<?php

use App\Mcp\Servers\TytoServer;
use App\Mcp\Tools\InvestigateProject;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Record;
use App\Models\User;

it('investigates an accessible project and correlates matching telemetry', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user->currentTeam)->create(['slug' => 'shop']);

    $issue = Issue::factory()->for($project)->create([
        'title' => 'Checkout failed',
        'message' => 'Payment gateway timeout',
        'status' => 'open',
        'priority' => 'high',
    ]);

    Record::factory()->for($project)->for($issue)->create([
        'type' => 'exception',
        'message' => 'Payment gateway timeout',
        'trace_id' => 'trace-123',
        'payload' => [
            'route' => '/checkout',
            'authorization' => 'Bearer super-secret',
        ],
        'created_at' => now(),
    ]);

    TytoServer::actingAs($user)
        ->tool(InvestigateProject::class, [
            'project' => 'shop',
            'query' => 'Payment gateway timeout',
            'period' => '24h',
        ])
        ->assertOk()
        ->assertSee('Checkout failed')
        ->assertSee('trace-123')
        ->assertSee('/checkout')
        ->assertSee('[REDACTED]')
        ->assertDontSee('super-secret');
});

it('refuses investigation for an inaccessible project', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    Project::factory()->for($other->currentTeam)->create(['slug' => 'private']);

    TytoServer::actingAs($user)
        ->tool(InvestigateProject::class, [
            'project' => 'private',
            'query' => 'timeout',
        ])
        ->assertHasErrors();
});
