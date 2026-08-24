import { router, usePage } from '@inertiajs/react';

import { Check, ChevronsUpDown, Plus, Users } from 'lucide-react';
import CreateTeamModal from '@/components/create-team-modal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import type { SharedData } from '@/types';
import type { Team } from '@/types';
import { switchMethod } from '@/routes/teams';

type TeamSwitcherProps = {
    inHeader?: boolean;
};

export function TeamSwitcher({ inHeader = false }: TeamSwitcherProps) {
    const { props } = usePage<SharedData>();
    const isMobile = useIsMobile();
    const currentTeam = props.currentTeam;
    const teams = props.teams ?? [];

    const switchTeam = (team: Team) => {
        const previousTeamSlug = currentTeam?.slug;

        router.visit(switchMethod(team.slug), {
            onFinish: () => {
                if (!previousTeamSlug || typeof window === 'undefined') {
                    router.reload();

                    return;
                }

                const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                const segment = `/${previousTeamSlug}`;

                if (currentUrl.includes(segment)) {
                    router.visit(currentUrl.replace(segment, `/${team.slug}`), {
                        replace: true,
                    });

                    return;
                }

                router.reload();
            },
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    data-test="team-switcher-trigger"
                    className={
                        inHeader
                            ? 'h-8 gap-1 border border-border px-2 text-foreground/70 transition-all hover:bg-muted hover:text-foreground'
                            : 'group w-full justify-start border border-border bg-muted/30 px-2 py-6 transition-all hover:bg-white/[0.05]'
                    }
                >
                    <div className="mr-2 flex aspect-square size-6 items-center justify-center rounded bg-blue-600/20 text-blue-400 group-data-[collapsible=icon]:mr-0">
                        {currentTeam?.logoUrl ? (
                            <img
                                src={currentTeam.logoUrl}
                                alt=""
                                className="size-full rounded-[inherit] object-cover"
                            />
                        ) : (
                            <Users className="size-3" />
                        )}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-bold tracking-tight text-foreground/90">
                            {currentTeam?.name ?? 'Select team'}
                        </span>
                        <span className="mt-0.5 text-[10px] leading-none font-black tracking-widest text-foreground/40 uppercase">
                            Workspace
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-3 text-foreground/20 group-data-[collapsible=icon]:hidden" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={
                    inHeader
                        ? 'w-56'
                        : 'w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                }
                side={inHeader ? undefined : isMobile ? 'bottom' : 'right'}
                align={inHeader ? 'end' : 'start'}
                sideOffset={inHeader ? undefined : 4}
            >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Teams
                </DropdownMenuLabel>
                {teams.map((team) => (
                    <DropdownMenuItem
                        key={team.id}
                        data-test="team-switcher-item"
                        className={
                            inHeader
                                ? 'cursor-pointer gap-2'
                                : 'cursor-pointer gap-2 p-2'
                        }
                        onSelect={() => switchTeam(team)}
                    >
                        <div className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-[9px] font-bold">
                            {team.logoUrl ? (
                                <img
                                    src={team.logoUrl}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                team.name.slice(0, 2).toUpperCase()
                            )}
                        </div>
                        <span className="truncate">{team.name}</span>
                        {currentTeam?.id === team.id && (
                            <Check
                                className={
                                    inHeader
                                        ? 'ml-auto size-4'
                                        : 'ml-auto h-4 w-4'
                                }
                            />
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <CreateTeamModal>
                    <DropdownMenuItem
                        data-test="team-switcher-new-team"
                        className={
                            inHeader
                                ? 'cursor-pointer gap-2'
                                : 'cursor-pointer gap-2 p-2'
                        }
                        onSelect={(event) => event.preventDefault()}
                    >
                        <Plus className={inHeader ? 'size-4' : 'h-4 w-4'} />
                        <span className="text-muted-foreground">New team</span>
                    </DropdownMenuItem>
                </CreateTeamModal>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
