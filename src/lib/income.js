/** Annual amount from monthly input (× 12). */
export function annualFromMonthly(monthly) {
  return Math.max(0, monthly) * 12;
}

/** Monthly amount from annual input (÷ 12). */
export function monthlyFromAnnual(annual) {
  return Math.max(0, annual) / 12;
}
