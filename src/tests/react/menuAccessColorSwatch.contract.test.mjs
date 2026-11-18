import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('every hex color field shows a swatch preview (#1648)', () => {
  assert.match(src, /const ColorInput = /);
  assert.match(src, /styles\.colorSwatch/);
  // draft.color, addDraft.color, category fields and the routeCard* menu fields (#1650)
  assert.equal((src.match(/<ColorInput/g) || []).length, 4);
  assert.match(src, /<ColorInput\n\s+value=\{draft\.color\}/);
  assert.match(src, /<ColorInput\n\s+value=\{addDraft\.color\}/);
  assert.match(src, /<ColorInput\n\s+value=\{categoryDraft\[field\]\}/);
});

test('category header icon uses the theme color, not the legacy category.color (#1648)', () => {
  assert.match(src, /<Icon name=\{categoryIcon\} size=\{18\} color=\{palette\.buttonIcon\} \/>/);
  assert.doesNotMatch(src, /color=\{categoryDraft\.color\}/);
});

test('swatch sits inside the bordered color box and color fields are narrow (#1648)', () => {
  assert.match(src, /<View style=\{styles\.colorInputBox\}>\n\s+<View\n\s+testID="color-swatch"/);
  assert.equal((src.match(/styles\.fieldColor/g) || []).length, 4);
  const styles = fs.readFileSync(new URL('../../react/pages/MenuAccessConfigPage.styles.js', import.meta.url), 'utf8');
  assert.match(styles, /fieldColor: \{\s+width: 120,/);
});
