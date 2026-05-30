import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearSlabUpperBound,
  enrichSlabsWithRanges,
  getSlabBounds,
  setSlabUpperBound,
} from './slabUtils.js';
import { cloneDefaultSlabs, cloneSlabsForBase, createEmptySlabs } from './taxSlabs.js';

describe('slab bounds editing', () => {
  it('builds FY 2083 default ranges', () => {
    const enriched = enrichSlabsWithRanges(cloneDefaultSlabs());
    assert.equal(enriched[0].rangeTo, 1_000_000);
    assert.equal(enriched[1].rangeFrom, 1_000_001);
    assert.equal(enriched[1].rangeTo, 1_200_000);
    assert.match(enriched[0].rangeLabel, /रु 0 –/);
  });

  it('updates upper bound and recalculates size', () => {
    const slabs = cloneDefaultSlabs();
    const next = setSlabUpperBound(slabs, 0, 800_000);
    const bounds = getSlabBounds(next, 0);
    assert.equal(bounds.to, 800_000);
    assert.equal(next[0].size, 800_000);
  });

  it('starts with blank open bracket bounds', () => {
    const slabs = createEmptySlabs();
    const bounds = getSlabBounds(slabs, 0);
    assert.equal(bounds.from, 0);
    assert.equal(bounds.to, null);
    assert.equal(slabs[0].rate, null);
  });

  it('clears bracket upper bound back to blank', () => {
    const slabs = cloneDefaultSlabs();
    const cleared = clearSlabUpperBound(slabs, 0);
    const bounds = getSlabBounds(cleared, 0);
    assert.equal(cleared[0].size, null);
    assert.equal(bounds.to, null);
  });

  it('loads 5 lakh and 10 lakh base presets', () => {
    const five = cloneSlabsForBase('5l');
    const ten = cloneSlabsForBase('10l');
    assert.equal(five.length, 6);
    assert.equal(five[0].size, 500_000);
    assert.equal(five[0].rate, 1);
    assert.equal(five[4].rate, 36);
    assert.equal(five[5].rate, 39);
    assert.equal(ten.length, 5);
    assert.equal(ten[0].size, 1_000_000);
    assert.equal(ten[0].rate, 1);
  });
});
