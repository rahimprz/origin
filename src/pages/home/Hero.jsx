import { useRef, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import Book3D from '../../components/Book3D.jsx';
import FieldVideo from '../../components/site/FieldVideo.jsx';
import { useSite } from '../../site/SiteContext.jsx';
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import { BOOK_STATES } from '../../../shared/catalog.js';
import { BRAND } from '../../../shared/brand.js';

function BookStarter() {
  const { openPlanner, openVideo } = useSite();
  const [state, setState] = useState('');
  return (
    <form
      className="starter"
      onSubmit={(e) => {
        e.preventDefault();
        openPlanner({ bookState: state || undefined, source: 'starter' });
      }}
    >
      <fieldset>
        <legend className="starter__q">Where is your book today?</legend>
        <div className="starter__opts">
          {BOOK_STATES.map((s) => (
            <label key={s.id} className={`starter__opt${state === s.id ? ' is-on' : ''}`}>
              <input type="radio" name="hero-book-state" value={s.id} checked={state === s.id} onChange={() => setState(s.id)} />
              <span>{s.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="starter__actions">
        <button type="submit" className="btn btn--saffron">
          Start my book <ArrowRight className="arrow" aria-hidden="true" />
        </button>
        <button type="button" className="starter__watch" onClick={() => openVideo(0)}>
          <span className="starter__play">
            <Play aria-hidden="true" />
          </span>
          Watch how a book is made
        </button>
      </div>
    </form>
  );
}

export default function Hero() {
  const { content } = useSite();
  const root = useRef(null);
  const bookRef = useRef(null);
  const hero = content.videos?.hero || {};

  useGSAP(
    () => {
      const book = bookRef.current;
      if (prefersReducedMotion()) return;
      const split = SplitText.create('.hero__title', { type: 'lines', mask: 'lines', linesClass: 'hero__line' });
      const tl = gsap.timeline({ defaults: { ease: 'page' } });
      tl.from('.hero__band', { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.2 }, 0)
        .from(split.lines, { yPercent: 105, duration: 1.1, stagger: 0.09 }, 0.1)
        .from('.hero__sub, .hero__lede', { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.45)
        .from('.starter__q, .starter__opt, .starter__actions', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.05 }, 0.6)
        .from(book, { y: -60, autoAlpha: 0, '--ry': '78deg', '--rx': '14deg', duration: 1.5 }, 0.25)
        .from('.hero__formats li, .hero__watchband', { y: 12, autoAlpha: 0, stagger: 0.06, duration: 0.6 }, 0.9);

      // one clock: the book drifts with the scroll, the band footage counter-drifts
      gsap.to(book, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 } });
      gsap.to('.hero__band video', { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 } });

      // the book answers the pointer
      if (window.matchMedia('(hover: hover)').matches) {
        const ry = gsap.quickTo(book, '--ry', { duration: 0.9, ease: 'power3', unit: 'deg' });
        const rx = gsap.quickTo(book, '--rx', { duration: 0.9, ease: 'power3', unit: 'deg' });
        const onMove = (e) => {
          const r = root.current.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          ry(24 + x * 22);
          rx(6 - y * 10);
        };
        root.current.addEventListener('pointermove', onMove);
        return () => root.current?.removeEventListener('pointermove', onMove);
      }
    },
    { scope: root },
  );

  return (
    <section className="hero" ref={root} data-spine="01|Where it begins|house" aria-labelledby="hero-title">
      <div className="hero__panel" data-ink="paper">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            Where your book begins.
          </h1>
          <p className="hero__sub">From the first idea to the first reader, with one team beside you.</p>
          <p className="hero__lede">{BRAND.name} helps authors write, edit, design, publish and promote books in print, digital and audio editions.</p>
          <BookStarter />
        </div>
        <figure className="hero__book">
          <Book3D ref={bookRef} image="/covers/your-story.webp" title="Your Story" author="Your Name" ink="house" depth={38} fluid />
          <figcaption>
            <em>Your Story</em>, by you. Every Origin edition starts with one idea.
          </figcaption>
        </figure>
      </div>
      <div className="hero__band overprint" data-ink="publishing">
        <FieldVideo src={hero.src} poster={hero.poster} />
        <ul className="hero__formats" aria-label="Editions we prepare">
          <li>eBook</li>
          <li>Paperback</li>
          <li>Hardcover</li>
          <li>Audiobook</li>
        </ul>
        <p className="hero__watchband">Writing, editing, design, publishing and marketing, all from one point of origin.</p>
      </div>
    </section>
  );
}
