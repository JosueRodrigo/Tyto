<?php

namespace App\Mcp\Tools;

use App\Mcp\Concerns\ResolvesAccessibleProjects;
use App\Models\Project;
use App\Models\User;
use App\Services\Agent\InvestigationService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
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

        $result = app(InvestigationService::class)->investigate($project, [
            'query' => (string) $request->get('query'),
            'period' => $request->get('period', '24h'),
            'from' => $request->get('from'),
            'to' => $request->get('to'),
            'limit' => (int) $request->get('limit', 20),
        ]);

        return Response::json($result);
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
