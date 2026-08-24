import { LOCALE_EVENT, storedLocale } from '@/hooks/use-locale';
import type { Locale } from '@/hooks/use-locale';

type Catalog = Record<string, string>;

const ptBR: Catalog = {
    Action: 'Ação',
    Add: 'Adicionar',
    Alert: 'Alerta',
    'Alert Rules': 'Regras de alerta',
    'All priorities': 'Todas as prioridades',
    Allowed: 'Permitido',
    Apply: 'Aplicar',
    'Apply Filter': 'Aplicar filtro',
    Arguments: 'Argumentos',
    Assignee: 'Responsável',
    Attempts: 'Tentativas',
    Availability: 'Disponibilidade',
    Back: 'Voltar',
    Blocked: 'Bloqueado',
    Cache: 'Cache',
    Calls: 'Chamadas',
    Cancel: 'Cancelar',
    Channel: 'Canal',
    Checked: 'Verificado',
    Close: 'Fechar',
    Command: 'Comando',
    Commands: 'Comandos',
    Configure: 'Configurar',
    Confirm: 'Confirmar',
    Connection: 'Conexão',
    Continue: 'Continuar',
    Count: 'Quantidade',
    Create: 'Criar',
    Created: 'Criado',
    Critical: 'Crítico',
    Custom: 'Personalizado',
    Dashboard: 'Painel',
    Date: 'Data',
    Description: 'Descrição',
    Destination: 'Destino',
    Details: 'Detalhes',
    Disabled: 'Desativado',
    Documentation: 'Documentação',
    Duration: 'Duração',
    Edit: 'Editar',
    Email: 'E-mail',
    Environment: 'Ambiente',
    Error: 'Erro',
    Errors: 'Erros',
    Events: 'Eventos',
    Exception: 'Exceção',
    Exceptions: 'Exceções',
    Failed: 'Falhou',
    Failures: 'Falhas',
    File: 'Arquivo',
    Firewall: 'Firewall',
    General: 'Geral',
    Global: 'Global',
    Healthy: 'Saudável',
    Heartbeats: 'Sinais de vida',
    High: 'Alta',
    Host: 'Host',
    Inactive: 'Inativo',
    Incidents: 'Incidentes',
    Integrations: 'Integrações',
    Issues: 'Problemas',
    Job: 'Tarefa',
    Jobs: 'Tarefas',
    Key: 'Chave',
    Language: 'Idioma',
    Light: 'Claro',
    Loading: 'Carregando',
    Location: 'Localização',
    Logs: 'Logs',
    Low: 'Baixa',
    Mail: 'E-mails',
    Management: 'Gerenciamento',
    Max: 'Máximo',
    Medium: 'Média',
    Message: 'Mensagem',
    Method: 'Método',
    Missing: 'Ausente',
    More: 'Mais',
    Name: 'Nome',
    Notifications: 'Notificações',
    Observed: 'Observado',
    Offline: 'Offline',
    Open: 'Aberto',
    Overview: 'Visão geral',
    Password: 'Senha',
    Path: 'Caminho',
    Pending: 'Pendente',
    Preview: 'Prévia',
    Priority: 'Prioridade',
    Processed: 'Processado',
    Profile: 'Perfil',
    Project: 'Aplicação',
    Projects: 'Aplicações',
    Queries: 'Consultas',
    Query: 'Consulta',
    Queue: 'Fila',
    Queued: 'Na fila',
    Recipient: 'Destinatário',
    Recipients: 'Destinatários',
    Records: 'Registros',
    Repository: 'Repositório',
    Request: 'Requisição',
    Requests: 'Requisições',
    Resolved: 'Resolvido',
    Response: 'Resposta',
    Retry: 'Tentar novamente',
    Revoke: 'Revogar',
    Role: 'Função',
    Routes: 'Rotas',
    Rules: 'Regras',
    Save: 'Salvar',
    Schedule: 'Agendamento',
    Search: 'Buscar',
    Security: 'Segurança',
    Sent: 'Enviado',
    Server: 'Servidor',
    Settings: 'Configurações',
    Signal: 'Sinal',
    Source: 'Origem',
    Status: 'Status',
    Success: 'Sucesso',
    System: 'Sistema',
    Target: 'Destino',
    Task: 'Tarefa',
    Teams: 'Times',
    Thresholds: 'Limites',
    Time: 'Tempo',
    Timeline: 'Linha do tempo',
    Timestamp: 'Data e hora',
    Today: 'Hoje',
    Total: 'Total',
    Trace: 'Rastreamento',
    Traffic: 'Tráfego',
    Type: 'Tipo',
    Unassigned: 'Não atribuído',
    Updated: 'Atualizado',
    Uptime: 'Disponibilidade',
    User: 'Usuário',
    Users: 'Usuários',
    Warning: 'Aviso',
    Workspace: 'Espaço de trabalho',
    'Create Project': 'Criar aplicação',
    'Create Application': 'Criar aplicação',
    'New Project': 'Nova aplicação',
    'Project Name': 'Nome da aplicação',
    'Project Settings': 'Configurações da aplicação',
    'Project Token': 'Token da aplicação',
    'Project URL': 'URL da aplicação',
    'General Information': 'Informações gerais',
    'Data Retention Period': 'Período de retenção de dados',
    'Delete Project': 'Excluir aplicação',
    'Team settings': 'Configurações do time',
    'Team members': 'Membros do time',
    'Team name': 'Nome do time',
    'Team logo': 'Logo do time',
    'Create team': 'Criar time',
    'New team': 'Novo time',
    'Invite member': 'Convidar membro',
    'Send invitation': 'Enviar convite',
    'Pending invitations': 'Convites pendentes',
    'Remove member': 'Remover membro',
    'Log in': 'Entrar',
    'Log out': 'Sair',
    Register: 'Cadastrar',
    'Create account': 'Criar conta',
    'Forgot password?': 'Esqueceu a senha?',
    'Reset password': 'Redefinir senha',
    'Remember me': 'Lembrar de mim',
    'Email address': 'Endereço de e-mail',
    'Full name': 'Nome completo',
    'Current password': 'Senha atual',
    'New password': 'Nova senha',
    'Confirm password': 'Confirmar senha',
    'Update password': 'Atualizar senha',
    'Profile settings': 'Configurações do perfil',
    'Appearance settings': 'Configurações de aparência',
    'Security settings': 'Configurações de segurança',
    'Two-factor authentication': 'Autenticação em dois fatores',
    'Enable 2FA': 'Ativar 2FA',
    'Disable 2FA': 'Desativar 2FA',
    'Recovery codes': 'Códigos de recuperação',
    'Scheduled Tasks': 'Tarefas agendadas',
    'Outgoing Requests': 'Requisições externas',
    'Status page': 'Página de status',
    'Open endpoint': 'Abrir endpoint',
    'Last 30 days': 'Últimos 30 dias',
    'Last checked': 'Última verificação',
    'Response time': 'Tempo de resposta',
    'Average response': 'Resposta média',
    'Daily availability': 'Disponibilidade diária',
    'Service status': 'Status do serviço',
    'Powered by Tyto': 'Desenvolvido com Tyto',
    'No data available': 'Nenhum dado disponível',
    'No records found for this period.':
        'Nenhum registro encontrado neste período.',
    'No issues found.': 'Nenhum problema encontrado.',
    'No logs found': 'Nenhum log encontrado',
};

