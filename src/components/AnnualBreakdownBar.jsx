import { formatRu, formatPercent } from '../lib/formatCurrency';

export function AnnualBreakdownBar({ gross, takeHome, tax, taxSaver }) {
  const segments = [
    { key: 'takehome', label: 'Take-home', amount: takeHome, className: 'bar-seg--green' },
    { key: 'tax', label: 'Govt. tax', amount: tax, className: 'bar-seg--red' },
    { key: 'saver', label: 'Tax-saver', amount: taxSaver, className: 'bar-seg--orange' },
  ];

  return (
    <section className="card card--breakdown">
      <div className="breakdown-header">
        <h2 className="card__label">Annual breakdown</h2>
        <span className="breakdown-header__total">{formatRu(gross)}</span>
      </div>

      <div className="stacked-bar" role="img" aria-label="Annual income allocation">
        {segments.map((seg) =>
          seg.amount > 0 ? (
            <div
              key={seg.key}
              className={`stacked-bar__seg ${seg.className}`}
              style={{ flex: seg.amount }}
              title={`${seg.label}: ${formatRu(seg.amount)}`}
            />
          ) : null,
        )}
      </div>

      <ul className="breakdown-legend">
        {segments.map((seg) => (
          <li key={seg.key} className={`legend-item legend-item--${seg.key}`}>
            <span className="legend-item__dot" aria-hidden="true" />
            <span className="legend-item__label">{seg.label}</span>
            <span className="legend-item__value">{formatRu(seg.amount)}</span>
            <span className="legend-item__pct">
              {formatPercent(seg.amount, gross)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
