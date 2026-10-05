<?php

use App\Models\Issue;
use App\Models\Project;
use App\Models\Record;
use App\Models\User;

it('requires authentication for the agent API', function () {
    $this->getJson('/api/v1/agent/projects')->assertUnauthorized();
});

it('only lists projects accessible to the authenticated agent user', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    Project::factory()->for($user->currentTeam)->create(['slug' => 'mine', 'name' => 'Mine']);
    Project::factory()->for($other->currentTeam)->create(['slug' => 'private', 'name' => 'Private']);

    $token = $user->createToken('agent')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/v1/agent/projects')
        ->assertOk()
        ->assertJsonFragment(['slug' => 'mine'])
        ->assertJsonMissing(['slug' => 'private']);
});

it('investigates through the shared service and redacts secrets', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user->currentTeam)->create(['slug' => 'shop']);

    $issue = Issue::factory()->for($project)->create([
        'title' => 'Checkout failed',
        'message' => 'Gateway timeout',
    ]);

    Record::factory()->for($project)->for($issue)->create([
        'type' => 'exception',
        'message' => 'Gateway timeout',
        'trace_id' => 'trace-agent-1',
        'payload' => ['route' => '/checkout', 'authorization' => 'Bearer secret'],
        'created_at' => now(),
    ]);

    $token = $user->createToken('agent')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/v1/agent/projects/shop/investigate', [
            'query' => 'Gateway timeout',
            'period' => '24h',
        ])
        ->assertOk()
        ->assertJsonFragment(['title' => 'Checkout failed'])
        ->assertJsonFragment(['trace_id' => 'trace-agent-1'])
        ->assertSee('[REDACTED]')
        ->assertDontSee('Bearer secret');
});

it('can follow a trace id through telemetry', function () {
    $user = User::factory()->create();
    $project = Project::factory()->for($user->currentTeam)->create(['slug' => 'api']);

    Record::factory()->for($project)->create([
        'type' => 'request',
        'trace_id' => 'trace-42',
        'payload' => ['path' => '/orders'],
        'created_at' => now(),
    ]);
    Record::factory()->for($project)->create([
        'type' => 'query',
        'trace_id' => 'trace-42',
        'payload' => ['sql' => 'select * from orders'],
        'created_at' => now(),
    ]);
    Record::factory()->for($project)->create([
        'type' => 'request',
        'trace_id' => 'another-trace',
        'payload' => ['path' => '/health'],
        'created_at' => now(),
    ]);

    $token = $user->createToken('agent')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/v1/agent/projects/api/telemetry?trace_id=trace-42')
        ->assertOk()
        ->assertJsonCount(2)
        ->assertJsonFragment(['trace_id' => 'trace-42'])
        ->assertJsonMissing(['trace_id' => 'another-trace']);
});

it('does not expose another teams project through agent endpoints', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    Project::factory()->for($other->currentTeam)->create(['slug' => 'private']);

    $token = $user->createToken('agent')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/v1/agent/projects/private/issues')
        ->assertNotFound();
});
