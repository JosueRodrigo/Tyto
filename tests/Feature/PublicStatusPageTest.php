<?php

use App\Models\Project;

it('does not expose a disabled status page', function () {
    $project = Project::factory()->create([
        'status_page_slug' => 'private-service',
        'status_page_enabled' => false,
    ]);

    $this->get('/status/'.$project->status_page_slug)->assertNotFound();
});

it('renders only public operational data for an enabled status page', function () {
    $project = Project::factory()->create([
        'name' => 'Internal project name',
        'api_token' => 'never-expose-this-token',
        'status_page_enabled' => true,
        'status_page_slug' => 'acme-status',
        'status_page_title' => 'Acme Cloud',
        'last_uptime_status' => 'up',
        'last_uptime_check_at' => now(),
    ]);
    $project->uptimeChecks()->create([
        'status' => 'up',
        'response_time' => 120,
        'status_code' => 200,
        'checked_at' => now(),
    ]);

    $this->get('/status/acme-status')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('status/show')
            ->where('page.title', 'Acme Cloud')
            ->where('page.status', 'up')
            ->has('page.daily', 30)
            ->where('page.daily.29.date', now()->toDateString())
            ->where('page.daily.29.uptime', 100)
            ->where('page.daily.28.uptime', null)
            ->missing('page.api_token'));
});
