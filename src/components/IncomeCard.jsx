import { monthlyFromAnnual, annualFromMonthly } from '../lib/income';
import { RuInput } from './RuInput';

export function IncomeCard({ grossAnnual, onGrossAnnualChange }) {
  const monthly = monthlyFromAnnual(grossAnnual);

  return (
    <section className="card">
      <h2 className="card__label">Income</h2>

      <label className="card__field" htmlFor="monthly-salary">
        <span className="card__field-label">Monthly gross salary</span>
        <RuInput
          id="monthly-salary"
          value={Math.round(monthly)}
          onChange={(monthlyVal) =>
            onGrossAnnualChange(annualFromMonthly(monthlyVal))
          }
        />
      </label>

      <label className="card__field" htmlFor="gross-income">
        <span className="card__field-label">
          Annual gross income (incl. allowances &amp; bonus)
        </span>
        <RuInput
          id="gross-income"
          value={grossAnnual}
          onChange={onGrossAnnualChange}
        />
      </label>
    </section>
  );
}
