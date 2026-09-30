import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Gauge,
    Globe2,
    HeartPulse,
    Radio,
    ServerCog,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { MetricCard } from '@/components/observability/metric-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLiveReload } from '@/hooks/use-live-reload';
import AppLayout from '@/layouts/app-layout';
import { appendMonitoringQuery } from '@/lib/monitoring-query';
import { formatCompactNumber, formatMicroSeconds } from '@/lib/utils';

type DashboardProps = {
    total_requests: number;
    request_breakdown?: {
        ok?: number;
        client_error?: number;
        server_error?: number;
    };
    duration_stats?: { min?: number; max?: number; avg?: number };
    total_exceptions: number;
    timeSeries?: Array<Record<string, number | string>>;
    exceptionTimeSeries?: Array<Record<string, number | string>>;
    job_stats?: {
        total?: number;
        failed?: number;
        processed?: number;
        avg_duration?: number;
    };
    impacted_users?: Array<Record<string, unknown>>;
    active_users?: Array<{
        user_identifier: string;
        user_email?: string;
        request_count: number;
    }>;
    auth_users_count: number;
    guest_users_count: number;
    uptime_status?: { current?: string; last_check?: string };
    operational_health?: {
        status: 'healthy' | 'warning' | 'critical';
        uptime: { status: string; last_check?: string };
        heartbeats: {
            total: number;
            healthy: number;
            failing: number;
            inactive: number;
        };
        incidents: { open: number; critical: number; unassigned: number };
    };
    period: string;
    from?: string;
    to?: string;
};

const tooltipStyle = {
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--popover)',
    color: 'var(--popover-foreground)',
    fontSize: 12,
};

