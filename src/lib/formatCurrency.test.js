import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  digitIndexToCursor,
  formatRu,
  formatRuDigits,
  formatTaxFormula,
  formatMonthlyTaxFormula,
  formatMonthlyTaxCalculation,
  parseRuInput,
} from './formatCurrency.js';

describe('formatCurrency input helpers', () => {
  it('formats digits with en-IN grouping', () => {
    assert.equal(formatRuDigits(1_200_000), '12,00,000');
    assert.equal(formatRuDigits(0), '');
  });

  it('parses formatted and raw strings', () => {
    assert.equal(parseRuInput('12,00,000'), 1_200_000);
    assert.equal(parseRuInput('रु 2,00,000'), 200_000);
    assert.equal(parseRuInput(''), 0);
  });

  it('formatRu includes prefix', () => {
    assert.equal(formatRu(1_200_000), 'रु 12,00,000');
  });

  it('maps digit index to cursor after commas', () => {
    const formatted = '12,00,000';
    assert.equal(digitIndexToCursor(formatted, 0), 0);
    assert.equal(digitIndexToCursor(formatted, 3), 4);
    assert.equal(digitIndexToCursor(formatted, 7), formatted.length);
  });

  it('formatTaxFormula shows progressive calculation', () => {
    assert.equal(
      formatTaxFormula(1_000_000, 1, 10_000),
      '10,00,000 × 1% = रु 10,000',
    );
  });

  it('formatMonthlyTaxFormula uses monthly amounts', () => {
    assert.equal(
      formatMonthlyTaxFormula(1_000_000, 1, 10_000 / 12),
      '83,333.33 × 1% = रु 833.33',
    );
  });

  it('formatMonthlyTaxCalculation shows operands only', () => {
    assert.equal(formatMonthlyTaxCalculation(1_000_000, 1), '83,333.33 × 1%');
  });
});
