<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Services\Agent\InvestigationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    public function projects(Request $request): JsonResponse
    {
        return response()->json($this->accessibleProjects($request->user())
            ->get(['id', 'team_id', 'name', 'slug', 'url'])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'team_id' => $project->team_id,
                'name' => $project->name,
                'slug' => $project->slug,
                'url' => $project->url,
            ]));
    }

    public function issues(Request $request, string $project): JsonResponse
    {
        $resolved = $this->resolveProject($request->user(), $project);

        abort_unless($resolved, 404);

        $validated = $request->validate([
            'status' => ['nullable', 'in:open,resolved,ignored'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $issues = $resolved->issues()
            ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->orderByDesc('last_seen_at')
            ->limit((int) ($validated['limit'] ?? 25))
            ->get([
                'id', 'type', 'title', 'message', 'status', 'priority',
                'occurrences_count', 'users_count', 'first_seen_at', 'last_seen_at',
            ]);

        return response()->json($issues);
    }

    public function issue(Request $request, int $issue): JsonResponse
    {
        $projectIds = $this->accessibleProjects($request->user())->pluck('id');

        $resolved = Issue::whereIn('project_id', $projectIds)
            ->whereKey($issue)
            ->first();

        abort_unless($resolved, 404);

        $records = $resolved->records()
            ->orderByDesc('created_at')
            ->limit(20)
            ->get(['id', 'issue_id', 'type', 'trace_id', 'message', 'payload', 'created_at'])
            ->map(fn ($record) => app(InvestigationService::class)->serializeRecord($record));

        return response()->json([
            'issue' => $resolved->only([
                'id', 'project_id', 'type', 'title', 'message', 'status', 'priority',
                'occurrences_count', 'users_count', 'first_seen_at', 'last_seen_at',
            ]),
            'records' => $records,
            'activities' => $resolved->activities()
                ->orderBy('created_at')
                ->get(['id', 'user_id', 'type', 'content', 'created_at']),
        ]);
    }

    public function telemetry(Request $request, string $project): JsonResponse
    {
        $resolved = $this->resolveProject($request->user(), $project);

        abort_unless($resolved, 404);

        $validated = $request->validate([
            'type' => ['nullable', 'string', 'max:100'],
            'trace_id' => ['nullable', 'string', 'max:255'],
            'period' => ['nullable', 'in:1h,24h,7d,14d,30d,custom'],
            'from' => ['nullable', 'date', 'required_if:period,custom'],
            'to' => ['nullable', 'date', 'required_if:period,custom'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $records = $resolved->records()
            ->when($validated['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($validated['trace_id'] ?? null, fn ($query, $traceId) => $query->where('trace_id', $traceId))
            ->forPeriod(
                $validated['period'] ?? '24h',
                $validated['from'] ?? null,
                $validated['to'] ?? null,
            )
            ->orderByDesc('created_at')
            ->limit((int) ($validated['limit'] ?? 25))
            ->get(['id', 'issue_id', 'type', 'trace_id', 'message', 'payload', 'created_at'])
            ->map(fn ($record) => app(InvestigationService::class)->serializeRecord($record));

        return response()->json($records);
    }

    public function investigate(Request $request, string $project, InvestigationService $service): JsonResponse
    {
        $resolved = $this->resolveProject($request->user(), $project);

        abort_unless($resolved, 404);

        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2', 'max:500'],
            'period' => ['nullable', 'in:1h,24h,7d,14d,30d,custom'],
            'from' => ['nullable', 'date', 'required_if:period,custom'],
            'to' => ['nullable', 'date', 'required_if:period,custom'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        return response()->json($service->investigate($resolved, $validated));
    }

    private function accessibleProjects(User $user): Builder
    {
        return Project::whereIn('team_id', $user->teams()->pluck('teams.id'));
    }

    private function resolveProject(User $user, string $slug): ?Project
    {
        return $this->accessibleProjects($user)->where('slug', $slug)->first();
    }
}
