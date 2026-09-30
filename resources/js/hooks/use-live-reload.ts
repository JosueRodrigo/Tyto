import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export function useLiveReload(
    projectId: number | string | undefined,
    intervalMs = 15000,
): void {
    const lastReloadAt = useRef(0);
    const isNavigating = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!projectId || !window.Echo) {
            return;
        }

        const clearTimer = () => {
            if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
            }
        };

        const reload = () => {
            if (
                isNavigating.current ||
                document.visibilityState !== 'visible'
            ) {
                return;
            }

            lastReloadAt.current = Date.now();
            router.reload({ preserveScroll: true, preserveState: true } as any);
        };

        const schedule = () => {
            if (
                isNavigating.current ||
                document.visibilityState !== 'visible'
            ) {
                return;
            }

            const elapsed = Date.now() - lastReloadAt.current;

            if (elapsed >= intervalMs) {
                clearTimer();
                reload();

                return;
            }

            if (!timer.current) {
                timer.current = setTimeout(() => {
                    timer.current = null;
                    reload();
                }, intervalMs - elapsed);
            }
        };

        const removeStartListener = router.on('start', () => {
            isNavigating.current = true;
            clearTimer();
        });
        const removeFinishListener = router.on('finish', () => {
            isNavigating.current = false;
        });

        const channel = window.Echo.private(`project.${projectId}`).listen(
            '.ProjectDataIngested',
            schedule,
        );

        return () => {
            clearTimer();
            removeStartListener();
            removeFinishListener();
            channel.stopListening('.ProjectDataIngested');
        };
    }, [projectId, intervalMs]);
}
