<?php

use App\Models\Integration;
use App\Models\Project;
use App\Services\IntegrationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('generic webhooks include an hmac signature when configured', function () {
    Http::fake(['hooks.example.com/*' => Http::response([], 204)]);

    $integration = Integration::query()->create([
        'project_id' => Project::factory()->create()->id,
        'name' => 'Signed webhook',
        'type' => 'webhook',
        'data' => [
            'url' => 'https://hooks.example.com/tyto',
            'signing_secret' => 'a-strong-signing-secret',
        ],
        'is_enabled' => true,
    ]);

    app(IntegrationService::class)->sendOrFail(
        $integration,
        'Site down',
        'HTTP 503',
        ['Status' => 503],
    );

    Http::assertSent(function (Request $request) {
        $payload = $request->data();
        $expected = 'sha256='.hash_hmac(
            'sha256',
            json_encode($payload, JSON_THROW_ON_ERROR),
            'a-strong-signing-secret',
        );

        return $request->url() === 'https://hooks.example.com/tyto'
            && $request->hasHeader('X-Tyto-Signature', $expected);
    });
});

test('webhooks reject private and local destinations', function (string $url) {
    $integration = new Integration([
        'type' => 'webhook',
        'data' => ['url' => $url],
    ]);

    expect(fn () => app(IntegrationService::class)->sendOrFail(
        $integration,
        'Test',
        'Private endpoint test',
    ))->toThrow(RuntimeException::class, 'Private integration endpoints are not allowed.');
})->with([
    'localhost' => 'https://localhost/hook',
    'loopback' => 'https://127.0.0.1/hook',
    'private network' => 'https://10.0.0.2/hook',
]);

test('provider integrations reject a webhook on an unexpected host', function () {
    $integration = new Integration([
        'type' => 'slack',
        'data' => ['webhook_url' => 'https://attacker.example/collect'],
    ]);

    expect(fn () => app(IntegrationService::class)->sendOrFail(
        $integration,
        'Test',
        'Host allowlist test',
    ))->toThrow(RuntimeException::class, 'not allowed');
});
