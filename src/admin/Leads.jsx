import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Download, Mail, Phone, Search, BookPlus, Send } from 'lucide-react';
import Dialog from '../components/Dialog.jsx';
import { api } from '../lib/api.js';
import { useAdmin, useCollections, ago, fmtDate } from './AdminContext.jsx';
import { ConfirmDelete, LoadState, PageHead, SampleTag, Segmented, StatusBadge, downloadFile } from './ui.jsx';
import { BOOK_STATES, FORMATS, LEAD_SOURCES, LEAD_STATUSES, serviceById, volumeBySlug } from '../../shared/catalog.js';
import { BRAND } from '../../shared/brand.js';

const STATUS_FILTERS = [{ id: 'all', label: 'All' }, ...LEAD_STATUSES.map((s) => ({ id: s.id, label: s.name }))];
const nameOf = (list, id) => list.find((x) => x.id === id)?.name || id || '';

function toCsv(rows) {
  const head = ['Received', 'Name', 'Email', 'Phone', 'Book stage', 'Title', 'Genre', 'Services', 'Formats', 'Source', 'Status', 'Message'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((l) =>
    [
      new Date(l.createdAt).toISOString(),
      l.name,
      l.email,
      l.phone,
      nameOf(BOOK_STATES, l.bookState),
      l.title,
      l.genre,
      (l.services || []).map((id) => serviceById[id]?.name).join('; '),
      (l.formats || []).map((f) => nameOf(FORMATS, f)).join('; '),
      nameOf(LEAD_SOURCES, l.source),
      nameOf(LEAD_STATUSES, l.status),
      l.message,
    ]
      .map(esc)
      .join(','),
  );
  return [head.map(esc).join(','), ...lines].join('\n');
}

export default function Leads() {
  const { data, patch, toast, handleError } = useAdmin();
  const state = useCollections('leads');
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [source, setSource] = useState('all');
  const openId = params.get('open');
  const leads = data.leads || [];

  const counts = useMemo(() => {
    const c = { all: leads.length };
    LEAD_STATUSES.forEach((s) => (c[s.id] = leads.filter((l) => l.status === s.id).length));
    return c;
  }, [leads]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (status === 'all' || l.status === status) &&
        (source === 'all' || l.source === source) &&
        (!needle || [l.name, l.email, l.title, l.genre, l.message].some((v) => String(v || '').toLowerCase().includes(needle))),
    );
  }, [leads, q, status, source]);

  const open = leads.find((l) => l.id === openId);
  const setOpen = (id) => {
    const next = new URLSearchParams(params);
    if (id) next.set('open', id);
    else next.delete('open');
    setParams(next, { replace: true });
  };

  async function setLeadStatus(lead, next) {
    const before = lead.status;
    patch('leads', (list) => list.map((l) => (l.id === lead.id ? { ...l, status: next } : l)));
    try {
      await api.updateLead(lead.id, { status: next });
      toast(`${lead.name} marked as ${nameOf(LEAD_STATUSES, next).toLowerCase()}.`);
    } catch (err) {
      patch('leads', (list) => list.map((l) => (l.id === lead.id ? { ...l, status: before } : l)));
      handleError(err);
    }
  }

  const filtersOn = q || status !== 'all' || source !== 'all';

  return (
    <>
      <PageHead title="Enquiries" sub="Every message from the website. New ones arrive at the top.">
        <button type="button" className="btn btn--ghost btn--small" onClick={() => downloadFile(`origin-enquiries-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows), 'text/csv')} disabled={!rows.length}>
          <Download aria-hidden="true" /> Export CSV
        </button>
      </PageHead>
      <LoadState state={state}>
        <div className="a-card a-card--flush">
          <div className="toolbar">
            <label className="search">
              <Search aria-hidden="true" />
              <span className="sr-only">Search enquiries</span>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, title or message" />
            </label>
            <Segmented label="Status" options={STATUS_FILTERS} value={status} onChange={setStatus} counts={counts} />
            <label className="a-select">
              <span className="sr-only">Source</span>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="all">All sources</option>
                {LEAD_SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {rows.length ? (
            <div className="table-wrap">
              <table className="a-table a-table--rows">
                <thead>
                  <tr>
                    <th scope="col">Author</th>
                    <th scope="col">Book</th>
                    <th scope="col">Services</th>
                    <th scope="col">Source</th>
                    <th scope="col">Received</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id} className={l.status === 'new' ? 'is-new' : ''} onClick={() => setOpen(l.id)}>
                      <td>
                        <button type="button" className="a-rowlink" onClick={(e) => { e.stopPropagation(); setOpen(l.id); }}>
                          {l.name}
                        </button>{' '}
                        <SampleTag item={l} />
                        <span className="a-muted a-block">{l.email}</span>
                      </td>
                      <td>
                        {l.title || <span className="a-muted">Untitled</span>}
                        <span className="a-muted a-block">{nameOf(BOOK_STATES, l.bookState) || 'Stage not given'}</span>
                      </td>
                      <td>
                        <span className="svc">
                          {(l.services || []).slice(0, 2).map((id) => (
                            <span key={id} className="svc__chip">
                              <span className="ink-dot" data-ink={volumeBySlug[serviceById[id]?.vol]?.ink} aria-hidden="true" />
                              {serviceById[id]?.name}
                            </span>
                          ))}
                          {(l.services || []).length > 2 && <span className="a-muted">+{l.services.length - 2}</span>}
                          {!(l.services || []).length && <span className="a-muted">Not specified</span>}
                        </span>
                      </td>
                      <td>{nameOf(LEAD_SOURCES, l.source)}</td>
                      <td>
                        <span title={fmtDate(l.createdAt)}>{ago(l.createdAt)}</span>
                      </td>
                      <td>
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="a-empty a-empty--big">
              {filtersOn ? (
                <>
                  <p>No enquiries match these filters.</p>
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => { setQ(''); setStatus('all'); setSource('all'); }}>
                    Clear filters
                  </button>
                </>
              ) : (
                <p>No enquiries yet. Submissions from the website appear here the moment they arrive.</p>
              )}
            </div>
          )}
        </div>
      </LoadState>
      <LeadDrawer lead={open} onClose={() => setOpen(null)} onStatus={setLeadStatus} />
    </>
  );
}

function LeadDrawer({ lead, onClose, onStatus }) {
  const { patch, toast, handleError, load } = useAdmin();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [shown, setShown] = useState(lead);
  useEffect(() => {
    if (lead) setShown(lead);
  }, [lead]);
  const l = lead || shown;

  async function addNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    try {
      const updated = await api.updateLead(l.id, { note });
      patch('leads', (list) => list.map((x) => (x.id === l.id ? updated : x)));
      setNote('');
      toast('Note added.');
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  async function createProject() {
    try {
      await api.createProject({ title: l.title || `${l.name.split(' ')[0]}’s book`, author: l.name, leadId: l.id, formats: l.formats || [], services: l.services || [], stage: l.bookState === 'finished' ? 'editorial' : 'manuscript' });
      await load('projects', true);
      if (l.status !== 'won') await onStatus(l, 'won');
      toast('Project created on the board.');
      navigate('/admin/projects');
    } catch (err) {
      handleError(err);
    }
  }

  async function remove() {
    try {
      await api.deleteLead(l.id);
      patch('leads', (list) => list.filter((x) => x.id !== l.id));
      toast('Enquiry deleted.');
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <Dialog open={!!lead} onClose={onClose} variant="sheet" labelledBy="lead-title" className="a-drawer" closeLabel="Close enquiry">
      {l && (
        <div className="drawer">
          <header className="drawer__head">
            <p className="a-muted">Received {fmtDate(l.createdAt)} · {nameOf(LEAD_SOURCES, l.source)}</p>
            <h2 id="lead-title" className="a-h1">
              {l.name} <SampleTag item={l} />
            </h2>
            <p className="drawer__contact">
              <a href={`mailto:${l.email}`}>
                <Mail aria-hidden="true" /> {l.email}
              </a>
              {l.phone && (
                <a href={`tel:${l.phone}`}>
                  <Phone aria-hidden="true" /> {l.phone}
                </a>
              )}
            </p>
          </header>

          <section className="drawer__section">
            <h3 className="a-h3">Status</h3>
            <Segmented label="Status" options={LEAD_STATUSES.map((s) => ({ id: s.id, label: s.name }))} value={l.status} onChange={(s) => onStatus(l, s)} />
          </section>

          <section className="drawer__section">
            <h3 className="a-h3">The book</h3>
            <dl className="facts">
              <div>
                <dt>Working title</dt>
                <dd>{l.title || '—'}</dd>
              </div>
              <div>
                <dt>Where it is</dt>
                <dd>{nameOf(BOOK_STATES, l.bookState) || '—'}</dd>
              </div>
              <div>
                <dt>Genre</dt>
                <dd>{l.genre || '—'}</dd>
              </div>
              <div>
                <dt>Formats</dt>
                <dd>{(l.formats || []).map((f) => nameOf(FORMATS, f)).join(', ') || 'Open'}</dd>
              </div>
              {/^https?:\/\//i.test(l.website || '') && (
                <div>
                  <dt>Website</dt>
                  <dd>
                    <a href={l.website} target="_blank" rel="noreferrer noopener">
                      {l.website}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            {(l.services || []).length > 0 && (
              <ul className="svc svc--list">
                {l.services.map((id) => (
                  <li key={id} className="svc__chip">
                    <span className="ink-dot" data-ink={volumeBySlug[serviceById[id]?.vol]?.ink} aria-hidden="true" />
                    {serviceById[id]?.name}
                  </li>
                ))}
              </ul>
            )}
            {l.message ? <blockquote className="drawer__message">{l.message}</blockquote> : <p className="a-muted">No message.</p>}
          </section>

          <section className="drawer__section">
            <h3 className="a-h3">Notes</h3>
            {(l.notes || []).length ? (
              <ol className="notes">
                {l.notes.map((n, i) => (
                  <li key={i}>
                    <p>{n.text}</p>
                    <span className="a-muted">
                      {fmtDate(n.at)}
                      {n.by ? ` · ${n.by}` : ''}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="a-muted">No notes yet.</p>
            )}
            <form className="note-form" onSubmit={addNote}>
              <label className="sr-only" htmlFor="note">
                Add a note
              </label>
              <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Called, sent the welcome pack, waiting on the manuscript…" />
              <button type="submit" className="btn btn--small" disabled={!note.trim() || saving}>
                <Send aria-hidden="true" /> Add note
              </button>
            </form>
          </section>

          <section className="drawer__section drawer__actions">
            <a className="btn btn--small" href={`mailto:${l.email}?subject=${encodeURIComponent(`Your book${l.title ? `: ${l.title}` : ''} – ${BRAND.name}`)}`}>
              <Mail aria-hidden="true" /> Reply by email
            </a>
            <button type="button" className="btn btn--ghost btn--small" onClick={createProject}>
              <BookPlus aria-hidden="true" /> Start a book project
            </button>
          </section>

          <section className="drawer__danger">
            <ConfirmDelete label="Delete this enquiry" note="This removes the enquiry and its notes for everyone." onConfirm={remove} />
          </section>
        </div>
      )}
    </Dialog>
  );
}
