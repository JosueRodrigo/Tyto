<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessIngestedRecords;
use App\Models\Project;
use App\Support\Ingestion\IngestBatch;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use InvalidArgumentException;

class IngestController extends Controller
{
    /**
     * Handle incoming data from monitored projects.
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Project $project */
        $project = $request->attributes->get('project');

        try {
            $batch = IngestBatch::fromPayload(
                $request->all(),
                (int) config('tyto.ingestion.max_records_per_batch'),
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        $ingestId = $request->header('Idempotency-Key')
            ?? $request->header('X-Tyto-Request-Id')
            ?? (string) Str::uuid();

        if (strlen($ingestId) > 200) {
            return response()->json(['message' => 'The ingestion request identifier may not exceed 200 characters.'], 422);
        }

        $receiptKey = 'tyto:ingest-receipt:'.$project->getKey().':'.hash('sha256', $ingestId);
        $receiptTtl = (int) config('tyto.ingestion.idempotency_ttl');

        if (!Cache::add($receiptKey, true, $receiptTtl)) {
            return response()->json([
                'message' => 'Ingestion request already accepted.',
                'ingest_id' => $ingestId,
                'duplicate' => true,
            ], 200);
        }

        // Auto-update project URL if not set
        if ($request->has('app_url') && !$project->url) {
            $project->update(['url' => $request->input('app_url')]);
        }

        try {
            ProcessIngestedRecords::dispatch($project, $batch->records);
        } catch (\Throwable $exception) {
            Cache::forget($receiptKey);

            throw $exception;
        }

        return response()->json([
            'message' => 'Data ingested successfully.',
            'ingest_id' => $ingestId,
            'duplicate' => false,
        ], 200);
    }
}
