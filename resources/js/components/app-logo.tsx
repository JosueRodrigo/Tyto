import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { SharedData } from '@/types';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="group flex cursor-pointer items-center gap-3">
            <div className="flex aspect-square size-10 items-center justify-center rounded-[14px] bg-primary/10 shadow-[0_0_28px_rgba(159,85,255,0.2)] ring-1 ring-primary/30 transition-transform group-hover:scale-[1.04]">
                <AppLogoIcon className="size-8" />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-base font-black tracking-[-0.03em] text-sidebar-foreground">
                    {name}
                </span>
                <span className="text-[9px] font-bold tracking-[0.18em] text-sidebar-foreground/40 uppercase">
                    See · Understand · Act
                </span>
            </div>
        </div>
    );
}
