export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-2'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-1 text-sm font-semibold tracking-tight text-foreground'
                        : 'text-2xl font-semibold tracking-[-0.025em] text-foreground'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            )}
        </header>
    );
}
