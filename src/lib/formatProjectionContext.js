import { getStatutoryCap } from './deductions.js';
import {
  formatMonthlyTaxFormula,
  formatPercent,
  formatRu,
  formatRuDigits,
  formatTaxFormula,
} from './formatCurrency.js';
import { monthlyFromAnnual } from './income.js';

const BRACKET_BASE_LABELS = {
  '5l': '5 Lakh first slab (legacy progressive schedule)',
  '10l': '10 Lakh first slab (FY 2082/83 default schedule)',
};

function nprLine(amount, period = 'year') {
  const digits = formatRuDigits(amount, { zeroAsEmpty: false }) || '0';
  const periodLabel = period === 'month' ? 'per month' : 'per year';
  return `${formatRu(amount)} — NPR ${digits} ${periodLabel}`;
}

function section(title) {
  return `\n## ${title}\n`;
}

function bullet(label, value) {
  return `- ${label}: ${value}`;
}

/**
 * Plain-text projection summary for pasting into an LLM or notes.
 */
export function formatProjectionContext({
  grossAnnual,
  claimedContributions,
  allowableDeduction,
  bracketBase,
  slabs,
  summary,
}) {
  const statutoryCap = getStatutoryCap(grossAnnual);
  const cappedByStatute = claimedContributions > statutoryCap;
  const monthlyGross = monthlyFromAnnual(grossAnnual);
  const { yearly, monthly, activeBrackets, totalAnnualTax, netTaxableIncome } =
    summary;

  const effectiveOnGross =
    grossAnnual > 0 ? formatPercent(totalAnnualTax, grossAnnual) : '0%';
  const effectiveOnTaxable =
    netTaxableIncome > 0
      ? formatPercent(totalAnnualTax, netTaxableIncome)
      : '0%';
  const takeHomeShare =
    grossAnnual > 0 ? formatPercent(yearly.takeHome, grossAnnual) : '0%';

  const lines = [
    '# Nepal income tax projection (copy context)',
    '',
    'This block describes a salary tax projection from the Income Tax Calculator.',
    'Amounts are in Nepalese Rupees (NPR). Figures are unofficial estimates — not certified by government.',
    '',
    'Use this context to: compare scenarios, explain take-home pay, review bracket math, or plan contributions.',
  ];

  lines.push(section('Inputs you projected'));
  lines.push(
    bullet(
      'Annual gross income (salary, allowances, bonus)',
      nprLine(grossAnnual, 'year'),
    ),
  );
  lines.push(
    bullet('Monthly gross equivalent', nprLine(monthlyGross, 'month')),
  );
  lines.push(
    bullet(
      'Tax-saver contributions claimed (annual)',
      nprLine(claimedContributions, 'year'),
    ),
  );
  lines.push(
    bullet(
      'Statutory deduction cap (min of ⅓ gross or NPR 5,00,000)',
      nprLine(statutoryCap, 'year'),
    ),
  );
  lines.push(
    bullet(
      'Allowable deduction applied',
      `${nprLine(allowableDeduction, 'year')}${cappedByStatute ? ' — capped by statute (claimed amount exceeded cap)' : ''}`,
    ),
  );
  lines.push(
    bullet(
      'Bracket preset',
      BRACKET_BASE_LABELS[bracketBase] ?? String(bracketBase),
    ),
  );

  lines.push(section('Progressive tax schedule configured'));
  slabs.forEach((slab, index) => {
    const rate =
      slab.rate == null ? 'rate not set' : `${slab.rate}% marginal rate`;
    const span = slab.rangeLabel ?? slab.label ?? `Tier ${index + 1}`;
    lines.push(`${index + 1}. ${span}: ${rate}`);
  });

  lines.push(section('Results — yearly'));
  lines.push(bullet('Gross inflow', nprLine(yearly.grossInflow, 'year')));
  lines.push(
    bullet('Tax-saver locked (deduction)', nprLine(yearly.deductions, 'year')),
  );
  lines.push(
    bullet('Net taxable income', nprLine(yearly.taxableIncome, 'year')),
  );
  lines.push(bullet('Total income tax', nprLine(yearly.incomeTax, 'year')));
  lines.push(bullet('Take-home pay', nprLine(yearly.takeHome, 'year')));
  lines.push(
    bullet(
      'Effective tax rate (tax ÷ gross)',
      `${effectiveOnGross} of gross`,
    ),
  );
  lines.push(
    bullet(
      'Marginal average on taxable income (tax ÷ taxable)',
      `${effectiveOnTaxable} of taxable income`,
    ),
  );
  lines.push(
    bullet('Take-home share of gross', `${takeHomeShare} retained after tax and locked savings`),
  );

  lines.push(section('Results — monthly'));
  lines.push(bullet('Gross inflow', nprLine(monthly.grossInflow, 'month')));
  lines.push(
    bullet('Tax-saver locked', nprLine(monthly.deductions, 'month')),
  );
  lines.push(bullet('Income tax', nprLine(monthly.incomeTax, 'month')));
  lines.push(bullet('Take-home pay', nprLine(monthly.takeHome, 'month')));

  lines.push(section('How tax was calculated (progressive brackets)'));
  if (activeBrackets.length === 0) {
    lines.push('- No taxable income hit any bracket (zero tax).');
  } else {
    activeBrackets.forEach((row, index) => {
      const bracket = row.rangeLabel ?? row.label ?? `Bracket ${index + 1}`;
      lines.push(`### ${bracket} @ ${row.rate}%`);
      lines.push(
        `- Taxable amount in this bracket (annual): ${nprLine(row.amountHit, 'year')}`,
      );
      lines.push(
        `- Taxable amount in this bracket (monthly): ${nprLine(row.amountHit / 12, 'month')}`,
      );
      lines.push(
        `- Tax for this bracket: ${nprLine(row.yearlyTax, 'year')} (${nprLine(row.monthlyTax, 'month')})`,
      );
      lines.push(
        `- Annual calculation: ${formatTaxFormula(row.amountHit, row.rate, row.yearlyTax)}`,
      );
      lines.push(
        `- Monthly calculation: ${formatMonthlyTaxFormula(row.amountHit, row.rate, row.monthlyTax)}`,
      );
    });
    lines.push('');
    lines.push(
      bullet('Total annual income tax', nprLine(totalAnnualTax, 'year')),
    );
    lines.push(
      bullet('Total monthly income tax', nprLine(monthly.incomeTax, 'month')),
    );
  }

  lines.push(section('Annual cash flow split (of gross)'));
  lines.push(
    bullet('Take-home', `${nprLine(yearly.takeHome, 'year')} (${formatPercent(yearly.takeHome, grossAnnual)} of gross)`),
  );
  lines.push(
    bullet('Income tax', `${nprLine(totalAnnualTax, 'year')} (${formatPercent(totalAnnualTax, grossAnnual)} of gross)`),
  );
  lines.push(
    bullet(
      'Tax-saver contributions (locked)',
      `${nprLine(allowableDeduction, 'year')} (${formatPercent(allowableDeduction, grossAnnual)} of gross)`,
    ),
  );

  lines.push('');
  lines.push('---');
  lines.push(
    'Reminder: verify against Inland Revenue Department rules and your employer payroll before financial decisions.',
  );

  return lines.join('\n');
}
