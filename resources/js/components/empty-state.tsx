import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: {
        label: string;
        href: string;
    };
}

export function EmptyState({
    title,
    description,
    icon = Ghost,
    action,
}: EmptyStateProps) {
    return (
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-border/80 bg-card/70 p-12 text-center shadow-[0_24px_80px_-48px_rgba(159,85,255,0.7)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-1/4 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
            <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 shadow-2xl shadow-primary/10">
                    <Icon iconNode={icon} className="size-8 text-primary" />
                </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="mb-8 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>
            {action && (
                <Button
                    asChild
                    className="h-10 rounded-xl px-6 text-xs font-bold tracking-wide uppercase shadow-lg shadow-primary/15 transition-all active:scale-95"
                >
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
        </div>
    );
}
