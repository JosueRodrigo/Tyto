<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Models\Heartbeat;
use App\Models\Project;
use App\Models\Team;
use Inertia\Inertia;
use Inertia\Response;

class HeartbeatController extends Controller
{
    public function index(Team $current_team, Project $project): Response
    {
        $heartbeats = $project->heartbeats()
            ->latest('last_seen_at')
            ->get()
            ->map(fn (Heartbeat $heartbeat) => [
                'id' => $heartbeat->id,
                'name' => $heartbeat->name,
                'slug' => $heartbeat->slug,
                'status' => $heartbeat->effectiveStatus(),
                'interval_minutes' => $heartbeat->interval_minutes,
                'last_seen_at' => $heartbeat->last_seen_at?->toIso8601String(),
                'next_expected_at' => $heartbeat->nextExpectedAt()?->toIso8601String(),
            ])
            ->sortBy(fn (array $heartbeat) => match ($heartbeat['status']) {
                'failing' => 0,
                'inactive' => 1,
                default => 2,
            })
            ->values();

        return Inertia::render('projects/heartbeats/index', [
            'heartbeats' => $heartbeats,
            'summary' => [
                'total' => $heartbeats->count(),
                'active' => $heartbeats->where('status', 'active')->count(),
                'failing' => $heartbeats->where('status', 'failing')->count(),
                'inactive' => $heartbeats->where('status', 'inactive')->count(),
            ],
        ]);
    }
}
