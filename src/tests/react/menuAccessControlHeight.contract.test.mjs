import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const styles = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.styles.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

const block = key => {
  const match = new RegExp(`^  ${key}: \\{\\n([\\s\\S]*?)^  \\},`, 'm').exec(styles);
  assert.ok(match, `style ${key} exists`);
  return match[1];
};

// Buttons, text fields and dropdowns share the app control height, border included (app-community#1711).
const MIN_HEIGHT = [
  'linkButton', 'primaryButton', 'saveButton', 'categoryButton', 'enabledButton',
  'input', 'orderInput', 'compactInput', 'modalSearch', 'colorInputBox',
  'selectField', 'appTypeSelectButton', 'appTypeOption', 'optionRow',
];
const FIXED = {replicateButton: ['height'], iconButton: ['height', 'width'], collapseButton: ['height', 'width']};

test('controls of the menu access page are 32px high', () => {
  for (const key of MIN_HEIGHT) assert.match(block(key), /minHeight: 32,/, key);
  for (const [key, props] of Object.entries(FIXED)) {
    for (const prop of props) assert.match(block(key), new RegExp(`${prop}: 32,`), `${key}.${prop}`);
  }
  assert.match(block('trashButton'), /minWidth: 32,/);
});

test('no control keeps the old 34-38px heights', () => {
  for (const key of [...MIN_HEIGHT, ...Object.keys(FIXED)]) {
    assert.doesNotMatch(block(key), /(?:minHeight|height): (?:3[3-9]|4\d),/, key);
  }
});
