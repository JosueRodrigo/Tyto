<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProductionReadinessService;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function live(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }

    public function ready(ProductionReadinessService $readiness): JsonResponse
    {
        $result = $readiness->inspect();
        $publicResult = [
            'status' => $result['status'],
            'checked_at' => $result['checked_at'],
            'checks' => collect($result['checks'])->map(fn (array $check) => $check['ok'] ? 'ok' : 'failed'),
        ];

        return response()->json($publicResult, $result['status'] === 'ready' ? 200 : 503);
    }
}
