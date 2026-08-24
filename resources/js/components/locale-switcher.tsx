import { Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLocale } from '@/hooks/use-locale';
import type { Locale, TranslationKey } from '@/hooks/use-locale';

const locales: Array<{
    value: Locale;
    shortLabel: string;
    labelKey: TranslationKey;
}> = [
    { value: 'en', shortLabel: 'EN', labelKey: 'language.english' },
    { value: 'pt-BR', shortLabel: 'PT', labelKey: 'language.portuguese' },
    { value: 'es', shortLabel: 'ES', labelKey: 'language.spanish' },
];

export function LocaleSwitcher() {
    const { locale, updateLocale, t } = useLocale();
    const currentLocale = locales.find((item) => item.value === locale)!;

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="h-9 gap-2 rounded-full border-border/70 bg-background/70 px-3 text-xs font-extrabold tracking-wide"
                            aria-label={t('language.label')}
                        >
                            <Languages className="size-4 text-primary" />
                            <span className="hidden sm:inline">
                                {currentLocale.shortLabel}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    {t('language.label')}
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
                <DropdownMenuLabel className="px-2 py-2 text-xs text-muted-foreground">
                    {t('language.label')}
                </DropdownMenuLabel>
                {locales.map((item) => (
                    <DropdownMenuItem
                        key={item.value}
                        className="cursor-pointer rounded-lg px-2 py-2.5"
                        onSelect={() => updateLocale(item.value)}
                    >
                        <span className="mr-2 w-7 text-[10px] font-black tracking-wider text-primary">
                            {item.shortLabel}
                        </span>
                        <span className="font-medium">{t(item.labelKey)}</span>
                        {locale === item.value && (
                            <Check className="ml-auto size-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
