import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Search,
    ShieldAlert,
    UserRoundX,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { IssueTable } from '@/components/issue-table';
import { MetricCard } from '@/components/observability/metric-card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLiveReload } from '@/hooks/use-live-reload';
import AppLayout from '@/layouts/app-layout';
import { formatCompactNumber } from '@/lib/utils';

type IssueFilters = {
    status?: string;
    priority?: string;
    search?: string;
};

type IssueCounts = {
    open?: number;
    resolved?: number;
    ignored?: number;
    unassigned?: number;
    critical?: number;
};

export default function Issues({
    issues,
    filters,
    counts,
    team_members,
    performance,
}: {
    issues: any;
    filters: IssueFilters;
    counts: IssueCounts;
    team_members: any[];
    performance: any;
}) {
    const { props }: any = usePage();
    const teamSlug = props.currentTeam?.slug || props.current_team?.slug;
    const project = props.current_project || props.currentProject;
    const [search, setSearch] = useState(filters.search || '');

    useLiveReload(project?.id);

    const updateFilter = useCallback(
        (next: IssueFilters) => {
            router.get(
                `/${teamSlug}/${project?.slug}/issues`,
                { ...filters, ...next },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        },
        [filters, project?.slug, teamSlug],
    );

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            if (search !== (filters.search || '')) {
                updateFilter({ search });
            }
        }, 400);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, updateFilter]);

    const statuses = [
        { value: 'open', label: 'Open', count: counts.open },
        { value: 'unassigned', label: 'Unassigned', count: counts.unassigned },
        { value: 'mine', label: 'Assigned to me' },
        { value: 'resolved', label: 'Resolved', count: counts.resolved },
        { value: 'ignored', label: 'Ignored', count: counts.ignored },
    ];

    return (
        <>
            <Head title="Incident center" />
            <div className="space-y-6">
                <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-red-600 uppercase dark:text-red-300">
                            <ShieldAlert className="size-4" /> Incident center
                        </div>
                        <h1 className="text-3xl font-black tracking-[-0.04em] text-foreground">
                            Triage what matters
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Prioritize recurring failures, assign ownership and
                            preserve the operational timeline from detection to
                            resolution.
                        </p>
                    </div>
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search title or error message"
                            className="h-10 bg-card pl-10"
                        />
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Open incidents"
                        value={formatCompactNumber(counts.open || 0)}
                        detail={`${formatCompactNumber(counts.critical || 0)} critical priority`}
                        icon={AlertTriangle}
                        tone={
                            (counts.critical || 0) > 0 ? 'critical' : 'warning'
                        }
                    />
                    <MetricCard
                        label="Unassigned"
                        value={formatCompactNumber(counts.unassigned || 0)}
                        detail="Incidents without an owner"
                        icon={UserRoundX}
                        tone={
                            (counts.unassigned || 0) > 0 ? 'warning' : 'healthy'
                        }
                    />
                    <MetricCard
                        label="Resolution rate"
                        value={`${performance.resolution_rate || 0}%`}
                        detail={`${formatCompactNumber(performance.total_resolved || 0)} resolved incidents`}
                        icon={CheckCircle2}
                        tone="healthy"
                    />
                    <MetricCard
                        label="Mean resolution"
                        value={`${performance.avg_resolution_time || 0}h`}
                        detail="Average time to resolve"
                        icon={Clock3}
                        tone="neutral"
                    />
                </section>

                <section className="tyto-panel overflow-hidden">
                    <div className="flex flex-col gap-4 border-b border-border/70 p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto">
                            {statuses.map((status) => (
                                <button
                                    key={status.value}
                                    type="button"
                                    onClick={() =>
                                        updateFilter({ status: status.value })
                                    }
                                    className={`rounded-lg px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors ${filters.status === status.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                >
                                    {status.label}
                                    {status.count !== undefined && (
                                        <span className="ml-1.5 opacity-60">
                                            {formatCompactNumber(status.count)}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <Select
                            value={filters.priority || 'all'}
                            onValueChange={(priority) =>
                                updateFilter({ priority })
                            }
                        >
                            <SelectTrigger className="h-9 w-full bg-background xl:w-44">
                                <SelectValue placeholder="All priorities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All priorities
                                </SelectItem>
                                <SelectItem value="critical">
                                    Critical
                                </SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="none">
                                    No priority
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <IssueTable issues={issues} team_members={team_members} />
                </section>

                <section className="tyto-panel p-5">
                    <div className="mb-5 flex items-start justify-between">
                        <div>
                            <h2 className="text-sm font-extrabold text-foreground">
                                Incident creation trend
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                New grouped incidents during the last 30 days
                            </p>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                            30 days
                        </span>
                    </div>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performance.daily_trend || []}>
                                <defs>
                                    <linearGradient
                                        id="issueTrend"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="var(--chart-2)"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="var(--chart-2)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 10,
                                        border: '1px solid var(--border)',
                                        background: 'var(--popover)',
                                        fontSize: 12,
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--chart-2)"
                                    strokeWidth={2}
                                    fill="url(#issueTrend)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>
        </>
    );
}

Issues.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Incident center', href: '#' }]}>
        {page}
    </AppLayout>
);
