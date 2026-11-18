import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('replicate button sits right of the colors and copies them to the other categories of the appType (#1655)', () => {
  assert.match(src, /Replicar para todas as categorias/);
  const row = src.slice(src.indexOf('CATEGORY_COLOR_FIELDS.map({field, label}'.replace('.map({', '.map(({')));
  assert.ok(row.indexOf('Replicar para todas as categorias') > row.indexOf('<ColorInput'));
  const fn = src.slice(src.indexOf('const replicateCategoryColors'), src.indexOf('const openAddMenu'));
  // targets come from the categories listed for the selected appType, never the source itself
  assert.match(fn, /groupedItems/);
  assert.match(fn, /id !== sourceId/);
  assert.match(fn, /CATEGORY_COLOR_FIELDS\.map/);
  assert.match(fn, /menu-config\/categories\/\$\{id\}/);
  assert.match(fn, /method: 'PATCH', body: colors/);
  // only the three colors are sent: name, icon and order of the targets stay untouched
  assert.doesNotMatch(fn, /sortOrder|icon:|name:/);
});
