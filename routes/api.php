<?php

use App\Http\Controllers\Api\IngestController;
use Illuminate\Support\Facades\Route;

Route::post('/ingest', IngestController::class)
    ->middleware('tyto.token');

Route::post('/records', IngestController::class)
    ->middleware('tyto.token');
