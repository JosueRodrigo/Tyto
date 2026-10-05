<?php

namespace App\Mcp\Tools;

use App\Mcp\Concerns\ResolvesAccessibleProjects;
use App\Mcp\Support\PayloadSanitizer;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Record;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Tool;

#[Description('Investigate a problem in one Tyto project by correlating issues and telemetry around a search term and time window. Returns evidence for AI agents: matching issues, recent records, related telemetry types, trace ids, and suggested next queries.')]
class InvestigateProject extends Tool
{
    use ResolvesAccessibleProjects;

    public function handle(Request $request): Response
    {
        $request->validate([
            'project' => ['required', 'string'],
            'query' => ['required', 'string', 'min:2', 'max:500'],
            'period' => ['nullable', 'in:1h,24h,7d,14d,30d,custom'],
            'from' => ['nullable', 'date', 'required_if:period,custom'],
            'to' => ['nullable', 'date', 'required_if:period,custom'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $identifier = (string) $request->get('project');
        $project = $this->resolveAccessibleProject($user, $identifier);

        if (! $project instanceof Project) {
            return Response::error("Project [{$identifier}] not found or not accessible.");
        }

        $query = trim((string) $request->get('query'));
        $limit = (int) $request->get('limit', 20);

        $issues = $project->issues()
            ->where(function (Builder $builder) use ($query) {
                $builder->where('title', 'like', '%'.$query.'%')
                    ->orWhere('message', 'like', '%'.$query.'%');
            })
            ->orderByDesc('last_seen_at')
            ->limit($limit)
            ->get([
                'id',
                'type',
                'title',
                'message',
                'status',
                'priority',
                'occurrences_count',
                'users_count',
                'first_seen_at',
                'last_seen_at',
            ]);

        $recordsQuery = $project->records()
            ->forPeriod(
                $request->get('period', '24h'),
                $request->get('from'),
                $request->get('to'),
            )
            ->where(function (Builder $builder) use ($query) {
                $builder->where('message', 'like', '%'.$query.'%')
                    ->orWhereRaw($this->payloadSearchExpression().' LIKE ?', ['%'.$query.'%']);
            })
            ->orderByDesc('created_at');

        $records = (clone $recordsQuery)
            ->limit($limit)
            ->get([
                'id',
                'issue_id',
                'type',
                'trace_id',
                'message',
                'payload',
                'created_at',
            ])
            ->map(fn (Record $record) => [
                'id' => $record->id,
                'issue_id' => $record->issue_id,
                'type' => $record->type,
                'trace_id' => $record->trace_id,
                'message' => $record->message,
                'created_at' => $record->created_at,
                'payload' => PayloadSanitizer::sanitize((array) $record->payload),
            ]);

        $relatedTypes = (clone $recordsQuery)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'type' => $row->type,
                'count' => (int) $row->count,
            ]);

        $traceIds = $records
            ->pluck('trace_id')
            ->filter()
            ->unique()
            ->values()
            ->take(20);

        $linkedIssueIds = $records
            ->pluck('issue_id')
            ->filter()
            ->unique()
            ->values();

        $linkedIssues = Issue::where('project_id', $project->id)
            ->whereIn('id', $linkedIssueIds)
            ->get([
                'id',
                'type',
                'title',
                'message',
                'status',
                'priority',
                'occurrences_count',
                'first_seen_at',
                'last_seen_at',
            ]);

        return Response::json([
            'project' => [
                'name' => $project->name,
                'slug' => $project->slug,
            ],
            'query' => $query,
            'window' => [
                'period' => $request->get('period', '24h'),
                'from' => $request->get('from'),
                'to' => $request->get('to'),
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
            'suggested_next_queries' => $this->suggestedNextQueries($records, $traceIds),
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, array<string, mixed>>  $records
     * @param  \Illuminate\Support\Collection<int, mixed>  $traceIds
     * @return array<int, array<string, mixed>>
     */
    private function suggestedNextQueries($records, $traceIds): array
    {
        $types = $records->pluck('type')->filter()->unique()->values();

        $suggestions = $types
            ->take(5)
            ->map(fn (string $type) => [
                'tool' => 'query-telemetry',
                'arguments' => ['type' => $type],
                'reason' => "Inspect more {$type} telemetry in the same project and time window.",
            ])
            ->values()
            ->all();

        if ($traceIds->isNotEmpty()) {
            $suggestions[] = [
                'tool' => 'query-telemetry',
                'arguments' => ['trace_id' => $traceIds->first()],
                'reason' => 'Follow one trace id to correlate request, query, job, and outgoing-request records.',
            ];
        }

        return $suggestions;
    }

    /**
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'project' => $schema->string()->description('Project slug.')->required(),
            'query' => $schema->string()->description('Problem description, error text, route, class, job, command, SQL fragment, trace id, or other search term.')->required(),
            'period' => $schema->string()->description('Time window: 1h, 24h, 7d, 14d, 30d, or custom.')->enum(['1h', '24h', '7d', '14d', '30d', 'custom'])->default('24h'),
            'from' => $schema->string()->description('ISO start time when period=custom.'),
            'to' => $schema->string()->description('ISO end time when period=custom.'),
            'limit' => $schema->integer()->description('Maximum issues and records returned (1-50).')->default(20),
        ];
    }
}
