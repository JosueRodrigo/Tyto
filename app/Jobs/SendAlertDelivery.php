<?php

namespace App\Jobs;

use App\Models\AlertDelivery;
use App\Services\IntegrationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use RuntimeException;
use Throwable;

class SendAlertDelivery implements ShouldQueue
{
    use Queueable;

    public int $tries = 4;

    public int $timeout = 30;

    public function __construct(public int $deliveryId) {}

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
                'last_error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }

    public function failed(Throwable $exception): void
    {
        AlertDelivery::query()->whereKey($this->deliveryId)->update([
            'status' => 'failed',
            'last_error' => $exception->getMessage(),
        ]);
    }
}
