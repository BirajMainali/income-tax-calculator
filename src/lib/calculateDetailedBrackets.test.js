import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDetailedBrackets,
  calculateTaxSummary,
} from './calculateDetailedBrackets.js';
import { getAllowableDeduction } from './deductions.js';
import { annualFromMonthly, monthlyFromAnnual } from './income.js';
import { enrichSlabsWithRanges, normalizeSlabSizes, clearSlabUpperBound, setSlabUpperBound } from './slabUtils.js';
import { cloneDefaultSlabs } from './taxSlabs.js';

function defaultSlabs() {
  return enrichSlabsWithRanges(normalizeSlabSizes(cloneDefaultSlabs()));
}

describe('FY 2082/83 mock scenario', () => {
  const gross = 1_200_000;
  const claimed = 200_000;
  const allowable = getAllowableDeduction(gross, claimed);
  const slabs = defaultSlabs();

  it('syncs monthly salary to annual gross', () => {
    assert.equal(annualFromMonthly(100_000), 1_200_000);
    assert.equal(monthlyFromAnnual(1_200_000), 100_000);
  });

  it('caps deduction at claimed when under statutory cap', () => {
    assert.equal(allowable, 200_000);
    assert.equal(getAllowableDeduction(gross, 500_000), 400_000);
  });

  it('taxes 10L taxable at 1% = 10,000 (first official bracket)', () => {
    const brackets = calculateDetailedBrackets(1_000_000, slabs);
    assert.equal(brackets[0].amountHit, 1_000_000);
    assert.equal(brackets[0].yearlyTax, 10_000);
    assert.equal(brackets[1].amountHit, 0);
  });

  it('matches reference take-home figures', () => {
    const summary = calculateTaxSummary({
      grossAnnualIncome: gross,
      allowableDeduction: allowable,
      slabs,
    });

    assert.equal(summary.netTaxableIncome, 1_000_000);
    assert.equal(summary.totalAnnualTax, 10_000);
    assert.equal(summary.yearly.takeHome, 990_000);
    assert.equal(summary.monthly.takeHome, 82_500);
    assert.equal(summary.activeBrackets.length, 1);
  });

  it('tracks remaining pool through progressive brackets', () => {
    const brackets = calculateDetailedBrackets(1_500_000, defaultSlabs());
    const active = brackets.filter((b) => b.amountHit > 0);
    assert.equal(active[0].poolBefore, 1_500_000);
    assert.equal(active[0].poolAfter, 500_000);
    assert.equal(active[1].poolBefore, 500_000);
    assert.equal(active[2].poolAfter, 0);
  });

  it('does not duplicate active rows when first bracket is cleared then restored', () => {
    const gross = 1_500_000;
    const ded = 90_000;

    let raw = cloneDefaultSlabs();
    raw = clearSlabUpperBound(raw, 0);
    raw = setSlabUpperBound(raw, 0, 1111);
    raw = setSlabUpperBound(raw, 1, 201_111);
    raw = setSlabUpperBound(raw, 2, 501_111);
    raw = setSlabUpperBound(raw, 3, 1_501_111);

    const slabs = enrichSlabsWithRanges(normalizeSlabSizes(raw));
    const summary = calculateTaxSummary({
      grossAnnualIncome: gross,
      allowableDeduction: ded,
      slabs,
    });

    assert.equal(summary.activeBrackets.length, 4);
    assert.ok(
      summary.activeBrackets.every((b) => !b.label.includes('All income')),
    );
    assert.equal(
      summary.activeBrackets.filter((b) => b.rate === 10).length,
      1,
    );
    assert.equal(
      summary.activeBrackets.filter((b) => b.rate === 20).length,
      1,
    );

    const cleared = enrichSlabsWithRanges(
      normalizeSlabSizes(clearSlabUpperBound(raw, 0)),
    );
    const midEdit = calculateTaxSummary({
      grossAnnualIncome: gross,
      allowableDeduction: ded,
      slabs: cleared,
    });
    assert.ok(
      midEdit.activeBrackets.every((b) => !b.label.includes('All income')),
    );
  });
});
