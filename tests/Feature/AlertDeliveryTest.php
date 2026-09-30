<?php

use App\Jobs\SendAlertDelivery;
use App\Models\AlertDelivery;
use App\Models\AlertRule;
use App\Models\Integration;
use App\Models\Project;
use App\Services\AlertService;
use App\Services\IntegrationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

function alertFixture(array $ruleSettings = []): array
{
    $project = Project::factory()->create(['url' => 'https://app.test']);
    $integration = Integration::query()->create([
        'project_id' => $project->id,
        'name' => 'Operations webhook',
        'type' => 'webhook',
        'data' => ['url' => 'https://hooks.test/alerts'],
        'is_enabled' => true,
    ]);
    $rule = AlertRule::query()->create([
        'project_id' => $project->id,
        'name' => 'Uptime down',
        'event_type' => 'uptime_down',
        'settings' => $ruleSettings,
        'is_enabled' => true,
    ]);
    $rule->integrations()->attach($integration);

    return [$project, $integration, $rule];
}

test('triggered alerts persist one queued delivery per integration', function () {
    Queue::fake();
    Cache::clear();
    [$project, $integration, $rule] = alertFixture(['throttle_period' => 3600]);

    app(AlertService::class)->notifyUptimeDown($project, 503, 'Unavailable');

    $delivery = AlertDelivery::query()->sole();
    expect($delivery->project_id)->toBe($project->id)
        ->and($delivery->alert_rule_id)->toBe($rule->id)
        ->and($delivery->integration_id)->toBe($integration->id)
        ->and($delivery->status)->toBe('pending')
        ->and($delivery->event_type)->toBe('uptime_down');

    Queue::assertPushed(SendAlertDelivery::class, fn ($job) => $job->deliveryId === $delivery->id);

    app(AlertService::class)->notifyUptimeDown($project, 503, 'Unavailable');
    expect(AlertDelivery::query()->count())->toBe(1);
});

test('a delivery is marked delivered only after a successful response', function () {
    Http::fake(['hooks.test/*' => Http::response([], 204)]);
    [$project, $integration, $rule] = alertFixture();
    $delivery = AlertDelivery::query()->create([
        'project_id' => $project->id,
        'alert_rule_id' => $rule->id,
        'integration_id' => $integration->id,
        'event_type' => 'uptime_down',
        'title' => 'Site down',
        'message' => 'HTTP 503',
        'fields' => ['Status' => 503],
        'status' => 'pending',
    ]);

    (new SendAlertDelivery($delivery->id))->handle(app(IntegrationService::class));

    $delivery->refresh();
    expect($delivery->status)->toBe('delivered')
        ->and($delivery->attempts)->toBe(1)
        ->and($delivery->delivered_at)->not->toBeNull()
        ->and($integration->fresh()->status)->toBe('healthy');
});

test('http failures remain retryable and are never reported as delivered', function () {
    Http::fake(['hooks.test/*' => Http::response(['error' => 'down'], 500)]);
    [$project, $integration, $rule] = alertFixture();
    $delivery = AlertDelivery::query()->create([
        'project_id' => $project->id,
        'alert_rule_id' => $rule->id,
        'integration_id' => $integration->id,
        'event_type' => 'uptime_down',
        'title' => 'Site down',
        'message' => 'HTTP 503',
        'status' => 'pending',
    ]);
    $job = new SendAlertDelivery($delivery->id);

    try {
        $job->handle(app(IntegrationService::class));
        $this->fail('The failed HTTP response should throw.');
    } catch (RequestException $exception) {
        $job->failed($exception);
    }

    expect($delivery->fresh()->status)->toBe('failed')
        ->and($delivery->fresh()->last_error)->not->toBeNull()
        ->and($integration->fresh()->status)->toBe('failing');
});
