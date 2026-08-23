import { Head, router, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import {
    CheckCircle2,
    Clock3,
    RefreshCw,
    Send,
    Siren,
    TriangleAlert,
} from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';

const statusClasses: Record<string, string> = {
    delivered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    failed: 'bg-red-500/10 text-red-700 dark:text-red-300',
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    processing: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
};

export default function AlertDeliveries({ deliveries, summary }: any) {
    const { props }: any = usePage();
    const team = props.currentTeam || props.current_team;
    const project = props.currentProject || props.current_project;

    const retry = (delivery: any) =>
        router.post(
            `/${team?.slug}/${project?.slug}/alerts/deliveries/${delivery.id}/retry`,
            {},
            { preserveScroll: true },
        );

    return (
        <>
            <Head title={`Alert delivery · ${project?.name}`} />
            <div className="space-y-6">
                <section>
                    <div className="mb-2 flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-primary uppercase">
                        <Siren className="size-4" /> Alert delivery
                    </div>
                    <h1 className="text-3xl font-black tracking-[-0.04em] text-foreground">
                        Delivery history
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Audit every notification attempt, inspect failures and
                        retry deliveries without generating a duplicate alert.
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Total"
                        value={summary.total.toLocaleString()}
                        detail="Persisted delivery attempts"
                        icon={Send}
                        tone="neutral"
                    />
                    <MetricCard
                        label="Delivered"
                        value={summary.delivered.toLocaleString()}
                        detail="Confirmed by the integration"
                        icon={CheckCircle2}
                        tone="healthy"
                    />
                    <MetricCard
                        label="Pending"
                        value={summary.pending.toLocaleString()}
                        detail="Queued or being processed"
                        icon={Clock3}
                        tone="warning"
                    />
                    <MetricCard
                        label="Failed"
                        value={summary.failed.toLocaleString()}
                        detail="Exhausted automatic retries"
                        icon={TriangleAlert}
                        tone={summary.failed ? 'critical' : 'healthy'}
                    />
                </section>

                <section className="tyto-panel overflow-hidden">
                    <div className="border-b border-border/70 p-5">
                        <h2 className="font-bold text-foreground">
                            Recent deliveries
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Automatic retries use progressive backoff before a
                            delivery is marked failed.
                        </p>
                    </div>
                    {deliveries.data.length ? (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead className="pl-5">
                                                Alert
                                            </TableHead>
                                            <TableHead>Destination</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Attempts</TableHead>
                                            <TableHead className="hidden xl:table-cell">
                                                Last error
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Created
                                            </TableHead>
                                            <TableHead className="w-14" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deliveries.data.map(
                                            (delivery: any) => (
                                                <TableRow key={delivery.id}>
                                                    <TableCell className="max-w-xs pl-5">
                                                        <div className="truncate font-semibold text-foreground">
                                                            {delivery.title}
                                                        </div>
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            {delivery.alert_rule
                                                                ?.name ||
                                                                delivery.event_type}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm font-medium text-foreground">
                                                            {delivery
                                                                .integration
                                                                ?.name ||
                                                                'Removed integration'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground capitalize">
                                                            {delivery
                                                                .integration
                                                                ?.type ||
                                                                'unknown'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                statusClasses[
                                                                    delivery
                                                                        .status
                                                                ] ||
                                                                statusClasses.pending
                                                            }
                                                        >
                                                            {delivery.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {delivery.attempts}
                                                    </TableCell>
                                                    <TableCell className="hidden max-w-sm truncate text-xs text-red-600 xl:table-cell">
                                                        {delivery.last_error ||
                                                            '—'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs text-muted-foreground">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                delivery.created_at,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {delivery.status ===
                                                            'failed' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    retry(
                                                                        delivery,
                                                                    )
                                                                }
                                                                title="Retry delivery"
                                                            >
                                                                <RefreshCw className="size-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <Pagination
                                links={deliveries.links}
                                meta={deliveries}
                            />
                        </>
                    ) : (
                        <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
                            <Send className="mb-3 size-8 text-muted-foreground/35" />
                            <div className="font-semibold text-foreground">
                                No alerts delivered yet
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Deliveries will appear when an enabled rule is
                                triggered.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

AlertDeliveries.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Alert delivery', href: '#' }]}>
        {page}
    </AppLayout>
);
