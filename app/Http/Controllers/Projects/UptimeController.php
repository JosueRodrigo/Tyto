<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Team;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class UptimeController extends Controller
{
    public function index(Request $request, Team $current_team, Project $project): Response
    {
        $period = in_array($request->query('period'), ['24h', '7d'], true)
            ? $request->query('period')
            : '24h';

        $periodStart = $period === '7d' ? now()->subDays(7) : now()->subDay();
        $periodChecks = $this->checksSince($project, $periodStart)->get();
        $responseTimes = $periodChecks->pluck('response_time')->filter(fn ($value) => $value !== null)->sort()->values();
        $latest = $project->uptimeChecks()->latest('checked_at')->first();

        return Inertia::render('projects/uptime/index', [
            'monitor' => [
                'enabled' => $project->uptime_monitoring_enabled,
                'url' => $project->url,
                'interval' => $project->uptime_check_interval,
                'status' => $latest?->status ?? $project->last_uptime_status,
                'last_checked_at' => $latest?->checked_at?->toIso8601String() ?? $project->last_uptime_check_at?->toIso8601String(),
            ],
            'summary' => [
                'uptime_24h' => $this->uptimePercentage($this->checksSince($project, now()->subDay())),
                'uptime_7d' => $this->uptimePercentage($this->checksSince($project, now()->subDays(7))),
                'average_response_time' => $responseTimes->isEmpty() ? null : round($responseTimes->average()),
                'p95_response_time' => $this->percentile($responseTimes, 95),
                'down_checks' => $periodChecks->where('status', 'down')->count(),
                'total_checks' => $periodChecks->count(),
            ],
            'chart' => $project->uptimeChecks()
                ->where('checked_at', '>=', $periodStart)
                ->latest('checked_at')
                ->limit(300)
                ->get(['id', 'status', 'response_time', 'status_code', 'checked_at'])
                ->reverse()
                ->values(),
            'checks' => $project->uptimeChecks()
                ->latest('checked_at')
                ->paginate(20)
                ->withQueryString(),
            'period' => $period,
        ]);
    }

    private function checksSince(Project $project, CarbonInterface $start): Builder
    {
        return $project->uptimeChecks()->where('checked_at', '>=', $start);
    }

    private function uptimePercentage(Builder $query): ?float
    {
        $total = (clone $query)->count();

        if ($total === 0) {
            return null;
        }

        return round(((clone $query)->where('status', 'up')->count() / $total) * 100, 2);
    }

    private function percentile(Collection $values, int $percentile): ?int
    {
        if ($values->isEmpty()) {
            return null;
        }

        $index = (int) ceil(($percentile / 100) * $values->count()) - 1;

        return (int) $values->get(max(0, $index));
    }
}
