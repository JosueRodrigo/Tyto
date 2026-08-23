<?php

return [
    'repository' => env('TYTO_REPOSITORY', env('LARAOWL_REPOSITORY', 'JosueRodrigo/laraowl')),

    'update_check' => [
        'enabled' => env('TYTO_UPDATE_CHECK', env('LARAOWL_UPDATE_CHECK', true)),
        'cache_ttl' => (int) env('TYTO_UPDATE_CHECK_TTL', env('LARAOWL_UPDATE_CHECK_TTL', 21600)),
        'timeout' => (int) env('TYTO_UPDATE_CHECK_TIMEOUT', env('LARAOWL_UPDATE_CHECK_TIMEOUT', 10)),
    ],

    'binaries' => [
        'git' => env('TYTO_GIT_BINARY', env('LARAOWL_GIT_BINARY', 'git')),
        'composer' => env('TYTO_COMPOSER_BINARY', env('LARAOWL_COMPOSER_BINARY', 'composer')),
        'npm' => env('TYTO_NPM_BINARY', env('LARAOWL_NPM_BINARY', 'npm')),
    ],

    'ingestion' => [
        'max_payload_bytes' => (int) env('TYTO_INGEST_MAX_PAYLOAD_BYTES', 1048576),
        'max_records_per_batch' => (int) env('TYTO_INGEST_MAX_RECORDS', 500),
        'rate_limit_per_minute' => (int) env('TYTO_INGEST_RATE_LIMIT', 600),
        'idempotency_ttl' => (int) env('TYTO_INGEST_IDEMPOTENCY_TTL', 86400),
    ],
];
