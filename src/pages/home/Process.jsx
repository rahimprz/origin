import { useEffect, useRef } from 'react';
import Book3D from '../../components/Book3D.jsx';
import FieldVideo from '../../components/site/FieldVideo.jsx';
import { useSite } from '../../site/SiteContext.jsx';
import { setSpine } from '../../site/spine.js';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import { STAGES } from '../../../shared/catalog.js';

const STAGE_INK = ['paper', 'editorial', 'design', 'publishing', 'house', 'marketing'];

// A typescript page in standard manuscript format: Courier, double-spaced.
// Every glyph is 0.6em wide, so proof marks can be placed by column.
const FONT = 13;
const CH = FONT * 0.6;
const LH = 26;
const PAD_X = 40;
const PAD_Y = 46;
const LINES = [
  'CHAPTER ONE',
  '',
  'The harbor lights came on one by one,',
  'the way they always did in October,',
  'and Mara counted them from the end of',
  'the pier like she was ten years old',
  'again. Seven lights. There used to be',
  'eight. She had never asked what',
  'happened to the last one, and nobody',
  'had ever thought to tell her.',
  '',
  'She pulled her coat tighter and waited',
  'for the ferry that would not come.',
  'Behind her the town was closing its',
  'shutters, one window at a time, the way',
  'a book closes on a finished chapter.',
];
const x = (col) => PAD_X + col * CH;
const base = (line) => PAD_Y + line * LH + FONT * 0.95;

// editor's marks (red pencil), positioned by line + column
const at = (line, word) => LINES[line].indexOf(word);
const MARKS = [
  // caret: insert "slowly" after "came on"
  { d: `M ${x(at(2, 'one by'))} ${base(2) + 2} l 4 -9 l 4 9`, note: { text: 'slowly', x: x(at(2, 'one by')) - 14, y: base(2) - 15 } },
  // strike "used to be" and write "had been" above
  { d: `M ${x(at(6, 'used'))} ${base(6) - 4} L ${x(at(6, 'used') + 10)} ${base(6) - 5}`, note: { text: 'had been', x: x(at(6, 'used')) + 4, y: base(6) - 16 } },
  // loop round "Mara"
  { d: `M ${x(at(4, 'Mara')) - 4} ${base(4) - 4} c 0 -12 34 -12 36 -1 c 2 10 -34 12 -37 2`, note: { text: 'consistent?', x: 360, y: base(4) - 3, margin: true } },
  // margin bar + praise for lines 7–9
  { d: `M ${PAD_X - 16} ${base(7) - 12} L ${PAD_X - 16} ${base(9) + 4}`, note: { text: 'lovely', x: 8, y: base(10) + 4 } },
  // delete loop on "tighter"
  { d: `M ${x(at(11, 'tighter'))} ${base(11) - 5} L ${x(at(11, 'tighter') + 7)} ${base(11) - 5} q 8 -4 4 -10 q -5 -3 -6 5`, note: null },
];
const PAGE_W = 2 * PAD_X + 40 * CH;
const PAGE_H = 576;

const CHANNELS = ['Amazon KDP', 'IngramSpark', 'Bookstores', 'Libraries', 'Audio stores'];

