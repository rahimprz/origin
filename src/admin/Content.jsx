import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Eye, EyeOff, Plus, X } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAdmin, useCollections } from './AdminContext.jsx';
import { ConfirmDelete, Field, LoadState, PageHead, Toggle } from './ui.jsx';
import { BRAND, DEFAULT_CONTACT } from '../../shared/brand.js';

const TABS = [
  { id: 'offer', label: 'Popup offer' },
  { id: 'announcement', label: 'Announcement bar' },
  { id: 'contact', label: 'Contact details' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'portfolio', label: 'Portfolio covers' },
  { id: 'videos', label: 'Videos' },
];

const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export default function Content() {
  const { data, patch, toast, handleError, mode } = useAdmin();
  const state = useCollections('content');
  const [tab, setTab] = useState('offer');
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data.content && !draft) setDraft(structuredClone(data.content));
  }, [data.content, draft]);

  const dirty = useMemo(() => draft && data.content && JSON.stringify(draft) !== JSON.stringify(data.content), [draft, data.content]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = (section, value) => setDraft((d) => ({ ...d, [section]: value }));

  async function save() {
    setSaving(true);
    try {
      const saved = await api.saveContent(draft);
      patch('content', () => saved);
      setDraft(structuredClone(saved));
      toast(mode === 'demo' ? 'Saved. The website in this browser now shows your changes.' : 'Saved. The website shows your changes now.');
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHead title="Website content" sub={`Change what visitors see on ${BRAND.domain} without touching code.`} />
      <LoadState state={{ ...state, ready: state.ready && !!draft }}>
        {draft && (
          <>
            <div className="tabs" role="tablist" aria-label="Content sections">
              {TABS.map((t) => (
                <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} className={tab === t.id ? 'is-on' : ''} onClick={() => setTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="a-card tabpanel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              {tab === 'offer' && <OfferEditor value={draft.offer} onChange={(v) => set('offer', v)} />}
              {tab === 'announcement' && <AnnouncementEditor value={draft.announcement} onChange={(v) => set('announcement', v)} />}
              {tab === 'contact' && <ContactEditor value={draft.contact} onChange={(v) => set('contact', v)} />}
              {tab === 'testimonials' && <TestimonialsEditor value={draft.testimonials} onChange={(v) => set('testimonials', v)} />}
              {tab === 'portfolio' && <PortfolioEditor value={draft.portfolio} onChange={(v) => set('portfolio', v)} />}
              {tab === 'videos' && <VideosEditor value={draft.videos} onChange={(v) => set('videos', v)} />}
            </div>
            <div className={`savebar${dirty ? ' is-dirty' : ''}`} aria-live="polite">
              <p>{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
              <button type="button" className="btn btn--ghost btn--small" disabled={!dirty || saving} onClick={() => setDraft(structuredClone(data.content))}>
                Discard
              </button>
              <button type="button" className="btn btn--small btn--saffron" disabled={!dirty || saving} onClick={save}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </>
        )}
      </LoadState>
    </>
  );
}

/* ---------------------------------------------------------------- offer */
function OfferEditor({ value, onChange }) {
  const v = value;
  const set = (k, x) => onChange({ ...v, [k]: x });
  return (
    <div className="editor">
      <div className="editor__form">
        <Toggle checked={v.enabled} onChange={(x) => set('enabled', x)} label="Show the offer on the website" hint="A bookmark that slides in from the right. It never blocks the page." />
        <Field label="Headline">
          <input value={v.title} onChange={(e) => set('title', e.target.value)} maxLength={80} />
        </Field>
        <Field label="Message">
          <textarea rows={3} value={v.body} onChange={(e) => set('body', e.target.value)} maxLength={260} />
        </Field>
        <Field label="Button label" hint="opens the book planner">
          <input value={v.cta} onChange={(e) => set('cta', e.target.value)} maxLength={32} />
        </Field>
        <fieldset className="a-fieldset">
          <legend>When it appears</legend>
          <div className="radios">
            {[
              { id: 'scroll', label: 'After scrolling part of the page' },
              { id: 'time', label: 'After a delay' },
              { id: 'exit', label: 'When the visitor moves to leave', hint: 'Phones fall back to the delay.' },
            ].map((o) => (
              <label key={o.id} className={`radio${v.trigger === o.id ? ' is-on' : ''}`}>
                <input type="radio" name="trigger" checked={v.trigger === o.id} onChange={() => set('trigger', o.id)} />
                <span>
                  {o.label}
                  {o.hint && <em>{o.hint}</em>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="a-grid-3">
          <Field label="Scroll depth" hint="%">
            <input type="number" min={10} max={90} value={v.scrollPercent} onChange={(e) => set('scrollPercent', Number(e.target.value))} disabled={v.trigger !== 'scroll'} />
          </Field>
          <Field label="Delay" hint="seconds">
            <input type="number" min={3} max={300} value={v.delaySeconds} onChange={(e) => set('delaySeconds', Number(e.target.value))} disabled={v.trigger === 'scroll'} />
          </Field>
          <Field label="After dismissal, wait" hint="days">
            <input type="number" min={0} max={90} value={v.snoozeDays} onChange={(e) => set('snoozeDays', Number(e.target.value))} />
          </Field>
        </div>
      </div>
      <div className="editor__preview" aria-label="Preview">
        <p className="label">Preview</p>
        <div className={`offer offer--preview${v.enabled ? '' : ' is-off'}`} data-ink="marketing">
          <span className="nib offer__nib" aria-hidden="true" />
          <h2>{v.title || 'Headline'}</h2>
          <p>{v.body}</p>
          <span className="btn btn--field">
            {v.cta || 'Start my book'} <ArrowRight className="arrow" aria-hidden="true" />
          </span>
          <span className="offer__later">Not now</span>
        </div>
        {!v.enabled && <p className="a-muted">Hidden on the website.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- announcement */
function AnnouncementEditor({ value, onChange }) {
  const v = value;
  const set = (k, x) => onChange({ ...v, [k]: x });
  return (
    <div className="editor editor--stack">
      <div className="editor__form">
        <Toggle checked={v.enabled} onChange={(x) => set('enabled', x)} label="Show the announcement bar" hint="The terracotta strip above the main navigation." />
        <Field label="Message">
          <input value={v.text} onChange={(e) => set('text', e.target.value)} maxLength={120} />
        </Field>
        <Field label="Link label" hint="opens the book planner; leave empty for no link">
          <input value={v.linkLabel} onChange={(e) => set('linkLabel', e.target.value)} maxLength={30} />
        </Field>
      </div>
      <div className="editor__preview">
        <p className="label">Preview</p>
        <div className={`announce announce--preview${v.enabled ? '' : ' is-off'}`} data-ink="marketing">
          <p>
            {v.text || 'Message'}
            {v.linkLabel && (
              <span className="announce__link">
                {v.linkLabel} <ArrowRight aria-hidden="true" />
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- contact */
function ContactEditor({ value, onChange }) {
  const v = { email: '', offices: [], ...(value || {}) };
  const offices = v.offices || [];
  const setOffice = (i, k, x) => onChange({ ...v, offices: offices.map((o, n) => (n === i ? { ...o, [k]: x } : o)) });
  return (
    <div className="items">
      <p className="a-sub">Shown in the header, footer, contact page, book planner and the “Talk to us” button. Leave phone numbers out until they are answered by the team.</p>
      <Field label="Email address" hint="where authors can write to you">
        <input type="email" value={v.email} onChange={(e) => onChange({ ...v, email: e.target.value })} placeholder={DEFAULT_CONTACT.email} />
      </Field>
      {offices.map((o, i) => (
        <div key={o.id} className="item">
          <div className="item__main">
            <Field label={`Office or line ${i + 1}: name`} hint="for example United Kingdom">
              <input value={o.region} onChange={(e) => setOffice(i, 'region', e.target.value)} maxLength={60} />
            </Field>
            <Field label="Phone" hint="the first number also shows in the header">
              <input type="tel" value={o.phone} onChange={(e) => setOffice(i, 'phone', e.target.value)} maxLength={40} />
            </Field>
            <Field label="Address" hint="one line per row; optional">
              <textarea rows={3} value={o.address} onChange={(e) => setOffice(i, 'address', e.target.value)} />
            </Field>
          </div>
          <div className="item__tools">
            <button type="button" className="a-iconbtn" disabled={i === 0} onClick={() => onChange({ ...v, offices: move(offices, i, -1) })} title="Move up">
              <ArrowUp aria-hidden="true" />
              <span className="sr-only">Move up</span>
            </button>
            <button type="button" className="a-iconbtn" disabled={i === offices.length - 1} onClick={() => onChange({ ...v, offices: move(offices, i, 1) })} title="Move down">
              <ArrowDown aria-hidden="true" />
              <span className="sr-only">Move down</span>
            </button>
            <ConfirmDelete label="Remove this office" confirmLabel="Remove" onConfirm={async () => onChange({ ...v, offices: offices.filter((_, n) => n !== i) })} />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--ghost btn--small" onClick={() => onChange({ ...v, offices: [...offices, { id: uid('o'), region: '', phone: '', address: '' }] })}>
        <Plus aria-hidden="true" /> Add an office or phone line
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- lists */
function move(list, i, d) {
  const next = [...list];
  const j = i + d;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function ListItemTools({ list, i, onChange, item, kind }) {
  return (
    <div className="item__tools">
      <button type="button" className="a-iconbtn" onClick={() => onChange(list.map((x, n) => (n === i ? { ...x, visible: x.visible === false } : x)))} title={item.visible === false ? 'Show on the website' : 'Hide from the website'}>
        {item.visible === false ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        <span className="sr-only">{item.visible === false ? 'Show' : 'Hide'}</span>
      </button>
      <button type="button" className="a-iconbtn" disabled={i === 0} onClick={() => onChange(move(list, i, -1))} title="Move up">
        <ArrowUp aria-hidden="true" />
        <span className="sr-only">Move up</span>
      </button>
      <button type="button" className="a-iconbtn" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, 1))} title="Move down">
        <ArrowDown aria-hidden="true" />
        <span className="sr-only">Move down</span>
      </button>
      <ConfirmDelete label={`Remove ${kind}`} confirmLabel="Remove" onConfirm={async () => onChange(list.filter((_, n) => n !== i))} />
    </div>
  );
}

function TestimonialsEditor({ value, onChange }) {
  return (
    <div className="items">
      <p className="a-sub">Use real words from real authors only. They appear in this order on the home page.</p>
      {value.map((t, i) => (
        <div key={t.id} className={`item${t.visible === false ? ' is-hidden' : ''}`}>
          <div className="item__main">
            <Field label={`Testimonial ${i + 1}`}>
              <textarea rows={4} value={t.quote} onChange={(e) => onChange(value.map((x, n) => (n === i ? { ...x, quote: e.target.value } : x)))} />
            </Field>
            <Field label="Attributed to">
              <input value={t.by} onChange={(e) => onChange(value.map((x, n) => (n === i ? { ...x, by: e.target.value } : x)))} />
            </Field>
          </div>
          <ListItemTools list={value} i={i} item={t} onChange={onChange} kind="testimonial" />
        </div>
      ))}
      <button type="button" className="btn btn--ghost btn--small" onClick={() => onChange([...value, { id: uid('t'), quote: '', by: `${BRAND.name} author`, visible: true }])}>
        <Plus aria-hidden="true" /> Add a testimonial
      </button>
    </div>
  );
}

function PortfolioEditor({ value, onChange }) {
  const set = (i, k, x) => onChange(value.map((b, n) => (n === i ? { ...b, [k]: x } : b)));
  return (
    <div className="items">
      <p className="a-sub">Covers on the shelf and in the cover viewer. Images should be 2:3 portrait, at least 800 px wide.</p>
      {value.map((b, i) => (
        <div key={b.id} className={`item item--cover${b.visible === false ? ' is-hidden' : ''}`}>
          <img className="item__thumb" src={b.image} alt="" width="80" height="120" />
          <div className="item__main a-grid-2">
            <Field label="Title">
              <input value={b.title} onChange={(e) => set(i, 'title', e.target.value)} />
            </Field>
            <Field label="Author">
              <input value={b.author} onChange={(e) => set(i, 'author', e.target.value)} />
            </Field>
            <Field label="Cover image URL">
              <input value={b.image} onChange={(e) => set(i, 'image', e.target.value)} />
            </Field>
            <Field label="Label under the book">
              <input value={b.note} onChange={(e) => set(i, 'note', e.target.value)} />
            </Field>
          </div>
          <ListItemTools list={value} i={i} item={b} onChange={onChange} kind="cover" />
        </div>
      ))}
      <button type="button" className="btn btn--ghost btn--small" onClick={() => onChange([...value, { id: uid('p'), title: '', author: '', image: '', note: 'Cover concept', visible: true }])}>
        <Plus aria-hidden="true" /> Add a cover
      </button>
    </div>
  );
}

function VideosEditor({ value, onChange }) {
  const v = value;
  const setSlot = (slot, k, x) => onChange({ ...v, [slot]: { ...v[slot], [k]: x } });
  const setChapter = (i, k, x) => onChange({ ...v, showreel: v.showreel.map((c, n) => (n === i ? { ...c, [k]: x } : c)) });
  return (
    <div className="items">
      <p className="a-sub">Use MP4 (H.264) files. Keep background clips under 10 seconds and about 1 MB; they play muted and on a loop.</p>
      {[
        { slot: 'hero', label: 'Home page band (behind the formats line)' },
        { slot: 'readers', label: 'Process: the readers stage' },
      ].map(({ slot, label }) => (
        <div key={slot} className="item item--video">
          <video className="item__video" src={v[slot]?.src} poster={v[slot]?.poster} muted loop playsInline preload="none" onMouseEnter={(e) => e.currentTarget.play().catch(() => {})} onMouseLeave={(e) => e.currentTarget.pause()} />
          <div className="item__main a-grid-2">
            <p className="a-h3 span-2">{label}</p>
            <Field label="Video URL">
              <input value={v[slot]?.src || ''} onChange={(e) => setSlot(slot, 'src', e.target.value)} />
            </Field>
            <Field label="Poster image URL">
              <input value={v[slot]?.poster || ''} onChange={(e) => setSlot(slot, 'poster', e.target.value)} />
            </Field>
          </div>
        </div>
      ))}
      <h3 className="a-h3">“How a book is made” reel</h3>
      {v.showreel.map((c, i) => (
        <div key={c.id} className="item item--video">
          <video className="item__video" src={c.src} poster={c.poster} muted loop playsInline preload="none" onMouseEnter={(e) => e.currentTarget.play().catch(() => {})} onMouseLeave={(e) => e.currentTarget.pause()} />
          <div className="item__main a-grid-3">
            <Field label={`Chapter ${i + 1}`}>
              <input value={c.chapter} onChange={(e) => setChapter(i, 'chapter', e.target.value)} />
            </Field>
            <Field label="Video URL">
              <input value={c.src} onChange={(e) => setChapter(i, 'src', e.target.value)} />
            </Field>
            <Field label="Poster image URL">
              <input value={c.poster} onChange={(e) => setChapter(i, 'poster', e.target.value)} />
            </Field>
          </div>
          <div className="item__tools">
            <button type="button" className="a-iconbtn" disabled={i === 0} onClick={() => onChange({ ...v, showreel: move(v.showreel, i, -1) })} title="Move up">
              <ArrowUp aria-hidden="true" />
              <span className="sr-only">Move up</span>
            </button>
            <button type="button" className="a-iconbtn" disabled={i === v.showreel.length - 1} onClick={() => onChange({ ...v, showreel: move(v.showreel, i, 1) })} title="Move down">
              <ArrowDown aria-hidden="true" />
              <span className="sr-only">Move down</span>
            </button>
            <button type="button" className="a-iconbtn" onClick={() => onChange({ ...v, showreel: v.showreel.filter((_, n) => n !== i) })} title="Remove chapter" disabled={v.showreel.length <= 1}>
              <X aria-hidden="true" />
              <span className="sr-only">Remove chapter</span>
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--ghost btn--small" onClick={() => onChange({ ...v, showreel: [...v.showreel, { id: uid('v'), chapter: 'New chapter', src: '', poster: '' }] })}>
        <Plus aria-hidden="true" /> Add a chapter
      </button>
    </div>
  );
}
