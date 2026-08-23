<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlertNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $messageContent;

    public ?array $alertMetadata;

    public ?string $stackTrace;

    public ?string $actionUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(string $messageContent, ?array $alertMetadata = [], ?string $stackTrace = null, ?string $actionUrl = null)
    {
        $this->messageContent = $messageContent;
        $this->alertMetadata = $alertMetadata;
        $this->stackTrace = $stackTrace;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tyto Alert: System Notification',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.alert',
            with: [
                'metadata' => $this->alertMetadata,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
