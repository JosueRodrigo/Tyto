<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyTytoToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-Tyto-Token') ?? $request->bearerToken();

        if (! $token) {
            abort(401, 'API Token is missing.');
        }

        $project = Project::where('api_token', $token)->first();

        if (! $project) {
            abort(401, 'Invalid API Token.');
        }

        $request->attributes->set('project', $project);

        return $next($request);
    }
}
