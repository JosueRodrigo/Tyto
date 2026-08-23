import { usePage } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TimeFilter } from '@/components/time-filter';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs: providedBreadcrumbs,
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { props }: any = usePage();
    const breadcrumbs =
        providedBreadcrumbs && providedBreadcrumbs.length > 0
            ? providedBreadcrumbs
            : props.breadcrumbs || [];

    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl transition-all sm:px-6">
            <div className="flex items-center gap-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SidebarTrigger className="-ml-1" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start">
                        Toggle Sidebar (Ctrl/⌘ + B)
                    </TooltipContent>
                </Tooltip>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/8 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.1em] text-emerald-700 uppercase md:flex dark:text-emerald-300">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    Live telemetry
                    <Activity className="size-3" />
                </div>
                <TimeFilter />
            </div>
        </header>
    );
}
