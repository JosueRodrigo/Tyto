<?php

use App\Jobs\RecordWorkerHeartbeat;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function (): void {
    Cache::put('tyto:health:scheduler', now()->toIso8601String(), now()->addMinutes(10));
    RecordWorkerHeartbeat::dispatch();
})->everyMinute()->name('tyto-health-pulse')->withoutOverlapping();

Schedule::command('projects:check-health')
    ->everyMinute()
    ->withoutOverlapping();
Schedule::command('model:prune')->daily();
Schedule::command('tyto:update --check')->daily();
