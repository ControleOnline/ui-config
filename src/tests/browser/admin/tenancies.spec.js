const {expect, test} = require('playwright/test');
const {API_ORIGIN} = require('../../../../../../../src/tests/browser/apiOrigin');
const {version: appVersion} = require('../../../../../../../package.json');

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'API-TOKEN, APP-DOMAIN, DEVICE, ACCEPT, CONTENT-TYPE, X-Requested-With',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const collection = (member = [], summary = {}) => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
  summary,
});

const jsonHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'application/ld+json; charset=utf-8',
});

const createCompany = () => ({
  id: 3,
  name: 'Produto Exemplo',
  alias: 'EXEMPLO',
  panel_enabled: true,
  enabled: true,
  commercial_enabled: true,
  theme: {
    colors: {
      primary: '#0EA5E9',
      secondary: '#F97316',
    },
  },
  configs: {},
});

const createTenanciesResponse = () => ({
  member: [
    {
      id: 1,
      appHost: 'cliente.exemplo.com',
      dbHost: 'db.exemplo.com',
      dbName: 'tenancy_cliente',
      dbPort: 3306,
      dbUser: 'tenancy_user',
      dbDriver: 'pdo_mysql',
      dbInstance: '',
      installationStatus: 'pending',
    },
    {
      id: 2,
      appHost: 'loja.exemplo.com',
      dbHost: 'db.exemplo.com',
      dbName: 'tenancy_loja',
      dbPort: 3306,
      dbUser: 'loja_user',
      dbDriver: 'pdo_mysql',
      dbInstance: '',
      installationStatus: 'installed',
    },
  ],
  summary: {},
});

const createAdminRuntimeMenusResponse = () => ({
  modules: {
    configuracoes: {
      id: 'admin-configuracoes',
      label: 'Configuracoes',
      icon: 'settings',
      menus: [
        {
          id: 'tenancies',
          menuKey: 'tenancies',
          label: 'Tenancies',
          route: 'TenanciesPage',
          icon: 'server',
          color: '#0284C7',
          sortOrder: 20,
          menuType: 'home',
        },
      ],
    },
  },
});

const mockTenanciesApi = async page => {
  const company = createCompany();

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: CORS_HEADERS,
        body: '',
      });
    }

    if (pathname === 'companies' || pathname === 'people/3' || pathname.startsWith('people/')) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(company),
      });
    }

    if (pathname === 'runtime_menus' || pathname === 'menus') {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(createAdminRuntimeMenusResponse()),
      });
    }

    if (pathname === 'configs' || pathname.startsWith('configs')) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify({configs: {}}),
      });
    }

    if (pathname === 'tenancies' || pathname.startsWith('tenancies')) {
      if (method === 'POST' && pathname.match(/tenancies\/\d+\/install/)) {
        return route.fulfill({
          status: 200,
          headers: jsonHeaders(),
          body: JSON.stringify({
            id: 1,
            appHost: 'cliente.exemplo.com',
            installationStatus: 'pending',
          }),
        });
      }
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(createTenanciesResponse()),
      });
    }

    return route.fulfill({
      status: 200,
      headers: jsonHeaders(),
      body: JSON.stringify(collection([])),
    });
  });

  await page.addInitScript(
    ({appVersion}) => {
      const setLocalStorageItem = (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Some initial documents (like about:blank) do not expose storage.
        }
      };

      setLocalStorageItem(
        'session',
        JSON.stringify({
          id: 7,
          people: '/people/7',
          api_key: 'test-api-key',
          active: 1,
          mycompany: 3,
          roles: ['ROLE_SUPER'],
        }),
      );
      setLocalStorageItem('config', JSON.stringify({language: 'pt-br'}));
      setLocalStorageItem('app-type', 'ADMIN');
      setLocalStorageItem(
        'device',
        JSON.stringify({
          id: 'web-admin',
          device: 'web-admin',
          type: 'WEB',
          appName: 'Browser Admin',
          appVersion,
          buildNumber: appVersion,
          systemName: 'web',
          systemVersion: 'web',
          deviceType: 'web',
          metadata: {},
        }),
      );
    },
    {appVersion},
  );
};

test.describe('tenancies browser smoke', () => {
  test('renders the admin tenancies page with DefaultTable', async ({page}) => {
    await mockTenanciesApi(page);

    await page.goto('/tenancies');

    // DefaultTable list content
    await expect(page.getByText('cliente.exemplo.com')).toBeVisible({timeout: 15000});
    await expect(page.getByText('loja.exemplo.com')).toBeVisible();
    await expect(page.getByText('tenancy_cliente')).toBeVisible();
    await expect(page.getByText('pending').first()).toBeVisible();

    // Search input from searchProps
    await expect(
      page.getByPlaceholder(/Buscar domínio, banco, usuário ou status/i),
    ).toBeVisible();

    // Row action Instalar
    await expect(page.getByRole('button', {name: /Instalar/i}).first()).toBeVisible();

    // Toolbar add
    await expect(page.getByRole('button', {name: /Adicionar|Novo/i}).first()).toBeVisible();
  });
});
