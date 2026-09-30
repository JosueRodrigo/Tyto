<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Jobs\SendAlertDelivery;
use App\Models\AlertDelivery;
use App\Models\AlertRule;
use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AlertRuleController extends Controller
{
    public function index(Team $current_team, Project $project)
    {
        $summary = $project->alertDeliveries()
            ->selectRaw('COUNT(*) as total_count')
            ->selectRaw("SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_count")
            ->selectRaw("SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count")
            ->selectRaw("SUM(CASE WHEN status IN ('pending', 'processing') THEN 1 ELSE 0 END) as pending_count")
            ->first();

        return Inertia::render('projects/alerts/index', [
            'rules' => $project->alertRules()->with('integrations')->get(),
            'integrations' => $project->integrations()->where('is_enabled', true)->get(),
            'deliveries' => $project->alertDeliveries()
                ->with(['integration:id,name,type', 'alertRule:id,name'])
                ->latest()
                ->paginate(20),
            'summary' => [
                'total' => (int) ($summary->total_count ?? 0),
                'delivered' => (int) ($summary->delivered_count ?? 0),
                'failed' => (int) ($summary->failed_count ?? 0),
                'pending' => (int) ($summary->pending_count ?? 0),
            ],
            'event_types' => [
                ['id' => 'new_exception', 'name' => 'New Exception', 'description' => 'Alert when a new type of exception is detected'],
                ['id' => 'success_rate_drop', 'name' => 'Success Rate Drop', 'description' => 'Alert when success rate falls below a threshold'],
                ['id' => 'high_latency', 'name' => 'High Latency', 'description' => 'Alert when average response time exceeds a threshold'],
                ['id' => 'daily_summary', 'name' => 'Daily Summary', 'description' => 'Send a summary of activity every 24 hours'],
            ],
        ]);
    }

    public function retry(Team $current_team, Project $project, AlertDelivery $delivery)
    {
        abort_unless($delivery->project_id === $project->id, 404);
        abort_if($delivery->status !== 'failed', 422, 'Only failed deliveries can be retried.');

        $delivery->update([
            'status' => 'pending',
            'last_error' => null,
        ]);

        SendAlertDelivery::dispatch($delivery->id);

        return back()->with('success', 'Alert delivery queued for retry.');
    }

    public function store(Request $request, Team $current_team, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'event_type' => ['required', 'string', Rule::in(['new_exception', 'success_rate_drop', 'high_latency', 'daily_summary', 'error_spike', 'uptime_down', 'heartbeat_failed'])],
            'settings' => 'nullable|array',
            'integration_ids' => 'nullable|array',
            'integration_ids.*' => Rule::exists('integrations', 'id')->where('project_id', $project->id),
        ]);

        try {
            $rule = $project->alertRules()->create([
                'name' => $validated['name'],
                'event_type' => $validated['event_type'],
                'settings' => $validated['settings'] ?? [],
            ]);

            if (! empty($validated['integration_ids'])) {
                $rule->integrations()->sync($validated['integration_ids']);
            }

            return back()->with('success', 'Alert rule created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to save alert rule: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to save rule: '.$e->getMessage()]);
        }
    }

    public function update(Request $request, Team $current_team, Project $project, AlertRule $rule)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'settings' => 'required|array',
            'is_enabled' => 'required|boolean',
            'integration_ids' => 'array',
            'integration_ids.*' => Rule::exists('integrations', 'id')->where('project_id', $project->id),
        ]);

        $rule->update([
            'name' => $validated['name'],
            'settings' => $validated['settings'],
            'is_enabled' => $validated['is_enabled'],
        ]);

        $rule->integrations()->sync($request->input('integration_ids', []));

        return back()->with('success', 'Alert rule updated successfully.');
    }

    public function destroy(Team $current_team, Project $project, AlertRule $rule)
    {
        $rule->delete();

        return back()->with('success', 'Alert rule deleted successfully.');
    }
}
