import { useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FieldVideo from '../components/site/FieldVideo.jsx';
import { useSite } from '../site/SiteContext.jsx';
import { usePageTitle } from '../site/usePageTitle.js';
import { BRAND } from '../../shared/brand.js';
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { SERVICES, VOLUMES, servicesIn, volumeBySlug } from '../../shared/catalog.js';
import { StartCta } from './home/Sections.jsx';

export default function ServiceVolume() {
  const { slug } = useParams();
  const vol = volumeBySlug[slug];
  const { openPlanner, openService } = useSite();
  const root = useRef(null);
  usePageTitle(vol ? `${vol.name} | ${BRAND.name}` : BRAND.name, vol?.intro);

  useGSAP(
    () => {
      if (!vol || prefersReducedMotion()) return;
      const split = SplitText.create('.volcover__title', { type: 'lines', mask: 'lines' });
      gsap
        .timeline()
        .from('.volcover__media', { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.2 }, 0)
        .from(split.lines, { yPercent: 105, stagger: 0.08, duration: 1 }, 0.1)
        .from('.volcover__line, .volcover__intro, .volcover__actions', { y: 16, autoAlpha: 0, stagger: 0.08 }, 0.4);
      gsap.utils.toArray('.chapter').forEach((el) => {
        gsap.from(el, { y: 36, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: el, start: 'top 86%' } });
      });
      gsap.from('.series-spines a', { yPercent: 40, autoAlpha: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: '.series-spines', start: 'top 85%' } });
    },
    { scope: root, dependencies: [slug] },
  );

  if (!vol) return <Navigate to="/" replace />;
  const services = servicesIn(slug);
  const others = VOLUMES.filter((v) => v.slug !== slug);

  return (
    <div ref={root} key={slug}>
      <section className="volcover" data-ink={vol.ink} data-spine={`Vol. ${vol.no}|${vol.name}|${vol.ink}`} aria-labelledby="vol-title">
        <div className="volcover__copy">
          <span className="volcover__numeral" aria-hidden="true">
            {vol.no}
          </span>
          <h1 id="vol-title" className="volcover__title">
            <span className="sr-only">Volume {vol.no}: </span>
            {vol.name}
          </h1>
          <p className="volcover__line">{vol.line}</p>
          <p className="volcover__intro">{vol.intro}</p>
          <div className="volcover__actions">
            <button type="button" className="btn btn--field" onClick={() => openPlanner({ source: 'planner' })}>
              Start my book <ArrowRight className="arrow" aria-hidden="true" />
            </button>
            <a className="link-arrow" href="#chapters">
              {services.length} services in this volume
            </a>
          </div>
        </div>
        <div className="volcover__media overprint">
          <FieldVideo src={`/media/${vol.video}.mp4`} poster={`/media/${vol.video}.webp`} />
        </div>
      </section>

      <section id="chapters" className="chapters" data-ink="paper" data-spine={`Vol. ${vol.no}|Contents|${vol.ink}`} aria-label={`${vol.name} services`}>
        {services.map((s) => (
          <article key={s.id} className="chapter" id={s.id}>
            <p className="chapter__no" aria-hidden="true">
              {String(s.no).padStart(2, '0')}
              <span>/{SERVICES.length}</span>
            </p>
            <div className="chapter__main">
              <h2>{s.name}</h2>
              <p className="chapter__blurb">{s.blurb}</p>
            </div>
            <div className="chapter__side">
              <h3 className="label">What the work usually involves</h3>
              <ul>
                {s.involves.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <div className="chapter__actions">
                <button type="button" className="btn btn--small" onClick={() => openPlanner({ services: [s.id], source: 'planner' })}>
                  Ask about this
                </button>
                <button type="button" className="link-arrow" onClick={() => openService(s.id)}>
                  Details <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="series" data-ink="paper-2" data-spine={`Vol. ${vol.no}|More services|house`} aria-labelledby="series-title">
        <h2 id="series-title">The other four volumes</h2>
        <p>One team handles every volume, so the writing, editing, design, publishing and marketing of your book stay connected.</p>
        <ul className="series-spines">
          {others.map((v) => (
            <li key={v.slug}>
              <Link to={`/services/${v.slug}`} data-ink={v.ink}>
                <span className="series-spines__no">Vol. {v.no}</span>
                <span className="series-spines__name">{v.name}</span>
                <span className="nib" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <StartCta />
    </div>
  );
}
