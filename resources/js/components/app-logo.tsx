import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { SharedData } from '@/types';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="group flex cursor-pointer items-center gap-4">
            <div className="flex aspect-square size-14 shrink-0 items-center justify-center rounded-[18px] bg-primary/12 shadow-[0_0_36px_rgba(159,85,255,0.28)] ring-1 ring-primary/40 transition-all duration-300 group-hover:scale-[1.04] group-hover:bg-primary/16 group-hover:shadow-[0_0_44px_rgba(159,85,255,0.36)]">
                <AppLogoIcon className="size-11 drop-shadow-[0_0_10px_rgba(159,85,255,0.35)]" />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-xl font-black tracking-[-0.04em] text-sidebar-foreground">
                    {name}
                </span>
                <span className="mt-0.5 text-[10px] font-bold tracking-[0.2em] text-sidebar-foreground/50 uppercase">
                    See · Understand · Act
                </span>
            </div>
        </div>
    );
}