export default function Process() {
  const { content } = useSite();
  const root = useRef(null);
  const readers = content.videos?.readers || {};

  // fit the fixed-size stage into whatever room the column has
  useEffect(() => {
    const obj = root.current?.querySelector('.process__object');
    const box = root.current?.querySelector('.process__stage-box');
    if (!obj || !box) return;
    const ro = new ResizeObserver(() => {
      const s = Math.min(1, obj.clientWidth / 580, obj.clientHeight / 660);
      box.style.setProperty('--stage-scale', String(Math.max(0.5, s)));
    });
    ro.observe(obj);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        const pin = root.current.querySelector('.process__pin');
        const items = gsap.utils.toArray('.process__stage', root.current);
        let current = -1;
        const setStage = (i) => {
          if (i === current) return;
          current = i;
          pin.dataset.ink = STAGE_INK[i];
          items.forEach((el, n) => el.classList.toggle('is-on', n === i));
          setSpine({ no: `02.${i + 1}`, title: STAGES[i].name, ink: STAGE_INK[i] === 'paper' ? 'house' : STAGE_INK[i] });
        };
        setStage(0);

        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut', duration: 1 },
          // the stage follows the timeline's own (scrubbed) clock, so the list,
          // the ink and the spine change exactly when the object does
          onUpdate: () => setStage(Math.max(0, Math.min(STAGES.length - 1, Math.floor(tl.time())))),
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${window.innerHeight * 5.2}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onLeaveBack: () => setStage(0),
          },
        });

        // 1 · the page is typed
        tl.from('.ms', { y: 60, rotate: -3, duration: 0.6 }, 0)
          .from('.ms__line', { clipPath: 'inset(0 100% 0 0)', stagger: 0.06, duration: 0.35, ease: 'none' }, 0.1)
          // 2 · the editor's red pencil
          .fromTo('.ms__mark', { drawSVG: '0%' }, { drawSVG: '100%', stagger: 0.14, duration: 0.4, ease: 'power1.inOut' }, 1.05)
          .from('.ms__note', { autoAlpha: 0, y: 4, stagger: 0.14, duration: 0.3 }, 1.2)
          // 3 · the page becomes a cover
          .to('.ms', { rotateY: 180, scale: 0.86, duration: 0.9 }, 2.05)
          // 4 · one book, three editions
          .to('.ms', { autoAlpha: 0, duration: 0.25 }, 3.0)
          .from('.ed', { y: 120, autoAlpha: 0, stagger: 0.12, duration: 0.7, ease: 'page' }, 3.0)
          .from('.ed .book3d', { '--ry': '82deg', stagger: 0.12, duration: 0.8 }, 3.05)
          // 5 · out into the world
          .to('.editions', { yPercent: -14, scale: 0.84, duration: 0.6 }, 4.05)
          .from('.channel', { scale: 1.35, autoAlpha: 0, rotate: () => gsap.utils.random(-7, 7), stagger: 0.09, duration: 0.45, ease: 'back.out(1.6)' }, 4.25)
          // 6 · into readers' hands
          .fromTo('.readers', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'power3.out' }, 5.0)
          .from('.readers__caption', { y: 20, autoAlpha: 0, duration: 0.4 }, 5.25)
          .to({}, { duration: 0.45 });

        return () => {
          pin.dataset.ink = 'paper';
        };
      });

      // small screens and reduced motion: a calm stacked sequence
      mm.add('(max-width: 959px), (prefers-reduced-motion: reduce)', () => {
        if (prefersReducedMotion()) return;
        gsap.utils.toArray('.process__stage', root.current).forEach((el) => {
          gsap.from(el, { y: 30, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 88%' } });
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="process" className="process" ref={root} data-spine="02|How it grows|house" aria-labelledby="process-title">
      <div className="process__pin" data-ink="paper">
        <div className="process__copy">
          <h2 id="process-title">Watch a first draft grow into a finished book</h2>
          <p className="process__lede">Six stages, in order, with the same team carrying your book from one to the next.</p>
          <ol className="process__stages">
            {STAGES.map((s, i) => (
              <li key={s.id} className={`process__stage${i === 0 ? ' is-on' : ''}`}>
                <span className="process__no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.line}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="process__object" aria-hidden="true">
          <div className="process__stage-box">
            <div className="ms" style={{ width: PAGE_W, height: PAGE_H }}>
              <div className="ms__front">
                {LINES.map((l, i) => (
                  <p key={i} className="ms__line" style={{ top: PAD_Y + i * LH, left: PAD_X, fontSize: FONT, lineHeight: `${LH}px` }}>
                    {l || ' '}
                  </p>
                ))}
                <svg className="ms__marks" viewBox={`0 0 ${PAGE_W} ${PAGE_H}`} width={PAGE_W} height={PAGE_H}>
                  {MARKS.map((m, i) => (
                    <path key={i} className="ms__mark" d={m.d} />
                  ))}
                  {MARKS.filter((m) => m.note).map((m, i) => (
                    <text key={i} className="ms__note" x={m.note.x} y={m.note.y}>
                      {m.note.text}
                    </text>
                  ))}
                </svg>
                <span className="ms__folio">1</span>
              </div>
              <div className="ms__back">
                <img src="/covers/seventh-light.webp" alt="" width="853" height="1280" />
              </div>
            </div>

            <div className="editions">
              <figure className="ed ed--hard">
                <Book3D image="/covers/seventh-light.webp" title="The Seventh Light" author="Your Name" ink="publishing" width={172} depth={34} />
                <figcaption>Hardcover</figcaption>
              </figure>
              <figure className="ed ed--paper">
                <Book3D image="/covers/seventh-light.webp" title="The Seventh Light" author="Your Name" ink="house" width={150} depth={20} />
                <figcaption>Paperback</figcaption>
              </figure>
              <figure className="ed ed--ebook">
                <div className="tablet">
                  <img src="/covers/seventh-light.webp" alt="" width="853" height="1280" />
                </div>
                <figcaption>eBook</figcaption>
              </figure>
            </div>

            <ul className="channels">
              {CHANNELS.map((c) => (
                <li key={c} className="channel">
                  {c}
                </li>
              ))}
            </ul>

            <div className="readers overprint" data-ink="marketing">
              <FieldVideo src={readers.src} poster={readers.poster} />
              <p className="readers__caption">And finally, the reader it was written for.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
