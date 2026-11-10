import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus, Table2, BarChart3 } from 'lucide-react';
import { fmtNum } from './AdminContext.jsx';

/* Charts follow one contract: thin marks, hairline recessive grid, a hover
   layer on every plotted mark, direct labels used sparingly, text in text
   tokens (never the data colour), and a table view for every chart. */

export function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function niceMax(v) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

export function ChartCard({ title, sub, table, children, className = '', sample = false }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className={`a-card chart-card ${className}`} aria-label={title}>
      <header className="chart-card__head">
        <div>
          <h2 className="a-h2">{title}</h2>
          {sub && <p className="a-sub">{sub}</p>}
          {sample && <p className="a-samplemark">Includes sample data</p>}
        </div>
        {table && (
          <button type="button" className="a-iconbtn" onClick={() => setAsTable((v) => !v)} aria-pressed={asTable} title={asTable ? 'Show chart' : 'Show as table'}>
            {asTable ? <BarChart3 aria-hidden="true" /> : <Table2 aria-hidden="true" />}
            <span className="sr-only">{asTable ? 'Show chart' : 'Show as table'}</span>
          </button>
        )}
      </header>
      {asTable && table ? (
        <table className="a-table a-table--compact">
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (
                  <td key={j} className={j > 0 ? 'num' : ''}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        children
      )}
    </section>
  );
}

/** Single series over time: 2px line, a 10% wash, crosshair + tooltip. */
export function LineArea({ points, height = 240, color = 'var(--house)', unit = 'enquiries' }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { l: 36, r: 46, t: 16, b: 30 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const max = niceMax(Math.max(1, ...points.map((p) => p.value)));
  const x = (i) => pad.l + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v) => pad.t + ih - (v / max) * ih;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${pad.t + ih} L${x(0).toFixed(1)},${pad.t + ih} Z`;
  const ticks = [0, max / 2, max];
  const labelEvery = Math.ceil(points.length / Math.max(2, Math.floor(iw / 70)));
  const last = points[points.length - 1];

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const i = Math.round(((px - pad.l) / iw) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };

  return (
    <div className="chart" ref={ref}>
      <svg width={width} height={height} role="img" aria-label={`Line chart of ${unit}. Latest: ${last ? `${last.value} in ${last.label}` : 'none'}.`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} className="chart__grid" />
            <text x={pad.l - 8} y={y(t) + 4} className="chart__tick" textAnchor="end">
              {fmtNum(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={p.label} x={x(i)} y={height - 8} className="chart__tick" textAnchor={i === points.length - 1 ? 'end' : 'middle'}>
              {p.label}
            </text>
          ) : null,
        )}
        <path d={area} fill={color} opacity="0.1" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {last && (
          <>
            <circle cx={x(points.length - 1)} cy={y(last.value)} r="6" fill="var(--a-surface)" />
            <circle cx={x(points.length - 1)} cy={y(last.value)} r="4" fill={color} />
            <text x={x(points.length - 1) + 10} y={y(last.value) + 4} className="chart__end">
              {last.value}
            </text>
          </>
        )}
        {hover != null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} className="chart__cross" />
            <circle cx={x(hover)} cy={y(points[hover].value)} r="6" fill="var(--a-surface)" />
            <circle cx={x(hover)} cy={y(points[hover].value)} r="4" fill={color} />
          </g>
        )}
      </svg>
      {hover != null && (
        <div className="chart__tip" style={{ left: Math.min(width - 150, Math.max(0, x(hover) - 70)), top: Math.max(0, y(points[hover].value) - 64) }}>
          <strong>{points[hover].value}</strong> {unit}
          <span>{points[hover].long || points[hover].label}</span>
        </div>
      )}
    </div>
  );
}

/** Horizontal bars, ≤24px, 4px rounded data-end, value at the tip. */
export function BarList({ rows, color = 'var(--house)', total, legend }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const [hover, setHover] = useState(null);
  return (
    <div className="barlist">
      {legend && (
        <ul className="legend" aria-label="Legend">
          {legend.map((l) => (
            <li key={l.label}>
              <span className="legend__key" style={{ background: l.color }} />
              {l.label}
            </li>
          ))}
        </ul>
      )}
      <ul className="barlist__rows">
        {rows.map((r, i) => (
          <li key={r.label} className={`barlist__row${hover === i ? ' is-hover' : ''}`} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
            <span className="barlist__label">
              {r.key && <span className="legend__key" style={{ background: r.color }} aria-hidden="true" />}
              {r.label}
            </span>
            <span className="barlist__track">
              <span className="barlist__bar" style={{ width: `${(r.value / max) * 100}%`, background: r.color || color }} />
              <span className="barlist__value">
                {fmtNum(r.value)}
                {total ? <span className="barlist__share"> · {Math.round((r.value / total) * 100)}%</span> : null}
              </span>
            </span>
            {hover === i && r.hint && <span className="barlist__tip">{r.hint}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Stat tile: label, value, signed delta vs a named period. */
export function StatTile({ label, value, delta, deltaLabel, goodWhenUp = true, foot }) {
  const dir = delta == null || Number.isNaN(delta) ? 0 : delta > 0.5 ? 1 : delta < -0.5 ? -1 : 0;
  const good = dir === 0 ? null : (dir > 0) === goodWhenUp;
  const Icon = dir > 0 ? ArrowUpRight : dir < 0 ? ArrowDownRight : Minus;
  return (
    <div className="stat">
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {delta != null && Number.isFinite(delta) ? (
        <p className={`stat__delta${good === true ? ' is-good' : good === false ? ' is-bad' : ''}`}>
          <Icon aria-hidden="true" />
          {dir === 0 ? 'No change' : `${dir > 0 ? '+' : '−'}${Math.abs(Math.round(delta))}%`} <span>{deltaLabel}</span>
        </p>
      ) : (
        foot && <p className="stat__delta">{foot}</p>
      )}
    </div>
  );
}

export function useBuckets(items, days, getTime) {
  return useMemo(() => {
    const now = Date.now();
    const DAY = 86400000;
    const weekly = days > 45;
    const size = weekly ? 7 : 1;
    const n = Math.ceil(days / size);
    const start = now - n * size * DAY;
    const buckets = Array.from({ length: n }, (_, i) => {
      const from = start + i * size * DAY;
      const d = new Date(from + (weekly ? 0 : 0));
      return {
        from,
        value: 0,
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        long: weekly ? `Week of ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}` : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' }),
      };
    });
    for (const it of items) {
      const t = getTime(it);
      if (t < start) continue;
      const i = Math.min(n - 1, Math.floor((t - start) / (size * DAY)));
      buckets[i].value += it.__count || 1;
    }
    return buckets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, days]);
}
