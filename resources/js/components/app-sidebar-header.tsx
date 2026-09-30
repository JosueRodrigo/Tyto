import { usePage } from '@inertiajs/react';
import { Activity, Moon, Sun } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { TimeFilter } from '@/components/time-filter';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import { useLocale } from '@/hooks/use-locale';
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
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const { t } = useLocale();

    return (
        <header className="sticky top-0 z-50 flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/75 px-4 backdrop-blur-2xl transition-all sm:px-7">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SidebarTrigger className="-ml-1" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start">
                        {t('header.toggleSidebar')}
                    </TooltipContent>
                </Tooltip>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.12em] text-primary uppercase md:flex">
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
                        <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    {t('header.liveTelemetry')}
                    <Activity className="size-3" />
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-9 rounded-full border-primary/20 bg-primary/8 text-primary shadow-[0_0_20px_rgba(159,85,255,0.1)] transition-all hover:border-primary/40 hover:bg-primary/15 hover:text-primary"
                            onClick={() =>
                                updateAppearance(isDark ? 'light' : 'dark')
                            }
                            aria-label={
                                isDark
                                    ? t('header.lightTheme')
                                    : t('header.darkTheme')
                            }
                        >
                            {isDark ? (
                                <Sun className="size-4" />
                            ) : (
                                <Moon className="size-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        {isDark
                            ? t('header.lightTheme')
                            : t('header.darkTheme')}
                    </TooltipContent>
                </Tooltip>
                <LocaleSwitcher />
                <TimeFilter />
            </div>
        </header>
    );
}
