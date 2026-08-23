<?php

use App\Models\Project;
use App\Models\UptimeCheck;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the uptime dashboard reports project metrics for the selected period', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create([
        'team_id' => $user->currentTeam->id,
        'url' => 'https://tyto.test/health',
        'uptime_monitoring_enabled' => true,
    ]);

    foreach ([100, 200, 300] as $responseTime) {
        UptimeCheck::query()->create([
            'project_id' => $project->id,
            'status' => 'up',
            'response_time' => $responseTime,
            'status_code' => 200,
            'checked_at' => now()->subHours(2),
        ]);
    }

    UptimeCheck::query()->create([
        'project_id' => $project->id,
        'status' => 'down',
        'response_time' => null,
        'status_code' => 503,
        'error' => 'Service unavailable',
        'checked_at' => now()->subHour(),
    ]);

    $this->actingAs($user)
        ->get(route('uptime', [$user->currentTeam, $project]).'?period=7d')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/uptime/index')
            ->where('period', '7d')
            ->where('monitor.url', 'https://tyto.test/health')
            ->where('monitor.status', 'down')
            ->where('summary.uptime_24h', 75)
            ->where('summary.uptime_7d', 75)
            ->where('summary.average_response_time', 200)
            ->where('summary.p95_response_time', 300)
            ->where('summary.down_checks', 1)
            ->where('summary.total_checks', 4)
            ->has('chart', 4)
            ->has('checks.data', 4));
});

test('the uptime dashboard never includes checks from another project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = Project::factory()->create(['team_id' => $team->id]);
    $otherProject = Project::factory()->create(['team_id' => $team->id]);

    UptimeCheck::query()->create([
        'project_id' => $project->id,
        'status' => 'up',
        'response_time' => 120,
        'status_code' => 200,
        'checked_at' => now(),
    ]);
    UptimeCheck::query()->create([
        'project_id' => $otherProject->id,
        'status' => 'down',
        'response_time' => 900,
        'status_code' => 500,
        'checked_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('uptime', [$team, $project]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.uptime_24h', 100)
            ->where('summary.total_checks', 1)
            ->has('checks.data', 1)
            ->where('checks.data.0.project_id', $project->id));
});

test('the uptime dashboard has an empty state before the first check', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create([
        'team_id' => $user->currentTeam->id,
        'uptime_monitoring_enabled' => false,
    ]);

    $this->actingAs($user)
        ->get(route('uptime', [$user->currentTeam, $project]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('monitor.enabled', false)
            ->where('summary.uptime_24h', null)
            ->where('summary.average_response_time', null)
            ->has('checks.data', 0));
});
