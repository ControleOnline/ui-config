import { api } from '@controleonline/ui-common/src/api';

/**
 * Re-enqueue installation for a tenancy. Used by the row action on TenanciesPage.
 * List/load/save go through ui-default default actions (getItems / save).
 */
export async function enqueueInstall({ commit }, payload = {}) {
  const id = String(payload?.id || payload || '').replace(/\D+/g, '');
  if (!id) {
    return null;
  }

  commit('SET_SAVING', true);
  commit('SET_ERROR', '');

  try {
    const response = await api.fetch(`tenancies/${id}/install`, {
      method: 'POST',
      body: {},
    });
    commit('UPSERT_ITEM', response);
    return response;
  } catch (error) {
    commit('SET_ERROR', error?.message || 'Falha ao reenfileirar instalação.');
    throw error;
  } finally {
    commit('SET_SAVING', false);
  }
}
