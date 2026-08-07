/**
 * Unit tests for tenancies custom actions (enqueueInstall).
 * Default list/save actions come from ui-default and are covered there.
 */

const mockFetch = jest.fn();

jest.mock('@controleonline/ui-common/src/api', () => ({
  api: {
    fetch: (...args) => mockFetch(...args),
  },
}));

const {enqueueInstall} = require('../actions');

describe('tenancies actions', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('enqueueInstall returns null when id is missing', async () => {
    const commit = jest.fn();
    const result = await enqueueInstall({commit}, {});
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('enqueueInstall posts to tenancies/{id}/install and commits UPSERT_ITEM', async () => {
    const commit = jest.fn();
    const response = {id: 42, installationStatus: 'pending'};
    mockFetch.mockResolvedValue(response);

    const result = await enqueueInstall({commit}, {id: 42});

    expect(mockFetch).toHaveBeenCalledWith('tenancies/42/install', {
      method: 'POST',
      body: {},
    });
    expect(commit).toHaveBeenCalledWith('SET_SAVING', true);
    expect(commit).toHaveBeenCalledWith('SET_ERROR', '');
    expect(commit).toHaveBeenCalledWith('UPSERT_ITEM', response);
    expect(commit).toHaveBeenCalledWith('SET_SAVING', false);
    expect(result).toEqual(response);
  });

  test('enqueueInstall commits SET_ERROR and rethrows on failure', async () => {
    const commit = jest.fn();
    mockFetch.mockRejectedValue(new Error('network down'));

    await expect(enqueueInstall({commit}, {id: '99'})).rejects.toThrow('network down');
    expect(commit).toHaveBeenCalledWith('SET_ERROR', 'network down');
    expect(commit).toHaveBeenCalledWith('SET_SAVING', false);
  });
});
