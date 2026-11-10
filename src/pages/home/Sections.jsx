import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleDashed, Loader2, Minus, Play, Plus } from 'lucide-react';
import Book3D from '../../components/Book3D.jsx';
import FieldVideo from '../../components/site/FieldVideo.jsx';
import { useSite } from '../../site/SiteContext.jsx';
import { api } from '../../lib/api.js';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import { FAQ, REASONS } from '../../../shared/catalog.js';
import { contactOf, telHref } from '../../../shared/brand.js';

const INKS = ['publishing', 'writing', 'design', 'editorial', 'house'];

/* ------------------------------------------------------------ portfolio */
export function Portfolio() {
  const { content, openCover } = useSite();
  const root = useRef(null);
  const books = (content.portfolio || []).filter((b) => b.visible !== false && b.image);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // books come off the shelf: spine-out to face-out, on the scroll's clock
      gsap.fromTo(
        '.shelf .book3d',
        { '--ry': '88deg', '--rx': '0deg' },
        {
          '--ry': '22deg',
          '--rx': '5deg',
          stagger: 0.12,
          ease: 'none',
          scrollTrigger: { trigger: '.shelf', start: 'top 85%', end: 'center 50%', scrub: 0.8 },
        },
      );
      gsap.from('.shelf__label', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.7, scrollTrigger: { trigger: '.shelf', start: 'top 60%' } });
    },
    { scope: root, dependencies: [books.length] },
  );

  if (!books.length) return null;
  return (
    <section id="portfolio" className="portfolio" ref={root} data-ink="paper-2" data-spine="04|Recent covers|house" aria-labelledby="portfolio-title">
      <div className="portfolio__head">
        <h2 id="portfolio-title">Covers made for the readers they need to reach</h2>
        <p>Recent cover and edition work from our design studio. Select a book to turn it in your hands.</p>
      </div>
      <ul className="shelf">
        {books.map((b, i) => (
          <li key={b.id}>
            <button type="button" className="shelf__book" onClick={() => openCover(i)} aria-label={`Open ${b.title} by ${b.author}`}>
              <Book3D image={b.image} title={b.title} author={b.author} ink={INKS[i % INKS.length]} depth={34} fluid />
            </button>
            <div className="shelf__label">
              <p className="shelf__title">{b.title}</p>
              <p className="shelf__author">{b.author}</p>
              <p className="shelf__note">{b.note}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="shelf__formats">
        <span>
          <strong>eBook</strong> Digital edition
        </span>
        <span>
          <strong>Print</strong> Paperback and hardcover
        </span>
      </p>
    </section>
  );
}

/* ------------------------------------------------------------ distribution */
const DOCKET = [
  { dept: 'Editing', state: 'Final proof approved', done: true },
  { dept: 'Cover and pages', state: 'Print and eBook files ready', done: true },
  { dept: 'Publishing setup', state: 'Editions being listed', done: false },
  { dept: 'Distribution', state: 'Retailers and libraries', done: false },
];

export function Distribution() {
  const root = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // each department's line prints in turn, left to right
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.docket', start: 'top 70%' } });
      tl.from('.docket', { y: 40, autoAlpha: 0, duration: 0.9 }).fromTo(
        '.docket__state',
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', stagger: 0.2, duration: 0.5, ease: 'power2.out' },
        '-=0.35',
      );
      gsap.from('.dist__list li', { x: -24, autoAlpha: 0, stagger: 0.08, duration: 0.7, scrollTrigger: { trigger: '.dist__list', start: 'top 80%' } });
    },
    { scope: root },
  );
  return (
    <section id="publishing" className="dist" ref={root} data-ink="publishing" data-spine="05|More than one shelf|publishing" aria-labelledby="dist-title">
      <div className="dist__copy">
        <h2 id="dist-title">Published for more than one shelf</h2>
        <p>Amazon is where many readers shop, but not all of them. We set up your eBook, paperback and hardcover on Amazon KDP, then make the same editions available to bookstores, libraries and retailers around the world.</p>
        <ul className="dist__list">
          {['Amazon KDP setup for every edition', 'ISBNs, barcodes and metadata', 'IngramSpark wide distribution', 'Bookstore and library ordering'].map((t) => (
            <li key={t}>
              <Check aria-hidden="true" /> {t}
            </li>
          ))}
        </ul>
        <Link to="/services/publishing" className="link-arrow">
          Explore publishing services <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <article className="docket" data-ink="paper" aria-label="Example production docket">
        <header className="docket__head">
          <span className="docket__book" data-ink="house" aria-hidden="true">
            <span className="nib" />
          </span>
          <div>
            <p className="docket__title">Your book</p>
            <p className="docket__sub">An example production record. Every stage, one team.</p>
          </div>
        </header>
        <ol className="docket__rows">
          {DOCKET.map((r) => (
            <li key={r.dept}>
              <span className="docket__dept">{r.dept}</span>
              <span className={`docket__state${r.done ? ' is-done' : ''}`}>
                {r.done ? <Check aria-hidden="true" /> : <CircleDashed aria-hidden="true" />}
                {r.state}
              </span>
            </li>
          ))}
        </ol>
        <footer className="docket__band" data-ink="house">
          <span>eBook</span>
          <span>Paperback</span>
          <span>Hardcover</span>
        </footer>
      </article>
    </section>
  );
}

