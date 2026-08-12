import { TENANCIES_I18N, tTenancy } from '../../../react/utils/tenanciesI18n';

describe('tenanciesI18n', () => {
  afterEach(() => {
    delete global.t;
  });

  it('uses Portuguese fallbacks when translate is unavailable', () => {
    expect(tTenancy(TENANCIES_I18N.pageTitle)).toBe('Inquilinos (tenancies)');
    expect(tTenancy(TENANCIES_I18N.dbHost)).toBe('Host do banco');
    expect(tTenancy(TENANCIES_I18N.save)).toBe('Salvar');
  });

  it('prefers catalog translation when global.t returns a value', () => {
    global.t = {
      t: (store, type, key) => {
        if (store === 'configs' && type === 'page' && key === 'tenancies') {
          return 'Inquilinos';
        }
        return key;
      },
    };
    expect(tTenancy(TENANCIES_I18N.pageTitle)).toBe('Inquilinos');
  });
});
