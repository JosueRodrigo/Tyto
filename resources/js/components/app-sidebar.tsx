import { Link, usePage } from '@inertiajs/react';

import {
    LayoutGrid,
    AlertCircle,
    Activity,
    Repeat,
    Terminal,
    Calendar,
    Zap,
    Search,
    Bell,
    Mail,
    Database,
    ExternalLink,
    Users,
    FileText,
    Settings,
    Globe,
    HeartPulse,
    Shield,
    Lock as LockIcon,
    ScanSearch,
    Siren,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { useLocale } from '@/hooks/use-locale';
import type { PageProps } from '@/types';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { props } = usePage<PageProps>();
    const { t } = useLocale();
    const teamSlug = props.currentTeam?.slug || '';

    const projects = (props as any).projects || [];
    const currentProject = (props as any).currentProject;
    const projectSlug =
        currentProject?.slug || (projects.length > 0 ? projects[0].slug : '');

    const currentPeriod = (props as any).period || '1h';
    const from = (props as any).from;
    const to = (props as any).to;

    const withPeriod = (url: string) => {
        if (!url || url === '#' || url.startsWith('http')) {
            return url;
        }

        const [base, query] = url.split('?');
        const searchParams = new URLSearchParams(query || '');

        searchParams.set('period', currentPeriod);

        if (from) {
            searchParams.set('from', from);
        }

        if (to) {
            searchParams.set('to', to);
        }

        return `${base}?${searchParams.toString()}`;
    };

    const dashboardUrl = projectSlug
        ? withPeriod(`/${teamSlug}/${projectSlug}/dashboard`)
        : teamSlug
          ? `/${teamSlug}/projects/create`
          : '/';

    const activityNavItems: NavItem[] = [
        {
            title: t('nav.requests'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/requests`),
            icon: Activity,
        },
        {
            title: t('nav.jobs'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/jobs`),
            icon: Repeat,
        },
        {
            title: t('nav.commands'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/commands`),
            icon: Terminal,
        },
        {
            title: t('nav.scheduledTasks'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/scheduled-tasks`),
            icon: Calendar,
        },
        {
            title: t('nav.exceptions'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/exceptions`),
            icon: Zap,
        },
        {
            title: t('nav.queries'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/queries`),
            icon: Search,
        },
        {
            title: t('nav.notifications'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/notifications`),
            icon: Bell,
        },
        {
            title: t('nav.mail'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/mail`),
            icon: Mail,
        },
        {
            title: t('nav.cache'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/cache`),
            icon: Database,
        },
        {
            title: t('nav.outgoingRequests'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/outgoing-requests`),
            icon: ExternalLink,
        },
    ];

    const uptimeEnabled = currentProject?.uptime_monitoring_enabled ?? true;

    const monitoringNavItems: NavItem[] = [
        {
            title: t('nav.alertDelivery'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/alerts`),
            icon: Siren,
        },
        {
            title: t('nav.users'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/users`),
            icon: Users,
        },
        ...(uptimeEnabled
            ? [
                  {
                      title: t('nav.uptime'),
                      href: withPeriod(`/${teamSlug}/${projectSlug}/uptime`),
                      icon: Globe,
                  },
              ]
            : []),
        {
            title: t('nav.heartbeats'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/heartbeats`),
            icon: HeartPulse,
        },
        {
            title: t('nav.logs'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/logs`),
            icon: FileText,
        },
    ];

    const securityNavItems: NavItem[] = [
        {
            title: t('nav.security'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/security`),
            icon: Shield,
        },
        {
            title: t('nav.firewall'),
            href: withPeriod(`/${teamSlug}/${projectSlug}/firewall`),
            icon: LockIcon,
            items: [
                {
                    title: 'Overview',
                    href: withPeriod(`/${teamSlug}/${projectSlug}/firewall`),
                },
                {
                    title: 'Traffic',
                    href: withPeriod(
                        `/${teamSlug}/${projectSlug}/firewall/traffic`,
                    ),
                },
                {
                    title: 'Rules',
                    href: withPeriod(
                        `/${teamSlug}/${projectSlug}/firewall/rules`,
                    ),
                },
                {
                    title: 'Audit Log',
                    href: withPeriod(
                        `/${teamSlug}/${projectSlug}/firewall/audit`,
                    ),
                },
            ],
        },
    ];

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-white/[0.06] bg-sidebar"
        >
            <SidebarHeader className="relative overflow-hidden px-3 pt-5 pb-3">
                <div className="pointer-events-none absolute -top-20 -left-16 size-52 rounded-full bg-primary/12 blur-3xl" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-16 hover:bg-transparent"
                        >
                            <Link
                                href={dashboardUrl}
                                prefetch
                                className="flex items-center gap-3"
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <div className="relative mt-4 px-1">
                    <WorkspaceSwitcher />
                </div>
            </SidebarHeader>

            <SidebarContent className="custom-scrollbar px-2 pt-4">
                <div className="space-y-4">
                    <NavMain
                        items={[
                            {
                                title: t('nav.dashboard'),
                                href: dashboardUrl,
                                icon: LayoutGrid,
                            },
                            {
                                title: t('nav.issues'),
                                href: withPeriod(
                                    `/${teamSlug}/${projectSlug}/issues`,
                                ),
                                icon: AlertCircle,
                            },
                            {
                                title: t('nav.telemetry'),
                                href: withPeriod(
                                    `/${teamSlug}/${projectSlug}/telemetry`,
                                ),
                                icon: ScanSearch,
                            },
                        ]}
                        label={t('nav.platform')}
                    />

                    <NavMain
                        items={activityNavItems}
                        label={t('nav.activity')}
                    />

                    <NavMain
                        items={securityNavItems}
                        label={t('nav.security')}
                    />

                    <NavMain
                        items={monitoringNavItems}
                        label={t('nav.monitoring')}
                    />

                    <NavMain
                        items={[
                            {
                                title: t('nav.projectSettings'),
                                href: `/${teamSlug}/${projectSlug}/settings`,
                                icon: Settings,
                            },
                            {
                                title: t('nav.statusPage'),
                                href: `/${teamSlug}/${projectSlug}/status-page`,
                                icon: Globe,
                            },
                        ]}
                        label={t('nav.settings')}
                    />
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border bg-black/10 p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
