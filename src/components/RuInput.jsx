import { useRef } from 'react';
import {
  digitIndexToCursor,
  digitsBeforeCursor,
  formatRuDigits,
  parseRuInput,
} from '../lib/formatCurrency';

export function RuInput({ value, onChange, id, className = '', ...rest }) {
  const inputRef = useRef(null);
  const display = formatRuDigits(value);

  const handleChange = (e) => {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? raw.length;
    const digitIndex = digitsBeforeCursor(raw, cursor);
    const parsed = parseRuInput(raw);

    onChange(parsed);

    const formatted = formatRuDigits(parsed);
    const nextCursor = digitIndexToCursor(formatted, digitIndex);

    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <div className={`ru-input ${className}`.trim()}>
      <span className="ru-input__prefix" aria-hidden="true">
        रु
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="ru-input__field card__input"
        value={display}
        placeholder="0"
        onChange={handleChange}
        {...rest}
      />
    </div>
  );
}
