<?php

use App\Support\Ingestion\IngestBatch;

test('it normalizes a single legacy record', function () {
    $batch = IngestBatch::fromPayload(['t' => 'request', 'path' => '/'], 10);

    expect($batch->records)->toHaveCount(1)
        ->and($batch->records[0]['t'])->toBe('request');
});

test('it rejects records without a type', function () {
    IngestBatch::fromPayload(['records' => [['path' => '/']]], 10);
})->throws(InvalidArgumentException::class, 'must contain a non-empty string type');
