import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('saving a menu or category re-spaces orders before the success message (#1468)', () => {
  assert.match(src, /renumberMenusAfterSave\(item, draft\);\n\s+showSuccess\('Menu atualizado\.'\)/);
  assert.match(src, /renumberCategoriesAfterSave\(categoryId, draft\);\n\s+showSuccess\('Categoria atualizada\.'\)/);
  assert.match(src, /body: \{sortOrder: change\.sortOrder\}/);
});
