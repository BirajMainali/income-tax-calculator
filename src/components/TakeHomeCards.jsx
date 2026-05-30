import { formatRu } from '../lib/formatCurrency';

function SummaryCard({ period, takeHome, rows }) {
  return (
    <article className="summary-card">
      <p className="summary-card__period">{period}</p>
      <p className="summary-card__label">Take-home</p>
      <p className="summary-card__amount">{formatRu(takeHome)}</p>
      <ul className="summary-card__rows">
        {rows.map((row) => (
          <li key={row.label} className={row.variant ? `summary-card__row--${row.variant}` : ''}>
            <span>{row.label}</span>
            <span>{row.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function TakeHomeCards({ yearly, monthly }) {
  return (
    <div className="take-home-grid">
      <SummaryCard
        period="Yearly"
        takeHome={yearly.takeHome}
        rows={[
          { label: 'Gross', value: formatRu(yearly.grossInflow) },
          { label: 'Taxable income', value: formatRu(yearly.taxableIncome) },
          {
            label: 'Total tax',
            value: formatRu(yearly.incomeTax),
            variant: 'tax',
          },
          {
            label: 'Tax-saver locked',
            value: formatRu(yearly.deductions),
          },
        ]}
      />
      <SummaryCard
        period="Monthly"
        takeHome={monthly.takeHome}
        rows={[
          { label: 'Gross', value: formatRu(monthly.grossInflow) },
          {
            label: 'Tax',
            value: formatRu(monthly.incomeTax),
            variant: 'tax',
          },
          {
            label: 'Tax-saver',
            value: formatRu(monthly.deductions),
          },
        ]}
      />
    </div>
  );
}
