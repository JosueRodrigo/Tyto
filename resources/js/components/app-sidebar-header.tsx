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
        <header className="sticky top-0 z-50 flex h-[68px] shrink-0 items-center justify-between border-b border-border/60 bg-background/75 px-4 backdrop-blur-2xl transition-all sm:px-7">
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
                <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.12em] text-primary uppercase md:flex">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
                        <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    Live telemetry
                    <Activity className="size-3" />
                </div>
                <TimeFilter />
            </div>
        </header>
    );
}
