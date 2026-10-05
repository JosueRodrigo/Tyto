<?php

namespace App\Services\Agent;

use App\Mcp\Support\PayloadSanitizer;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Record;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class InvestigationService
{
    /**
     * Correlate issues and telemetry for an AI agent investigation.
     *
     * @param  array{query:string,period?:string,from?:string|null,to?:string|null,limit?:int}  $filters
     * @return array<string, mixed>
     */
    public function investigate(Project $project, array $filters): array
    {
        $query = trim($filters['query']);
        $period = $filters['period'] ?? '24h';
        $limit = (int) ($filters['limit'] ?? 20);

        $issues = $project->issues()
            ->where(function (Builder $builder) use ($query) {
                $builder->where('title', 'like', '%'.$query.'%')
                    ->orWhere('message', 'like', '%'.$query.'%');
            })
            ->orderByDesc('last_seen_at')
            ->limit($limit)
            ->get([
                'id', 'type', 'title', 'message', 'status', 'priority',
                'occurrences_count', 'users_count', 'first_seen_at', 'last_seen_at',
            ]);

        $recordsQuery = $project->records()
            ->forPeriod($period, $filters['from'] ?? null, $filters['to'] ?? null)
            ->where(function (Builder $builder) use ($query) {
                $builder->where('message', 'like', '%'.$query.'%')
                    ->orWhereRaw($this->payloadSearchExpression().' LIKE ?', ['%'.$query.'%']);
            })
            ->orderByDesc('created_at');

        $records = (clone $recordsQuery)
            ->limit($limit)
            ->get(['id', 'issue_id', 'type', 'trace_id', 'message', 'payload', 'created_at'])
            ->map(fn (Record $record) => $this->serializeRecord($record));

        $relatedTypes = (clone $recordsQuery)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($row) => ['type' => $row->type, 'count' => (int) $row->count]);

        $traceIds = $records->pluck('trace_id')->filter()->unique()->values()->take(20);
        $linkedIssueIds = $records->pluck('issue_id')->filter()->unique()->values();

        $linkedIssues = Issue::where('project_id', $project->id)
            ->whereIn('id', $linkedIssueIds)
            ->get([
                'id', 'type', 'title', 'message', 'status', 'priority',
                'occurrences_count', 'first_seen_at', 'last_seen_at',
            ]);

        return [
            'project' => ['name' => $project->name, 'slug' => $project->slug],
            'query' => $query,
            'window' => [
                'period' => $period,
                'from' => $filters['from'] ?? null,
                'to' => $filters['to'] ?? null,
            ],
            'summary' => [
                'matching_issues' => $issues->count(),
                'matching_records' => $records->count(),
                'trace_ids' => $traceIds->count(),
            ],
            'issues' => $issues,
            'linked_issues' => $linkedIssues,
            'records' => $records,
            'related_types' => $relatedTypes,
            'trace_ids' => $traceIds,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeRecord(Record $record): array
    {
        return [
            'id' => $record->id,
            'issue_id' => $record->issue_id,
            'type' => $record->type,
            'trace_id' => $record->trace_id,
            'message' => $record->message,
            'created_at' => $record->created_at,
            'payload' => PayloadSanitizer::sanitize((array) $record->payload),
        ];
    }

    private function payloadSearchExpression(): string
    {
        return match (DB::connection()->getDriverName()) {
            'pgsql', 'sqlite' => 'CAST(payload AS TEXT)',
            default => 'CAST(payload AS CHAR)',
        };
    }
}
