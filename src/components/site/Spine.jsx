import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useSpine, setSpine } from '../../site/spine.js';
import { gsap, ScrollTrigger, scrollToTarget } from '../../lib/motion.js';

/**
 * The series spine: a strip down the left edge that re-inks to the section
 * you are reading and carries its number, like the spine of the current volume.
 */
export default function Spine() {
  const { no, title, ink } = useSpine();
  const { pathname } = useLocation();
  const fillRef = useRef(null);
  const textRef = useRef(null);

  // watch every [data-spine] section on the page
  useEffect(() => {
    const triggers = [];
    const setup = () => {
      document.querySelectorAll('[data-spine]').forEach((el) => {
        const [sNo, sTitle, sInk] = el.getAttribute('data-spine').split('|');
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => self.isActive && setSpine({ no: sNo, title: sTitle, ink: sInk }),
          }),
        );
      });
    };
    const id = requestAnimationFrame(setup);
    const progress = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => fillRef.current && gsap.set(fillRef.current, { scaleY: self.progress }),
    });
    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
      progress.kill();
    };
  }, [pathname]);

  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(textRef.current, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.6 });
  }, [title]);

  return (
    <aside className="spine" data-ink={ink} aria-hidden="true">
      <span className="spine__series">Origin</span>
      <span className="spine__text" ref={textRef}>
        <span className="spine__no">{/^\d/.test(no) ? `No. ${no}` : no}</span>
        <span className="spine__title">{title}</span>
      </span>
      <span className="spine__track">
        <span className="spine__fill" ref={fillRef} />
      </span>
      <button type="button" className="spine__top" tabIndex={-1} onClick={() => scrollToTarget(document.body)}>
        <ArrowUp />
      </button>
      <span className="nib spine__nib" />
    </aside>
  );
}
