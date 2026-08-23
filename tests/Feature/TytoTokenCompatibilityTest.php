<?php

use App\Jobs\ProcessIngestedRecords;
use App\Models\Project;
use Illuminate\Support\Facades\Bus;

test('ingestion accepts the Tyto token header', function () {
    Bus::fake();
    $project = Project::factory()->create();

    $this->postJson('/api/ingest', ['t' => 'request'], [
        'X-Tyto-Token' => $project->api_token,
    ])->assertOk();

    Bus::assertDispatched(ProcessIngestedRecords::class);
});

test('ingestion keeps accepting the legacy LaraOwl token header', function () {
    Bus::fake();
    $project = Project::factory()->create();

    $this->postJson('/api/ingest', ['t' => 'request'], [
        'X-Laraowl-Token' => $project->api_token,
    ])->assertOk();

    Bus::assertDispatched(ProcessIngestedRecords::class);
});

test('versioned ingestion endpoint accepts batches and returns a receipt', function () {
    Bus::fake();
    $project = Project::factory()->create();

    $this->postJson('/api/v1/ingest', [
        'records' => [
            ['t' => 'request', 'path' => '/orders'],
            ['t' => 'query', 'sql' => 'select 1'],
        ],
    ], [
        'X-Tyto-Token' => $project->api_token,
        'Idempotency-Key' => 'batch-42',
    ])->assertOk()
        ->assertJson([
            'ingest_id' => 'batch-42',
            'duplicate' => false,
        ]);

    Bus::assertDispatched(ProcessIngestedRecords::class, fn ($job) => count($job->records) === 2);
});

test('idempotency key prevents a batch from being dispatched twice', function () {
    Bus::fake();
    $project = Project::factory()->create();
    $headers = [
        'X-Tyto-Token' => $project->api_token,
        'Idempotency-Key' => 'same-batch',
    ];

    $this->postJson('/api/v1/ingest', ['t' => 'request'], $headers)
        ->assertOk()
        ->assertJson(['duplicate' => false]);

    $this->postJson('/api/v1/ingest', ['t' => 'request'], $headers)
        ->assertOk()
        ->assertJson(['duplicate' => true]);

    Bus::assertDispatchedTimes(ProcessIngestedRecords::class, 1);
});

test('ingestion rejects malformed and oversized batches', function () {
    Bus::fake();
    $project = Project::factory()->create();
    config(['tyto.ingestion.max_records_per_batch' => 1]);

    $this->postJson('/api/v1/ingest', ['records' => [
        ['t' => 'request'],
        ['t' => 'query'],
    ]], [
        'X-Tyto-Token' => $project->api_token,
    ])->assertUnprocessable()
        ->assertJsonPath('message', 'A batch may contain at most 1 records.');

    $this->postJson('/api/v1/ingest', ['path' => '/missing-type'], [
        'X-Tyto-Token' => $project->api_token,
    ])->assertUnprocessable();

    Bus::assertNotDispatched(ProcessIngestedRecords::class);
});

test('ingestion enforces project scoped rate limits', function () {
    Bus::fake();
    $project = Project::factory()->create();
    config(['tyto.ingestion.rate_limit_per_minute' => 1]);
    $headers = ['X-Tyto-Token' => $project->api_token];

    $this->postJson('/api/v1/ingest', ['t' => 'request'], $headers)->assertOk();
    $this->postJson('/api/v1/ingest', ['t' => 'request'], $headers)
        ->assertStatus(429)
        ->assertHeader('Retry-After');
});

test('ingestion rejects payloads above the configured byte limit', function () {
    Bus::fake();
    $project = Project::factory()->create();
    config(['tyto.ingestion.max_payload_bytes' => 20]);

    $this->postJson('/api/v1/ingest', [
        't' => 'request',
        'message' => str_repeat('x', 100),
    ], [
        'X-Tyto-Token' => $project->api_token,
    ])->assertStatus(413);

    Bus::assertNotDispatched(ProcessIngestedRecords::class);
});
