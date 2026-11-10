import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FieldVideo from '../../components/site/FieldVideo.jsx';
import { useSite } from '../../site/SiteContext.jsx';
import { setSpine } from '../../site/spine.js';
import { gsap, useGSAP } from '../../lib/motion.js';
import { SERVICES, VOLUMES, servicesIn } from '../../../shared/catalog.js';

export function Toc({ slug, onOpen }) {
  return (
    <ol className="toc">
      {servicesIn(slug).map((s) => (
        <li key={s.id}>
          <button type="button" className="toc__row" onClick={() => onOpen(s.id)}>
            <span className="toc__name">{s.name}</span>
            <span className="toc__dots" aria-hidden="true" />
            <span className="toc__no">
              <span className="sr-only">service number </span>
              {String(s.no).padStart(2, '0')}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export default function Catalogue() {
  const { openService } = useSite();
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        const track = root.current.querySelector('.catalogue__track');
        const panels = gsap.utils.toArray('.vol', track);
        let current = -1;
        const distance = () => track.scrollWidth - window.innerWidth + track.getBoundingClientRect().left;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current.querySelector('.catalogue__viewport'),
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate(self) {
              const i = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
              if (i !== current) {
                current = i;
                const v = VOLUMES[i];
                setSpine({ no: `03.${v.no}`, title: v.name, ink: v.ink });
              }
            },
          },
        });
        // inside each volume, the contents rows set in as the volume arrives
        panels.forEach((panel) => {
          gsap.from(panel.querySelectorAll('.toc__row'), {
            x: 40,
            autoAlpha: 0,
            stagger: 0.04,
            duration: 0.6,
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' },
          });
          gsap.fromTo(
            panel.querySelector('.vol__numeral'),
            { xPercent: 30 },
            { xPercent: -30, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } },
          );
        });
      });
      mm.add('(max-width: 959px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.vol', root.current).forEach((panel) => {
          gsap.from(panel.querySelectorAll('.toc__row'), { y: 16, autoAlpha: 0, stagger: 0.03, duration: 0.5, scrollTrigger: { trigger: panel, start: 'top 75%' } });
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="services" className="catalogue" ref={root} aria-labelledby="cat-title">
      <div className="catalogue__intro" data-ink="paper" data-spine="03|Services|house">
        <h2 id="cat-title">Everything a book needs, in the order it needs it</h2>
        <p>
          {SERVICES.length} services in five volumes, from writing to readers. Open a service to see what the work involves, or a volume to read it all.
        </p>
      </div>
      <div className="catalogue__viewport">
        <div className="catalogue__track">
          {VOLUMES.map((v) => (
            <article key={v.slug} className="vol" data-ink={v.ink} aria-labelledby={`vol-${v.slug}`}>
              <span className="vol__numeral" aria-hidden="true">
                {v.no}
              </span>
              <div className="vol__head">
                <h3 id={`vol-${v.slug}`} className="vol__name">
                  <span className="sr-only">Volume {v.no}: </span>
                  {v.name}
                </h3>
                <p className="vol__line">{v.line}</p>
                <div className="vol__media overprint">
                  <FieldVideo src={`/media/${v.video}.mp4`} poster={`/media/${v.video}.webp`} />
                </div>
                <Link to={`/services/${v.slug}`} className="link-arrow">
                  Open volume {v.no} <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <Toc slug={v.slug} onOpen={openService} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
