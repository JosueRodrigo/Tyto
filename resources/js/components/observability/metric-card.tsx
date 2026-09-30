import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'healthy' | 'warning' | 'critical';

const tones: Record<Tone, string> = {
    neutral: 'bg-primary/10 text-primary',
    healthy: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    critical: 'bg-red-500/10 text-red-700 dark:text-red-300',
};

export function MetricCard({
    label,
    value,
    detail,
    icon: Icon,
    tone = 'neutral',
}: {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone?: Tone;
}) {
    return (
        <div className="tyto-panel group relative overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_55px_rgba(159,85,255,0.08)]">
            <div className="pointer-events-none absolute -top-16 -right-16 size-32 rounded-full bg-primary/5 blur-2xl transition-colors group-hover:bg-primary/10" />
            <div className="mb-5 flex items-start justify-between gap-4">
                <span className="text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
                    {label}
                </span>
                <span className={cn('rounded-xl p-2.5', tones[tone])}>
                    <Icon className="size-4" />
                </span>
            </div>
            <div className="relative text-3xl font-black tracking-[-0.05em] text-foreground">
                {value}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
        </div>
    );
}
