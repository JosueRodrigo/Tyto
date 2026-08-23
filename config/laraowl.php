<?php

// Legacy configuration bridge. New installations should configure config/tyto.php
// and TYTO_* environment variables instead.
return [

    /*
    |--------------------------------------------------------------------------
    | Repository
    |--------------------------------------------------------------------------
    |
    | The GitHub repository new releases are checked against. Forks that cut
    | their own releases should point this at their own repository.
    |
    */

    'repository' => env('LARAOWL_REPOSITORY', env('TYTO_REPOSITORY', 'JosueRodrigo/Tyto')),

    /*
    |--------------------------------------------------------------------------
    | Update Checks
    |--------------------------------------------------------------------------
    |
    | Legacy update settings kept so upgraded installations can migrate without
    | losing their environment configuration.
    | Disable this to stop the instance from making outbound requests.
    |
    */

    'update_check' => [
        'enabled' => env('LARAOWL_UPDATE_CHECK', true),
        'cache_ttl' => (int) env('LARAOWL_UPDATE_CHECK_TTL', 21600),
        'timeout' => (int) env('LARAOWL_UPDATE_CHECK_TIMEOUT', 10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Update Binaries
    |--------------------------------------------------------------------------
    |
    | Executables the legacy command alias shells out to. Override these
    | when they are not resolvable on the PATH of the user running the update,
    | for example "/usr/local/bin/composer".
    |
    */

    'binaries' => [
        'git' => env('LARAOWL_GIT_BINARY', 'git'),
        'composer' => env('LARAOWL_COMPOSER_BINARY', 'composer'),
        'npm' => env('LARAOWL_NPM_BINARY', 'npm'),
    ],

];
