import { useState } from 'react';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { LEAD_STATUSES } from '../../shared/catalog.js';

export function PageHead({ title, sub, children }) {
  return (
    <header className="a-head">
      <div>
        <h1 className="a-h1">{title}</h1>
        {sub && <p className="a-sub">{sub}</p>}
      </div>
      {children && <div className="a-head__actions">{children}</div>}
    </header>
  );
}

export function Segmented({ label, options, value, onChange, counts }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={value === o.id ? 'is-on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
          {counts && counts[o.id] != null && <span className="seg__count">{counts[o.id]}</span>}
        </button>
      ))}
    </div>
  );
}

const STATUS_TONE = { new: 'new', contacted: 'info', proposal: 'warn', won: 'ok', lost: 'muted' };
export function StatusBadge({ status }) {
  const s = LEAD_STATUSES.find((x) => x.id === status);
  return <span className={`badge badge--${STATUS_TONE[status] || 'muted'}`}>{s ? s.name : status}</span>;
}

export function SampleTag({ item }) {
  return item?.sample ? (
    <span className="tag-sample" title="Synthetic sample data. Remove it from Settings.">
      Sample
    </span>
  ) : null;
}

export function LoadState({ state, children }) {
  if (state.error) {
    return (
      <div className="a-card a-loadfail" role="alert">
        <p>{state.error}</p>
        <button type="button" className="btn btn--small" onClick={state.reload}>
          <RefreshCw aria-hidden="true" /> Try again
        </button>
      </div>
    );
  }
  if (!state.ready) {
    return (
      <div className="a-loading" role="status">
        <Loader2 className="spin" aria-hidden="true" /> Loading…
      </div>
    );
  }
  return children;
}

/** A destructive action that asks once more, in place, before it acts. */
export function ConfirmDelete({ label = 'Delete', confirmLabel = 'Yes, delete it', onConfirm, note }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!asking) {
    return (
      <button type="button" className="a-danger" onClick={() => setAsking(true)}>
        <Trash2 aria-hidden="true" /> {label}
      </button>
    );
  }
  return (
    <div className="a-confirm" role="group" aria-label="Confirm deletion">
      {note && <p>{note}</p>}
      <div>
        <button
          type="button"
          className="a-danger a-danger--solid"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
            } finally {
              setBusy(false);
              setAsking(false);
            }
          }}
        >
          {busy ? <Loader2 className="spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />} {confirmLabel}
        </button>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setAsking(false)}>
          Keep it
        </button>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="toggle">
      <input type="checkbox" role="switch" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__thumb" />
      </span>
      <span className="toggle__text">
        {label}
        {hint && <span className="toggle__hint">{hint}</span>}
      </span>
    </label>
  );
}

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`a-field ${error ? 'has-error' : ''} ${className}`}>
      <span>
        {label}
        {hint && <em>{hint}</em>}
      </span>
      {children}
      {error && <span className="a-error">{error}</span>}
    </label>
  );
}

export function downloadFile(name, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
