import { useCallback, useEffect, useState } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const APPEARANCE_COOKIE = 'appearance';
const APPEARANCE_EVENT = 'tyto:appearance-change';
const systemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
        ? ('dark' as const)
        : ('light' as const);

const storedAppearance = (): Appearance => {
    if (typeof document === 'undefined') {
        return 'system';
    }

    const value = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith(`${APPEARANCE_COOKIE}=`))
        ?.split('=')[1];

    return value === 'light' || value === 'dark' || value === 'system'
        ? value
        : 'system';
};

const applyAppearance = (appearance: Appearance): ResolvedAppearance => {
    const resolved = appearance === 'system' ? systemTheme() : appearance;

    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.style.colorScheme = resolved;
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', resolved === 'dark' ? '#050510' : '#f7f5fb');

    return resolved;
};

export function initializeTheme(): void {
    if (typeof window !== 'undefined') {
        applyAppearance(storedAppearance());
    }
}

export function useAppearance(): UseAppearanceReturn {
    const [appearance, setAppearance] = useState<Appearance>(storedAppearance);
    const [resolvedAppearance, setResolvedAppearance] =
        useState<ResolvedAppearance>(() => {
            if (typeof window === 'undefined') {
                return 'light';
            }

            const stored = storedAppearance();

            return stored === 'system' ? systemTheme() : stored;
        });

    const updateAppearance = useCallback((mode: Appearance) => {
        document.cookie = `${APPEARANCE_COOKIE}=${mode};path=/;max-age=31536000;SameSite=Lax`;
        setAppearance(mode);
        setResolvedAppearance(applyAppearance(mode));
        window.dispatchEvent(
            new CustomEvent<Appearance>(APPEARANCE_EVENT, { detail: mode }),
        );
    }, []);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const syncAppearance = (mode: Appearance) => {
            setAppearance(mode);
            setResolvedAppearance(applyAppearance(mode));
        };
        const handleAppearanceChange = (event: Event) =>
            syncAppearance((event as CustomEvent<Appearance>).detail);
        const handleSystemChange = () => {
            if (appearance === 'system') {
                setResolvedAppearance(applyAppearance('system'));
            }
        };

        window.addEventListener(APPEARANCE_EVENT, handleAppearanceChange);
        media.addEventListener('change', handleSystemChange);

        return () => {
            window.removeEventListener(
                APPEARANCE_EVENT,
                handleAppearanceChange,
            );
            media.removeEventListener('change', handleSystemChange);
        };
    }, [appearance]);

    return { appearance, resolvedAppearance, updateAppearance };
}
