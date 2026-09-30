import { Head } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock3,
    Radio,
    TriangleAlert,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

type DailyAvailability = {
    date: string;
    uptime: number | null;
};

const tone = (status: string) =>
    status === 'up' || status === 'active'
        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
        : status === 'unknown' || status === 'inactive'
          ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
          : 'border-red-400/20 bg-red-400/10 text-red-300';

export default function PublicStatus({ page }: any) {
    const operational = page.status === 'up';
    const measuredDays = page.daily.filter(
        (day: DailyAvailability) => day.uptime !== null,
    ).length;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#050510] text-[#eaeaea]">
            <Head title={page.title} />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(159,85,255,0.18),transparent_30rem),radial-gradient(circle_at_90%_90%,rgba(159,85,255,0.08),transparent_28rem)]" />
            <div className="tyto-grid pointer-events-none absolute inset-0 opacity-20" />
            <main className="relative mx-auto max-w-5xl px-5 py-10 sm:py-16">
                <header className="mb-12 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-lg font-black tracking-tight">
                        <span className="grid size-11 place-items-center rounded-[15px] border border-primary/30 bg-primary/10 shadow-[0_0_30px_rgba(159,85,255,0.18)]">
                            <AppLogoIcon className="size-8" />
                        </span>
                        <div>
                            <div>{page.title}</div>
                            <div className="mt-0.5 text-[9px] font-bold tracking-[0.18em] text-white/35 uppercase">
                                Service status
                            </div>
                        </div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-white/40 uppercase">
                        Powered by Tyto
                    </span>
                </header>

                <section
                    className={`mb-5 rounded-[28px] border p-7 sm:p-9 ${tone(page.status)}`}
                >
                    <div className="flex items-start gap-5">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-current/10">
                            {operational ? (
                                <CheckCircle2 className="size-7" />
                            ) : (
                                <TriangleAlert className="size-7" />
                            )}
                        </span>
                        <div>
                            <p className="mb-2 text-[10px] font-black tracking-[0.18em] uppercase">
                                Live system state
                            </p>
                            <h1 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                                {operational
                                    ? 'All systems operational'
                                    : page.status === 'unknown'
                                      ? 'Awaiting monitoring data'
                                      : 'Service disruption detected'}
                            </h1>
                            <p className="mt-2 text-sm opacity-70">
                                Verified from the latest availability signal
                                collected by Tyto.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-3">
                    <Metric
                        icon={CheckCircle2}
                        label="90-day uptime"
                        value={
                            page.uptime_90d == null
                                ? '—'
                                : `${page.uptime_90d}%`
                        }
                    />
                    <Metric
                        icon={Activity}
                        label="Average response"
                        value={
                            page.average_response_time == null
                                ? '—'
                                : `${Math.round(page.average_response_time)} ms`
                        }
                    />
                    <Metric
                        icon={Clock3}
                        label="Last checked"
                        value={
                            page.last_checked_at
                                ? new Date(
                                      page.last_checked_at,
                                  ).toLocaleString()
                                : 'Not yet'
                        }
                    />
                </section>

                <section className="mt-5 rounded-[28px] border border-white/10 bg-[#101020]/80 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
                    <div className="mb-7 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black tracking-[0.18em] text-primary uppercase">
                                Availability
                            </p>
                            <h2 className="mt-1 text-xl font-black tracking-tight">
                                Last 30 days
                            </h2>
                        </div>
                        <span className="text-right text-xs text-white/35">
                            {measuredDays} of 30 days monitored
                        </span>
                    </div>
                    <div
                        className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5 sm:grid-cols-[repeat(30,minmax(0,1fr))]"
                        aria-label="Daily availability"
                    >
                        {page.daily.map((day: DailyAvailability) => {
                            const label = new Date(
                                `${day.date}T12:00:00`,
                            ).toLocaleDateString(undefined, {
                                day: '2-digit',
                                month: 'short',
                            });
                            const title =
                                day.uptime === null
                                    ? `${label}: No data`
                                    : `${label}: ${day.uptime}% uptime`;

                            return (
                                <div
                                    key={day.date}
                                    title={title}
                                    aria-label={title}
                                    className={`h-12 rounded-md border transition duration-200 hover:-translate-y-1 hover:brightness-125 sm:h-16 ${availabilityTone(day.uptime)}`}
                                />
                            );
                        })}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[10px] font-bold tracking-[0.12em] text-white/30 uppercase">
                        <span>30 days ago</span>
                        <span>Today</span>
                    </div>
                </section>

                {page.heartbeats.length > 0 && (
                    <section className="mt-5 rounded-[28px] border border-white/10 bg-[#101020]/80 p-6 backdrop-blur-xl sm:p-8">
                        <p className="text-[10px] font-black tracking-[0.18em] text-primary uppercase">
                            Heartbeat network
                        </p>
                        <h2 className="mt-1 mb-5 text-xl font-black">
                            Background services
                        </h2>
                        <div className="divide-y divide-white/10">
                            {page.heartbeats.map((heartbeat: any) => (
                                <div
                                    key={heartbeat.name}
                                    className="flex items-center justify-between py-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Radio className="size-4 text-primary" />
                                        <span className="font-semibold">
                                            {heartbeat.name}
                                        </span>
                                    </div>
                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-bold ${tone(heartbeat.status)}`}
                                    >
                                        {heartbeat.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <footer className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 text-[10px] font-bold tracking-[0.12em] text-white/30 uppercase">
                    <span>Tyto observability</span>
                    <span>
                        Updated {new Date(page.updated_at).toLocaleString()}
                    </span>
                </footer>
            </main>
        </div>
    );
}

function availabilityTone(uptime: number | null) {
    if (uptime === null) {
        return 'border-white/5 bg-white/[0.04]';
    }

    if (uptime >= 99) {
        return 'border-emerald-300/30 bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.18)]';
    }

    if (uptime >= 90) {
        return 'border-amber-300/30 bg-amber-400';
    }

    return 'border-red-300/30 bg-red-400';
}

function Metric({ icon: Icon, label, value }: any) {
    return (
        <div className="rounded-[24px] border border-white/10 bg-[#101020]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <Icon className="mb-7 size-5 text-primary" />
            <div className="text-2xl font-black tracking-tight">{value}</div>
            <div className="mt-1 text-xs font-semibold text-white/35">
                {label}
            </div>
        </div>
    );
}
