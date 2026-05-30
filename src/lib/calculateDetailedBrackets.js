import { isSlabChainComplete } from './slabUtils.js';

/**
 * Pass net taxable income through progressive slabs and return per-tier breakdown.
 */
export function calculateDetailedBrackets(netTaxableIncome, slabs) {
  let remainingIncome = Math.max(0, netTaxableIncome);

  return slabs.map((slab, index) => {
    const poolBefore = remainingIncome;
    const chainComplete = isSlabChainComplete(slabs, index);
    const isLast = index === slabs.length - 1;
    const isOpenEnded =
      slab.size === Infinity || (slab.size == null && isLast && chainComplete);

    if (remainingIncome <= 0 || !chainComplete) {
      return {
        ...slab,
        tierIndex: index,
        label: slab.rangeLabel ?? slab.label,
        amountHit: 0,
        yearlyTax: 0,
        monthlyTax: 0,
        poolBefore,
        poolAfter: remainingIncome,
        monthlyPoolBefore: poolBefore / 12,
        monthlyPoolAfter: remainingIncome / 12,
      };
    }

    let bracketCapacity;
    if (slab.size == null) {
      bracketCapacity = isOpenEnded ? remainingIncome : 0;
    } else if (slab.size === Infinity) {
      bracketCapacity = remainingIncome;
    } else {
      bracketCapacity = slab.size;
    }
    const amountInSlab = Math.min(remainingIncome, bracketCapacity);
    remainingIncome -= amountInSlab;
    const poolAfter = remainingIncome;

    const rate = slab.rate ?? 0;
    const yearlyTax = amountInSlab * (rate / 100);

    return {
      label: slab.rangeLabel ?? slab.label,
      rangeLabel: slab.rangeLabel,
      rate: slab.rate,
      size: slab.size,
      tierName: slab.tierName,
      tierIndex: index,
      amountHit: amountInSlab,
      yearlyTax,
      monthlyTax: yearlyTax / 12,
      poolBefore,
      poolAfter,
      monthlyPoolBefore: poolBefore / 12,
      monthlyPoolAfter: poolAfter / 12,
    };
  });
}

export function sumBracketTax(brackets) {
  return brackets.reduce((sum, b) => sum + b.yearlyTax, 0);
}

/**
 * Single calculation path:
 * gross (annual) − allowable deductions (annual) → taxable → progressive tax → take-home.
 */
export function calculateTaxSummary({
  grossAnnualIncome,
  allowableDeduction,
  slabs,
}) {
  const netTaxableIncome = Math.max(0, grossAnnualIncome - allowableDeduction);
  const brackets = calculateDetailedBrackets(netTaxableIncome, slabs);
  const totalAnnualTax = sumBracketTax(brackets);
  const activeBrackets = brackets.filter((b) => b.amountHit > 0);

  const grossMonthly = grossAnnualIncome / 12;
  const monthlyDeductions = allowableDeduction / 12;
  const monthlyTax = totalAnnualTax / 12;
  const netMonthlyTakeHome = grossMonthly - monthlyDeductions - monthlyTax;
  const netYearlyTakeHome =
    grossAnnualIncome - allowableDeduction - totalAnnualTax;

  return {
    netTaxableIncome,
    brackets,
    activeBrackets,
    totalAnnualTax,
    monthly: {
      grossInflow: grossMonthly,
      deductions: monthlyDeductions,
      incomeTax: monthlyTax,
      takeHome: netMonthlyTakeHome,
    },
    yearly: {
      grossInflow: grossAnnualIncome,
      deductions: allowableDeduction,
      incomeTax: totalAnnualTax,
      takeHome: netYearlyTakeHome,
      taxableIncome: netTaxableIncome,
    },
  };
}
