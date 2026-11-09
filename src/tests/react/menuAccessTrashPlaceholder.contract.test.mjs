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
  // the notice is a negative (red) toast, not a success/info one
  assert.match(src, /announceDeleteUnavailable = \(\) => showError\(DELETE_UNAVAILABLE_MESSAGE\)/);
  // no real deletion: no DELETE request is issued by this screen
  assert.doesNotMatch(src, /method: 'DELETE'/);
});
