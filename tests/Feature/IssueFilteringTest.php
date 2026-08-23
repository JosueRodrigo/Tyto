<?php

use App\Enums\TeamRole;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;

test('incident center filters by priority and exposes triage counts', function () {
    $team = Team::factory()->create();
    $user = User::factory()->create();
    $team->members()->attach($user, ['role' => TeamRole::Owner->value]);
    $project = Project::factory()->create(['team_id' => $team->id]);

    Issue::create([
        'project_id' => $project->id,
        'hash' => 'critical-unassigned',
        'type' => 'exception',
        'title' => 'Checkout unavailable',
        'message' => 'Payment provider failed',
        'status' => 'open',
        'priority' => 'critical',
    ]);
    Issue::create([
        'project_id' => $project->id,
        'hash' => 'low-assigned',
        'type' => 'exception',
        'title' => 'Minor warning',
        'message' => 'Non blocking warning',
        'status' => 'open',
        'priority' => 'low',
        'assigned_to' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('issues', [
            'current_team' => $team->slug,
            'project' => $project->slug,
            'status' => 'open',
            'priority' => 'critical',
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/issues/index')
            ->has('issues.data', 1)
            ->where('issues.data.0.title', 'Checkout unavailable')
            ->where('counts.open', 2)
            ->where('counts.unassigned', 1)
            ->where('counts.critical', 1)
        );
});

test('an incident cannot be assigned to a user outside its team', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $outsider = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Owner->value]);
    $project = Project::factory()->create(['team_id' => $team->id]);
    $issue = Issue::create([
        'project_id' => $project->id,
        'hash' => 'assignment-boundary',
        'type' => 'exception',
        'title' => 'Scoped incident',
        'message' => 'Must remain inside its team',
        'status' => 'open',
        'priority' => 'high',
    ]);

    $this->actingAs($member)
        ->from(route('issues.show', [
            'current_team' => $team->slug,
            'project' => $project->slug,
            'issue' => $issue->id,
        ]))
        ->patch(route('issues.update', [
            'current_team' => $team->slug,
            'project' => $project->slug,
            'issue' => $issue->id,
        ]), ['assigned_to' => $outsider->id])
        ->assertSessionHasErrors('assigned_to');

    expect($issue->fresh()->assigned_to)->toBeNull();
});