export default function Dashboard(props: DashboardProps) {
    const { props: pageProps }: any = usePage();
    const project = pageProps.current_project || pageProps.currentProject;
    const teamSlug =
        pageProps.current_team?.slug || pageProps.currentTeam?.slug;
    const href = (path: string) =>
        appendMonitoringQuery(`/${teamSlug}/${project?.slug}/${path}`, {
            period: props.period,
            from: props.from,
            to: props.to,
        });

    useLiveReload(project?.id);

    const uptimeEnabled = project?.uptime_monitoring_enabled ?? true;
    const isUp = uptimeEnabled && props.uptime_status?.current === 'up';
    const isDown = uptimeEnabled && props.uptime_status?.current === 'down';
    const serverErrors = props.request_breakdown?.server_error || 0;
    const errorRate = props.total_requests
        ? (serverErrors / props.total_requests) * 100
        : 0;
    const averageDuration = props.duration_stats?.avg || 0;
    const jobsFailed = props.job_stats?.failed || 0;
    const operationalHealth = props.operational_health;

    return (
        <>
            <Head title={`Overview · ${project?.name || 'Tyto'}`} />
            <div className="space-y-7">
                <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className={
                                    isDown
                                        ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300'
                                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                }
                            >
                                <span className="mr-1.5 size-1.5 rounded-full bg-current" />
                                {!uptimeEnabled
                                    ? 'Uptime disabled'
                                    : isUp
                                      ? 'Operational'
                                      : isDown
                                        ? 'Service disruption'
                                        : 'Waiting for health check'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                Window: {props.period}
                            </span>
                        </div>
                        <p className="mb-2 text-[10px] font-black tracking-[0.2em] text-primary uppercase">
                            Command center
                        </p>
                        <h1 className="text-3xl font-black tracking-[-0.055em] text-foreground sm:text-[2.75rem]">
                            See the whole system.
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            Health, performance and incident signals for{' '}
                            <span className="font-bold text-foreground">
                                {project?.name}
                            </span>
                            . Understand what changed and act before users feel
                            it.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={href('requests')}>
                                Explore telemetry
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={href('issues')}>
                                Open incidents <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Requests"
                        value={formatCompactNumber(props.total_requests)}
                        detail={`${formatCompactNumber(props.request_breakdown?.ok || 0)} successful responses`}
                        icon={Radio}
                        tone="healthy"
                    />
                    <MetricCard
                        label="Average latency"
                        value={formatMicroSeconds(averageDuration)}
                        detail={`Range ${formatMicroSeconds(props.duration_stats?.min || 0)}–${formatMicroSeconds(props.duration_stats?.max || 0)}`}
                        icon={Gauge}
                        tone={averageDuration > 500000 ? 'warning' : 'neutral'}
                    />
                    <MetricCard
                        label="Exceptions"
                        value={formatCompactNumber(props.total_exceptions)}
                        detail={`${props.impacted_users?.length || 0} impacted users`}
                        icon={AlertTriangle}
                        tone={
                            props.total_exceptions > 0 ? 'critical' : 'healthy'
                        }
                    />
                    <MetricCard
                        label="Error rate"
                        value={`${errorRate.toFixed(2)}%`}
                        detail={`${formatCompactNumber(serverErrors)} server errors`}
                        icon={Activity}
                        tone={errorRate > 1 ? 'critical' : 'healthy'}
                    />
                </section>

                {operationalHealth && (
                    <section className="tyto-panel overflow-hidden ring-1 ring-primary/5">
                        <div className="flex flex-col justify-between gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-center">
                            <div>
                                <div className="flex items-center gap-2 font-extrabold text-foreground">
                                    <span
                                        className={`size-2.5 rounded-full ${
                                            operationalHealth.status ===
                                            'critical'
                                                ? 'animate-pulse bg-red-500'
                                                : operationalHealth.status ===
                                                    'warning'
                                                  ? 'bg-amber-500'
                                                  : 'bg-emerald-500'
                                        }`}
                                    />
                                    System pulse
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Current state across availability, recurring
                                    processes and incidents.
                                </p>
                            </div>
                            <Badge
                                className={
                                    operationalHealth.status === 'critical'
                                        ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                                        : operationalHealth.status === 'warning'
                                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                }
                            >
                                {operationalHealth.status === 'critical'
                                    ? 'Action required'
                                    : operationalHealth.status === 'warning'
                                      ? 'Needs attention'
                                      : 'All systems healthy'}
                            </Badge>
                        </div>
                        <div className="grid gap-px bg-border/70 md:grid-cols-3">
                            <Link
                                href={href('uptime')}
                                className="group bg-card p-5 transition-colors hover:bg-primary/[0.035]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-300">
                                        <Globe2 className="size-4" />
                                    </span>
                                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                </div>
                                <div className="mt-4 font-bold text-foreground">
                                    Uptime
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground capitalize">
                                    {operationalHealth.uptime.status ===
                                    'disabled'
                                        ? 'Monitoring disabled'
                                        : operationalHealth.uptime.status ===
                                            'unknown'
                                          ? 'Waiting for first check'
                                          : operationalHealth.uptime.status}
                                </p>
                            </Link>
                            <Link
                                href={href('heartbeats')}
                                className="group bg-card p-5 transition-colors hover:bg-primary/[0.035]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-300">
                                        <HeartPulse className="size-4" />
                                    </span>
                                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                </div>
                                <div className="mt-4 font-bold text-foreground">
                                    Heartbeats
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {operationalHealth.heartbeats.failing > 0
                                        ? `${operationalHealth.heartbeats.failing} missing check-ins`
                                        : `${operationalHealth.heartbeats.healthy}/${operationalHealth.heartbeats.total} healthy`}
                                </p>
                            </Link>
                            <Link
                                href={href('issues')}
                                className="group bg-card p-5 transition-colors hover:bg-primary/[0.035]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="rounded-lg bg-red-500/10 p-2 text-red-600 dark:text-red-300">
                                        <AlertTriangle className="size-4" />
                                    </span>
                                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                </div>
                                <div className="mt-4 font-bold text-foreground">
                                    Incidents
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {operationalHealth.incidents.open} open ·{' '}
                                    {operationalHealth.incidents.critical}{' '}
                                    critical
                                </p>
                            </Link>
                        </div>
                    </section>
                )}

                {props.total_requests === 0 && (
                    <section className="tyto-panel flex flex-col gap-5 border-primary/20 bg-primary/[0.04] p-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-extrabold text-foreground">
                                Connect your first Laravel application
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Install the collector and use the project token
                                to start streaming telemetry.
                            </p>
                        </div>
                        <code className="rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-xs text-foreground">
                            composer require tyto/agent
                        </code>
                    </section>
                )}

                <section className="grid gap-4 xl:grid-cols-12">
                    <div className="tyto-panel p-5 xl:col-span-8">
                        <PanelHeader
                            title="Request volume"
                            detail="Successful, client-error and server-error responses"
                            href={href('requests')}
                        />
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={props.timeSeries || []}
                                    barGap={2}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="var(--border)"
                                        opacity={0.55}
                                    />
                                    <XAxis
                                        dataKey="minute"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10 }}
                                        minTickGap={32}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10 }}
                                        width={32}
                                    />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar
                                        dataKey="ok"
                                        stackId="status"
                                        fill="var(--chart-1)"
                                        radius={[3, 3, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="client_error"
                                        stackId="status"
                                        fill="var(--chart-4)"
                                    />
                                    <Bar
                                        dataKey="server_error"
                                        stackId="status"
                                        fill="var(--destructive)"
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="tyto-panel flex flex-col p-5 xl:col-span-4">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <h2 className="font-extrabold text-foreground">
                                    Incident pressure
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Exception occurrences over time
                                </p>
                            </div>
                            {props.total_exceptions === 0 ? (
                                <CheckCircle2 className="size-5 text-emerald-500" />
                            ) : (
                                <AlertTriangle className="size-5 text-red-500" />
                            )}
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={props.exceptionTimeSeries || []}
                                >
                                    <defs>
                                        <linearGradient
                                            id="incidentArea"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="var(--destructive)"
                                                stopOpacity={0.28}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="var(--destructive)"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="var(--destructive)"
                                        strokeWidth={2}
                                        fill="url(#incidentArea)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <Button
                            className="mt-auto w-full"
                            variant="outline"
                            asChild
                        >
                            <Link href={href('exceptions')}>
                                Review exceptions{' '}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <SummaryPanel
                        icon={ServerCog}
                        tone="blue"
                        title="Queue health"
                        detail="Background processing"
                    >
                        <div className="grid grid-cols-3 gap-3">
                            <CompactMetric
                                label="Total"
                                value={props.job_stats?.total || 0}
                            />
                            <CompactMetric
                                label="Processed"
                                value={props.job_stats?.processed || 0}
                            />
                            <CompactMetric
                                label="Failed"
                                value={jobsFailed}
                                critical={jobsFailed > 0}
                            />
                        </div>
                    </SummaryPanel>
                    <SummaryPanel
                        icon={Users}
                        tone="violet"
                        title="Audience"
                        detail="Observed application users"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <CompactMetric
                                label="Authenticated"
                                value={props.auth_users_count || 0}
                            />
                            <CompactMetric
                                label="Guests"
                                value={props.guest_users_count || 0}
                            />
                        </div>
                    </SummaryPanel>
                    <SummaryPanel
                        icon={Clock3}
                        tone="amber"
                        title="Most active"
                        detail="Top users in this window"
                    >
                        <div className="space-y-2">
                            {(props.active_users || [])
                                .slice(0, 3)
                                .map((user) => (
                                    <div
                                        key={user.user_identifier}
                                        className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2"
                                    >
                                        <span className="truncate text-xs font-bold">
                                            {user.user_identifier}
                                        </span>
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {formatCompactNumber(
                                                user.request_count,
                                            )}
                                        </span>
                                    </div>
                                ))}
                            {!props.active_users?.length && (
                                <p className="py-3 text-center text-xs text-muted-foreground">
                                    No user activity yet
                                </p>
                            )}
                        </div>
                    </SummaryPanel>
                </section>
            </div>
        </>
    );
}

