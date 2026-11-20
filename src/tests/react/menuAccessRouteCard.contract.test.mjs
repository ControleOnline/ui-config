import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(`../../react/pages/${name}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const styles = read('MenuAccessConfigPage.styles.js');
const src = read('MenuAccessConfigPage.js');

const block = key => {
  const match = new RegExp(`^  ${key}: \\{\\n([\\s\\S]*?)^  \\},`, 'm').exec(styles);
  assert.ok(match, `style ${key} exists`);
  return match[1];
};
const colors = body => body.split('\n').filter(line => /[cC]olor:/.test(line)).map(line => line.trim());

// The route follows the category card: block, header and title share the same colors (app-community#1716).
test('routeBlock, routeHeader and routeTitle use the same colors as the category card', () => {
  assert.deepEqual(colors(block('routeBlock')), colors(block('categoryBlock')));
  assert.deepEqual(colors(block('routeHeader')), colors(block('categoryHeader')));
  assert.deepEqual(colors(block('routeTitle')), colors(block('categoryTitle')));
  assert.match(block('routeBlock'), /overflow: 'hidden'/);
  assert.match(block('routeHeader'), /borderBottomWidth: 1/);
});

test('each route renders a block with a header and a body, and the old row styles are gone', () => {
  assert.match(src, /<View key=\{item\.id\} style=\{styles\.routeBlock\}>\n\s+<View style=\{styles\.routeHeader\}>/);
  assert.match(src, /<View style=\{styles\.routeBody\}>\n\s+<View style=\{styles\.formGrid\}>/);
  assert.match(src, /<Text style=\{styles\.routeTitle\}>/);
  for (const old of ['menuRow', 'menuHeader', 'menuTitle']) {
    assert.doesNotMatch(src, new RegExp(`styles\\.${old}\\b`), old);
    assert.doesNotMatch(styles, new RegExp(`^  ${old}: \\{`, 'm'), old);
  }
});

test('the route header holds the title and the actions; the fields stay in the body', () => {
  const start = src.indexOf('<View style={styles.routeHeader}>');
  const bodyAt = src.indexOf('<View style={styles.routeBody}>');
  const header = src.slice(start, bodyAt);
  assert.match(header, /styles\.routeTitle/);
  assert.match(header, /styles\.menuHeaderActions/);
  assert.match(header, /saveMenu\(item\)/);
  assert.doesNotMatch(header, /styles\.formGrid/);
});

// The category block has a 4px border and the route block a 2px border (app-community#1720).
test('category and route blocks have 4px and 2px borders', () => {
  assert.match(block('categoryBlock'), /borderWidth: 4,/);
  assert.match(block('routeBlock'), /borderWidth: 2,/);
});

// 18px between the category block and the first route, and between routes (app-community#1724).
test('the route list keeps 18px above the first route and between routes', () => {
  const list = block('menuList');
  assert.match(list, /gap: 18,/);
  assert.match(list, /paddingTop: 18,/);
  assert.match(list, /padding: 12,/);
});
