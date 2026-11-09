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
