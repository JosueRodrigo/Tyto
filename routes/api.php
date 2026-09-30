<?php

use App\Http\Controllers\Api\IngestController;
use App\Http\Controllers\Api\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('/health/live', [HealthController::class, 'live'])->name('api.health.live');
Route::get('/health/ready', [HealthController::class, 'ready'])->name('api.health.ready');

Route::post('/ingest', IngestController::class)
    ->middleware(['tyto.token', 'tyto.ingestion']);

Route::post('/records', IngestController::class)
    ->middleware(['tyto.token', 'tyto.ingestion']);

Route::prefix('v1')->group(function () {
    Route::post('/ingest', IngestController::class)
        ->middleware(['tyto.token', 'tyto.ingestion'])
        ->name('api.v1.ingest');
});