const es: Catalog = {
    Action: 'Acción',
    Add: 'Agregar',
    Alert: 'Alerta',
    'Alert Rules': 'Reglas de alerta',
    'All priorities': 'Todas las prioridades',
    Allowed: 'Permitido',
    Apply: 'Aplicar',
    'Apply Filter': 'Aplicar filtro',
    Arguments: 'Argumentos',
    Assignee: 'Responsable',
    Attempts: 'Intentos',
    Availability: 'Disponibilidad',
    Back: 'Volver',
    Blocked: 'Bloqueado',
    Cache: 'Caché',
    Calls: 'Llamadas',
    Cancel: 'Cancelar',
    Channel: 'Canal',
    Checked: 'Verificado',
    Close: 'Cerrar',
    Command: 'Comando',
    Commands: 'Comandos',
    Configure: 'Configurar',
    Confirm: 'Confirmar',
    Connection: 'Conexión',
    Continue: 'Continuar',
    Count: 'Cantidad',
    Create: 'Crear',
    Created: 'Creado',
    Critical: 'Crítico',
    Custom: 'Personalizado',
    Dashboard: 'Panel',
    Date: 'Fecha',
    Description: 'Descripción',
    Destination: 'Destino',
    Details: 'Detalles',
    Disabled: 'Desactivado',
    Documentation: 'Documentación',
    Duration: 'Duración',
    Edit: 'Editar',
    Email: 'Correo',
    Environment: 'Entorno',
    Error: 'Error',
    Errors: 'Errores',
    Events: 'Eventos',
    Exception: 'Excepción',
    Exceptions: 'Excepciones',
    Failed: 'Falló',
    Failures: 'Fallos',
    File: 'Archivo',
    Firewall: 'Firewall',
    General: 'General',
    Global: 'Global',
    Healthy: 'Saludable',
    Heartbeats: 'Señales de vida',
    High: 'Alta',
    Host: 'Host',
    Inactive: 'Inactivo',
    Incidents: 'Incidentes',
    Integrations: 'Integraciones',
    Issues: 'Problemas',
    Job: 'Tarea',
    Jobs: 'Tareas',
    Key: 'Clave',
    Language: 'Idioma',
    Light: 'Claro',
    Loading: 'Cargando',
    Location: 'Ubicación',
    Logs: 'Registros',
    Low: 'Baja',
    Mail: 'Correos',
    Management: 'Gestión',
    Max: 'Máximo',
    Medium: 'Media',
    Message: 'Mensaje',
    Method: 'Método',
    Missing: 'Ausente',
    More: 'Más',
    Name: 'Nombre',
    Notifications: 'Notificaciones',
    Observed: 'Observado',
    Offline: 'Fuera de línea',
    Open: 'Abierto',
    Overview: 'Resumen',
    Password: 'Contraseña',
    Path: 'Ruta',
    Pending: 'Pendiente',
    Preview: 'Vista previa',
    Priority: 'Prioridad',
    Processed: 'Procesado',
    Profile: 'Perfil',
    Project: 'Aplicación',
    Projects: 'Aplicaciones',
    Queries: 'Consultas',
    Query: 'Consulta',
    Queue: 'Cola',
    Queued: 'En cola',
    Recipient: 'Destinatario',
    Recipients: 'Destinatarios',
    Records: 'Registros',
    Repository: 'Repositorio',
    Request: 'Solicitud',
    Requests: 'Solicitudes',
    Resolved: 'Resuelto',
    Response: 'Respuesta',
    Retry: 'Reintentar',
    Revoke: 'Revocar',
    Role: 'Rol',
    Routes: 'Rutas',
    Rules: 'Reglas',
    Save: 'Guardar',
    Schedule: 'Programación',
    Search: 'Buscar',
    Security: 'Seguridad',
    Sent: 'Enviado',
    Server: 'Servidor',
    Settings: 'Configuración',
    Signal: 'Señal',
    Source: 'Origen',
    Status: 'Estado',
    Success: 'Éxito',
    System: 'Sistema',
    Target: 'Destino',
    Task: 'Tarea',
    Teams: 'Equipos',
    Thresholds: 'Umbrales',
    Time: 'Tiempo',
    Timeline: 'Cronología',
    Timestamp: 'Fecha y hora',
    Today: 'Hoy',
    Total: 'Total',
    Trace: 'Rastreo',
    Traffic: 'Tráfico',
    Type: 'Tipo',
    Unassigned: 'Sin asignar',
    Updated: 'Actualizado',
    Uptime: 'Disponibilidad',
    User: 'Usuario',
    Users: 'Usuarios',
    Warning: 'Advertencia',
    Workspace: 'Espacio de trabajo',
    'Create Project': 'Crear aplicación',
    'Create Application': 'Crear aplicación',
    'New Project': 'Nueva aplicación',
    'Project Name': 'Nombre de la aplicación',
    'Project Settings': 'Configuración de la aplicación',
    'Project Token': 'Token de la aplicación',
    'Project URL': 'URL de la aplicación',
    'General Information': 'Información general',
    'Data Retention Period': 'Período de retención de datos',
    'Delete Project': 'Eliminar aplicación',
    'Team settings': 'Configuración del equipo',
    'Team members': 'Miembros del equipo',
    'Team name': 'Nombre del equipo',
    'Team logo': 'Logo del equipo',
    'Create team': 'Crear equipo',
    'New team': 'Nuevo equipo',
    'Invite member': 'Invitar miembro',
    'Send invitation': 'Enviar invitación',
    'Pending invitations': 'Invitaciones pendientes',
    'Remove member': 'Eliminar miembro',
    'Log in': 'Iniciar sesión',
    'Log out': 'Cerrar sesión',
    Register: 'Registrarse',
    'Create account': 'Crear cuenta',
    'Forgot password?': '¿Olvidaste tu contraseña?',
    'Reset password': 'Restablecer contraseña',
    'Remember me': 'Recordarme',
    'Email address': 'Correo electrónico',
    'Full name': 'Nombre completo',
    'Current password': 'Contraseña actual',
    'New password': 'Nueva contraseña',
    'Confirm password': 'Confirmar contraseña',
    'Update password': 'Actualizar contraseña',
    'Profile settings': 'Configuración del perfil',
    'Appearance settings': 'Configuración de apariencia',
    'Security settings': 'Configuración de seguridad',
    'Two-factor authentication': 'Autenticación de dos factores',
    'Enable 2FA': 'Activar 2FA',
    'Disable 2FA': 'Desactivar 2FA',
    'Recovery codes': 'Códigos de recuperación',
    'Scheduled Tasks': 'Tareas programadas',
    'Outgoing Requests': 'Solicitudes salientes',
    'Status page': 'Página de estado',
    'Open endpoint': 'Abrir endpoint',
    'Last 30 days': 'Últimos 30 días',
    'Last checked': 'Última comprobación',
    'Response time': 'Tiempo de respuesta',
    'Average response': 'Respuesta media',
    'Daily availability': 'Disponibilidad diaria',
    'Service status': 'Estado del servicio',
    'Powered by Tyto': 'Desarrollado con Tyto',
    'No data available': 'No hay datos disponibles',
    'No records found for this period.':
        'No se encontraron registros para este período.',
    'No issues found.': 'No se encontraron problemas.',
    'No logs found': 'No se encontraron registros',
};