/* ------------------------------------------------------------ about */
export function About() {
  const root = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.reason', { y: 28, autoAlpha: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: '.reasons', start: 'top 78%' } });
      gsap.fromTo('.about__film', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, scrollTrigger: { trigger: '.about__film', start: 'top 80%' } });
    },
    { scope: root },
  );
  return (
    <section id="about" className="about" ref={root} data-ink="paper" data-spine="06|Why Origin|house" aria-labelledby="about-title">
      <div className="about__head">
        <h2 id="about-title">Why authors begin with Origin</h2>
        <p>Good books grow from a clear starting point. We find yours, then make every decision about the book with its readers in mind.</p>
        <figure className="about__film overprint" data-ink="house">
          <FieldVideo src="/media/stack.mp4" poster="/media/stack.webp" />
        </figure>
      </div>
      <dl className="reasons">
        {REASONS.map((r) => (
          <div key={r.title} className="reason">
            <dt>{r.title}</dt>
            <dd>{r.line}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------ testimonials */
export function Voices() {
  const { content } = useSite();
  const list = content.testimonials || [];
  const [i, setI] = useState(0);
  const quoteRef = useRef(null);
  const n = list.length;

  useEffect(() => {
    if (i >= n) setI(0);
  }, [n, i]);

  const go = (next) => {
    const el = quoteRef.current;
    const target = (next + n) % n;
    if (!el || prefersReducedMotion()) return setI(target);
    gsap.to(el, {
      autoAlpha: 0,
      y: -12,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setI(target);
        gsap.fromTo(el, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 });
      },
    });
  };

  if (!n) return null;
  const t = list[Math.min(i, n - 1)];
  return (
    <section className="voices" data-ink="editorial" data-spine="07|In their words|editorial" aria-labelledby="voices-title" aria-roledescription="carousel">
      <h2 id="voices-title" className="voices__title">
        What our authors say
      </h2>
      <figure className="voices__quote" ref={quoteRef} aria-live="polite">
        <blockquote>
          <p>{t.quote}</p>
        </blockquote>
        <figcaption>{t.by}</figcaption>
      </figure>
      {n > 1 && (
        <div className="voices__nav">
          <button type="button" className="voices__btn" onClick={() => go(i - 1)} aria-label="Previous review">
            <ArrowLeft aria-hidden="true" />
          </button>
          <p className="voices__count" aria-hidden="true">
            {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </p>
          <button type="button" className="voices__btn" onClick={() => go(i + 1)} aria-label="Next review">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------ reel band */
export function ReelBand() {
  const { content, openVideo } = useSite();
  const chapters = content.videos?.showreel || [];
  const root = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo('.reelband video', { yPercent: -10, scale: 1.12 }, { yPercent: 10, scale: 1.12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
    },
    { scope: root },
  );
  return (
    <section className="reelband overprint" ref={root} data-ink="house" data-spine="08|How a book is made|house" aria-labelledby="reel-band-title">
      <FieldVideo src="/media/pages.mp4" poster="/media/pages.webp" />
      <div className="reelband__inner">
        <h2 id="reel-band-title">Watch a manuscript become a book</h2>
        <button type="button" className="reelband__play" onClick={() => openVideo(0)}>
          <span className="reelband__disc">
            <Play aria-hidden="true" />
          </span>
          Watch how a book is made
        </button>
        <ol className="reelband__chapters">
          {chapters.map((c, n) => (
            <li key={c.id}>
              <button type="button" onClick={() => openVideo(n)}>
                {String(n + 1).padStart(2, '0')} {c.chapter}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ faq */
function FaqItem({ q, a, open, onToggle, id }) {
  const bodyRef = useRef(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.height = open ? 'auto' : '0px';
      return;
    }
    gsap.to(el, { height: open ? 'auto' : 0, duration: open ? 0.6 : 0.35, ease: open ? 'page' : 'power2.inOut' });
  }, [open]);
  return (
    <div className={`faq__item${open ? ' is-open' : ''}`}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={`${id}-a`} id={`${id}-q`} onClick={onToggle}>
          <span>{q}</span>
          {open ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
        </button>
      </h3>
      <div className="faq__a" id={`${id}-a`} role="region" aria-labelledby={`${id}-q`} ref={bodyRef} style={{ height: 0 }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export function Faq({ items = FAQ, spine = '09|Common questions|house' }) {
  const { openPlanner } = useSite();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="faq" data-ink="paper-2" data-spine={spine} aria-labelledby="faq-title">
      <div className="faq__head">
        <h2 id="faq-title">Questions worth asking before you publish</h2>
        <p>Straight answers about where to start, what your book needs and how it reaches readers.</p>
        <button type="button" className="btn" onClick={() => openPlanner()}>
          Ask about your book
        </button>
      </div>
      <div className="faq__list">
        {items.map((f, i) => (
          <FaqItem key={f.q} id={`faq-${i}`} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ enquiry form */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function EnquiryForm({ source = 'contact', compact = false }) {
  const [data, setData] = useState({ name: '', email: '', message: '', website: '', company: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');
  const doneRef = useRef(null);

  useEffect(() => {
    if (status === 'done' && doneRef.current && !prefersReducedMotion()) {
      gsap.fromTo(doneRef.current, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.out' });
    }
  }, [status]);

  const set = (k, v) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!data.name.trim()) errs.name = 'Please tell us your name.';
    if (!EMAIL_RE.test(data.email.trim())) errs.email = 'Enter an email address like name@example.com.';
    if (!data.message.trim()) errs.message = 'A sentence or two about your book helps us reply properly.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus('sending');
    setServerError('');
    try {
      await api.submitLead({ ...data, source });
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      if (err.field) setErrors({ [err.field]: err.message });
      else setServerError(err.message);
    }
  }

  if (status === 'done') {
    return (
      <div className="enquiry__done" role="status">
        <p className="enquiry__imprint" ref={doneRef}>
          <Check aria-hidden="true" /> Received {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p>
          Thank you, {data.name.split(' ')[0]}. Your enquiry is with our publishing team and we will reply to <strong>{data.email}</strong> with the next step.
        </p>
        <button type="button" className="link-arrow" onClick={() => { setData({ name: '', email: '', message: '', website: '', company: '' }); setStatus('idle'); }}>
          Send another enquiry <ArrowRight aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form className={`enquiry${compact ? ' enquiry--compact' : ''}`} onSubmit={submit} noValidate>
      <div className="field-row">
        <label className={`field${errors.name ? ' has-error' : ''}`}>
          <span>Your name</span>
          <input value={data.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
          {errors.name && <span className="field__error">{errors.name}</span>}
        </label>
        <label className={`field${errors.email ? ' has-error' : ''}`}>
          <span>Email address</span>
          <input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" inputMode="email" aria-invalid={!!errors.email} />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </label>
      </div>
      <label className={`field${errors.message ? ' has-error' : ''}`}>
        <span>Tell us about your book</span>
        <textarea rows={compact ? 4 : 5} value={data.message} onChange={(e) => set('message', e.target.value)} aria-invalid={!!errors.message} />
        {errors.message && <span className="field__error">{errors.message}</span>}
      </label>
      <label className="field">
        <span>Website <em>optional</em></span>
        <input type="url" value={data.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" autoComplete="url" />
      </label>
      <label className="hp" aria-hidden="true">
        Company
        <input tabIndex={-1} autoComplete="off" value={data.company} onChange={(e) => set('company', e.target.value)} />
      </label>
      {serverError && (
        <p className="form-error" role="alert">
          {serverError}
        </p>
      )}
      <button type="submit" className="btn btn--saffron" disabled={status === 'sending'}>
        {status === 'sending' ? (
          <>
            <Loader2 className="spin" aria-hidden="true" /> Sending
          </>
        ) : (
          <>
            Send your enquiry <ArrowRight className="arrow" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}

export function Offices() {
  const { content } = useSite();
  const { email, offices } = contactOf(content);
  return (
    <div className="offices">
      {offices.map((o) => {
        const address = String(o.address || '').split('\n').filter(Boolean).join(', ');
        return (
          <address key={o.id || o.region || o.phone} className="office">
            {o.phone && (
              <a href={telHref(o.phone)} className="office__phone">
                {o.phone}
              </a>
            )}
            {(o.region || address) && (
              <span>
                {o.region && <strong>{o.region}.</strong>} {address}
              </span>
            )}
          </address>
        );
      })}
      <a className="office__mail" href={`mailto:${email}`}>
        {email}
      </a>
    </div>
  );
}

export function StartCta() {
  return (
    <section id="start" className="start" data-ink="house" data-spine="10|Begin here|house" aria-labelledby="start-title">
      <div className="start__copy">
        <h2 id="start-title">Tell us where your book is today</h2>
        <p>An idea, a draft or a finished manuscript. Share as much as you have and we will reply with the next step.</p>
        <Offices />
      </div>
      <EnquiryForm source="contact" />
    </section>
  );
}
