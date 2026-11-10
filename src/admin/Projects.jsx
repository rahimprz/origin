import { useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CalendarClock, Plus, Search, UserRound } from 'lucide-react';
import Dialog from '../components/Dialog.jsx';
import { api } from '../lib/api.js';
import { useAdmin, useCollections, daysBetween, fmtShort } from './AdminContext.jsx';
import { ConfirmDelete, Field, LoadState, PageHead, SampleTag } from './ui.jsx';
import { FORMATS, SERVICES, STAGES, VOLUMES, serviceById, volumeBySlug } from '../../shared/catalog.js';

const fmtNames = (ids) => ids.map((f) => FORMATS.find((x) => x.id === f)?.name).filter(Boolean);
// trade shorthand keeps the band to one line: eBook · PB · HB · Audio
const SHORT = { ebook: 'eBook', paperback: 'PB', hardcover: 'HB', audiobook: 'Audio' };
const fmtShortNames = (ids) => ids.map((f) => SHORT[f]).filter(Boolean);

function ProjectCard({ p, onOpen, overlay = false }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: p.id, disabled: overlay });
  const first = (p.services || []).map((id) => serviceById[id]).find(Boolean);
  const ink = first ? volumeBySlug[first.vol].ink : 'house';
  const day = Math.max(1, daysBetween(p.startedAt, Date.now()));
  const late = p.dueAt && p.dueAt < Date.now() && p.stage !== 'readers';
  return (
    <article
      ref={overlay ? undefined : setNodeRef}
      className={`pcard${isDragging ? ' is-dragging' : ''}${overlay ? ' is-overlay' : ''}`}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      aria-roledescription="Draggable book project"
      aria-label={`${p.title} by ${p.author}. Press space to pick up and move between stages, or enter to edit.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen?.(p);
        listeners?.onKeyDown?.(e);
      }}
      onClick={() => onOpen?.(p)}
    >
      <div className="pcard__band" data-ink={ink}>
        <span title={fmtNames(p.formats || []).join(', ')}>{fmtShortNames(p.formats || []).join(' · ') || 'Formats open'}</span>
        <span>Day {day}</span>
      </div>
      <div className="pcard__body">
        <h3 className="pcard__title">
          {p.title} <SampleTag item={p} />
        </h3>
        <p className="pcard__author">{p.author || 'Author not set'}</p>
        <p className="pcard__meta">
          {p.owner && (
            <span>
              <UserRound aria-hidden="true" /> {p.owner}
            </span>
          )}
          {p.dueAt && (
            <span className={late ? 'is-late' : ''}>
              <CalendarClock aria-hidden="true" /> {late ? 'Overdue ' : 'Due '}
              {fmtShort(p.dueAt)}
            </span>
          )}
        </p>
      </div>
    </article>
  );
}

function Column({ stage, items, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <section ref={setNodeRef} className={`col${isOver ? ' is-over' : ''}`} aria-label={`${stage.name}, ${items.length} projects`}>
      <header className="col__head">
        <h2>{stage.name}</h2>
        <span className="col__count">{items.length}</span>
      </header>
      <div className="col__list">
        {items.map((p) => (
          <ProjectCard key={p.id} p={p} onOpen={onOpen} />
        ))}
        {!items.length && <p className="col__empty">Drop a project here</p>}
      </div>
    </section>
  );
}

export default function Projects() {
  const { data, patch, toast, handleError } = useAdmin();
  const state = useCollections('projects');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // project or {} for new
  const [dragId, setDragId] = useState(null);
  const lastDrag = useRef(0);
  const openProject = (p) => {
    if (Date.now() - lastDrag.current > 300) setEditing(p);
  };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  const projects = data.projects || [];

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? projects.filter((p) => [p.title, p.author, p.owner].some((v) => String(v || '').toLowerCase().includes(n))) : projects;
  }, [projects, q]);

  async function move(id, stage) {
    const p = projects.find((x) => x.id === id);
    if (!p || p.stage === stage) return;
    const before = p.stage;
    patch('projects', (list) => list.map((x) => (x.id === id ? { ...x, stage } : x)));
    try {
      await api.updateProject(id, { stage });
      toast(`${p.title} moved to ${STAGES.find((s) => s.id === stage).name}.`);
    } catch (err) {
      patch('projects', (list) => list.map((x) => (x.id === id ? { ...x, stage: before } : x)));
      handleError(err);
    }
  }

  const dragging = projects.find((p) => p.id === dragId);

  return (
    <>
      <PageHead title="Book projects" sub="Drag a book to the stage it has reached. Select it to edit the details.">
        <label className="search search--small">
          <Search aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, author or owner" />
        </label>
        <button type="button" className="btn btn--small" onClick={() => setEditing({})}>
          <Plus aria-hidden="true" /> New project
        </button>
      </PageHead>
      <LoadState state={state}>
        <DndContext
          sensors={sensors}
          onDragStart={(e) => setDragId(e.active.id)}
          onDragCancel={() => setDragId(null)}
          onDragEnd={(e) => {
            setDragId(null);
            lastDrag.current = Date.now();
            if (e.over) move(e.active.id, e.over.id);
          }}
        >
          <div className="board">
            {STAGES.map((s) => (
              <Column key={s.id} stage={s} items={filtered.filter((p) => p.stage === s.id)} onOpen={openProject} />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>{dragging ? <ProjectCard p={dragging} overlay /> : null}</DragOverlay>
        </DndContext>
      </LoadState>
      <ProjectDialog project={editing} onClose={() => setEditing(null)} />
    </>
  );
}

const toDateInput = (t) => (t ? new Date(t).toISOString().slice(0, 10) : '');

function ProjectDialog({ project, onClose }) {
  const { patch, toast, handleError } = useAdmin();
  const isNew = project && !project.id;
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({ title: '', author: '', owner: '', stage: 'manuscript', formats: [], services: [], dueAt: null, ...project });
      setError('');
    }
  }, [project]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => set(k, form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v]);

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError('Give the project a working title.');
    setBusy(true);
    const payload = { title: form.title, author: form.author, owner: form.owner, stage: form.stage, formats: form.formats, services: form.services, dueAt: form.dueAt };
    try {
      if (isNew) {
        const created = await api.createProject(payload);
        patch('projects', (list) => [created, ...list]);
        toast('Project added to the board.');
      } else {
        const updated = await api.updateProject(form.id, payload);
        patch('projects', (list) => list.map((x) => (x.id === form.id ? { ...x, ...updated } : x)));
        toast('Project saved.');
      }
      onClose();
    } catch (err) {
      if (err.field) setError(err.message);
      else handleError(err);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    try {
      await api.deleteProject(form.id);
      patch('projects', (list) => list.filter((x) => x.id !== form.id));
      toast('Project deleted.');
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <Dialog open={!!project} onClose={onClose} labelledBy="project-title" className="a-modal" closeLabel="Close project">
      {form && (
        <form className="a-form" onSubmit={save} noValidate>
          <header className="a-form__head">
            <h2 id="project-title" className="a-h1">
              {isNew ? 'New book project' : 'Edit book project'}
            </h2>
            {!isNew && <p className="a-sub">Started {fmtShort(form.startedAt)} · day {Math.max(1, daysBetween(form.startedAt, Date.now()))}</p>}
          </header>
          <div className="a-form__body">
            <div className="a-grid-2">
              <Field label="Working title" error={error}>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} autoFocus={isNew} />
              </Field>
              <Field label="Author">
                <input value={form.author} onChange={(e) => set('author', e.target.value)} />
              </Field>
              <Field label="Stage">
                <select value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Owner" hint="team or person">
                <input value={form.owner} onChange={(e) => set('owner', e.target.value)} list="owners" />
                <datalist id="owners">
                  {['Editorial team', 'Design team', 'Publishing team', 'Marketing team'].map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              </Field>
              <Field label="Due date" hint="optional">
                <input type="date" value={toDateInput(form.dueAt)} onChange={(e) => set('dueAt', e.target.value ? new Date(`${e.target.value}T12:00:00`).getTime() : null)} />
              </Field>
            </div>
            <fieldset className="a-fieldset">
              <legend>Formats</legend>
              <div className="chips">
                {FORMATS.map((f) => (
                  <label key={f.id} className={`chip${form.formats.includes(f.id) ? ' is-on' : ''}`}>
                    <input type="checkbox" checked={form.formats.includes(f.id)} onChange={() => toggle('formats', f.id)} />
                    {f.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="a-fieldset">
              <legend>Services in this project</legend>
              {VOLUMES.map((v) => (
                <div key={v.slug} className="a-volgroup">
                  <p className="a-volgroup__name">
                    <span className="ink-dot" data-ink={v.ink} aria-hidden="true" /> {v.name}
                  </p>
                  <div className="chips">
                    {SERVICES.filter((s) => s.vol === v.slug).map((s) => (
                      <label key={s.id} className={`chip chip--small${form.services.includes(s.id) ? ' is-on' : ''}`}>
                        <input type="checkbox" checked={form.services.includes(s.id)} onChange={() => toggle('services', s.id)} />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>
            {!isNew && (
              <div className="a-form__danger">
                <ConfirmDelete label="Delete this project" note="The enquiry it came from is kept." onConfirm={remove} />
              </div>
            )}
          </div>
          <footer className="a-form__foot">
            <button type="button" className="btn btn--ghost btn--small" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--small" disabled={busy}>
              {isNew ? 'Add to the board' : 'Save changes'}
            </button>
          </footer>
        </form>
      )}
    </Dialog>
  );
}