const catalogs: Record<Locale, Catalog> = { en: {}, 'pt-BR': ptBR, es };
const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const attributes = ['aria-label', 'placeholder', 'title'] as const;
const excluded =
    'code, pre, textarea, [contenteditable="true"], [data-raw], [data-telemetry]';

const knownTranslations = (source: string): string[] =>
    Object.values(catalogs).map((catalog) => catalog[source] ?? source);

function translate(root: ParentNode, locale: Locale): void {
    const catalog = catalogs[locale];
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    );
    let node: Node | null = root;

    while (node) {
        if (
            node instanceof Text &&
            node.parentElement &&
            !node.parentElement.closest(excluded)
        ) {
            const previousSource = originalText.get(node);
            const source =
                previousSource &&
                (node.data === previousSource ||
                    knownTranslations(previousSource.trim()).includes(
                        node.data.trim(),
                    ))
                    ? previousSource
                    : node.data;
            originalText.set(node, source);
            const trimmed = source.trim();
            const translated = catalog[trimmed];

            if (translated) {
                const nextValue = source.replace(trimmed, translated);

                if (node.data !== nextValue) {
                    node.data = nextValue;
                }
            } else if (locale === 'en' && node.data !== source) {
                node.data = source;
            }
        } else if (node instanceof Element && !node.closest(excluded)) {
            const originals =
                originalAttributes.get(node) ?? new Map<string, string>();

            for (const attribute of attributes) {
                const value = node.getAttribute(attribute);

                if (!value) {
                    continue;
                }

                const previousSource = originals.get(attribute);

                if (
                    !previousSource ||
                    !knownTranslations(previousSource).includes(value)
                ) {
                    originals.set(attribute, value);
                }

                const source = originals.get(attribute)!;
                const nextValue = catalog[source] ?? source;

                if (value !== nextValue) {
                    node.setAttribute(attribute, nextValue);
                }
            }

            originalAttributes.set(node, originals);
        }

        node = walker.nextNode();
    }
}

export function initializeDocumentLocalization(): void {
    if (typeof document === 'undefined') {
        return;
    }

    let translating = false;
    const apply = () => {
        if (translating) {
            return;
        }

        translating = true;
        translate(document.body, storedLocale());
        translating = false;
    };

    queueMicrotask(apply);
    new MutationObserver(apply).observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...attributes],
    });
    window.addEventListener(LOCALE_EVENT, apply);
}
