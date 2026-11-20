import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

test('trash buttons only announce that delete is unavailable (#1470)', () => {
  assert.match(src, /Esta funcionalidade ainda está sendo elaborada, tente mais tarde…/);
  assert.match(src, /accessibilityLabel="Apagar categoria"/);
  assert.match(src, /accessibilityLabel="Apagar item de menu"/);
  assert.equal((src.match(/onPress=\{announceDeleteUnavailable\}/g) || []).length, 2);
  // colors come from the theme `negative` variable, never a hard-coded red
  assert.match(src, /const negative = themeColors\.negative;/);
  assert.match(src, /indicator: \{backgroundColor: negative\}/);
  assert.match(src, /borderColor: palette\.negative \|\| palette\.buttonBorder/);
  assert.match(src, /color=\{palette\.negative \|\| palette\.buttonIcon\}/);
  assert.doesNotMatch(src, /#(?:DC2626|FEF2F2|FFF7F7|FECACA)/i);
  // no real deletion: no DELETE request is issued by this screen
  assert.doesNotMatch(src, /method: 'DELETE'/);
});

// The trash buttons sit in the card headers, to the right of the save buttons (app-community#1729).
test('trash buttons sit in the headers after Salvar categoria and Salvar menu', () => {
  const categoryHeader = src.slice(src.indexOf('<View style={styles.categoryHeader}>'), src.indexOf('<View style={styles.categoryFields}>'));
  assert.ok(categoryHeader.indexOf('Apagar categoria') > categoryHeader.indexOf('Salvar categoria'));
  const routeHeader = src.slice(src.indexOf('<View style={styles.routeHeader}>'), src.indexOf('<View style={styles.routeBody}>'));
  assert.ok(routeHeader.indexOf('Apagar item de menu') > routeHeader.indexOf('Salvar menu'));
  const categoryFields = src.slice(src.indexOf('<View style={styles.categoryFields}>'), src.indexOf('<View style={styles.menuList}>'));
  assert.doesNotMatch(categoryFields, /Apagar categoria/);
  const routeBody = src.slice(src.indexOf('<View style={styles.routeBody}>'), src.lastIndexOf('availableLinkTypes.map'));
  assert.doesNotMatch(routeBody, /Apagar item de menu/);
  assert.doesNotMatch(src, /menuTrashField/);
  assert.doesNotMatch(src.slice(src.indexOf('trashButton: {')), /^\s*marginLeft: 'auto'/m);
});
