<?php

namespace App\Jobs;

use App\Models\AlertDelivery;
use App\Services\IntegrationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class SendAlertDelivery implements ShouldQueue
{
    use Queueable;

    public int $tries = 4;

    public int $timeout = 30;

    public function __construct(public int $deliveryId) {}

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("alert-delivery:{$this->deliveryId}"))
                ->dontRelease()
                ->expireAfter($this->timeout + 10),
        ];
    }

    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(IntegrationService $integrations): void
    {
        $delivery = AlertDelivery::query()->with('integration')->findOrFail($this->deliveryId);

        if ($delivery->status === 'delivered') {
            return;
        }

        $delivery->increment('attempts');
        $delivery->update(['status' => 'processing']);

        try {
            if (! $delivery->integration || ! $delivery->integration->is_enabled) {
                throw new RuntimeException('Alert integration is unavailable or disabled.');
            }

            $integrations->sendOrFail(
                $delivery->integration,
                $delivery->title,
                $delivery->message,
                $delivery->fields ?? [],
                $delivery->url,
            );

            $delivery->update([
                'status' => 'delivered',
                'last_error' => null,
                'delivered_at' => now(),
            ]);
        } catch (Throwable $exception) {
            $delivery->update([
                'status' => 'pending',
                'last_error' => $this->safeErrorMessage($delivery, $exception),
            ]);

            throw $exception;
        }
    }

    public function failed(Throwable $exception): void
    {
        $delivery = AlertDelivery::query()->with('integration')->find($this->deliveryId);

        $delivery?->update([
            'status' => 'failed',
            'last_error' => $delivery
                ? $this->safeErrorMessage($delivery, $exception)
                : Str::limit($exception->getMessage(), 1000),
        ]);

        if ($delivery?->alert_rule_id) {
            $errorHash = md5($delivery->title.$delivery->message);
            Cache::forget("alert_rule_{$delivery->alert_rule_id}_{$errorHash}_last_sent");
        }
    }

    private function safeErrorMessage(AlertDelivery $delivery, Throwable $exception): string
    {
        $message = $exception->getMessage();
        $integration = $delivery->integration;

        if (! $integration) {
            return Str::limit($message, 1000);
        }

        foreach ($integration->secretFields() as $field) {
            $secret = $integration->data[$field] ?? null;

            if (is_string($secret) && $secret !== '') {
                $message = str_replace($secret, '[redacted]', $message);
            }
        }

        return Str::limit($message, 1000);
    }
}
