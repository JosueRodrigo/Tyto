import { Head, Link, router, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    Activity,
    ArrowRight,
    Braces,
    Fingerprint,
    Search,
    Server,
    Waypoints,
} from 'lucide-react';
import { useState } from 'react';
import { MetricCard } from '@/components/observability/metric-card';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCompactNumber } from '@/lib/utils';

const signalTypes = [
    ['all', 'All signals'],
    ['request', 'Requests'],
    ['exception', 'Exceptions'],
    ['query', 'Queries'],
    ['job-attempt', 'Job attempts'],
    ['queued-job', 'Queued jobs'],
    ['log', 'Logs'],
    ['scheduled-task', 'Scheduled tasks'],
    ['outgoing-request', 'Outgoing requests'],
    ['cache-event', 'Cache'],
    ['mail', 'Mail'],
    ['notification', 'Notifications'],
] as const;

const typeTone: Record<string, string> = {
    request: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    exception: 'bg-red-500/10 text-red-700 dark:text-red-300',
    query: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    log: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    'job-attempt': 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    'queued-job': 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
};

export default function TelemetryExplorer({ records, filters, stats }: any) {
    const { props }: any = usePage();
    const teamSlug = props.currentTeam?.slug || props.current_team?.slug;
    const project = props.currentProject || props.current_project;
    const [search, setSearch] = useState(filters.search || '');
    const [traceId, setTraceId] = useState(filters.trace_id || '');

    const navigate = (next: Record<string, string>) =>
        router.get(
            `/${teamSlug}/${project?.slug}/telemetry`,
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        navigate({ search, trace_id: traceId });
    };

    const recordHref = (record: any) => {
        const query = new URLSearchParams();

        if (filters.period) {
            query.set('period', filters.period);
        }

        if (filters.from) {
            query.set('from', filters.from);
        }

        if (filters.to) {
            query.set('to', filters.to);
        }

        return `/${teamSlug}/${project?.slug}/records/${record.id}?${query.toString()}`;
    };

    return (
        <>
            <Head title="Telemetry explorer" />
            <div className="space-y-6">
                <section>
                    <div className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-primary uppercase">
                        <Waypoints className="size-4" /> Telemetry explorer
                    </div>
                    <h1 className="text-3xl font-black tracking-[-0.04em] text-foreground">
                        Search every signal
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Investigate indexed messages, isolate a trace and move
                        between telemetry domains without losing the selected
                        time window.
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Requests"
                        value={formatCompactNumber(stats.requests || 0)}
                        detail="HTTP request signals"
                        icon={Activity}
                        tone="healthy"
                    />
                    <MetricCard
                        label="Exceptions"
                        value={formatCompactNumber(stats.exceptions || 0)}
                        detail="Captured failures"
                        icon={Braces}
                        tone={
                            (stats.exceptions || 0) > 0 ? 'critical' : 'healthy'
                        }
                    />
                    <MetricCard
                        label="Queries"
                        value={formatCompactNumber(stats.queries || 0)}
                        detail="Database operations"
                        icon={Server}
                        tone="neutral"
                    />
                    <MetricCard
                        label="Logs"
                        value={formatCompactNumber(stats.logs || 0)}
                        detail="Application log events"
                        icon={Fingerprint}
                        tone="neutral"
                    />
                </section>

                <section className="tyto-panel overflow-hidden">
                    <form
                        onSubmit={submit}
                        className="grid gap-3 border-b border-border/70 p-4 lg:grid-cols-[190px_1fr_1fr_auto]"
                    >
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(type) => navigate({ type })}
                        >
                            <SelectTrigger className="bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {signalTypes.map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="bg-background pl-10"
                                placeholder="Search indexed message"
                                maxLength={200}
                            />
                        </div>
                        <div className="relative">
                            <Waypoints className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={traceId}
                                onChange={(event) =>
                                    setTraceId(event.target.value)
                                }
                                className="bg-background pl-10 font-mono text-xs"
                                placeholder="Exact trace ID"
                                maxLength={100}
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>

                    {records.data?.length ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow>
                                        <TableHead className="pl-5">
                                            Signal
                                        </TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead className="hidden lg:table-cell">
                                            Trace
                                        </TableHead>
                                        <TableHead className="hidden xl:table-cell">
                                            Source IP
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Observed
                                        </TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.data.map((record: any) => (
                                        <TableRow
                                            key={record.id}
                                            className="group h-[68px] border-border/70 hover:bg-primary/[0.035]"
                                        >
                                            <TableCell className="pl-5">
                                                <Badge
                                                    className={`border-0 text-[10px] ${typeTone[record.type] || 'bg-muted text-muted-foreground'}`}
                                                >
                                                    {record.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={recordHref(record)}
                                                    className="block max-w-xl"
                                                >
                                                    <span className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">
                                                        {record.message ||
                                                            'Signal without a summarized message'}
                                                    </span>
                                                    <span className="mt-1 block text-[10px] text-muted-foreground">
                                                        Record #{record.id}
                                                        {record.issue
                                                            ? ` · Incident ${record.issue.status}`
                                                            : ''}
                                                    </span>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden max-w-52 truncate font-mono text-[10px] text-muted-foreground lg:table-cell">
                                                {record.trace_id || '—'}
                                            </TableCell>
                                            <TableCell className="hidden font-mono text-xs text-muted-foreground xl:table-cell">
                                                {record.ip || '—'}
                                            </TableCell>
                                            <TableCell className="text-right text-xs whitespace-nowrap text-muted-foreground">
                                                {formatDistanceToNow(
                                                    new Date(record.created_at),
                                                    { addSuffix: true },
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={recordHref(
                                                            record,
                                                        )}
                                                        aria-label={`Open record ${record.id}`}
                                                    >
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination links={records.links} meta={records} />
                        </div>
                    ) : (
                        <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
                            <Search className="mb-4 size-8 text-muted-foreground/40" />
                            <h2 className="text-sm font-extrabold text-foreground">
                                No telemetry matched
                            </h2>
                            <p className="mt-1 max-w-md text-xs text-muted-foreground">
                                Change the signal type, widen the time window or
                                use a different indexed message.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

TelemetryExplorer.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Telemetry explorer', href: '#' }]}>
        {page}
    </AppLayout>
);
