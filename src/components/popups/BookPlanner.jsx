import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import Dialog from '../Dialog.jsx';
import LiveryCover from '../LiveryCover.jsx';
import { useSite } from '../../site/SiteContext.jsx';
import { api } from '../../lib/api.js';
import { gsap, prefersReducedMotion } from '../../lib/motion.js';
import { BOOK_STATES, FORMATS, SERVICES, VOLUMES, serviceById, volumeBySlug } from '../../../shared/catalog.js';
import { BRAND, contactOf, telHref } from '../../../shared/brand.js';

const STEPS = ['Your book', 'What you need', 'Formats', 'Your details'];
const GENRES = ['Literary fiction', 'Thriller or crime', 'Romance', 'Fantasy or sci-fi', 'Memoir', 'Biography', 'Business', 'Self-help', 'Children’s', 'Poetry', 'History'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const blank = () => ({ bookState: '', title: '', genre: '', services: [], formats: [], message: '', name: '', email: '', phone: '', company: '' });

export default function BookPlanner() {
  const { content, planner, closePlanner } = useSite();
  const phones = contactOf(content).offices.filter((o) => o.phone);
  const [step, setStep] = useState(0);
  const [data, setData] = useState(blank);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [serverError, setServerError] = useState('');
  const bodyRef = useRef(null);
  const source = planner.prefill?.source || 'planner';

  // reset or prefill every time the planner opens
  useEffect(() => {
    if (!planner.open) return;
    const pf = planner.prefill || {};
    setData((d) => {
      const base = status === 'done' ? blank() : d;
      return {
        ...base,
        bookState: pf.bookState || base.bookState,
        services: pf.services ? Array.from(new Set([...base.services, ...pf.services])) : base.services,
      };
    });
    if (status === 'done') setStatus('idle');
    setStep(pf.bookState ? 1 : 0);
    setErrors({});
    setServerError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planner.open]);

  useLayoutEffect(() => {
    if (!bodyRef.current || prefersReducedMotion()) return;
    gsap.fromTo(bodyRef.current.children, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.04, duration: 0.5 });
  }, [step, status]);

  const set = (key, value) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const toggle = (key, value) => set(key, data[key].includes(value) ? data[key].filter((v) => v !== value) : [...data[key], value]);

  const leadVolume = useMemo(() => {
    const first = data.services.map((id) => serviceById[id]).find(Boolean);
    return first ? volumeBySlug[first.vol] : null;
  }, [data.services]);

  function validate(s) {
    const e = {};
    if (s === 0 && !data.bookState) e.bookState = 'Choose the option closest to where your book is today.';
    if (s === 3) {
      if (!data.name.trim()) e.name = 'Please tell us your name.';
      if (!EMAIL_RE.test(data.email.trim())) e.email = 'Enter an email address like name@example.com.';
    }
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function next(e) {
    e?.preventDefault();
    if (!validate(step)) return;
    if (step < STEPS.length - 1) return setStep(step + 1);
    setStatus('sending');
    setServerError('');
    try {
      await api.submitLead({ ...data, source });
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      if (err.field) setErrors({ [err.field]: err.message });
      else setServerError(err.message || 'We could not send your enquiry. Please try again.');
    }
  }

  const stateName = BOOK_STATES.find((s) => s.id === data.bookState)?.name;
  const formatNames = data.formats.map((f) => FORMATS.find((x) => x.id === f)?.name).filter(Boolean);

  return (
    <Dialog open={planner.open} onClose={closePlanner} labelledBy="planner-title" className="planner" closeLabel="Close the book planner">
      <div className="planner__grid">
        <form className="planner__form" onSubmit={next} noValidate>
          <header className="planner__head">
            <h2 id="planner-title">{status === 'done' ? 'Your book is with us' : 'Start your book'}</h2>
            {status !== 'done' && (
              <div className="planner__progress">
                <p className="label">
                  Step {step + 1} of {STEPS.length}: {STEPS[step]}
                </p>
                <ol className="planner__bars" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <li key={s} className={i <= step ? 'is-done' : ''} />
                  ))}
                </ol>
              </div>
            )}
          </header>

          <div className="planner__body" ref={bodyRef}>
            {status === 'done' ? (
              <div className="planner__done" role="status">
                <p className="planner__printed">
                  <Check aria-hidden="true" /> Enquiry received {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="planner__lede">
                  Thank you, {data.name.split(' ')[0] || 'author'}. A publishing consultant will read your notes and reply to <strong>{data.email}</strong>.
                </p>
                {phones.length > 0 && (
                  <p>
                    If your book has a deadline, call us:{' '}
                    {phones.map((o, i) => (
                      <span key={o.id || o.phone}>
                        {i > 0 && ' or '}
                        {o.region && `${o.region} `}
                        <a href={telHref(o.phone)}>{o.phone}</a>
                      </span>
                    ))}
                    .
                  </p>
                )}
              </div>
            ) : step === 0 ? (
              <>
                <fieldset className="field" aria-describedby={errors.bookState ? 'err-bookState' : undefined}>
                  <legend>Where is your book today?</legend>
                  <div className="choice-grid">
                    {BOOK_STATES.map((s, i) => (
                      <label key={s.id} className={`choice${data.bookState === s.id ? ' is-on' : ''}`}>
                        <input type="radio" name="bookState" value={s.id} checked={data.bookState === s.id} onChange={() => set('bookState', s.id)} />
                        <span className="choice__no">{String(i + 1).padStart(2, '0')}</span>
                        <span className="choice__name">{s.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.bookState && <p className="field__error" id="err-bookState">{errors.bookState}</p>}
                </fieldset>
                <div className="field-row">
                  <label className="field">
                    <span>Working title <em>optional</em></span>
                    <input value={data.title} onChange={(e) => set('title', e.target.value)} placeholder="The title you use for now" maxLength={120} />
                  </label>
                  <label className="field">
                    <span>Genre <em>optional</em></span>
                    <input value={data.genre} onChange={(e) => set('genre', e.target.value)} list="planner-genres" placeholder="For example, memoir" maxLength={60} />
                    <datalist id="planner-genres">
                      {GENRES.map((g) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
                  </label>
                </div>
              </>
            ) : step === 1 ? (
              <fieldset className="field">
                <legend>What would you like help with?</legend>
                <p className="field__hint">Pick as many as apply. Not sure? Leave this empty and we will suggest a plan.</p>
                <div className="planner__volumes">
                  {VOLUMES.map((v) => (
                    <div key={v.slug} className="planner__volume">
                      <p className="planner__volname">
                        <span className="ink-dot" data-ink={v.ink} />
                        {v.name}
                      </p>
                      <div className="chips">
                        {SERVICES.filter((s) => s.vol === v.slug).map((s) => (
                          <label key={s.id} className={`chip${data.services.includes(s.id) ? ' is-on' : ''}`}>
                            <input type="checkbox" checked={data.services.includes(s.id)} onChange={() => toggle('services', s.id)} />
                            {data.services.includes(s.id) && <Check aria-hidden="true" />}
                            {s.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            ) : step === 2 ? (
              <>
                <fieldset className="field">
                  <legend>Which formats are you thinking about?</legend>
                  <div className="choice-grid choice-grid--4">
                    {FORMATS.map((f) => (
                      <label key={f.id} className={`choice choice--check${data.formats.includes(f.id) ? ' is-on' : ''}`}>
                        <input type="checkbox" checked={data.formats.includes(f.id)} onChange={() => toggle('formats', f.id)} />
                        <span className="choice__name">{f.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="field__hint">Choose none if you would like our advice.</p>
                </fieldset>
                <label className="field">
                  <span>Anything else we should know? <em>optional</em></span>
                  <textarea rows={4} value={data.message} onChange={(e) => set('message', e.target.value)} placeholder="Word count, deadlines, what worries you about publishing…" maxLength={4000} />
                </label>
              </>
            ) : (
              <>
                <div className="field-row">
                  <label className={`field${errors.name ? ' has-error' : ''}`}>
                    <span>Your name</span>
                    <input value={data.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'err-name' : undefined} />
                    {errors.name && <span className="field__error" id="err-name">{errors.name}</span>}
                  </label>
                  <label className={`field${errors.email ? ' has-error' : ''}`}>
                    <span>Email address</span>
                    <input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" inputMode="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'err-email' : undefined} />
                    {errors.email && <span className="field__error" id="err-email">{errors.email}</span>}
                  </label>
                </div>
                <label className="field">
                  <span>Phone <em>optional, if you prefer a call</em></span>
                  <input type="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
                </label>
                <label className="hp" aria-hidden="true">
                  Company
                  <input tabIndex={-1} autoComplete="off" value={data.company} onChange={(e) => set('company', e.target.value)} />
                </label>
                <p className="field__hint">We use these details only to reply about your book.</p>
              </>
            )}
            {serverError && (
              <p className="form-error" role="alert">
                {serverError}
              </p>
            )}
          </div>

          <footer className="planner__foot">
            {status === 'done' ? (
              <button type="button" className="btn" onClick={closePlanner}>
                Keep exploring
              </button>
            ) : (
              <>
                {step > 0 ? (
                  <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)}>
                    <ArrowLeft aria-hidden="true" /> Back
                  </button>
                ) : (
                  <span />
                )}
                <button type="submit" className="btn btn--saffron" disabled={status === 'sending'}>
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="spin" aria-hidden="true" /> Sending
                    </>
                  ) : step === STEPS.length - 1 ? (
                    <>
                      Send my enquiry <ArrowRight className="arrow" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="arrow" aria-hidden="true" />
                    </>
                  )}
                </button>
              </>
            )}
          </footer>
        </form>

        <aside className="planner__preview" data-ink={leadVolume ? leadVolume.ink : 'house'} aria-label="Summary of your plan">
          <LiveryCover title={data.title} author={data.name} ink={leadVolume ? leadVolume.ink : 'house'} volumeName={leadVolume ? leadVolume.name : BRAND.name} stamped={status === 'done'} />
          <dl className="planner__summary">
            <div>
              <dt>Stage</dt>
              <dd>{stateName || 'Not chosen yet'}</dd>
            </div>
            <div>
              <dt>Services</dt>
              <dd>{data.services.length ? `${data.services.length} selected` : 'We will suggest'}</dd>
            </div>
            <div>
              <dt>Formats</dt>
              <dd>{formatNames.length ? formatNames.join(', ') : 'Open'}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </Dialog>
  );
}
