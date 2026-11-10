import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock } from 'lucide-react';
import { useAdmin, useCollections, ago, fmtShort, DAY } from './AdminContext.jsx';
import { BarList, ChartCard, LineArea, StatTile, useBuckets } from './charts.jsx';
import { PageHead, Segmented, StatusBadge, SampleTag, LoadState } from './ui.jsx';
import { LEAD_SOURCES, STAGES, VOLUMES, serviceById } from '../../shared/catalog.js';

const RANGES = [
  { id: 30, label: '30 days' },
  { id: 90, label: '90 days' },
];

const pct = (a, b) => (b ? ((a - b) / b) * 100 : a ? 100 : 0);

export default function Overview() {
  const { data } = useAdmin();
  const state = useCollections('leads', 'projects', 'visits');
  const [days, setDays] = useState(30);
  const now = Date.now();

  const leads = data.leads || [];
  const projects = data.projects || [];
  const visits = data.visits || [];

  const inRange = (t, from, to) => t >= from && t < to;
  const cur = leads.filter((l) => inRange(l.createdAt, now - days * DAY, now + DAY));
  const prev = leads.filter((l) => inRange(l.createdAt, now - 2 * days * DAY, now - days * DAY));
  const closed = cur.filter((l) => l.status === 'won' || l.status === 'lost');
  const won = cur.filter((l) => l.status === 'won');
  const conv = closed.length ? Math.round((won.length / closed.length) * 100) : null;
  const active = projects.filter((p) => p.stage !== 'readers');
  const visitRows = visits.map((v) => ({ t: new Date(`${v.day}T12:00:00Z`).getTime(), __count: v.count }));
  const visCur = visitRows.filter((v) => inRange(v.t, now - days * DAY, now + DAY)).reduce((s, v) => s + v.__count, 0);
  const visPrev = visitRows.filter((v) => inRange(v.t, now - 2 * days * DAY, now - days * DAY)).reduce((s, v) => s + v.__count, 0);
  const periodLabel = `vs previous ${days} days`;
  const sampleLeads = leads.some((l) => l.sample);
  const sampleProjects = projects.some((p) => p.sample);
  const sampleVisits = visits.some((v) => v.sample);

  const series = useBuckets(leads, days, (l) => l.createdAt);

  const bySource = useMemo(
    () =>
      LEAD_SOURCES.map((s) => ({ label: s.name, value: cur.filter((l) => l.source === s.id).length }))
        .sort((a, b) => b.value - a.value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads, days],
  );

  const byVolume = useMemo(() => {
    const counts = Object.fromEntries(VOLUMES.map((v) => [v.slug, 0]));
    const top = {};
    cur.forEach((l) =>
      (l.services || []).forEach((id) => {
        const s = serviceById[id];
        if (!s) return;
        counts[s.vol] += 1;
        top[s.vol] = top[s.vol] || {};
        top[s.vol][s.name] = (top[s.vol][s.name] || 0) + 1;
      }),
    );
    return VOLUMES.map((v) => {
      const best = Object.entries(top[v.slug] || {}).sort((a, b) => b[1] - a[1])[0];
      return { label: v.name, value: counts[v.slug], color: `var(--chart-${v.ink})`, key: true, hint: best ? `Most asked: ${best[0]} (${best[1]})` : 'No requests yet' };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, days]);
  const volumeTotal = byVolume.reduce((s, r) => s + r.value, 0);

  const byStage = STAGES.map((s) => ({ label: s.name, value: projects.filter((p) => p.stage === s.id).length }));
  const recent = leads.slice(0, 6);
  const dueSoon = projects
    .filter((p) => p.dueAt && p.stage !== 'readers' && p.dueAt < now + 30 * DAY)
    .sort((a, b) => a.dueAt - b.dueAt)
    .slice(0, 5);

  return (
    <>
      <PageHead title="Overview" sub={`Everything that came in over the last ${days} days.`}>
        <Segmented label="Period" options={RANGES} value={days} onChange={setDays} />
      </PageHead>
      <LoadState state={state}>
        {(sampleLeads || sampleProjects || sampleVisits) && (
          <p className="a-samplenote">
            These figures include synthetic sample data. <Link to="/admin/settings">Remove it in Settings</Link> before going live.
          </p>
        )}
        <div className="stats">
          <StatTile label="New enquiries" value={cur.length} delta={pct(cur.length, prev.length)} deltaLabel={periodLabel} />
          <StatTile label="Won" value={won.length} foot={conv == null ? 'No closed enquiries yet' : `${conv}% of closed enquiries`} />
          <StatTile label="Active book projects" value={active.length} foot={`${projects.length - active.length} with readers`} />
          <StatTile label="Site visits" value={visCur.toLocaleString('en-GB')} delta={pct(visCur, visPrev)} deltaLabel={periodLabel} />
        </div>

        <div className="grid-2">
          <ChartCard
            className="span-2"
            title={days > 45 ? 'Enquiries per week' : 'Enquiries per day'}
            sub="Every form, planner and popup submission"
            table={{ columns: ['Period', 'Enquiries'], rows: series.map((b) => [b.long, b.value]) }}
            sample={sampleLeads}
          >
            <LineArea points={series} />
          </ChartCard>

          <ChartCard title="Where enquiries come from" sub={`Last ${days} days`} sample={sampleLeads} table={{ columns: ['Source', 'Enquiries'], rows: bySource.map((r) => [r.label, r.value]) }}>
            <BarList rows={bySource} total={cur.length} />
          </ChartCard>

          <ChartCard
            title="Services requested, by volume"
            sub="A single enquiry can ask for several services"
            table={{ columns: ['Volume', 'Requests'], rows: byVolume.map((r) => [r.label, r.value]) }}
            sample={sampleLeads}
          >
            <BarList rows={byVolume} total={volumeTotal} />
          </ChartCard>

          <ChartCard title="Book projects by stage" sub="Where every book is right now" sample={sampleProjects} table={{ columns: ['Stage', 'Projects'], rows: byStage.map((r) => [r.label, r.value]) }}>
            <BarList rows={byStage} />
          </ChartCard>

          <section className="a-card" aria-labelledby="due-title">
            <header className="chart-card__head">
              <div>
                <h2 className="a-h2" id="due-title">
                  Due in the next 30 days
                </h2>
                <p className="a-sub">Projects still in production</p>
              </div>
            </header>
            {dueSoon.length ? (
              <ul className="due">
                {dueSoon.map((p) => {
                  const late = p.dueAt < now;
                  return (
                    <li key={p.id}>
                      <CalendarClock aria-hidden="true" />
                      <span className="due__title">
                        {p.title} <SampleTag item={p} />
                        <span className="due__meta">
                          {p.author} · {STAGES.find((s) => s.id === p.stage)?.name}
                        </span>
                      </span>
                      <span className={`due__date${late ? ' is-late' : ''}`}>{late ? `Overdue · ${fmtShort(p.dueAt)}` : fmtShort(p.dueAt)}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="a-empty">Nothing due in the next 30 days.</p>
            )}
            <Link to="/admin/projects" className="a-link a-cardlink">
              Open the project board <ArrowRight aria-hidden="true" />
            </Link>
          </section>
        </div>

        <section className="a-card" aria-labelledby="recent-title">
          <header className="chart-card__head">
            <div>
              <h2 className="a-h2" id="recent-title">
                Latest enquiries
              </h2>
              <p className="a-sub">Newest first</p>
            </div>
            <Link to="/admin/enquiries" className="a-link">
              All enquiries <ArrowRight aria-hidden="true" />
            </Link>
          </header>
          {recent.length ? (
            <div className="table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th scope="col">Author</th>
                  <th scope="col">Book</th>
                  <th scope="col">Source</th>
                  <th scope="col">Received</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link to={`/admin/enquiries?open=${l.id}`} className="a-strong">
                        {l.name}
                      </Link>{' '}
                      <SampleTag item={l} />
                    </td>
                    <td>{l.title || <span className="a-muted">Untitled</span>}</td>
                    <td>{LEAD_SOURCES.find((s) => s.id === l.source)?.name || l.source}</td>
                    <td>{ago(l.createdAt)}</td>
                    <td>
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <p className="a-empty">No enquiries yet. Submissions from the website appear here the moment they arrive.</p>
          )}
        </section>
      </LoadState>
    </>
  );
}
