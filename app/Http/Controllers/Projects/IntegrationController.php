<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use App\Models\Project;
use App\Models\Team;
use App\Services\IntegrationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IntegrationController extends Controller
{
    public function index(Request $request, Team $current_team, Project $project, IntegrationService $service)
    {
        $project->load(['integrations', 'alertRules.integrations', 'thresholds']);
        $integrations = $project->integrations->map(function (Integration $integration) {
            $attributes = $integration->toArray();
            $attributes['data'] = $integration->configurationForDisplay();
            $attributes['configuration_error'] = $integration->hasUnreadableConfiguration();

            return $attributes;
        });
        $alertRules = $project->alertRules->map(function ($rule) {
            $attributes = $rule->toArray();
            $attributes['integrations'] = $rule->integrations->map->only([
                'id',
                'name',
                'type',
                'status',
                'is_enabled',
            ])->values();

            return $attributes;
        });
        $project->unsetRelation('integrations')->unsetRelation('alertRules');

        return Inertia::render('projects/settings/index', [
            'project' => $project->makeVisible(['api_token']),
            'integrations' => $integrations,
            'alert_rules' => $alertRules,
            'available_types' => $service->getAvailableTypes(),
            'team_members' => $current_team->users,
        ]);
    }

    public function store(Request $request, Team $current_team, Project $project)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:slack,discord,telegram,webhook,email'],
            'data' => ['required', 'array'],
            ...$this->configurationRules($request->string('type')->toString()),
        ]);

        $integration = $project->integrations()->create([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'data' => $validated['data'],
            'is_enabled' => true,
        ]);

        $rules = $project->alertRules()->get();
        foreach ($rules as $rule) {
            $rule->integrations()->attach($integration->id);
        }

        return back()->with('success', 'Integration added successfully.');
    }

    public function update(Request $request, Team $current_team, Project $project, Integration $integration)
    {
        $this->ensureIntegrationBelongsToProject($integration, $project);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'is_enabled' => ['required', 'boolean'],
            'data' => ['required', 'array'],
            ...$this->configurationRules($integration->type, updating: true),
        ]);

        $integration->update([
            'name' => $validated['name'],
            'is_enabled' => $validated['is_enabled'],
            'data' => $integration->mergeConfiguration($validated['data']),
        ]);

        return back()->with('success', 'Integration updated successfully.');
    }

    public function destroy(Team $current_team, Project $project, Integration $integration)
    {
        $this->ensureIntegrationBelongsToProject($integration, $project);
        $integration->delete();

        return back()->with('success', 'Integration removed successfully.');
    }

    public function test(Request $request, Team $current_team, Project $project, Integration $integration)
    {
        $this->ensureIntegrationBelongsToProject($integration, $project);

        try {
            app(IntegrationService::class)->sendOrFail(
                $integration,
                '✅ Test Connection',
                'This is a test notification from Tyto to verify your integration settings.',
            );

            return back()->with('success', 'Test notification sent successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['integration' => 'Failed to send test: '.$e->getMessage()]);
        }
    }

    private function ensureIntegrationBelongsToProject(Integration $integration, Project $project): void
    {
        abort_unless($integration->project_id === $project->id, 404);
    }

    private function configurationRules(string $type, bool $updating = false): array
    {
        return match ($type) {
            'slack', 'discord' => ['data.webhook_url' => [$updating ? 'nullable' : 'required', 'url', 'max:2048']],
            'telegram' => [
                'data.bot_token' => [$updating ? 'nullable' : 'required', 'string', 'max:255'],
                'data.chat_id' => ['required', 'string', 'max:255'],
            ],
            'webhook' => ['data.url' => [$updating ? 'nullable' : 'required', 'url', 'max:2048']],
            'email' => [
                'data.email' => ['required', 'email:rfc', 'max:255'],
                'data.smtp_host' => ['required', 'string', 'max:255'],
                'data.smtp_port' => ['required', 'integer', 'between:1,65535'],
                'data.smtp_encryption' => ['required', Rule::in(['tls', 'ssl', 'none'])],
                'data.smtp_username' => ['nullable', 'string', 'max:255'],
                'data.smtp_password' => [$updating ? 'nullable' : 'required', 'string', 'max:1024'],
                'data.from_address' => ['required', 'email:rfc', 'max:255'],
                'data.from_name' => ['nullable', 'string', 'max:255'],
            ],
            default => [],
        };
    }
}
