<?php

use App\Models\Heartbeat;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the heartbeat dashboard derives current process health', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create(['team_id' => $user->currentTeam->id]);

    Heartbeat::query()->create([
        'project_id' => $project->id,
        'name' => 'Laravel scheduler',
        'slug' => 'scheduler',
        'interval_minutes' => 5,
        'status' => 'active',
        'last_seen_at' => now()->subMinute(),
    ]);
    Heartbeat::query()->create([
        'project_id' => $project->id,
        'name' => 'Nightly import',
        'slug' => 'nightly-import',
        'interval_minutes' => 60,
        'status' => 'active',
        'last_seen_at' => now()->subHours(2),
    ]);
    Heartbeat::query()->create([
        'project_id' => $project->id,
        'name' => 'Legacy sync',
        'slug' => 'legacy-sync',
        'interval_minutes' => 15,
        'status' => 'inactive',
        'last_seen_at' => now()->subDay(),
    ]);

    $this->actingAs($user)
        ->get(route('heartbeats', [$user->currentTeam, $project]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/heartbeats/index')
            ->where('summary.total', 3)
            ->where('summary.active', 1)
            ->where('summary.failing', 1)
            ->where('summary.inactive', 1)
            ->where('heartbeats.0.slug', 'nightly-import')
            ->where('heartbeats.0.status', 'failing')
            ->where('heartbeats.2.slug', 'scheduler')
            ->where('heartbeats.2.status', 'active'));
});

test('the heartbeat dashboard is scoped to the current project', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $project = Project::factory()->create(['team_id' => $team->id]);
    $otherProject = Project::factory()->create(['team_id' => $team->id]);

    foreach ([$project, $otherProject] as $index => $owner) {
        Heartbeat::query()->create([
            'project_id' => $owner->id,
            'name' => 'Process '.($index + 1),
            'slug' => 'process-'.($index + 1),
            'interval_minutes' => 15,
            'status' => 'active',
            'last_seen_at' => now(),
        ]);
    }

    $this->actingAs($user)
        ->get(route('heartbeats', [$team, $project]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.total', 1)
            ->has('heartbeats', 1)
            ->where('heartbeats.0.slug', 'process-1'));
});

test('checking heartbeat health does not mutate its last seen timestamp in memory', function () {
    $heartbeat = new Heartbeat([
        'interval_minutes' => 15,
        'status' => 'active',
        'last_seen_at' => now(),
    ]);
    $lastSeen = $heartbeat->last_seen_at->copy();

    $heartbeat->isFailing();

    expect($heartbeat->last_seen_at->equalTo($lastSeen))->toBeTrue();
});
