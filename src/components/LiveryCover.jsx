import { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { BRAND } from '../../shared/brand.js';

/** A cover in the Origin Edition house style, drawn from the author's own words. */
export default function LiveryCover({ title, author, ink = 'house', volumeName, stamped = false, size = 'md' }) {
  const stampRef = useRef(null);

  useLayoutEffect(() => {
    if (!stamped || !stampRef.current || prefersReducedMotion()) return;
    gsap.fromTo(stampRef.current, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power2.out', delay: 0.2 });
  }, [stamped]);

  const shownTitle = title && title.trim() ? title.trim() : 'Your book';
  const shownAuthor = author && author.trim() ? author.trim() : 'Your name';
  const long = shownTitle.length > 26;

  return (
    <div className={`livery-cover livery-cover--${size}`} aria-hidden="true">
      <div className="livery-cover__band livery-cover__band--top" data-ink={ink}>
        <span className="livery-cover__series">{BRAND.series}</span>
        <span className="livery-cover__vol">{volumeName || BRAND.name}</span>
      </div>
      <div className="livery-cover__panel">
        <p className={`livery-cover__title${long ? ' is-long' : ''}`}>{shownTitle}</p>
        <span className="livery-cover__rule" />
        <p className="livery-cover__author">{shownAuthor}</p>
        {stamped && (
          <p className="livery-cover__imprint" ref={stampRef}>
            Received {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
      <div className="livery-cover__band livery-cover__band--bottom" data-ink={ink}>
        <span className="nib" />
      </div>
    </div>
  );
}