function PanelHeader({
    title,
    detail,
    href,
}: {
    title: string;
    detail: string;
    href: string;
}) {
    return (
        <div className="mb-6 flex items-start justify-between gap-4">
            <div>
                <h2 className="font-extrabold text-foreground">{title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href={href}>
                    Details <ArrowRight className="size-3.5" />
                </Link>
            </Button>
        </div>
    );
}

function SummaryPanel({
    icon: Icon,
    tone,
    title,
    detail,
    children,
}: {
    icon: LucideIcon;
    tone: 'blue' | 'violet' | 'amber';
    title: string;
    detail: string;
    children: React.ReactNode;
}) {
    const tones = {
        blue: 'bg-blue-500/10 text-blue-500',
        violet: 'bg-violet-500/10 text-violet-500',
        amber: 'bg-amber-500/10 text-amber-500',
    };

    return (
        <div className="tyto-panel p-5">
            <div className="mb-5 flex items-center gap-3">
                <span className={`rounded-lg p-2 ${tones[tone]}`}>
                    <Icon className="size-4" />
                </span>
                <div>
                    <h2 className="text-sm font-extrabold">{title}</h2>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function CompactMetric({
    label,
    value,
    critical = false,
}: {
    label: string;
    value: number;
    critical?: boolean;
}) {
    return (
        <div className="rounded-lg border border-border/70 bg-muted/35 p-3">
            <div
                className={`text-lg font-black tabular-nums ${critical ? 'text-red-500' : 'text-foreground'}`}
            >
                {formatCompactNumber(value)}
            </div>
            <div className="mt-0.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                {label}
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Overview', href: '#' }]}>
        {page}
    </AppLayout>
);
