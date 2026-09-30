<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StatusPageController extends Controller
{
    public function edit(Team $current_team, Project $project): Response
    {
        return Inertia::render('projects/status-page/edit', [
            'statusPage' => [
                'enabled' => $project->status_page_enabled,
                'slug' => $project->status_page_slug ?: $project->slug,
                'title' => $project->status_page_title ?: $project->name,
                'show_heartbeats' => $project->status_page_show_heartbeats,
                'public_url' => $project->status_page_slug
                    ? route('status.show', $project->status_page_slug)
                    : null,
            ],
        ]);
    }

    public function update(Request $request, Team $current_team, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
            'slug' => ['required', 'string', 'max:100', 'alpha_dash:ascii', Rule::unique('projects', 'status_page_slug')->ignore($project)],
            'title' => ['required', 'string', 'max:120'],
            'show_heartbeats' => ['required', 'boolean'],
        ]);

        $project->update([
            'status_page_enabled' => $validated['enabled'],
            'status_page_slug' => Str::lower($validated['slug']),
            'status_page_title' => $validated['title'],
            'status_page_show_heartbeats' => $validated['show_heartbeats'],
        ]);

        return back()->with('success', 'Status page updated.');
    }

    public function show(string $slug): Response
    {
        $project = Project::query()
            ->where('status_page_slug', $slug)
            ->where('status_page_enabled', true)
            ->firstOrFail();

        $checks = $project->uptimeChecks()
            ->where('checked_at', '>=', now()->subDays(90))
            ->get(['status', 'response_time', 'checked_at']);
        $total = $checks->count();
        $up = $checks->where('status', 'up')->count();

        $dailyChecks = $project->uptimeChecks()
            ->selectRaw('DATE(checked_at) as day, COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as successful', ['up'])
            ->where('checked_at', '>=', now()->subDays(30))
            ->groupBy(DB::raw('DATE(checked_at)'))
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $daily = collect(range(29, 0))->map(function (int $daysAgo) use ($dailyChecks): array {
            $date = now()->subDays($daysAgo)->toDateString();
            $day = $dailyChecks->get($date);

            return [
                'date' => $date,
                'uptime' => $day?->total
                    ? round(($day->successful / $day->total) * 100, 2)
                    : null,
            ];
        });

        return Inertia::render('status/show', [
            'page' => [
                'title' => $project->status_page_title ?: $project->name,
                'status' => $project->last_uptime_status ?: 'unknown',
                'last_checked_at' => $project->last_uptime_check_at,
                'uptime_90d' => $total ? round(($up / $total) * 100, 2) : null,
                'average_response_time' => $checks->where('status', 'up')->avg('response_time'),
                'daily' => $daily,
                'heartbeats' => $project->status_page_show_heartbeats
                    ? $project->heartbeats()->get()->map(fn ($heartbeat) => [
                        'name' => $heartbeat->name,
                        'status' => $heartbeat->effectiveStatus(),
                        'last_seen_at' => $heartbeat->last_seen_at,
                    ])
                    : [],
                'updated_at' => now()->toIso8601String(),
            ],
        ]);
    }
}
