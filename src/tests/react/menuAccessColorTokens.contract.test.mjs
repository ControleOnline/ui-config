import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../../react/pages/${name}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const colorsSrc = read('MenuAccessConfigPage.colors.js');
const styles = read('MenuAccessConfigPage.styles.js');
const page = read('MenuAccessConfigPage.js');

const palette = Object.fromEntries([...colorsSrc.matchAll(/^  (\w+): '(#[0-9A-Fa-f]{6})',$/gm)].map(([, name, hex]) => [name, hex.toUpperCase()]));
const tokens = Object.fromEntries([...colorsSrc.matchAll(/^  (\w+): palette\.(\w+),$/gm)].map(([, name, base]) => [name, palette[base]]));
const block = key => {
  const match = new RegExp(`^  ${key}: \\{\\n([\\s\\S]*?)^  \\},`, 'm').exec(styles);
  assert.ok(match, `style ${key} exists`);
  return match[1];
};

// Fixed colors of the page body live in one file, by function, each value once (app-community#1718).
test('every fixed color is written once and every token points at the palette', () => {
  const values = Object.values(palette);
  assert.equal(values.length, new Set(values).size, 'palette values are unique');
  assert.equal([...colorsSrc.matchAll(/#[0-9A-Fa-f]{6}/g)].length, values.length, 'no hex outside the palette');
  assert.equal(Object.keys(tokens).length, 12);
});

// Same resolved colors as before the refactor: nothing changes visually.
const EXPECTED = {
  categoryBlock: {backgroundColor: ['blockBackground', '#FFFFFF'], borderColor: ['blockBorder', '#D8E0EA']},
  routeBlock: {backgroundColor: ['blockBackground', '#FFFFFF'], borderColor: ['blockBorder', '#D8E0EA']},
  categoryHeader: {backgroundColor: ['headerBackground', '#F1F5F9'], borderBottomColor: ['divider', '#E2E8F0']},
  routeHeader: {backgroundColor: ['headerBackground', '#F1F5F9'], borderBottomColor: ['divider', '#E2E8F0']},
  categoryFields: {borderBottomColor: ['divider', '#E2E8F0']},
  categoryTitle: {color: ['textTitle', '#0F172A']},
  routeTitle: {color: ['textTitle', '#0F172A']},
  fieldLabel: {color: ['textLabel', '#64748B']},
  input: {backgroundColor: ['inputBackground', '#FFFFFF'], borderColor: ['inputBorder', '#CBD5E1'], color: ['inputText', '#0F172A']},
  compactInput: {backgroundColor: ['inputBackground', '#FFFFFF'], borderColor: ['inputBorder', '#CBD5E1'], color: ['inputText', '#0F172A']},
  orderInput: {backgroundColor: ['inputBackground', '#FFFFFF'], borderColor: ['inputBorder', '#CBD5E1'], color: ['inputText', '#0F172A']},
  colorInputBox: {backgroundColor: ['inputBackground', '#FFFFFF'], borderColor: ['inputBorder', '#CBD5E1']},
  colorSwatch: {borderColor: ['inputBorder', '#CBD5E1']},
  colorInputText: {color: ['inputText', '#0F172A']},
  selectField: {backgroundColor: ['inputBackground', '#FFFFFF'], borderColor: ['inputBorder', '#CBD5E1']},
  selectText: {color: ['inputText', '#0F172A']},
  menuTypeBadge: {backgroundColor: ['badgeBackground', '#E2E8F0'], color: ['badgeText', '#334155']},
};

test('the body styles reference tokens and keep their previous colors', () => {
  for (const [key, props] of Object.entries(EXPECTED)) {
    const body = block(key);
    assert.doesNotMatch(body, /#[0-9A-Fa-f]{3,8}/, `${key} has no literal hex`);
    for (const [prop, [token, hex]] of Object.entries(props)) {
      assert.match(body, new RegExp(`${prop}: menuAccessColors\\.${token},`), `${key}.${prop}`);
      assert.equal(tokens[token], hex, `${token} keeps ${hex}`);
    }
  }
});

test('the route dropdown chevrons use the muted icon token', () => {
  assert.match(page, /import menuAccessColors from '\.\/MenuAccessConfigPage\.colors';/);
  assert.equal((page.match(/color=\{menuAccessColors\.iconMuted\}/g) || []).length, 2);
  assert.equal(tokens.iconMuted, '#64748B');
});
