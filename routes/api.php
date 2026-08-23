<?php

use App\Http\Controllers\Api\IngestController;
use Illuminate\Support\Facades\Route;

Route::post('/ingest', IngestController::class)
    ->middleware(['tyto.token', 'tyto.ingestion']);

Route::post('/records', IngestController::class)
    ->middleware(['tyto.token', 'tyto.ingestion']);

Route::prefix('v1')->group(function () {
    Route::post('/ingest', IngestController::class)
        ->middleware(['tyto.token', 'tyto.ingestion'])
        ->name('api.v1.ingest');
});
