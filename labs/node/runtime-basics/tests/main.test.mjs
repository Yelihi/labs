import test from 'node:test';
import assert from 'node:assert/strict';
import { add } from '../src/main.mjs';

test('adds positive and negative numbers', () => {
  assert.equal(add(2, 3), 5);
  assert.equal(add(-2, 2), 0);
});
