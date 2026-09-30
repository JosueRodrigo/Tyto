<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class ProductionReadinessService
{
    public function inspect(): array
    {
        $checks = [
            'database' => $this->attempt(fn () => DB::select('select 1')),
            'cache' => $this->checkCache(),
            'storage' => $this->checkStorage(),
            'scheduler' => $this->checkPulse('tyto:health:scheduler', 120),
            'queue' => $this->checkPulse('tyto:health:queue', 180),
        ];

        return [
            'status' => collect($checks)->every(fn (array $check) => $check['ok']) ? 'ready' : 'not_ready',
            'checked_at' => now()->toIso8601String(),
            'checks' => $checks,
        ];
    }

    private function checkCache(): array
    {
        return $this->attempt(function (): void {
            $key = 'tyto:health:probe:'.str()->random(12);
            Cache::put($key, 'ok', 10);

            if (Cache::get($key) !== 'ok') {
                throw new \RuntimeException('Cache value could not be read back.');
            }

            Cache::forget($key);
        });
    }

    private function checkStorage(): array
    {
        return $this->attempt(function (): void {
            $directory = storage_path('framework');

            if (! is_dir($directory) || ! is_writable($directory)) {
                throw new \RuntimeException('The framework storage directory is not writable.');
            }
        });
    }

    private function checkPulse(string $key, int $maximumAge): array
    {
        return $this->attempt(function () use ($key, $maximumAge): void {
            $pulse = Cache::get($key);

            if (! is_string($pulse) || now()->diffInSeconds($pulse, absolute: true) > $maximumAge) {
                throw new \RuntimeException('No recent pulse was recorded.');
            }
        });
    }

    private function attempt(callable $callback): array
    {
        try {
            $callback();

            return ['ok' => true, 'message' => 'ok'];
        } catch (Throwable $exception) {
            return ['ok' => false, 'message' => $exception->getMessage()];
        }
    }
}
