<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\IngestService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessIngestedRecords implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     *
     * @param  list<array<string, mixed>>  $records
     */
    public function __construct(public Project $project, public array $records) {}

    /**
     * Execute the job.
     */
    public function handle(IngestService $ingestService): void
    {
        $ingestService->ingest($this->project, $this->records);
    }
}
