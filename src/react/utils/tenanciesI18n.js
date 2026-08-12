/**
 * Labels for ADMIN Tenancies page (app-community#319).
 * Uses global.t when available; Portuguese fallbacks for default language pt-BR.
 */
export const TENANCIES_I18N = {
  pageTitle: { type: 'page', key: 'tenancies', fallback: 'Inquilinos (tenancies)' },
  restrictedTitle: { type: 'message', key: 'tenancies_restricted_title', fallback: 'Acesso restrito' },
  restrictedMeta: {
    type: 'message',
    key: 'tenancies_restricted_meta',
    fallback: 'Inquilinos ficam disponíveis apenas no app ADMIN para ROLE_SUPER.',
  },
  domain: { type: 'label', key: 'tenancy_domain', fallback: 'Domínio' },
  dbHost: { type: 'label', key: 'tenancy_db_host', fallback: 'Host do banco' },
  dbName: { type: 'label', key: 'tenancy_db_name', fallback: 'Nome do banco' },
  port: { type: 'label', key: 'tenancy_db_port', fallback: 'Porta' },
  dbUser: { type: 'label', key: 'tenancy_db_user', fallback: 'Usuário do banco' },
  password: { type: 'label', key: 'tenancy_db_password', fallback: 'Senha' },
  driver: { type: 'label', key: 'tenancy_db_driver', fallback: 'Driver' },
  instance: { type: 'label', key: 'tenancy_db_instance', fallback: 'Instância' },
  status: { type: 'label', key: 'tenancy_status', fallback: 'Status' },
  new: { type: 'action', key: 'new', fallback: 'Novo' },
  save: { type: 'action', key: 'save', fallback: 'Salvar' },
  saving: { type: 'action', key: 'saving', fallback: 'Salvando...' },
  install: { type: 'action', key: 'install', fallback: 'Instalar' },
  searchPlaceholder: {
    type: 'placeholder',
    key: 'tenancies_search',
    fallback: 'Buscar domínio, banco, usuário ou status',
  },
  totalItems: { type: 'label', key: 'tenancies_total', fallback: 'inquilinos' },
  saveSuccess: { type: 'message', key: 'tenancy_saved', fallback: 'Inquilino salvo.' },
  saveError: { type: 'message', key: 'tenancy_save_failed', fallback: 'Falha ao salvar inquilino.' },
  installSuccess: {
    type: 'message',
    key: 'tenancy_install_queued',
    fallback: 'Instalação enfileirada.',
  },
  installError: {
    type: 'message',
    key: 'tenancy_install_failed',
    fallback: 'Falha ao enfileirar instalação.',
  },
};

export const tTenancy = (entry, store = 'configs') => {
  if (!entry) return '';
  const translated = global.t?.t?.(store, entry.type, entry.key);
  if (translated && translated !== entry.key) {
    return translated;
  }
  return entry.fallback || entry.key || '';
};
