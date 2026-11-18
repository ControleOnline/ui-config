import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('clicking the swatch opens the color palette and writes the hex to the text field', () => {
  const box = src.slice(src.indexOf('const ColorInput'), src.indexOf('// Category card colors'));
  assert.match(box, /Platform\.OS === 'web'/);
  assert.match(box, /type: 'color'/);
  assert.match(box, /onChange: event => onChangeText\(/);
  // the invisible native input covers the swatch so the click lands on it
  assert.match(box, /opacity: 0/);
  assert.match(box, /<TextInput/);
});

test('picker value falls back to a valid #rrggbb', () => {
  assert.match(src, /const toPickerValue = /);
  assert.match(src, /return '#000000';/);
});
