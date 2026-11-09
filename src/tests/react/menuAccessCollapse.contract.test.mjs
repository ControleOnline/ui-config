import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('categories start collapsed and the header toggles the items (#1469)', () => {
  assert.match(src, /useState\(\{\}\);\n\s+const toggleCategory/);
  assert.match(src, /const expanded = Boolean\(expandedCategories\[String\(categoryId\)\]\)/);
  assert.match(src, /onPress=\{\(\) => toggleCategory\(categoryId\)\}/);
  assert.match(src, /\{expanded \? \(\n\s+<View style=\{styles\.menuList\}>/);
  assert.match(src, /accessibilityState=\{\{expanded\}\}/);
});
