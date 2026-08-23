<?php

namespace App\Services;

use App\Jobs\SendAlertDelivery;
use App\Models\AlertRule;
use App\Models\Heartbeat;
use App\Models\Issue;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;

class AlertService
{
    /**
     * Notify about a new issue (exception).
     */
    public function notifyNewIssue(Issue $issue)
    {
        $project = $issue->project;
        $rules = $project->alertRules()
            ->where('event_type', 'new_exception')
            ->where('is_enabled', true)
            ->with('integrations')
            ->get();

        $title = '🚨 New Exception: '.$issue->title;
        $message = $issue->message;
        $url = $issue->url();
        $fields = [
            'Project' => $project->name,
            'Type' => $issue->type,
            'Priority' => strtoupper($issue->priority),
        ];

        foreach ($rules as $rule) {
            $this->dispatchAlert($rule, $title, $message, $fields, $url);
        }
    }

    /**
     * Notify about slow performance violation.
     */
    public function notifySlowPerformance(Issue $issue)
    {
        $project = $issue->project;
        $rules = $project->alertRules()
            ->where('event_type', 'high_latency')
            ->where('is_enabled', true)
            ->with('integrations')
            ->get();

        $title = '⏱️ High Latency: '.$issue->title;
        $message = $issue->message;
        $url = $issue->url();
        $fields = [
            'Project' => $project->name,
            'Priority' => strtoupper($issue->priority),
        ];

        foreach ($rules as $rule) {
            $this->dispatchAlert($rule, $title, $message, $fields, $url);
        }
    }

    /**
     * Notify about uptime down.
     */
    public function notifyUptimeDown(Project $project, int $statusCode, ?string $error = null)
    {
        $rules = $project->alertRules()
            ->where('event_type', 'uptime_down')
            ->where('is_enabled', true)
            ->with('integrations')
            ->get();

        $title = '🚨 Uptime Alert: Site is DOWN!';
        $message = "The site returned a {$statusCode} status code.".($error ? "\nError: {$error}" : '');
        $url = $project->dashboardUrl();
        $fields = [
            'Project' => $project->name,
            'URL' => $project->url,
            'Status' => $statusCode,
        ];

        foreach ($rules as $rule) {
            $this->dispatchAlert($rule, $title, $message, $fields, $url);
        }
    }

    /**
     * Notify about heartbeat failure.
     */
    public function notifyHeartbeatFailed($heartbeat)
    {
        $project = $heartbeat->project;
        $rules = $project->alertRules()
            ->where('event_type', 'heartbeat_failed')
            ->where('is_enabled', true)
            ->with('integrations')
            ->get();

        $title = '💓 Heartbeat Failure: '.$heartbeat->name;
        $message = "The heartbeat '{$heartbeat->name}' has stopped checking in.";
        $url = $project->dashboardUrl();
        $fields = [
            'Project' => $project->name,
            'Last Seen' => $heartbeat->last_seen_at ? $heartbeat->last_seen_at->diffForHumans() : 'Never',
        ];

        foreach ($rules as $rule) {
            $this->dispatchAlert($rule, $title, $message, $fields, $url);
        }
    }

    public function notifyUptimeRecovered(Project $project): void
    {
        $rules = $project->alertRules()
            ->where('event_type', 'uptime_down')
            ->where('is_enabled', true)
            ->with('integrations')
            ->get();

        foreach ($rules as $rule) {
            $this->dispatchAlert(
                $rule,
                '✅ Uptime Recovered',
                'The monitored endpoint is responding again.',
                ['Project' => $project->name, 'URL' => $project->url, 'Status' => 'Recovered'],
                $project->dashboardUrl(),
            );
        }
    }

    public function notifyHeartbeatRecovered(Heartbeat $heartbeat): void
    {
        $rules = $heartbeat->project->alertRules()
            ->where('event_type', 'heartbeat_failed')
            ->where('is_enabled', true)
            ->with('integrations')
            ->get();

        foreach ($rules as $rule) {
            $this->dispatchAlert(
                $rule,
                '✅ Heartbeat Recovered: '.$heartbeat->name,
                "The heartbeat '{$heartbeat->name}' is checking in again.",
                ['Project' => $heartbeat->project->name, 'Status' => 'Recovered'],
                $heartbeat->project->dashboardUrl(),
            );
        }
    }

    /**
     * Notify about an error spike.
     */
    public function notifyErrorSpike(Project $project, int $count, int $windowMinutes)
    {
        $rules = $project->alertRules()
            ->where('event_type', 'error_spike')
            ->where('is_enabled', true)
            ->with('integrations')
            ->get();

        $title = '🔥 Error Spike Detected!';
        $message = "Detected {$count} errors in the last {$windowMinutes} minutes.";
        $url = $project->dashboardUrl();
        $fields = [
            'Project' => $project->name,
            'Spike Count' => $count,
            'Time Window' => "{$windowMinutes}m",
        ];

        foreach ($rules as $rule) {
            $this->dispatchAlert($rule, $title, $message, $fields, $url);
        }
    }

    /**
     * Dispatch alert to all integrations of a rule.
     */
    protected function dispatchAlert(AlertRule $rule, string $title, string $message, array $fields = [], ?string $url = null)
    {
        $settings = $rule->settings ?? [];
        $throttlePeriod = $settings['throttle_period'] ?? 3600;

        $errorHash = md5($title.$message);
        $cacheKey = "alert_rule_{$rule->id}_{$errorHash}";

        $lastSentKey = "{$cacheKey}_last_sent";
        if ($throttlePeriod > 0 && Cache::has($lastSentKey)) {
            return;
        }

        $queued = false;
        foreach ($rule->integrations as $integration) {
            if (! $integration->is_enabled) {
                continue;
            }

            $delivery = $rule->project->alertDeliveries()->create([
                'alert_rule_id' => $rule->id,
                'integration_id' => $integration->id,
                'event_type' => $rule->event_type,
                'title' => $title,
                'message' => $message,
                'fields' => $fields,
                'url' => $url,
                'status' => 'pending',
            ]);

            SendAlertDelivery::dispatch($delivery->id);
            $queued = true;
        }

        if ($queued && $throttlePeriod > 0) {
            Cache::put($lastSentKey, true, now()->addSeconds($throttlePeriod));
        }
    }
}
