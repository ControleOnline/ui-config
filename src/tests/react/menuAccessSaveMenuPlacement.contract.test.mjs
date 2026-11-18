import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('Salvar menu sits next to Ativo/Inativo with the category button style (#1467)', () => {
  const header = src.slice(src.indexOf('styles.menuHeaderActions'));
  const enabled = header.indexOf('styles.enabledButton');
  const save = header.indexOf('Salvar menu');
  const closing = header.indexOf('</View>', save);
  assert.ok(enabled > -1 && save > enabled && closing > save, 'Salvar menu must follow the toggle in the same group');
  assert.match(header.slice(enabled, save), /styles\.categoryButton/);
  assert.doesNotMatch(src, /styles\.saveButtonText[^\n]*Salvar menu</);
});
