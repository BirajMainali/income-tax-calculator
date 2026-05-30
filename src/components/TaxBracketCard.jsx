import { cloneSlabsForBase } from '../lib/taxSlabs';
import {
  clearSlabUpperBound,
  getSlabBounds,
  nextSlabId,
  setSlabLowerBound,
  setSlabUpperBound,
} from '../lib/slabUtils';
import { RuInput } from './RuInput';

export function TaxBracketCard({ slabs, onChange, bracketBase, onBracketBaseChange }) {
  const updateRate = (id, rate) => {
    onChange(
      slabs.map((s) =>
        s.id === id
          ? {
              ...s,
              rate:
                rate == null
                  ? null
                  : Math.min(100, Math.max(0, Number(rate) || 0)),
            }
          : s,
      ),
    );
  };

  const updateTo = (index, upper) => {
    if (!upper) {
      onChange(clearSlabUpperBound(slabs, index));
      return;
    }
    onChange(setSlabUpperBound(slabs, index, upper));
  };

  const updateFrom = (index, lower) => {
    if (index <= 0) return;
    if (!lower) {
      onChange(clearSlabUpperBound(slabs, index - 1));
      return;
    }
    onChange(setSlabLowerBound(slabs, index, lower));
  };

  const removeSlab = (id) => {
    if (slabs.length <= 1) return;
    const next = slabs.filter((s) => s.id !== id);
    const last = next[next.length - 1];
    if (last && last.size !== Infinity) {
      next[next.length - 1] = { ...last, size: Infinity, unlimited: true };
    }
    onChange(next);
  };

  const addSlab = () => {
    const next = [...slabs];
    const last = next[next.length - 1];
    if (last?.size === Infinity) {
      next[next.length - 1] = { ...last, size: 500_000, unlimited: false };
    }
    next.push({ id: nextSlabId(slabs), size: null, rate: null });
    onChange(next);
  };

  return (
    <section className="card card--brackets">
      <header className="brackets-header">
        <h2 className="card__label">Tax brackets</h2>
        <button
          type="button"
          className="brackets-reset"
          onClick={() => onChange(cloneSlabsForBase(bracketBase))}
        >
          Reset
        </button>
      </header>

      <div
        className="brackets-base-toggle"
        role="group"
        aria-label="First slab base"
      >
        <button
          type="button"
          className={`brackets-base-toggle__btn${bracketBase === '5l' ? ' brackets-base-toggle__btn--active' : ''}`}
          aria-pressed={bracketBase === '5l'}
          onClick={() => onBracketBaseChange('5l')}
        >
          5 Lakh base
        </button>
        <button
          type="button"
          className={`brackets-base-toggle__btn${bracketBase === '10l' ? ' brackets-base-toggle__btn--active' : ''}`}
          aria-pressed={bracketBase === '10l'}
          onClick={() => onBracketBaseChange('10l')}
        >
          10 Lakh base
        </button>
      </div>

      <ul className="bracket-lines">
        {slabs.map((slab, index) => {
          const { from, to, unlimited } = getSlabBounds(slabs, index);
          const isLast = index === slabs.length - 1;
          const showOpenEnd = unlimited && slab.size === Infinity;

          return (
            <li key={slab.id} className="bracket-row">
              <div className="bracket-row__inputs">
                {index === 0 ? (
                  <span className="bracket-row__fixed">0</span>
                ) : (
                  <RuInput
                    className="ru-input--compact ru-input--inline"
                    value={from ?? 0}
                    onChange={(v) => updateFrom(index, v)}
                    aria-label={`Bracket ${index + 1} start`}
                  />
                )}

                <span className="bracket-row__dash" aria-hidden="true">
                  –
                </span>

                {showOpenEnd ? (
                  <span className="bracket-row__open">…</span>
                ) : (
                  <RuInput
                    className="ru-input--compact ru-input--inline"
                    value={to ?? 0}
                    onChange={(v) => updateTo(index, v)}
                    aria-label={`Bracket ${index + 1} end`}
                  />
                )}

                <div className="bracket-rate">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    className="card__input bracket-rate__input"
                    value={slab.rate ?? ''}
                    placeholder="Rate"
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateRate(slab.id, raw === '' ? null : Number(raw));
                    }}
                    aria-label={`Bracket ${index + 1} rate`}
                  />
                  <span className="bracket-rate__suffix">%</span>
                </div>
              </div>

              {slabs.length > 1 && !isLast && (
                <button
                  type="button"
                  className="bracket-row__remove"
                  onClick={() => removeSlab(slab.id)}
                  aria-label="Remove bracket"
                >
                  ×
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="brackets-footer">
        <button type="button" className="brackets-add" onClick={addSlab}>
          + Add
        </button>
      </footer>
    </section>
  );
}
