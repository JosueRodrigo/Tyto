import { Head, Link, router, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    Activity,
    CircleAlert,
    Clock3,
    ExternalLink,
    Gauge,
    Globe2,
    Settings2,
    ShieldCheck,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { MetricCard } from '@/components/observability/metric-card';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useLiveReload } from '@/hooks/use-live-reload';
import AppLayout from '@/layouts/app-layout';

const availability = (value: number | null) =>
    value === null ? '—' : `${value.toFixed(value % 1 ? 2 : 0)}%`;
const latency = (value: number | null) =>
    value === null ? '—' : `${value.toLocaleString()} ms`;

export default function UptimeIndex({
    monitor,
    summary,
    chart,
    checks,
    period,
}: any) {
    const { props }: any = usePage();
    const team = props.currentTeam || props.current_team;
    const project = props.currentProject || props.current_project;
    const baseUrl = `/${team?.slug}/${project?.slug}`;

    useLiveReload(project?.id);

    const selectPeriod = (nextPeriod: string) =>
        router.get(
            `${baseUrl}/uptime`,
            { period: nextPeriod },
            { preserveScroll: true, preserveState: true, replace: true },
        );

    return (
        <>
            <Head title={`Uptime · ${project?.name}`} />
            <div className="space-y-6">
                <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-primary uppercase">
                            <Globe2 className="size-4" /> Uptime center
                        </div>
                        <h1 className="text-3xl font-black tracking-[-0.04em] text-foreground">
                            Availability at a glance
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Track endpoint health, latency and every
                            availability check from one operational view.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {monitor.url && (
                            <Button variant="outline" asChild>
                                <a
                                    href={monitor.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open endpoint{' '}
                                    <ExternalLink className="size-4" />
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={`${baseUrl}/settings`}>
                                <Settings2 className="size-4" /> Configure
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="tyto-panel flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <div
                            className={`flex size-11 items-center justify-center rounded-xl ${monitor.status === 'up' ? 'bg-emerald-500/10 text-emerald-600' : monitor.status === 'down' ? 'bg-red-500/10 text-red-600' : 'bg-muted text-muted-foreground'}`}
                        >
                            {monitor.status === 'down' ? (
                                <CircleAlert className="size-5" />
                            ) : (
                                <ShieldCheck className="size-5" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">
                                    {monitor.status === 'up'
                                        ? 'Operational'
                                        : monitor.status === 'down'
                                          ? 'Endpoint down'
                                          : 'Awaiting first check'}
                                </span>
                                <Badge variant="outline">
                                    {monitor.enabled
                                        ? 'Monitoring on'
                                        : 'Monitoring off'}
                                </Badge>
                            </div>
                            <p className="mt-1 text-xs break-all text-muted-foreground">
                                {monitor.url || 'No endpoint configured'} ·
                                every {monitor.interval || 60} minutes
                            </p>
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground md:text-right">
                        <div className="font-semibold text-foreground">
                            Last check
                        </div>
                        {monitor.last_checked_at
                            ? formatDistanceToNow(
                                  new Date(monitor.last_checked_at),
                                  { addSuffix: true },
                              )
                            : 'Not checked yet'}
                    </div>
                </section>

                {!monitor.enabled && (
                    <section className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 text-sm text-amber-800 dark:text-amber-200">
                        Monitoring is paused. Existing history remains
                        available; enable uptime checks in project settings to
                        resume collection.
                    </section>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Uptime · 24h"
                        value={availability(summary.uptime_24h)}
                        detail="Availability in the last day"
                        icon={ShieldCheck}
                        tone={
                            summary.uptime_24h !== null &&
                            summary.uptime_24h < 99
                                ? 'critical'
                                : 'healthy'
                        }
                    />
                    <MetricCard
                        label="Uptime · 7d"
                        value={availability(summary.uptime_7d)}
                        detail="Rolling seven-day window"
                        icon={Globe2}
                        tone={
                            summary.uptime_7d !== null && summary.uptime_7d < 99
                                ? 'critical'
                                : 'healthy'
                        }
                    />
                    <MetricCard
                        label="Average latency"
                        value={latency(summary.average_response_time)}
                        detail={`Across ${summary.total_checks} checks`}
                        icon={Activity}
                        tone="neutral"
                    />
                    <MetricCard
                        label="P95 latency"
                        value={latency(summary.p95_response_time)}
                        detail={`${summary.down_checks} failed checks`}
                        icon={Gauge}
                        tone={summary.down_checks > 0 ? 'critical' : 'neutral'}
                    />
                </section>

                <section className="tyto-panel overflow-hidden">
                    <div className="flex flex-col justify-between gap-3 border-b border-border/70 p-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-bold text-foreground">
                                Response time
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Up to 300 recent samples in the selected window.
                            </p>
                        </div>
                        <div className="flex rounded-lg border border-border bg-muted/30 p-1">
                            {['24h', '7d'].map((option) => (
                                <Button
                                    key={option}
                                    size="sm"
                                    variant={
                                        period === option
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    onClick={() => selectPeriod(option)}
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {chart.length ? (
                        <div className="h-72 p-5">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chart}>
                                    <defs>
                                        <linearGradient
                                            id="uptimeLatency"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="var(--chart-1)"
                                                stopOpacity={0.42}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="var(--chart-1)"
                                                stopOpacity={0.02}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="var(--border)"
                                        opacity={0.55}
                                        strokeDasharray="4 6"
                                    />
                                    <XAxis
                                        dataKey="checked_at"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: 'var(--muted-foreground)',
                                            fontSize: 10,
                                        }}
                                        minTickGap={48}
                                        tickFormatter={(value) =>
                                            new Date(value).toLocaleTimeString(
                                                [],
                                                {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                },
                                            )
                                        }
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: 'var(--muted-foreground)',
                                            fontSize: 10,
                                        }}
                                        tickFormatter={(value) => `${value}ms`}
                                        width={52}
                                        domain={[0, 'auto']}
                                    />
                                    <Tooltip
                                        cursor={{
                                            stroke: 'var(--chart-1)',
                                            strokeOpacity: 0.28,
                                            strokeDasharray: '4 4',
                                        }}
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: '1px solid var(--border)',
                                            background: 'var(--popover)',
                                            color: 'var(--popover-foreground)',
                                            boxShadow:
                                                '0 18px 45px rgba(5, 5, 16, 0.35)',
                                            fontSize: 12,
                                        }}
                                        labelStyle={{
                                            color: 'var(--muted-foreground)',
                                            marginBottom: 4,
                                        }}
                                        itemStyle={{
                                            color: 'var(--chart-1)',
                                            fontWeight: 700,
                                        }}
                                        labelFormatter={(_, payload) =>
                                            payload?.[0]
                                                ? new Date(
                                                      payload[0].payload
                                                          .checked_at,
                                                  ).toLocaleString()
                                                : ''
                                        }
                                        formatter={(value) => [
                                            `${value ?? 0} ms`,
                                            'Latency',
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="response_time"
                                        connectNulls
                                        stroke="var(--chart-1)"
                                        strokeWidth={3}
                                        fill="url(#uptimeLatency)"
                                        dot={
                                            chart.length <= 48
                                                ? {
                                                      r: 3,
                                                      fill: 'var(--chart-1)',
                                                      stroke: 'var(--card)',
                                                      strokeWidth: 2,
                                                  }
                                                : false
                                        }
                                        activeDot={{
                                            r: 5,
                                            fill: 'var(--chart-1)',
                                            stroke: 'var(--card)',
                                            strokeWidth: 3,
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-56 flex-col items-center justify-center text-center">
                            <Activity className="mb-3 size-8 text-muted-foreground/40" />
                            <div className="font-semibold text-foreground">
                                No uptime samples yet
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                The chart will populate after the first endpoint
                                check.
                            </p>
                        </div>
                    )}
                </section>

                <section className="tyto-panel overflow-hidden">
                    <div className="border-b border-border/70 p-5">
                        <h2 className="font-bold text-foreground">
                            Check history
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Latest probe results, scoped to this project.
                        </p>
                    </div>
                    {checks.data.length ? (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="pl-5">
                                                Status
                                            </TableHead>
                                            <TableHead>Response</TableHead>
                                            <TableHead>HTTP</TableHead>
                                            <TableHead className="hidden lg:table-cell">
                                                Error
                                            </TableHead>
                                            <TableHead className="pr-5 text-right">
                                                Checked
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {checks.data.map((check: any) => (
                                            <TableRow key={check.id}>
                                                <TableCell className="pl-5">
                                                    <Badge
                                                        className={
                                                            check.status ===
                                                            'up'
                                                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                                : 'bg-red-500/10 text-red-700 dark:text-red-300'
                                                        }
                                                    >
                                                        {check.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {latency(
                                                        check.response_time,
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {check.status_code || '—'}
                                                </TableCell>
                                                <TableCell className="hidden max-w-xs truncate text-xs text-muted-foreground lg:table-cell">
                                                    {check.error || '—'}
                                                </TableCell>
                                                <TableCell className="pr-5 text-right text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock3 className="size-3.5" />
                                                        {new Date(
                                                            check.checked_at,
                                                        ).toLocaleString()}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <Pagination links={checks.links} meta={checks} />
                        </>
                    ) : (
                        <div className="p-10 text-center text-sm text-muted-foreground">
                            No checks recorded for this project.
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

UptimeIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Uptime', href: '#' }]}>{page}</AppLayout>
);
