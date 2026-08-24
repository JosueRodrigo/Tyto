<?php

namespace App\Services;

use App\Models\Integration;
use App\Models\Issue;
use Illuminate\Mail\MailManager;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Throwable;

class IntegrationService
{
    public function __construct(private readonly MailManager $mail) {}

    /**
     * Send notification for a specific issue to all enabled integrations.
     */
    public function notify(Issue $issue): void
    {
        $project = $issue->project;
        $integrations = $project->integrations()->where('is_enabled', true)->get();

        $title = '🚨 New '.strtoupper($issue->type).' Alert';
        $message = "*{$issue->title}*\n{$issue->message}";
        $url = $issue->url();

        foreach ($integrations as $integration) {
            $this->send($integration, $title, $message, [
                'Project' => $issue->project->name,
                'Priority' => strtoupper($issue->priority),
            ], $url);
        }
    }

    /**
     * Send a generic notification to an integration.
     */
    public function send(Integration $integration, string $title, string $message, array $fields = [], ?string $url = null): bool
    {
        try {
            $this->sendOrFail($integration, $title, $message, $fields, $url);

            return true;
        } catch (Throwable $exception) {
            Log::error('Integration failed: '.$integration->type.' - '.$exception->getMessage());

            return false;
        }
    }

    public function sendOrFail(Integration $integration, string $title, string $message, array $fields = [], ?string $url = null): void
    {
        try {
            $this->dispatchToDriver($integration, $title, $message, $fields, $url);
            $integration->update(['status' => 'healthy', 'last_error' => null]);
        } catch (Throwable $exception) {
            $integration->update([
                'status' => 'failing',
                'last_error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }

    /**
     * Dispatch the notification to the correct driver.
     */
    protected function dispatchToDriver(Integration $integration, string $title, string $message, array $fields = [], ?string $url = null): void
    {
        match ($integration->type) {
            'slack' => $this->sendToSlack($integration, $title, $message, $fields, $url),
            'discord' => $this->sendToDiscord($integration, $title, $message, $fields, $url),
            'telegram' => $this->sendToTelegram($integration, $title, $message, $fields, $url),
            'webhook' => $this->sendToWebhook($integration, $title, $message, $fields, $url),
            'email' => $this->sendToEmail($integration, $title, $message, $fields, $url),
            default => throw new RuntimeException("Unsupported integration type: {$integration->type}"),
        };
    }

    protected function sendToSlack(Integration $integration, string $title, string $message, array $fields = [], ?string $url = null): void
    {
        $webhookUrl = $integration->data['webhook_url'] ?? null;
        if (! $webhookUrl) {
            throw new RuntimeException('Slack webhook URL is not configured.');
        }

        $slackFields = [];
        foreach ($fields as $label => $value) {
            $slackFields[] = ['type' => 'mrkdwn', 'text' => "*{$label}:* {$value}"];
        }

        $blocks = [
            [
                'type' => 'header',
                'text' => [
                    'type' => 'plain_text',
                    'text' => $title,
                ],
            ],
        ];

        if (! empty($slackFields)) {
            $blocks[] = ['type' => 'section', 'fields' => $slackFields];
        }

        $blocks[] = [
            'type' => 'section',
            'text' => [
                'type' => 'mrkdwn',
                'text' => $message,
            ],
        ];

        if ($url) {
            $blocks[] = [
                'type' => 'actions',
                'elements' => [
                    [
                        'type' => 'button',
                        'text' => ['type' => 'plain_text', 'text' => 'View Details'],
                        'url' => $url,
                        'style' => 'primary',
                    ],
                ],
            ];
        }

        Http::post($webhookUrl, ['blocks' => $blocks])->throw();
    }

    protected function sendToDiscord(Integration $integration, string $title, string $message, array $fields = [], ?string $url = null): void
    {
        $webhookUrl = $integration->data['webhook_url'] ?? null;
        if (! $webhookUrl) {
            throw new RuntimeException('Discord webhook URL is not configured.');
        }

        $discordFields = [];
        foreach ($fields as $label => $value) {
            $discordFields[] = ['name' => $label, 'value' => (string) $value, 'inline' => true];
        }

        Http::post($webhookUrl, [
            'embeds' => [[
                'title' => $title,
                'description' => $message,
                'url' => $url,
                'color' => 0x3498DB,
                'fields' => $discordFields,
                'timestamp' => now()->toIso8601String(),
            ]],
        ])->throw();
    }

    protected function sendToTelegram(Integration $integration, string $title, string $message, array $fields = [], ?string $url = null): void
    {
        $botToken = $integration->data['bot_token'] ?? null;
        $chatId = $integration->data['chat_id'] ?? null;
        if (! $botToken || ! $chatId) {
            throw new RuntimeException('Telegram bot token and chat ID are required.');
        }

        $text = "*{$title}*\n\n";
        foreach ($fields as $label => $value) {
            $text .= "*{$label}:* {$value}\n";
        }
        $text .= "\n{$message}\n\n";
        if ($url) {
            $text .= "[View Details]({$url})";
        }

        Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'Markdown',
        ])->throw();
    }

    protected function sendToWebhook(Integration $integration, string $title, string $message, array $fields = [], ?string $url = null): void
    {
        $webhookUrl = $integration->data['url'] ?? null;
        if (! $webhookUrl) {
            throw new RuntimeException('Webhook URL is not configured.');
        }

        Http::post($webhookUrl, [
            'event' => 'tyto.alert',
            'title' => $title,
            'message' => $message,
            'fields' => $fields,
            'url' => $url,
            'timestamp' => now()->timestamp,
        ])->throw();
    }

    protected function sendToEmail(Integration $integration, string $title, string $message, array $fields = [], ?string $url = null): void
    {
        $email = $integration->data['email'] ?? null;
        if (! $email) {
            throw new RuntimeException('Email recipient is not configured.');
        }

        $body = "{$title}\n\n";
        foreach ($fields as $label => $value) {
            $body .= "{$label}: {$value}\n";
        }
        $body .= "\n{$message}\n\n";
        if ($url) {
            $body .= "View details: {$url}";
        }

        $configuration = $integration->data ?? [];
        $host = $configuration['smtp_host'] ?? null;

        if (! $host) {
            Mail::raw($body, function ($m) use ($email, $title) {
                $m->to($email)->subject($title);
            });

            return;
        }

        $scheme = match ($configuration['smtp_encryption'] ?? 'tls') {
            'ssl' => 'smtps',
            'none' => 'smtp',
            default => 'smtp',
        };

        $mailer = $this->mail->build([
            'transport' => 'smtp',
            'scheme' => $scheme,
            'host' => $host,
            'port' => (int) ($configuration['smtp_port'] ?? 587),
            'username' => $configuration['smtp_username'] ?? null,
            'password' => $configuration['smtp_password'] ?? null,
            'timeout' => 10,
        ]);

        $fromAddress = $configuration['from_address'] ?? null;
        $fromName = $configuration['from_name'] ?? config('app.name');

        $mailer->raw($body, function ($message) use ($email, $title, $fromAddress, $fromName) {
            $message->to($email)->subject($title);

            if ($fromAddress) {
                $message->from($fromAddress, $fromName);
            }
        });
    }

    public function getAvailableTypes(): array
    {
        return [
            [
                'id' => 'slack',
                'name' => 'Slack',
                'fields' => [
                    ['name' => 'webhook_url', 'label' => 'Webhook URL', 'type' => 'url', 'placeholder' => 'https://hooks.slack.com/services/...'],
                ],
            ],
            [
                'id' => 'discord',
                'name' => 'Discord',
                'fields' => [
                    ['name' => 'webhook_url', 'label' => 'Webhook URL', 'type' => 'url', 'placeholder' => 'https://discord.com/api/webhooks/...'],
                ],
            ],
            [
                'id' => 'telegram',
                'name' => 'Telegram',
                'fields' => [
                    ['name' => 'bot_token', 'label' => 'Bot Token', 'type' => 'password', 'placeholder' => '123456:ABC-DEF...'],
                    ['name' => 'chat_id', 'label' => 'Chat ID', 'type' => 'text', 'placeholder' => '-100123456789'],
                ],
            ],
            [
                'id' => 'webhook',
                'name' => 'Webhook',
                'fields' => [
                    ['name' => 'url', 'label' => 'Webhook URL', 'type' => 'url', 'placeholder' => 'https://api.yourdomain.com/webhook'],
                ],
            ],
            [
                'id' => 'email',
                'name' => 'Email',
                'fields' => [
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'ops@example.com'],
                    ['name' => 'smtp_host', 'label' => 'SMTP Host', 'type' => 'text', 'placeholder' => 'smtp.example.com'],
                    ['name' => 'smtp_port', 'label' => 'SMTP Port', 'type' => 'number', 'placeholder' => '587'],
                    ['name' => 'smtp_encryption', 'label' => 'Encryption', 'type' => 'select', 'options' => [['value' => 'tls', 'label' => 'TLS'], ['value' => 'ssl', 'label' => 'SSL'], ['value' => 'none', 'label' => 'None']],
                    ['name' => 'smtp_username', 'label' => 'SMTP Username', 'type' => 'text', 'placeholder' => 'mailer@example.com'],
                    ['name' => 'smtp_password', 'label' => 'SMTP Password', 'type' => 'password', 'placeholder' => 'Leave blank to keep the saved password'],
                    ['name' => 'from_address', 'label' => 'From Address', 'type' => 'email', 'placeholder' => 'alerts@example.com'],
                    ['name' => 'from_name', 'label' => 'From Name', 'type' => 'text', 'placeholder' => 'Tyto Alerts'],
                ],
            ],
        ];
    }
}
