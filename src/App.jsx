import { useMemo, useState } from 'react';
import { calculateTaxSummary } from './lib/calculateDetailedBrackets';
import { getAllowableDeduction } from './lib/deductions';
import { cloneDefaultSlabs, cloneSlabsForBase } from './lib/taxSlabs';
import { GOV_BASIC_SALARY_ANNUAL } from './lib/defaults';
import { enrichSlabsWithRanges, normalizeSlabSizes } from './lib/slabUtils';
import { AppHeader } from './components/AppHeader';
import { TaxBracketCard } from './components/TaxBracketCard';
import { IncomeCard } from './components/IncomeCard';
import { TaxSaversCard } from './components/TaxSaversCard';
import { TakeHomeCards } from './components/TakeHomeCards';
import { AnnualBreakdownBar } from './components/AnnualBreakdownBar';
import { TaxSlabTable } from './components/TaxSlabTable';
import './App.css';

const DEFAULT_GROSS = GOV_BASIC_SALARY_ANNUAL;
const DEFAULT_CONTRIBUTIONS = 0;

export default function App() {
  const [bracketBase, setBracketBase] = useState('10l');
  const [rawSlabs, setRawSlabs] = useState(cloneDefaultSlabs);
  const [grossAnnual, setGrossAnnual] = useState(DEFAULT_GROSS);
  const [annualContributions, setAnnualContributions] = useState(
    DEFAULT_CONTRIBUTIONS,
  );

  const slabs = useMemo(
    () => enrichSlabsWithRanges(normalizeSlabSizes(rawSlabs)),
    [rawSlabs],
  );

  const allowableDeduction = useMemo(
    () => getAllowableDeduction(grossAnnual, annualContributions),
    [grossAnnual, annualContributions],
  );

  const summary = useMemo(
    () =>
      calculateTaxSummary({
        grossAnnualIncome: grossAnnual,
        allowableDeduction,
        slabs,
      }),
    [grossAnnual, allowableDeduction, slabs],
  );

  const handleBracketBaseChange = (base) => {
    setBracketBase(base);
    setRawSlabs(cloneSlabsForBase(base));
  };

  return (
    <div className="app">
      <AppHeader />

      <main className="app__grid">
        <div className="app__inputs">
          <IncomeCard
            grossAnnual={grossAnnual}
            onGrossAnnualChange={setGrossAnnual}
          />
          <TaxSaversCard
            annualContributions={annualContributions}
            onAnnualContributionsChange={setAnnualContributions}
          />
        </div>

        <div className="app__results">
          <TakeHomeCards monthly={summary.monthly} yearly={summary.yearly} />
          <AnnualBreakdownBar
            gross={grossAnnual}
            takeHome={summary.yearly.takeHome}
            tax={summary.totalAnnualTax}
            taxSaver={allowableDeduction}
          />
          <TaxSlabTable
            activeBrackets={summary.activeBrackets}
            totalMonthlyTax={summary.monthly.incomeTax}
          />
        </div>

        <TaxBracketCard
          slabs={rawSlabs}
          onChange={setRawSlabs}
          bracketBase={bracketBase}
          onBracketBaseChange={handleBracketBaseChange}
        />
      </main>
    </div>
  );
}
