<?php

use Illuminate\Support\Facades\Artisan;

test('legacy LaraOwl command aliases remain registered', function () {
    $commands = Artisan::all();

    expect($commands)->toHaveKeys([
        'laraowl:update',
        'laraowl:rollups:backfill',
        'laraowl:mcp-token',
        'laraowl:projects:create',
        'laraowl:teams:create',
        'laraowl:teams:invite',
    ]);
});
