import { Head } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock3,
    Radio,
    ShieldCheck,
    TriangleAlert,
} from 'lucide-react';

const tone = (status: string) =>
    status === 'up' || status === 'active'
        ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
        : status === 'unknown' || status === 'inactive'
          ? 'text-amber-600 bg-amber-500/10 border-amber-500/20'
          : 'text-red-600 bg-red-500/10 border-red-500/20';

export default function PublicStatus({ page }: any) {
    const operational = page.status === 'up';

    return (
        <div className="min-h-screen bg-[#f6f7f9] text-slate-950 dark:bg-[#090b10] dark:text-white">
            <Head title={page.title} />
            <main className="mx-auto max-w-4xl px-5 py-12 sm:py-20">
                <header className="mb-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-lg font-black tracking-tight">
                        <span className="grid size-9 place-items-center rounded-xl bg-amber-500 text-black">
                            <ShieldCheck className="size-5" />
                        </span>
                        {page.title}
                    </div>
                    <span className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">
                        Powered by Tyto
                    </span>
                </header>

                <section
                    className={`mb-6 rounded-2xl border p-6 ${tone(page.status)}`}
                >
                    <div className="flex items-center gap-4">
                        {operational ? (
                            <CheckCircle2 className="size-8" />
                        ) : (
                            <TriangleAlert className="size-8" />
                        )}
                        <div>
                            <h1 className="text-2xl font-black">
                                {operational
                                    ? 'All systems operational'
                                    : page.status === 'unknown'
                                      ? 'Awaiting monitoring data'
                                      : 'Service disruption detected'}
                            </h1>
                            <p className="mt-1 text-sm opacity-80">
                                Current state from the latest availability
                                check.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-3">
                    <Metric
                        icon={ShieldCheck}
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

                <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="mb-5">
                        <h2 className="font-black">
                            Availability · last 30 days
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Each bar represents one day with monitoring data.
                        </p>
                    </div>
                    <div
                        className="flex h-20 items-end gap-1"
                        aria-label="Daily availability"
                    >
                        {page.daily.length ? (
                            page.daily.map((day: any) => (
                                <div
                                    key={day.date}
                                    title={`${day.date}: ${day.uptime}%`}
                                    className={`min-w-1 flex-1 rounded-sm ${day.uptime >= 99 ? 'bg-emerald-500' : day.uptime >= 90 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{
                                        height: `${Math.max(12, day.uptime)}%`,
                                    }}
                                />
                            ))
                        ) : (
                            <p className="self-center text-sm text-slate-500">
                                No availability history yet.
                            </p>
                        )}
                    </div>
                </section>

                {page.heartbeats.length > 0 && (
                    <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <h2 className="mb-4 font-black">Background services</h2>
                        <div className="divide-y divide-black/5 dark:divide-white/10">
                            {page.heartbeats.map((heartbeat: any) => (
                                <div
                                    key={heartbeat.name}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Radio className="size-4 text-slate-400" />
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

                <footer className="mt-8 text-center text-xs text-slate-500">
                    Updated {new Date(page.updated_at).toLocaleString()}
                </footer>
            </main>
        </div>
    );
}

function Metric({ icon: Icon, label, value }: any) {
    return (
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <Icon className="mb-5 size-5 text-amber-500" />
            <div className="text-2xl font-black tracking-tight">{value}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
                {label}
            </div>
        </div>
    );
}
