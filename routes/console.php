<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

Schedule::command('projects:check-health')->everyThirtySeconds();
Schedule::command('model:prune')->daily();
Schedule::command('tyto:update --check')->daily();

Artisan::command('tyto:update {--check} {--dry-run} {--force}', function (): int {
    return $this->call('laraowl:update', [
        '--check' => (bool) $this->option('check'),
        '--dry-run' => (bool) $this->option('dry-run'),
        '--force' => (bool) $this->option('force'),
    ]);
})->purpose('Check for and install the latest Tyto release');
