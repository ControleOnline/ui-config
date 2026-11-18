import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('category card has labelled fields and the three card colors (#1644)', () => {
  const card = src.slice(src.indexOf('<View style={styles.categoryFields}>'), src.indexOf('{expanded ? ('));
  for (const label of ['Nome da categoria', 'Icone da categoria', 'Ordem']) {
    assert.match(card, new RegExp(`<Text style=\\{styles\\.fieldLabel\\}>${label}</Text>`));
  }
  assert.match(card, /CATEGORY_COLOR_FIELDS\.map/);
  assert.match(card, /<Text style=\{styles\.fieldLabel\}>\{label\}<\/Text>/);
});

test('category color fields map to the new columns with the requested labels (#1644)', () => {
  assert.match(src, /\{field: 'categoryCardBackground', label: 'CardBackground'\}/);
  assert.match(src, /\{field: 'categoryCardText', label: 'CardText'\}/);
  assert.match(src, /\{field: 'categoryCardMenu', label: 'MenuText'\}/);
  // drafts load all three columns, so the PATCH body (the whole draft) saves them
  for (const f of ['categoryCardBackground', 'categoryCardText', 'categoryCardMenu']) {
    assert.match(src, new RegExp(`${f}: category\\.${f} \\|\\| ''`));
  }
});

test('colors sit on a second row below name, icon, order and trash (#1648)', () => {
  const card = src.slice(src.indexOf('<View style={styles.categoryFields}>'), src.indexOf('{expanded ? ('));
  const first = card.indexOf('styles.categoryFieldsRow');
  const second = card.indexOf('styles.categoryFieldsRow', first + 1);
  assert.ok(first > -1 && second > first);
  const row1 = card.slice(first, second);
  assert.match(row1, /Nome da categoria/);
  assert.match(row1, /Ordem/);
  assert.match(row1, /Apagar categoria/);
  assert.doesNotMatch(row1, /CATEGORY_COLOR_FIELDS/);
  assert.match(card.slice(second), /CATEGORY_COLOR_FIELDS\.map/);
});
