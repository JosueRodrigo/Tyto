import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { SharedData } from '@/types';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="group flex cursor-pointer items-center gap-3">
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-emerald-300 text-slate-950 shadow-[0_0_24px_rgba(110,231,183,0.18)] ring-1 ring-emerald-200/30 transition-transform group-hover:scale-[1.03]">
                <AppLogoIcon className="size-7" />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-base font-black tracking-[-0.03em] text-sidebar-foreground">
                    {name}
                </span>
                <span className="text-[9px] font-bold tracking-[0.18em] text-sidebar-foreground/40 uppercase">
                    Observe · Resolve
                </span>
            </div>
        </div>
    );
}
