import { useCallback, useState } from 'react';

/** Heroicons-style sparkles — AI assist (stroke, crisp at 20px). */
function CopyAiIcon() {
  return (
    <svg
      className="copy-context__icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.455L18 2.25l.259 1.036a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.455L18 9.75l.259-1.035a3.375 3.375 0 0 0 2.455-2.456L21.75 6l-1.035-.259a3.375 3.375 0 0 0-2.456-2.455L18 2.25l-.259 1.036a3.375 3.375 0 0 0-2.455 2.455L14.25 6l1.036.259a3.375 3.375 0 0 0 2.455 2.456L18 9.75Z" />
    </svg>
  );
}

export function CopyContextButton({ getText, label = 'Copy as context' }) {
  const [status, setStatus] = useState('idle');

  const copy = useCallback(async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    window.setTimeout(() => setStatus('idle'), 2200);
  }, [getText]);

  const statusLabel =
    status === 'copied'
      ? 'Copied'
      : status === 'failed'
        ? 'Copy failed'
        : null;

  return (
    <div className="copy-context">
      <div className="copy-context__copy">
        <button
          type="button"
          className={`copy-context__btn${status === 'copied' ? ' copy-context__btn--done' : ''}`}
          onClick={copy}
          aria-live="polite"
          aria-label={
            status === 'copied'
              ? 'Copied projection for AI'
              : 'Copy tax projection as context for AI analysis'
          }
        >
          <span className="copy-context__icon">
            <CopyAiIcon />
          </span>
          <span className="copy-context__label">
            {statusLabel ?? label}
          </span>
        </button>
        <p className="copy-context__hint">
          Descriptive projection for LLM analysis — inputs, brackets, take-home,
          and step-by-step tax math.
        </p>
      </div>
    </div>
  );
}
