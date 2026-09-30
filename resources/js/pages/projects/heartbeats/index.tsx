import { Head, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    Activity,
    CircleAlert,
    Clock3,
    HeartPulse,
    PauseCircle,
    ServerCog,
    ShieldCheck,
    TerminalSquare,
} from 'lucide-react';
import { MetricCard } from '@/components/observability/metric-card';
import { Badge } from '@/components/ui/badge';
import { useLiveReload } from '@/hooks/use-live-reload';
import AppLayout from '@/layouts/app-layout';

const statusMeta: Record<
    string,
    { label: string; classes: string; icon: typeof Activity }
> = {
    active: {
        label: 'Healthy',
        classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        icon: ShieldCheck,
    },
    failing: {
        label: 'Missing',
        classes: 'bg-red-500/10 text-red-700 dark:text-red-300',
        icon: CircleAlert,
    },
    inactive: {
        label: 'Inactive',
        classes: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
        icon: PauseCircle,
    },
};

const intervalLabel = (minutes: number) => {
    if (minutes >= 1440 && minutes % 1440 === 0) {
        return `${minutes / 1440}d`;
    }

    if (minutes >= 60 && minutes % 60 === 0) {
        return `${minutes / 60}h`;
    }

    return `${minutes}m`;
};

export default function HeartbeatIndex({ heartbeats, summary }: any) {
    const { props }: any = usePage();
    const project = props.currentProject || props.current_project;

    useLiveReload(project?.id);

    return (
        <>
            <Head title={`Heartbeats · ${project?.name}`} />
            <div className="space-y-6">
                <section>
                    <div className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-primary uppercase">
                        <HeartPulse className="size-4" /> Heartbeat center
                    </div>
                    <h1 className="text-3xl font-black tracking-[-0.04em] text-foreground">
                        Watch recurring processes
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Detect a stopped scheduler, cron, import or backup as
                        soon as its expected check-in is missed.
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Monitors"
                        value={summary.total.toLocaleString()}
                        detail="Recurring processes"
                        icon={HeartPulse}
                        tone="neutral"
                    />
                    <MetricCard
                        label="Healthy"
                        value={summary.active.toLocaleString()}
                        detail="Checking in on schedule"
                        icon={ShieldCheck}
                        tone="healthy"
                    />
                    <MetricCard
                        label="Missing"
                        value={summary.failing.toLocaleString()}
                        detail="Past the grace window"
                        icon={CircleAlert}
                        tone={summary.failing > 0 ? 'critical' : 'healthy'}
                    />
                    <MetricCard
                        label="Inactive"
                        value={summary.inactive.toLocaleString()}
                        detail="Collection paused"
                        icon={PauseCircle}
                        tone="warning"
                    />
                </section>

                {heartbeats.length ? (
                    <section className="grid gap-4 lg:grid-cols-2">
                        {heartbeats.map((heartbeat: any) => {
                            const meta =
                                statusMeta[heartbeat.status] ||
                                statusMeta.inactive;
                            const StatusIcon = meta.icon;

                            return (
                                <article
                                    key={heartbeat.id}
                                    className="tyto-panel p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span
                                                className={`mt-0.5 rounded-lg p-2 ${meta.classes}`}
                                            >
                                                <StatusIcon className="size-4" />
                                            </span>
                                            <div className="min-w-0">
                                                <h2 className="truncate font-bold text-foreground">
                                                    {heartbeat.name}
                                                </h2>
                                                <code className="mt-1 block truncate text-xs text-muted-foreground">
                                                    {heartbeat.slug}
                                                </code>
                                            </div>
                                        </div>
                                        <Badge className={meta.classes}>
                                            {meta.label}
                                        </Badge>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border/70 pt-4 text-xs">
                                        <div>
                                            <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                                                <Clock3 className="size-3.5" />{' '}
                                                Last check-in
                                            </div>
                                            <span className="text-muted-foreground">
                                                {heartbeat.last_seen_at
                                                    ? formatDistanceToNow(
                                                          new Date(
                                                              heartbeat.last_seen_at,
                                                          ),
                                                          { addSuffix: true },
                                                      )
                                                    : 'Never'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                                                <Activity className="size-3.5" />{' '}
                                                Expected every
                                            </div>
                                            <span className="text-muted-foreground">
                                                {intervalLabel(
                                                    heartbeat.interval_minutes,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {heartbeat.next_expected_at &&
                                        heartbeat.status !== 'inactive' && (
                                            <div
                                                className={`mt-4 rounded-lg px-3 py-2 text-xs ${heartbeat.status === 'failing' ? 'bg-red-500/[0.07] text-red-700 dark:text-red-300' : 'bg-muted/50 text-muted-foreground'}`}
                                            >
                                                {heartbeat.status === 'failing'
                                                    ? 'Expected '
                                                    : 'Next expected '}
                                                {formatDistanceToNow(
                                                    new Date(
                                                        heartbeat.next_expected_at,
                                                    ),
                                                    { addSuffix: true },
                                                )}
                                            </div>
                                        )}
                                </article>
                            );
                        })}
                    </section>
                ) : (
                    <section className="tyto-panel flex min-h-64 flex-col items-center justify-center p-8 text-center">
                        <ServerCog className="mb-4 size-10 text-muted-foreground/35" />
                        <h2 className="font-bold text-foreground">
                            No heartbeat received yet
                        </h2>
                        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                            Update the Tyto agent and keep Laravel Scheduler
                            running. The default scheduler monitor will appear
                            after its first check-in.
                        </p>
                    </section>
                )}

                <section className="tyto-panel overflow-hidden">
                    <div className="border-b border-border/70 p-5">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                            <TerminalSquare className="size-4 text-primary" />{' '}
                            Add a custom heartbeat
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Send a check-in only after the recurring process
                            completes successfully.
                        </p>
                    </div>
                    <div className="grid gap-px bg-border/70 lg:grid-cols-2">
                        <div className="bg-card p-5">
                            <div className="mb-3 text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
                                Application code
                            </div>
                            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                                <code>{`TytoAgent::heartbeat(
    'nightly-import',
    'Nightly customer import',
    1440,
);`}</code>
                            </pre>
                        </div>
                        <div className="bg-card p-5">
                            <div className="mb-3 text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
                                Artisan / cron
                            </div>
                            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                                <code>
                                    php artisan tyto:heartbeat nightly-import
                                    <br /> --name=&quot;Nightly customer
                                    import&quot; --interval=1440
                                </code>
                            </pre>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

HeartbeatIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Heartbeats', href: '#' }]}>
        {page}
    </AppLayout>
);
