import type { SVGProps } from 'react';

export default function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 40 40" fill="none" aria-label="Tyto" {...props}>
            <path
                d="M7 10.5 14.5 7 20 11l5.5-4 7.5 3.5-2 14.25L20 34 9 24.75 7 10.5Z"
                fill="currentColor"
            />
            <path
                d="M11.5 14.5h7v7h-7zM21.5 14.5h7v7h-7z"
                className="fill-slate-950/90"
            />
            <path d="m20 21-3 4h6l-3-4Z" className="fill-orange-400" />
        </svg>
    );
}
