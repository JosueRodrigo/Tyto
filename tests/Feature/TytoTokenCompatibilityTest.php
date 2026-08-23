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
