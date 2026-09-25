<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\Project;
use App\Models\Team;
use App\Services\IssueService;
use App\Support\ExceptionTrace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IssueController extends Controller
{
    protected IssueService $issueService;

    public function __construct(IssueService $issueService)
    {
        $this->issueService = $issueService;
    }

    /**
     * Display a listing of project issues.
     */
    public function index(Request $request, Team $current_team, Project $project): Response
    {
        $filters = $request->only(['status', 'priority', 'search']);

        return Inertia::render('projects/issues/index', [
            'issues' => $this->issueService->getPaginatedIssues($project, $filters),
            'filters' => array_merge(['status' => 'open'], $filters),
            'counts' => $this->issueService->getIssueCounts($project),
            'performance' => $this->issueService->getPerformanceStats($project),
            'team_members' => $current_team->members,
        ]);
    }

    /**
     * Display the specified issue.
     */
    public function show(Team $current_team, Project $project, Issue $issue): Response
    {
        $issue->load(['assignee', 'records' => fn ($q) => $q->latest()->limit(1), 'activities.user']);

        if ($record = $issue->records->first()) {
            $record->payload = ExceptionTrace::normalize($record->payload);
        }

        return Inertia::render('projects/issues/show', [
            'issue' => $issue,
            'team_members' => $current_team->members,
        ]);
    }

    /**
     * Update the specified issue (status, priority, assignment).
     */
    public function update(Request $request, Team $current_team, Project $project, Issue $issue): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:open,resolved,ignored',
            'priority' => 'sometimes|string|in:none,low,medium,high,critical',
            'assigned_to' => [
                'sometimes',
                'nullable',
                Rule::exists('team_members', 'user_id')->where('team_id', $current_team->id),
            ],
        ]);

        $this->issueService->updateIssue($issue, $validated);

        return back()->with('success', 'Issue updated successfully.');
    }

    /**
     * Update multiple issues from the incident center.
     */
    public function bulkUpdate(Request $request, Team $current_team, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'issue_ids' => ['required', 'array', 'min:1', 'max:100'],
            'issue_ids.*' => ['required', 'integer', 'distinct'],
            'status' => ['required', 'string', 'in:resolved,ignored'],
        ]);

        $issues = $project->issues()
            ->whereIn('id', $validated['issue_ids'])
            ->get();

        abort_if($issues->count() !== count($validated['issue_ids']), 422, 'One or more issues do not belong to this project.');

        foreach ($issues as $issue) {
            $this->issueService->updateIssue($issue, ['status' => $validated['status']]);
        }

        return back()->with('success', $issues->count().' issues updated successfully.');
    }

    /**
     * Add a comment/activity to the issue.
     */
    public function comment(Request $request, Team $current_team, Project $project, Issue $issue): RedirectResponse
    {
        $validated = $request->validate(['comment' => 'required|string|max:5000']);

        $this->issueService->addComment($issue, $validated['comment']);

        return back()->with('success', 'Comment added.');
    }
}
