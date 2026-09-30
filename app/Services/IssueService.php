<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class IssueService
{
    /**
     * Get paginated issues with advanced filters.
     */
    public function getPaginatedIssues(Project $project, array $filters = []): LengthAwarePaginator
    {
        $status = $filters['status'] ?? 'open';

        $query = $project->issues()
            ->with(['assignee', 'project'])
            ->withCount('records')
            ->when($status !== 'all' && $status !== 'unassigned' && $status !== 'mine', function ($q) use ($status) {
                return $q->where('status', $status);
            })
            ->when($status === 'unassigned', function ($q) {
                return $q->whereNull('assigned_to');
            })
            ->when($status === 'mine', function ($q) {
                return $q->where('assigned_to', auth()->id());
            })
            ->when(isset($filters['priority']) && $filters['priority'] !== 'all', function ($q) use ($filters) {
                return $q->where('priority', $filters['priority']);
            })
            ->when(isset($filters['search']), function ($q) use ($filters) {
                return $q->where(function ($sq) use ($filters) {
                    $sq->where('title', 'like', '%'.$filters['search'].'%')
                        ->orWhere('message', 'like', '%'.$filters['search'].'%');
                });
            });

        return $query->latest('last_seen_at')->paginate(20)->withQueryString();
    }

    /**
     * Get real performance metrics for the project.
     */
    public function getPerformanceStats(Project $project): array
    {
        $total = $project->issues()->count();
        $resolved = $project->issues()->where('status', 'resolved')->count();
        $driver = DB::connection()->getDriverName();

        $resolutionRate = $total > 0 ? round(($resolved / $total) * 100, 1) : 0;
        $avgResolutionExpression = match ($driver) {
            'pgsql' => 'AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_time',
            'sqlite' => 'AVG((JULIANDAY(resolved_at) - JULIANDAY(created_at)) * 86400) as avg_time',
            default => 'AVG(TIMESTAMPDIFF(SECOND, created_at, resolved_at)) as avg_time',
        };

        $avgResolutionTime = $project->issues()
            ->whereNotNull('resolved_at')
            ->select(DB::raw($avgResolutionExpression))
            ->first()
            ->avg_time ?? 0;

        return [
            'resolution_rate' => $resolutionRate,
            'avg_resolution_time' => round($avgResolutionTime / 3600, 1), // in hours
            'total_resolved' => $resolved,
            'open_issues' => $project->issues()->where('status', 'open')->count(),
            'daily_trend' => $project->issues()
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->get(),
        ];
    }

    /**
     * Update issue attributes and log activity.
     */
    public function updateIssue(Issue $issue, array $data): Issue
    {
        $oldStatus = $issue->status;
        $oldPriority = $issue->priority;

        $issue->update($data);

        // Track Status Change
        if (isset($data['status']) && $oldStatus !== $data['status']) {
            $this->logActivity($issue, 'status_change', "changed status from {$oldStatus} to {$data['status']}");
            if ($data['status'] === 'resolved' && ! $issue->resolved_at) {
                $issue->update(['resolved_at' => now()]);
            }
        }

        // Track Assignee Change
        if (array_key_exists('assigned_to', $data) && (int) $issue->assigned_to !== (int) $data['assigned_to']) {
            $newAssigneeId = $data['assigned_to'];
            $assigneeName = 'Unassigned';

            if ($newAssigneeId) {
                $user = User::find($newAssigneeId);
                $assigneeName = $user ? $user->name : 'Unknown User';
            }

            $this->logActivity($issue, 'assignment', "assigned this issue to {$assigneeName}");
        }

        // Track Priority Change
        if (isset($data['priority']) && $oldPriority !== $data['priority']) {
            $this->logActivity($issue, 'priority_change', "changed priority from {$oldPriority} to {$data['priority']}");
        }

        return $issue;
    }

    /**
     * Add a comment to an issue.
     */
    public function addComment(Issue $issue, string $content): void
    {
        $this->logActivity($issue, 'comment', $content);
    }

    /**
     * Internal helper to record activity.
     */
    protected function logActivity(Issue $issue, string $type, string $content): void
    {
        $issue->activities()->create([
            'user_id' => auth()->id(),
            'type' => $type,
            'content' => $content,
        ]);
    }

    /**
     * Get summary stats for issues dashboard.
     */
    public function getIssueCounts(Project $project): array
    {
        $counts = $project->issues()
            ->selectRaw("SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count")
            ->selectRaw("SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count")
            ->selectRaw("SUM(CASE WHEN status = 'ignored' THEN 1 ELSE 0 END) as ignored_count")
            ->selectRaw("SUM(CASE WHEN status = 'open' AND assigned_to IS NULL THEN 1 ELSE 0 END) as unassigned_count")
            ->selectRaw("SUM(CASE WHEN status = 'open' AND priority = 'critical' THEN 1 ELSE 0 END) as critical_count")
            ->first();

        return [
            'open' => (int) ($counts->open_count ?? 0),
            'resolved' => (int) ($counts->resolved_count ?? 0),
            'ignored' => (int) ($counts->ignored_count ?? 0),
            'unassigned' => (int) ($counts->unassigned_count ?? 0),
            'critical' => (int) ($counts->critical_count ?? 0),
        ];
    }
}
