const STATUTORY_CAP_MAX = 500_000;

/** Statutory cap: min(⅓ of gross, रु 5,00,000). */
export function getStatutoryCap(grossAnnualIncome) {
  return Math.min(grossAnnualIncome / 3, STATUTORY_CAP_MAX);
}

/** Allowable deduction = min(claimed contributions, statutory cap). */
export function getAllowableDeduction(grossAnnualIncome, claimedContributions) {
  const cap = getStatutoryCap(grossAnnualIncome);
  return Math.min(Math.max(0, claimedContributions), cap);
}
