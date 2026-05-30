const ruFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const ruFormatterDecimals = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format as रु 12,00,000 (Indian/Nepali grouping). */
export function formatRu(amount, { decimals = false } = {}) {
  if (!Number.isFinite(amount)) return 'रु 0';
  const fmt = decimals ? ruFormatterDecimals : ruFormatter;
  return `रु ${fmt.format(Math.round(amount * 100) / 100)}`;
}

/** Digits-only grouping for input fields (no रु prefix). */
export function formatRuDigits(amount, { zeroAsEmpty = true } = {}) {
  if (!Number.isFinite(amount) || amount < 0) return '';
  if (amount === 0) return zeroAsEmpty ? '' : '0';
  return ruFormatter.format(amount);
}

/** Parse user typing — strips everything except digits. */
export function parseRuInput(value) {
  const digits = String(value).replace(/\D/g, '');
  if (digits === '') return 0;
  return Number(digits);
}

/** Map digit index → cursor position in formatted string. */
export function digitIndexToCursor(formatted, digitIndex) {
  if (digitIndex <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++;
      if (seen >= digitIndex) return i + 1;
    }
  }
  return formatted.length;
}

/** Count digits before cursor in raw input value. */
export function digitsBeforeCursor(value, cursorPos) {
  return String(value)
    .slice(0, cursorPos)
    .replace(/\D/g, '').length;
}

/** Format rate for display (e.g. 1 → "1%"). */
export function formatRate(rate) {
  return `${rate}%`;
}

/** Progressive tax operands: 10,00,000 × 1% */
export function formatTaxFormulaOperands(amountHit, rate, { decimals = false } = {}) {
  const base = decimals
    ? ruFormatterDecimals.format(amountHit)
    : formatRuDigits(amountHit, { zeroAsEmpty: false }) || '0';
  return `${base} × ${rate}%`;
}

/** Progressive tax line: 10,00,000 × 1% = रु 10,000 */
export function formatTaxFormula(amountHit, rate, tax, { decimals = false } = {}) {
  return `${formatTaxFormulaOperands(amountHit, rate, { decimals })} = ${formatRu(tax, { decimals })}`;
}

/** Monthly slab operands (amount and rate only). */
export function formatMonthlyTaxCalculation(amountHitAnnual, rate) {
  return formatTaxFormulaOperands(amountHitAnnual / 12, rate, {
    decimals: true,
  });
}

/** Monthly slab line (taxable portion and tax per month). */
export function formatMonthlyTaxFormula(amountHitAnnual, rate, monthlyTax) {
  return formatTaxFormula(amountHitAnnual / 12, rate, monthlyTax, {
    decimals: true,
  });
}

/** Percentage for breakdown legend (one decimal). */
export function formatPercent(part, total) {
  if (!total) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}
