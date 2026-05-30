import { monthlyFromAnnual, annualFromMonthly } from '../lib/income';
import { RuInput } from './RuInput';

export function TaxSaversCard({
  annualContributions,
  onAnnualContributionsChange,
}) {
  const monthlyContributions = monthlyFromAnnual(annualContributions);

  return (
    <section className="card">
      <h2 className="card__label">Tax savers</h2>

      <label className="card__field" htmlFor="monthly-tax-saver">
        <span className="card__field-label">Monthly tax-saver contributions</span>
        <RuInput
          id="monthly-tax-saver"
          value={Math.round(monthlyContributions)}
          onChange={(monthlyVal) =>
            onAnnualContributionsChange(annualFromMonthly(monthlyVal))
          }
        />
      </label>

      <label className="card__field" htmlFor="contributions">
        <span className="card__field-label">
          Annual tax-saver contributions (CIT, PF, insurance)
        </span>
        <RuInput
          id="contributions"
          value={annualContributions}
          onChange={onAnnualContributionsChange}
        />
      </label>
    </section>
  );
}
