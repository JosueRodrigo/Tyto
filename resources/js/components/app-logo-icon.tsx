import type { SVGProps } from 'react';

export default function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 64 64" fill="none" aria-label="Tyto" {...props}>
            <path
                d="M10 16 24 10l8 7 8-7 14 6-4 28-18 12-18-12-4-28Z"
                className="fill-primary"
            />
            <path
                d="m15 20 11-4 6 6 6-6 11 4-4 20-13 10-13-10-4-20Z"
                className="fill-[var(--logo-face)]"
            />
            <path
                d="m20 25 9-3-2 13-9-3 2-7Zm24 0-9-3 2 13 9-3-2-7Z"
                className="fill-[var(--logo-ink)]"
            />
            <circle cx="25" cy="28" r="2.5" className="fill-primary" />
            <circle cx="39" cy="28" r="2.5" className="fill-primary" />
            <path d="m32 31 4 6-4 3-4-3 4-6Z" className="fill-primary" />
        </svg>
    );
}
