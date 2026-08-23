<?php

use App\Models\Heartbeat;
use App\Models\Issue;
use App\Models\Project;
use App\Services\RecordService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('operational health prioritizes availability and heartbeat failures', function () {
    $project = Project::factory()->create([
        'uptime_monitoring_enabled' => true,
        'last_uptime_status' => 'down',
        'last_uptime_check_at' => now(),
    ]);

    Heartbeat::query()->create([
        'project_id' => $project->id,
        'name' => 'Scheduler',
        'slug' => 'scheduler',
        'interval_minutes' => 5,
        'status' => 'active',
        'last_seen_at' => now()->subHour(),
    ]);
    Issue::query()->create([
        'project_id' => $project->id,
        'hash' => 'critical-issue',
        'type' => 'exception',
        'title' => 'Database unavailable',
        'message' => 'Connection refused',
        'status' => 'open',
        'priority' => 'critical',
    ]);

    $health = app(RecordService::class)->getOperationalHealth($project);

    expect($health['status'])->toBe('critical')
        ->and($health['uptime']['status'])->toBe('down')
        ->and($health['heartbeats'])->toMatchArray([
            'total' => 1,
            'healthy' => 0,
            'failing' => 1,
            'inactive' => 0,
        ])
        ->and($health['incidents'])->toMatchArray([
            'open' => 1,
            'critical' => 1,
            'unassigned' => 1,
        ]);
});

test('operational health is healthy when optional uptime is disabled and signals are clear', function () {
    $project = Project::factory()->create([
        'uptime_monitoring_enabled' => false,
        'last_uptime_status' => null,
    ]);

    Heartbeat::query()->create([
        'project_id' => $project->id,
        'name' => 'Scheduler',
        'slug' => 'scheduler',
        'interval_minutes' => 5,
        'status' => 'active',
        'last_seen_at' => now(),
    ]);

    $health = app(RecordService::class)->getOperationalHealth($project);

    expect($health['status'])->toBe('healthy')
        ->and($health['uptime']['status'])->toBe('disabled')
        ->and($health['heartbeats']['healthy'])->toBe(1)
        ->and($health['incidents']['open'])->toBe(0);
});

test('operational health never includes another projects signals', function () {
    $project = Project::factory()->create(['uptime_monitoring_enabled' => false]);
    $otherProject = Project::factory()->create(['uptime_monitoring_enabled' => false]);

    Issue::query()->create([
        'project_id' => $otherProject->id,
        'hash' => 'other-project-issue',
        'type' => 'exception',
        'title' => 'Other failure',
        'message' => 'Must stay isolated',
        'status' => 'open',
        'priority' => 'critical',
    ]);
    Heartbeat::query()->create([
        'project_id' => $otherProject->id,
        'name' => 'Other scheduler',
        'slug' => 'other-scheduler',
        'interval_minutes' => 1,
        'status' => 'failing',
        'last_seen_at' => now()->subDay(),
    ]);

    $health = app(RecordService::class)->getOperationalHealth($project);

    expect($health['status'])->toBe('healthy')
        ->and($health['heartbeats']['total'])->toBe(0)
        ->and($health['incidents']['open'])->toBe(0);
});
