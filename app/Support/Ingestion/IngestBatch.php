<?php

namespace App\Support\Ingestion;

use InvalidArgumentException;

final readonly class IngestBatch
{
    /**
     * @param  list<array<string, mixed>>  $records
     */
    private function __construct(public array $records)
    {
    }

    /**
     * Normalize the legacy single-record payload and the current batch shapes.
     *
     * @param  array<string, mixed>|list<mixed>  $payload
     */
    public static function fromPayload(array $payload, int $maximumRecords): self
    {
        $candidate = array_key_exists('records', $payload) ? $payload['records'] : $payload;

        if (! is_array($candidate) || $candidate === []) {
            throw new InvalidArgumentException('At least one record is required.');
        }

        $records = array_is_list($candidate) ? $candidate : [$candidate];

        if (count($records) > $maximumRecords) {
            throw new InvalidArgumentException("A batch may contain at most {$maximumRecords} records.");
        }

        foreach ($records as $index => $record) {
            if (! is_array($record)) {
                throw new InvalidArgumentException("Record {$index} must be an object.");
            }

            if (! is_string($record['t'] ?? null) || trim($record['t']) === '') {
                throw new InvalidArgumentException("Record {$index} must contain a non-empty string type in `t`.");
            }
        }

        /** @var list<array<string, mixed>> $records */
        return new self($records);
    }
}
