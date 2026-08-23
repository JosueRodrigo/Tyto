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
import type { PageProps } from '@/types';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { props } = usePage<PageProps>();
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
            title: 'Requests',
            href: withPeriod(`/${teamSlug}/${projectSlug}/requests`),
            icon: Activity,
        },
        {
            title: 'Jobs',
            href: withPeriod(`/${teamSlug}/${projectSlug}/jobs`),
            icon: Repeat,
        },
        {
            title: 'Commands',
            href: withPeriod(`/${teamSlug}/${projectSlug}/commands`),
            icon: Terminal,
        },
        {
            title: 'Scheduled Tasks',
            href: withPeriod(`/${teamSlug}/${projectSlug}/scheduled-tasks`),
            icon: Calendar,
        },
        {
            title: 'Exceptions',
            href: withPeriod(`/${teamSlug}/${projectSlug}/exceptions`),
            icon: Zap,
        },
        {
            title: 'Queries',
            href: withPeriod(`/${teamSlug}/${projectSlug}/queries`),
            icon: Search,
        },
        {
            title: 'Notifications',
            href: withPeriod(`/${teamSlug}/${projectSlug}/notifications`),
            icon: Bell,
        },
        {
            title: 'Mail',
            href: withPeriod(`/${teamSlug}/${projectSlug}/mail`),
            icon: Mail,
        },
        {
            title: 'Cache',
            href: withPeriod(`/${teamSlug}/${projectSlug}/cache`),
            icon: Database,
        },
        {
            title: 'Outgoing Requests',
            href: withPeriod(`/${teamSlug}/${projectSlug}/outgoing-requests`),
            icon: ExternalLink,
        },
    ];

    const uptimeEnabled = currentProject?.uptime_monitoring_enabled ?? true;

    const monitoringNavItems: NavItem[] = [
        {
            title: 'Alert delivery',
            href: withPeriod(`/${teamSlug}/${projectSlug}/alerts`),
            icon: Siren,
        },
        {
            title: 'Users',
            href: withPeriod(`/${teamSlug}/${projectSlug}/users`),
            icon: Users,
        },
        ...(uptimeEnabled
            ? [
                  {
                      title: 'Uptime',
                      href: withPeriod(`/${teamSlug}/${projectSlug}/uptime`),
                      icon: Globe,
                  },
              ]
            : []),
        {
            title: 'Heartbeats',
            href: withPeriod(`/${teamSlug}/${projectSlug}/heartbeats`),
            icon: HeartPulse,
        },
        {
            title: 'Logs',
            href: withPeriod(`/${teamSlug}/${projectSlug}/logs`),
            icon: FileText,
        },
    ];

    const securityNavItems: NavItem[] = [
        {
            title: 'Security',
            href: withPeriod(`/${teamSlug}/${projectSlug}/security`),
            icon: Shield,
        },
        {
            title: 'Firewall',
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
                            className="h-12 hover:bg-transparent"
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
                                title: 'Dashboard',
                                href: dashboardUrl,
                                icon: LayoutGrid,
                            },
                            {
                                title: 'Issues',
                                href: withPeriod(
                                    `/${teamSlug}/${projectSlug}/issues`,
                                ),
                                icon: AlertCircle,
                            },
                            {
                                title: 'Telemetry',
                                href: withPeriod(
                                    `/${teamSlug}/${projectSlug}/telemetry`,
                                ),
                                icon: ScanSearch,
                            },
                        ]}
                        label="Platform"
                    />

                    <NavMain items={activityNavItems} label="Activity" />

                    <NavMain items={securityNavItems} label="Security" />

                    <NavMain items={monitoringNavItems} label="Monitoring" />

                    <NavMain
                        items={[
                            {
                                title: 'Project Settings',
                                href: `/${teamSlug}/${projectSlug}/settings`,
                                icon: Settings,
                            },
                            {
                                title: 'Status Page',
                                href: `/${teamSlug}/${projectSlug}/status-page`,
                                icon: Globe,
                            },
                        ]}
                        label="Settings"
                    />
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border bg-black/10 p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
