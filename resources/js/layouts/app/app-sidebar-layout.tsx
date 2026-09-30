import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { UpdateBanner } from '@/components/update-banner';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className="relative min-h-screen overflow-hidden bg-background"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_40%_0%,rgba(159,85,255,0.11),transparent_35rem)]" />
                <div className="tyto-grid pointer-events-none absolute inset-x-0 top-0 h-96 opacity-35" />
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="relative mx-auto w-full max-w-[1680px] animate-in space-y-8 p-4 duration-500 fade-in sm:p-6 xl:p-9">
                    <UpdateBanner />
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
