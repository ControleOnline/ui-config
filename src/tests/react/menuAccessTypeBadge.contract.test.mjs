import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('each menu row shows a read-only menu_type badge next to the route/category subtitle', () => {
  const row = src.slice(src.indexOf('<View style={styles.menuMetaRow}>'));
  assert.match(row.slice(0, 600), /styles\.menuMeta\}>\{route\.route/);
  assert.match(row.slice(0, 600), /testID="menu-type-badge"/);
  assert.match(row.slice(0, 600), /item\.menuType \|\| item\.menu_type \|\| 'home'\).toUpperCase\(\)/);
});

test('the badge is display-only: menuType is never sent by saveMenu or createMenu', () => {
  const save = src.slice(src.indexOf('const saveMenu'), src.indexOf('const saveCategory'));
  assert.doesNotMatch(save, /menuType/);
});
