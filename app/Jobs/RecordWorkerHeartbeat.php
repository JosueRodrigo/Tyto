<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class RecordWorkerHeartbeat implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        Cache::put('tyto:health:queue', now()->toIso8601String(), now()->addMinutes(10));
    }
}
