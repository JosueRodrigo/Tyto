import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({
    items = [],
    label,
}: {
    items: NavItem[];
    label?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-1 py-0">
            {label && (
                <SidebarGroupLabel className="hidden px-2 text-[9px] font-extrabold tracking-[0.16em] text-sidebar-foreground/30 uppercase group-data-[collapsible=icon]:hidden">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className={`group/menu-item relative h-9 rounded-lg transition-all duration-200 ${
                                isCurrentUrl(item.href)
                                    ? 'bg-sidebar-accent font-bold text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--sidebar-primary)]'
                                    : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                            } `}
                        >
                            <Link
                                href={item.href}
                                prefetch
                                className="flex items-center gap-3"
                            >
                                {item.icon && (
                                    <item.icon
                                        className={`size-4 transition-colors ${isCurrentUrl(item.href) ? 'text-sidebar-primary' : 'text-sidebar-foreground/35 group-hover/menu-item:text-sidebar-foreground/70'}`}
                                    />
                                )}
                                <span className="text-[13px] tracking-tight">
                                    {item.title}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
