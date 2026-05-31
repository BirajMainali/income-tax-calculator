import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTaxSummary } from './calculateDetailedBrackets.js';
import { getAllowableDeduction } from './deductions.js';
import { formatProjectionContext } from './formatProjectionContext.js';
import { enrichSlabsWithRanges, normalizeSlabSizes } from './slabUtils.js';
import { cloneDefaultSlabs } from './taxSlabs.js';

describe('formatProjectionContext', () => {
  const gross = 1_200_000;
  const claimed = 200_000;
  const allowable = getAllowableDeduction(gross, claimed);
  const slabs = enrichSlabsWithRanges(normalizeSlabSizes(cloneDefaultSlabs()));
  const summary = calculateTaxSummary({
    grossAnnualIncome: gross,
    allowableDeduction: allowable,
    slabs,
  });

  const text = formatProjectionContext({
    grossAnnual: gross,
    claimedContributions: claimed,
    allowableDeduction: allowable,
    bracketBase: '10l',
    slabs,
    summary,
  });

  it('includes title and descriptive sections', () => {
    assert.match(text, /Nepal income tax projection/);
    assert.match(text, /## Inputs you projected/);
    assert.match(text, /## Results — yearly/);
    assert.match(text, /## How tax was calculated/);
  });

  it('includes key money figures in NPR', () => {
    assert.match(text, /12,00,000/);
    assert.match(text, /Take-home pay.*9,90,000/);
    assert.match(text, /Total income tax.*10,000/);
  });

  it('includes bracket math for LLM follow-up', () => {
    assert.match(text, /10,00,000 × 1%/);
    assert.match(text, /10 Lakh first slab/);
  });
});
