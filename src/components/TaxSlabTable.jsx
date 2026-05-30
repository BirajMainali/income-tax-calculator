import { formatMonthlyTaxCalculation, formatRu } from '../lib/formatCurrency';

export function TaxSlabTable({ activeBrackets, totalMonthlyTax }) {
  return (
    <section className="card card--slabs">
      <h2 className="card__label">Tax slab breakdown · monthly</h2>

      <div className="slab-table-wrap">
        <table className="slab-table">
          <thead>
            <tr>
              <th scope="col">Bracket (annual)</th>
              <th scope="col">Available / mo</th>
              <th scope="col">Calculation</th>
              <th scope="col">Tax / mo</th>
            </tr>
          </thead>
          <tbody>
            {activeBrackets.map((row, index) => (
              <tr key={row.tierIndex ?? `row-${index}`}>
                <td className="slab-table__bracket">
                  {row.rangeLabel ?? row.label}
                </td>
                <td className="slab-table__pool">
                  {formatRu(row.monthlyPoolBefore, { decimals: true })}
                  {index === 0 && (
                    <span className="slab-table__pool-hint">taxable pool</span>
                  )}
                  {index > 0 && (
                    <span className="slab-table__pool-hint">after prev.</span>
                  )}
                </td>
                <td className="slab-table__calc">
                  {formatMonthlyTaxCalculation(row.amountHit, row.rate)}
                </td>
                <td className="slab-table__tax">
                  {formatRu(row.monthlyTax, { decimals: true })}
                </td>
              </tr>
            ))}
          </tbody>
          {activeBrackets.length > 0 && (
            <tfoot>
              <tr className="slab-table__total-row">
                <td colSpan={3}>Total monthly income tax</td>
                <td className="slab-table__tax">
                  {formatRu(totalMonthlyTax, { decimals: true })}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <p className="slab-footnote">
        <strong>Available</strong> = income entering this slab (row 1 = full
        taxable pool; later rows = left after previous bracket). Monthly =
        annual ÷ 12.
      </p>
    </section>
  );
}
