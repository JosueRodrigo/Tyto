import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#050510] p-6 text-[#eaeaea] md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(159,85,255,0.2),transparent_28rem),radial-gradient(circle_at_85%_85%,rgba(159,85,255,0.08),transparent_25rem)]" />
            <div className="tyto-grid pointer-events-none absolute inset-0 opacity-25" />
            <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#101020]/85 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-9">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-5">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-3 font-medium"
                        >
                            <div className="flex size-16 items-center justify-center rounded-[20px] border border-primary/30 bg-primary/10 shadow-[0_0_45px_rgba(159,85,255,0.22)]">
                                <AppLogoIcon className="size-12" />
                            </div>
                            <span className="text-lg font-black tracking-[-0.04em]">
                                TYTO
                            </span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-black tracking-[-0.04em]">
                                {title}
                            </h1>
                            <p className="mx-auto max-w-xs text-center text-sm leading-6 text-[#a0a0a0]">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                    <p className="text-center text-[10px] font-bold tracking-[0.2em] text-white/25 uppercase">
                        Observability without blind spots
                    </p>
                </div>
            </div>
        </div>
    );
}
