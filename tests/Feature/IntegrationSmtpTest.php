<?php

use App\Models\Integration;
use App\Models\Project;
use App\Services\IntegrationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\Mailer;
use Illuminate\Mail\MailManager;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('integration credentials are encrypted at rest and masked for the browser', function () {
    $integration = Integration::query()->create([
        'project_id' => Project::factory()->create()->id,
        'name' => 'Operations SMTP',
        'type' => 'email',
        'data' => [
            'email' => 'ops@example.com',
            'smtp_host' => 'smtp.example.com',
            'smtp_password' => 'super-secret-password',
        ],
        'is_enabled' => true,
    ]);

    $stored = DB::table('integrations')->where('id', $integration->id)->value('data');

    expect($stored)->not->toContain('super-secret-password')
        ->and($integration->fresh()->data['smtp_password'])->toBe('super-secret-password')
        ->and($integration->configurationForDisplay()['smtp_password'])->toBe('');
});

test('blank secrets keep the existing credential during an update', function () {
    $integration = new Integration([
        'type' => 'email',
        'data' => ['smtp_password' => 'existing-password'],
    ]);

    $configuration = $integration->mergeConfiguration([
        'smtp_host' => 'smtp.example.com',
        'smtp_password' => '',
    ]);

    expect($configuration['smtp_password'])->toBe('existing-password');
});

test('email integrations build and use their own smtp transport', function () {
    $mailer = Mockery::mock(Mailer::class);
    $mailer->shouldReceive('raw')->once();

    $manager = Mockery::mock(MailManager::class);
    $manager->shouldReceive('build')
        ->once()
        ->with(Mockery::on(fn (array $configuration) => $configuration['transport'] === 'smtp'
            && $configuration['host'] === 'smtp.example.com'
            && $configuration['port'] === 587
            && $configuration['username'] === 'mailer@example.com'
            && $configuration['password'] === 'secret'
            && $configuration['timeout'] === 10
        ))
        ->andReturn($mailer);

    $integration = new Integration([
        'type' => 'email',
        'data' => [
            'email' => 'ops@example.com',
            'smtp_host' => 'smtp.example.com',
            'smtp_port' => 587,
            'smtp_encryption' => 'tls',
            'smtp_username' => 'mailer@example.com',
            'smtp_password' => 'secret',
            'from_address' => 'alerts@example.com',
            'from_name' => 'Tyto Alerts',
        ],
    ]);

    (new IntegrationService($manager))->sendOrFail(
        $integration,
        'Test alert',
        'SMTP delivery test',
    );
});
