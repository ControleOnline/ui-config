// Re-spaces sort orders in steps of 10 (app-community#1468).
// Entries are ordered by their current order; on a tie the entry that was just
// edited goes first. Only entries whose order actually changes are returned.
export const ORDER_STEP = 10;

const toOrder = value => {
  if (value === null || value === undefined || value === '') return Number.POSITIVE_INFINITY;
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.POSITIVE_INFINITY;
};

export function renumberByTen(entries, editedId = null) {
  const list = (Array.isArray(entries) ? entries : []).map((entry, index) => ({
    id: String(entry.id),
    current: entry.sortOrder,
    order: toOrder(entry.sortOrder),
    edited: editedId !== null && String(entry.id) === String(editedId),
    index,
  }));

  list.sort((left, right) => {
    if (left.order !== right.order) return left.order < right.order ? -1 : 1;
    if (left.edited !== right.edited) return left.edited ? -1 : 1;
    return left.index - right.index;
  });

  return list
    .map((entry, position) => ({
      id: entry.id,
      current: entry.current,
      sortOrder: (position + 1) * ORDER_STEP,
    }))
    .filter(entry => Number(entry.current) !== entry.sortOrder || entry.current === null || entry.current === '' || entry.current === undefined);
}
