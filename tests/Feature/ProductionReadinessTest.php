<?php

use Illuminate\Support\Facades\Cache;

it('exposes a lightweight liveness endpoint', function () {
    $this->getJson('/api/health/live')
        ->assertOk()
        ->assertExactJson(['status' => 'ok']);
});

it('reports not ready when background processes have not checked in', function () {
    Cache::forget('tyto:health:scheduler');
    Cache::forget('tyto:health:queue');

    $this->getJson('/api/health/ready')
        ->assertStatus(503)
        ->assertJsonPath('status', 'not_ready')
        ->assertJsonPath('checks.scheduler', 'failed')
        ->assertJsonPath('checks.queue', 'failed');
});

it('reports ready after scheduler and queue pulses', function () {
    Cache::put('tyto:health:scheduler', now()->toIso8601String(), 600);
    Cache::put('tyto:health:queue', now()->toIso8601String(), 600);

    $this->getJson('/api/health/ready')
        ->assertOk()
        ->assertJsonPath('status', 'ready')
        ->assertJsonPath('checks.database', 'ok')
        ->assertJsonPath('checks.cache', 'ok');
});

it('provides a machine readable production diagnostic', function () {
    Cache::put('tyto:health:scheduler', now()->toIso8601String(), 600);
    Cache::put('tyto:health:queue', now()->toIso8601String(), 600);

    $this->artisan('tyto:doctor --json')->assertSuccessful();
});
