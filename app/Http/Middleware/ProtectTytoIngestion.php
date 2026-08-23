<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class ProtectTytoIngestion
{
    public function __construct(private readonly RateLimiter $limiter) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $maximumBytes = (int) config('tyto.ingestion.max_payload_bytes');
        $contentLength = (int) $request->headers->get('Content-Length', '0');

        if ($contentLength > $maximumBytes || strlen($request->getContent()) > $maximumBytes) {
            return new JsonResponse(['message' => 'Ingestion payload is too large.'], 413);
        }

        /** @var Project $project */
        $project = $request->attributes->get('project');
        $key = "tyto:ingest-rate:{$project->getKey()}";
        $maximumAttempts = (int) config('tyto.ingestion.rate_limit_per_minute');

        if ($this->limiter->tooManyAttempts($key, $maximumAttempts)) {
            return new JsonResponse(
                ['message' => 'Ingestion rate limit exceeded.'],
                429,
                ['Retry-After' => (string) $this->limiter->availableIn($key)],
            );
        }

        $this->limiter->hit($key, 60);

        return $next($request);
    }
}
