<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\CommentOnIssue;
use App\Mcp\Tools\GetIssue;
use App\Mcp\Tools\ListIssues;
use App\Mcp\Tools\ListProjects;
use App\Mcp\Tools\QueryTelemetry;
use App\Mcp\Tools\UpdateIssueStatus;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Instructions;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;

#[Name('tyto')]
#[Version('0.1.0')]
#[Instructions('Browse Tyto projects, issues, and telemetry, and triage issues by updating status or adding comments. All data is scoped to the authenticated user\'s teams.')]
class TytoServer extends Server
{
    protected array $tools = [
        ListProjects::class,
        ListIssues::class,
        GetIssue::class,
        QueryTelemetry::class,
        UpdateIssueStatus::class,
        CommentOnIssue::class,
    ];
}
