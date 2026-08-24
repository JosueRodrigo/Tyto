import { useCallback, useEffect, useState } from 'react';

export type Locale = 'en' | 'pt-BR' | 'es';

const LOCALE_COOKIE = 'locale';
const LOCALE_EVENT = 'tyto:locale-change';

const messages = {
    en: {
        'language.label': 'Language',
        'language.english': 'English',
        'language.portuguese': 'Portuguese (Brazil)',
        'language.spanish': 'Spanish',
        'header.toggleSidebar': 'Toggle Sidebar (Ctrl/⌘ + B)',
        'header.liveTelemetry': 'Live telemetry',
        'header.lightTheme': 'Light theme',
        'header.darkTheme': 'Dark theme',
        'workspace.selectTeam': 'Select team',
        'workspace.noProject': 'No project',
        'workspace.search': 'Find application or organization',
        'workspace.newApplication': 'New application',
        'nav.platform': 'Platform',
        'nav.activity': 'Activity',
        'nav.security': 'Security',
        'nav.monitoring': 'Monitoring',
        'nav.settings': 'Settings',
        'nav.dashboard': 'Dashboard',
        'nav.issues': 'Issues',
        'nav.telemetry': 'Telemetry',
        'nav.requests': 'Requests',
        'nav.jobs': 'Jobs',
        'nav.commands': 'Commands',
        'nav.scheduledTasks': 'Scheduled tasks',
        'nav.exceptions': 'Exceptions',
        'nav.queries': 'Queries',
        'nav.notifications': 'Notifications',
        'nav.mail': 'Mail',
        'nav.cache': 'Cache',
        'nav.outgoingRequests': 'Outgoing requests',
        'nav.alertDelivery': 'Alert delivery',
        'nav.users': 'Users',
        'nav.uptime': 'Uptime',
        'nav.heartbeats': 'Heartbeats',
        'nav.logs': 'Logs',
        'nav.firewall': 'Firewall',
        'nav.projectSettings': 'Project settings',
        'nav.statusPage': 'Status page',
    },
    'pt-BR': {
        'language.label': 'Idioma',
        'language.english': 'Inglês',
        'language.portuguese': 'Português (Brasil)',
        'language.spanish': 'Espanhol',
        'header.toggleSidebar': 'Alternar menu lateral (Ctrl/⌘ + B)',
        'header.liveTelemetry': 'Telemetria ao vivo',
        'header.lightTheme': 'Tema claro',
        'header.darkTheme': 'Tema escuro',
        'workspace.selectTeam': 'Selecionar organização',
        'workspace.noProject': 'Nenhuma aplicação',
        'workspace.search': 'Buscar aplicação ou organização',
        'workspace.newApplication': 'Nova aplicação',
        'nav.platform': 'Plataforma',
        'nav.activity': 'Atividade',
        'nav.security': 'Segurança',
        'nav.monitoring': 'Monitoramento',
        'nav.settings': 'Configurações',
        'nav.dashboard': 'Painel',
        'nav.issues': 'Problemas',
        'nav.telemetry': 'Telemetria',
        'nav.requests': 'Requisições',
        'nav.jobs': 'Tarefas',
        'nav.commands': 'Comandos',
        'nav.scheduledTasks': 'Tarefas agendadas',
        'nav.exceptions': 'Exceções',
        'nav.queries': 'Consultas',
        'nav.notifications': 'Notificações',
        'nav.mail': 'E-mails',
        'nav.cache': 'Cache',
        'nav.outgoingRequests': 'Requisições externas',
        'nav.alertDelivery': 'Envio de alertas',
        'nav.users': 'Usuários',
        'nav.uptime': 'Disponibilidade',
        'nav.heartbeats': 'Sinais de vida',
        'nav.logs': 'Logs',
        'nav.firewall': 'Firewall',
        'nav.projectSettings': 'Configurações do projeto',
        'nav.statusPage': 'Página de status',
    },
    es: {
        'language.label': 'Idioma',
        'language.english': 'Inglés',
        'language.portuguese': 'Portugués (Brasil)',
        'language.spanish': 'Español',
        'header.toggleSidebar': 'Alternar menú lateral (Ctrl/⌘ + B)',
        'header.liveTelemetry': 'Telemetría en vivo',
        'header.lightTheme': 'Tema claro',
        'header.darkTheme': 'Tema oscuro',
        'workspace.selectTeam': 'Seleccionar organización',
        'workspace.noProject': 'Ninguna aplicación',
        'workspace.search': 'Buscar aplicación u organización',
        'workspace.newApplication': 'Nueva aplicación',
        'nav.platform': 'Plataforma',
        'nav.activity': 'Actividad',
        'nav.security': 'Seguridad',
        'nav.monitoring': 'Monitoreo',
        'nav.settings': 'Configuración',
        'nav.dashboard': 'Panel',
        'nav.issues': 'Problemas',
        'nav.telemetry': 'Telemetría',
        'nav.requests': 'Solicitudes',
        'nav.jobs': 'Tareas',
        'nav.commands': 'Comandos',
        'nav.scheduledTasks': 'Tareas programadas',
        'nav.exceptions': 'Excepciones',
        'nav.queries': 'Consultas',
        'nav.notifications': 'Notificaciones',
        'nav.mail': 'Correos',
        'nav.cache': 'Caché',
        'nav.outgoingRequests': 'Solicitudes salientes',
        'nav.alertDelivery': 'Envío de alertas',
        'nav.users': 'Usuarios',
        'nav.uptime': 'Disponibilidad',
        'nav.heartbeats': 'Señales de vida',
        'nav.logs': 'Registros',
        'nav.firewall': 'Firewall',
        'nav.projectSettings': 'Configuración del proyecto',
        'nav.statusPage': 'Página de estado',
    },
} as const;

export type TranslationKey = keyof (typeof messages)['en'];

const storedLocale = (): Locale => {
    if (typeof document === 'undefined') {
        return 'en';
    }

    const value = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith(`${LOCALE_COOKIE}=`))
        ?.split('=')[1];

    return value === 'en' || value === 'pt-BR' || value === 'es'
        ? value
        : 'en';
};

const applyLocale = (locale: Locale) => {
    document.documentElement.lang = locale;
};

export function initializeLocale(): void {
    if (typeof document !== 'undefined') {
        applyLocale(storedLocale());
    }
}

export function useLocale() {
    const [locale, setLocale] = useState<Locale>(storedLocale);

    const updateLocale = useCallback((nextLocale: Locale) => {
        document.cookie = `${LOCALE_COOKIE}=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
        applyLocale(nextLocale);
        setLocale(nextLocale);
        window.dispatchEvent(
            new CustomEvent<Locale>(LOCALE_EVENT, { detail: nextLocale }),
        );
    }, []);

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const nextLocale = (event as CustomEvent<Locale>).detail;
            applyLocale(nextLocale);
            setLocale(nextLocale);
        };

        window.addEventListener(LOCALE_EVENT, handleLocaleChange);

        return () =>
            window.removeEventListener(LOCALE_EVENT, handleLocaleChange);
    }, []);

    const t = useCallback(
        (key: TranslationKey) => messages[locale][key] ?? messages.en[key],
        [locale],
    );

    return { locale, updateLocale, t } as const;
}
