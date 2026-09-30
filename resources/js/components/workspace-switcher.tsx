import { router, usePage } from '@inertiajs/react';
import {
    Check,
    ChevronsUpDown,
    Plus,
    Layout,
    Terminal,
    Search,
    Settings2,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import CreateProjectModal from '@/components/create-project-modal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/hooks/use-locale';
import { useIsMobile } from '@/hooks/use-mobile';

export function WorkspaceSwitcher({
    inHeader = false,
}: {
    inHeader?: boolean;
}) {
    const { props }: any = usePage();
    const isMobile = useIsMobile();
    const currentTeam = props.currentTeam;
    const projects = useMemo(() => props.projects ?? [], [props.projects]);
    const currentProject = props.currentProject;
    const { t } = useLocale();

    const [search, setSearch] = useState('');

    const filteredTeams = useMemo(() => {
        const teamsList = props.teams ?? [];
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return teamsList;
        }

        return teamsList.filter(
            (team: any) =>
                team.name.toLowerCase().includes(normalizedSearch) ||
                projects.some(
                    (project: any) =>
                        project.team_id === team.id &&
                        project.name.toLowerCase().includes(normalizedSearch),
                ),
        );
    }, [projects, props.teams, search]);

    const switchProject = (project: any) => {
        const projectTeam =
            (props.teams ?? []).find((t: any) => t.id === project.team_id) ??
            currentTeam;
        const newPrefix = `/${projectTeam.slug}/${project.slug}`;

        const currentUrl = window.location.pathname;
        const oldPrefix =
            currentTeam && currentProject
                ? `/${currentTeam.slug}/${currentProject.slug}`
                : null;

        if (oldPrefix && currentUrl.includes(oldPrefix)) {
            router.visit(currentUrl.replace(oldPrefix, newPrefix));
        } else {
            router.visit(newPrefix + '/dashboard');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={
                        inHeader
                            ? 'h-9 max-w-[200px] gap-2 rounded-lg border border-border px-3 text-foreground/70 transition-all hover:bg-muted hover:text-foreground'
                            : 'group h-auto w-full justify-start rounded-2xl border border-border/70 bg-card/70 px-3 py-3 shadow-sm transition-all group-data-[collapsible=icon]:p-2 hover:border-primary/25 hover:bg-accent/70 hover:shadow-md'
                    }
                >
                    <div
                        className={
                            inHeader
                                ? 'flex aspect-square size-5 shrink-0 items-center justify-center rounded bg-blue-600/20 text-blue-400'
                                : 'mr-3 flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-[0_0_20px_rgba(159,85,255,0.12)] group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:size-7'
                        }
                    >
                        {currentTeam?.logoUrl ? (
                            <img
                                src={currentTeam.logoUrl}
                                alt=""
                                className="size-full rounded-[inherit] object-cover"
                            />
                        ) : currentProject?.logo_url ? (
                            <img
                                src={currentProject.logo_url}
                                alt=""
                                className="size-full rounded-[inherit] object-cover"
                            />
                        ) : (
                            <Terminal
                                className={inHeader ? 'size-3' : 'size-4'}
                            />
                        )}
                    </div>
                    <div
                        className={
                            inHeader
                                ? 'flex min-w-0 flex-col items-start leading-tight'
                                : 'grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden'
                        }
                    >
                        <div className="flex w-full items-center gap-1.5">
                            <span
                                title={currentTeam?.name}
                                className={
                                    inHeader
                                        ? 'truncate text-[11px] font-bold tracking-tight text-foreground'
                                        : 'truncate text-sm font-bold tracking-tight text-foreground uppercase'
                                }
                            >
                                {currentTeam?.name ?? t('workspace.selectTeam')}
                            </span>
                        </div>
                        <div className="mt-0.5 flex w-full items-center gap-1">
                            <Layout className="size-2.5 shrink-0 text-foreground/40" />
                            <span
                                title={currentProject?.name}
                                className="truncate text-[10px] font-medium tracking-tight text-foreground/60"
                            >
                                {currentProject?.name ??
                                    t('workspace.noProject')}
                            </span>
                        </div>
                    </div>
                    <ChevronsUpDown
                        className={
                            inHeader
                                ? 'ml-1 size-3 shrink-0 text-foreground/20'
                                : 'ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]:rotate-180'
                        }
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-border/70 bg-popover/95 p-0 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
                side={inHeader ? 'bottom' : isMobile ? 'bottom' : 'right'}
                align={inHeader ? 'end' : 'start'}
                sideOffset={inHeader ? 8 : 4}
            >
                {/* Search Bar */}
                <div className="flex items-center gap-3 border-b border-border/70 bg-muted/25 px-4 py-3.5">
                    <Search className="size-4 text-muted-foreground" />
                    <input
                        className="w-full border-none bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
                        placeholder={t('workspace.search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="custom-scrollbar max-h-[400px] overflow-y-auto">
                    {/* Organizations/Teams Section */}
                    <div className="p-2">
                        {filteredTeams.map((team: any) => (
                            <div key={team.id} className="mb-3 last:mb-0">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-muted text-[9px] font-black text-muted-foreground">
                                            {team.logoUrl ? (
                                                <img
                                                    src={team.logoUrl}
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                team.name
                                                    .slice(0, 2)
                                                    .toUpperCase()
                                            )}
                                        </div>
                                        <span
                                            className="truncate text-[11px] font-black tracking-[0.1em] text-foreground/40 uppercase"
                                            title={team.name}
                                        >
                                            {team.name}
                                        </span>
                                    </div>
                                    <Settings2
                                        className="size-3.5 shrink-0 cursor-pointer text-foreground/20 transition-colors hover:text-foreground/60"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.visit(
                                                `/settings/teams/${team.slug}`,
                                            );
                                        }}
                                    />
                                </div>

                                <div className="space-y-0.5">
                                    {projects
                                        .filter(
                                            (p: any) => p.team_id === team.id,
                                        )
                                        .filter((p: any) =>
                                            p.name
                                                .toLowerCase()
                                                .includes(search.toLowerCase()),
                                        )
                                        .map((project: any, index: number) => (
                                            <DropdownMenuItem
                                                key={project.id}
                                                onSelect={() =>
                                                    switchProject(project)
                                                }
                                                className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 transition-all data-[highlighted]:border-border data-[highlighted]:bg-accent/70"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div
                                                        className={`size-9 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${
                                                            [
                                                                'from-indigo-500 to-purple-600',
                                                                'from-blue-500 to-cyan-400',
                                                                'from-emerald-500 to-teal-400',
                                                                'from-orange-500 to-amber-400',
                                                                'from-rose-500 to-pink-400',
                                                            ][index % 5]
                                                        } flex items-center justify-center text-white shadow-lg`}
                                                    >
                                                        {project.logo_url ? (
                                                            <img
                                                                src={
                                                                    project.logo_url
                                                                }
                                                                alt=""
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <Layout className="size-5" />
                                                        )}
                                                    </div>
                                                    <span
                                                        title={project.name}
                                                        className={`truncate text-sm font-semibold ${currentProject?.id === project.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                                                    >
                                                        {project.name}
                                                    </span>
                                                </div>
                                                {currentProject?.id ===
                                                    project.id && (
                                                    <Check className="size-4 shrink-0 text-primary" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DropdownMenuSeparator className="m-0 bg-border/70" />

                <div className="bg-muted/20 p-2">
                    <CreateProjectModal>
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                            }}
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                            <Plus className="size-4" />
                            <span className="text-sm font-semibold">
                                {t('workspace.newApplication')}
                            </span>
                        </DropdownMenuItem>
                    </CreateProjectModal>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
