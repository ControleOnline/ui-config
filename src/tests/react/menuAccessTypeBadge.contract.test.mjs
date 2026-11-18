import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('each menu row shows icon, menu name and type badge on one line, without the concatenated route/category text (#1666)', () => {
  const row = src.slice(src.indexOf('<View style={styles.menuTitleRow}>'));
  assert.match(row.slice(0, 500), /styles\.menuTitle\}>\{draft\.menu/);
  assert.match(row.slice(0, 500), /testID="menu-type-badge"/);
  assert.match(row.slice(0, 500), /item\.menuType \|\| item\.menu_type \|\| 'home'\)\.toUpperCase\(\)/);
  assert.doesNotMatch(src, /\{route\.route \|\| '-'\} em /);
  assert.doesNotMatch(src, /styles\.menuMeta/);
});

test('the badge is display-only: menuType is never sent by saveMenu or createMenu', () => {
  const save = src.slice(src.indexOf('const saveMenu'), src.indexOf('const saveCategory'));
  assert.doesNotMatch(save, /menuType/);
});
