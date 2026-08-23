<?php

use App\Enums\TeamRole;
use App\Models\Project;
use App\Models\Record;
use App\Models\Team;
use App\Models\User;

test('telemetry explorer filters indexed signals inside the current project', function () {
    $team = Team::factory()->create();
    $user = User::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $project = Project::factory()->create(['team_id' => $team->id]);
    $otherProject = Project::factory()->create();

    Record::create([
        'project_id' => $project->id,
        'type' => 'exception',
        'payload' => ['t' => 'exception'],
        'message' => 'Payment gateway timeout',
        'trace_id' => 'trace-checkout',
        'created_at' => now(),
    ]);
    Record::create([
        'project_id' => $project->id,
        'type' => 'request',
        'payload' => ['t' => 'request'],
        'message' => 'GET /health',
        'trace_id' => 'trace-health',
        'created_at' => now(),
    ]);
    Record::create([
        'project_id' => $otherProject->id,
        'type' => 'exception',
        'payload' => ['t' => 'exception'],
        'message' => 'Payment gateway timeout from another tenant',
        'trace_id' => 'trace-outsider',
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('telemetry', [
            'current_team' => $team->slug,
            'project' => $project->slug,
            'type' => 'exception',
            'search' => 'gateway',
            'period' => '24h',
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/telemetry/index')
            ->has('records.data', 1)
            ->where('records.data.0.trace_id', 'trace-checkout')
            ->where('filters.type', 'exception')
        );
});

test('telemetry explorer can isolate an exact trace', function () {
    $team = Team::factory()->create();
    $user = User::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $project = Project::factory()->create(['team_id' => $team->id]);

    foreach (['request', 'query'] as $type) {
        Record::create([
            'project_id' => $project->id,
            'type' => $type,
            'payload' => ['t' => $type],
            'message' => "{$type} signal",
            'trace_id' => 'shared-trace',
            'created_at' => now(),
        ]);
    }

    $this->actingAs($user)
        ->get(route('telemetry', [
            'current_team' => $team->slug,
            'project' => $project->slug,
            'trace_id' => 'shared-trace',
        ]))
        ->assertInertia(fn ($page) => $page->has('records.data', 2));
});
