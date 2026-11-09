import assert from 'node:assert/strict';
import test from 'node:test';
import {renumberByTen} from '../../react/utils/menuOrder.js';

const ids = result => result.map(item => `${item.id}:${item.sortOrder}`);

test('renumbers an edited order to 10,20,30,40', () => {
  const result = renumberByTen([
    {id: 1, sortOrder: 10}, {id: 2, sortOrder: 15}, {id: 3, sortOrder: 20}, {id: 4, sortOrder: 40},
  ], 2);
  assert.deepEqual(ids(result), ['2:20', '3:30']);
});

test('moving an item to the front shifts the others', () => {
  const result = renumberByTen([
    {id: 1, sortOrder: 10}, {id: 2, sortOrder: 20}, {id: 3, sortOrder: 5},
  ], 3);
  assert.deepEqual(ids(result), ['3:10', '1:20', '2:30']);
});

test('already-aligned lists produce no updates', () => {
  assert.deepEqual(renumberByTen([{id: 1, sortOrder: 10}, {id: 2, sortOrder: 20}]), []);
});

test('tie: the edited entry goes first; empty orders go last', () => {
  const tie = renumberByTen([{id: 1, sortOrder: 20}, {id: 2, sortOrder: 20}, {id: 3, sortOrder: 10}], 2);
  assert.deepEqual(ids(tie), ['1:30']);
  const blank = renumberByTen([{id: 1, sortOrder: null}, {id: 2, sortOrder: 10}]);
  assert.deepEqual(ids(blank), ['1:20']);
});
