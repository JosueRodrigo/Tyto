import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'healthy' | 'warning' | 'critical';

const tones: Record<Tone, string> = {
    neutral: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
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
        <div className="tyto-panel group p-5 transition-colors hover:border-primary/30">
            <div className="mb-5 flex items-start justify-between gap-4">
                <span className="text-[11px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
                    {label}
                </span>
                <span className={cn('rounded-lg p-2', tones[tone])}>
                    <Icon className="size-4" />
                </span>
            </div>
            <div className="text-3xl font-black tracking-[-0.04em] text-foreground">
                {value}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
        </div>
    );
}
