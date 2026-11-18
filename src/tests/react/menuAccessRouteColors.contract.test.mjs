import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

const src = fs.readFileSync(
  new URL('../../react/pages/MenuAccessConfigPage.js', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');

const FIELDS = ['routeCardBackground', 'routeCardIcon', 'routeCardIconBackground', 'routeCardText', 'routeCardBorder'];

test('menu card exposes the five routeCard colors with labels (#1650)', () => {
  for (const f of FIELDS) {
    assert.match(src, new RegExp(`\\{field: '${f}', label: '${f}'\\}`));
  }
  const card = src.slice(src.lastIndexOf('ROUTE_COLOR_FIELDS.map'), src.lastIndexOf('availableLinkTypes.map'));
  assert.match(card, /<Text style=\{styles\.fieldLabel\}>\{label\}<\/Text>/);
  assert.match(card, /<ColorInput/);
});

test('drafts load and the menu PATCH saves the routeCard colors (#1650)', () => {
  assert.match(src, /\.\.\.pickRouteColors\(item\)/);
  assert.match(src, /\.\.\.pickRouteColors\(draft\)/);
});
