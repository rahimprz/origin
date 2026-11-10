import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Move3d } from 'lucide-react';
import Dialog from '../Dialog.jsx';
import Book3D from '../Book3D.jsx';
import { useSite } from '../../site/SiteContext.jsx';
import { gsap } from '../../lib/motion.js';

const INKS = ['publishing', 'writing', 'design', 'editorial', 'house'];

/** Turn a finished cover in your hands: drag to rotate, or jump to front / spine / angle. */
export default function CoverViewer() {
  const { cover, closeCover, content, openPlanner } = useSite();
  const books = content.portfolio || [];
  const [index, setIndex] = useState(0);
  const bookRef = useRef(null);
  const angle = useRef({ ry: 24, rx: 6 });
  const drag = useRef(null);

  useEffect(() => {
    if (cover.open) setIndex(Math.min(cover.index, books.length - 1));
  }, [cover.open, cover.index, books.length]);

  const turnTo = (ry, rx = 4) => {
    angle.current = { ry, rx };
    if (bookRef.current) gsap.to(bookRef.current, { '--ry': `${ry}deg`, '--rx': `${rx}deg`, duration: 0.9, ease: 'page' });
  };

  useEffect(() => {
    if (!cover.open || !bookRef.current) return;
    gsap.fromTo(bookRef.current, { '--ry': '80deg', '--rx': '10deg', autoAlpha: 0 }, { '--ry': '24deg', '--rx': '6deg', autoAlpha: 1, duration: 1.1, ease: 'page', delay: 0.15 });
    angle.current = { ry: 24, rx: 6 };
  }, [cover.open, index]);

  const onDown = (e) => {
    drag.current = { x: e.clientX, y: e.clientY, ...angle.current };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current || !bookRef.current) return;
    const ry = Math.max(-40, Math.min(175, drag.current.ry + (e.clientX - drag.current.x) * 0.45));
    const rx = Math.max(-20, Math.min(24, drag.current.rx - (e.clientY - drag.current.y) * 0.2));
    angle.current = { ry, rx };
    gsap.set(bookRef.current, { '--ry': `${ry}deg`, '--rx': `${rx}deg` });
  };
  const onUp = () => (drag.current = null);

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') turnTo(angle.current.ry - 20, angle.current.rx);
    if (e.key === 'ArrowRight') turnTo(angle.current.ry + 20, angle.current.rx);
  };

  const book = books[index];

  return (
    <Dialog open={cover.open && !!book} onClose={closeCover} variant="full" ink="paper-2" labelledBy="cover-title" className="viewer" closeLabel="Close the cover viewer">
      {book && (
        <div className="viewer__layout">
          <div
            className="viewer__stage"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
            tabIndex={0}
            role="img"
            aria-label={`${book.title} by ${book.author}, shown as a 3D book. Drag or use the arrow keys to turn it.`}
          >
            <Book3D ref={bookRef} key={book.id} image={book.image} title={book.title} author={book.author} ink={INKS[index % INKS.length]} depth={42} fluid />
            <p className="viewer__hint label">
              <Move3d aria-hidden="true" /> Drag to turn the book
            </p>
          </div>
          <div className="viewer__info">
            <h2 id="cover-title">{book.title}</h2>
            <p className="viewer__author">{book.author}</p>
            <p className="viewer__band">{book.note}</p>
            <div className="viewer__turns" role="group" aria-label="Turn the book">
              <button type="button" className="btn btn--ghost btn--small" onClick={() => turnTo(0, 0)}>Front</button>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => turnTo(24, 6)}>Angle</button>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => turnTo(88, 0)}>Spine</button>
            </div>
            <button type="button" className="btn btn--saffron" onClick={() => { closeCover(); setTimeout(() => openPlanner({ services: ['cover-design'] }), 320); }}>
              Talk to us about your cover <ArrowRight className="arrow" aria-hidden="true" />
            </button>
            <nav className="viewer__pager" aria-label="Other covers">
              <button type="button" className="btn btn--ghost btn--small" onClick={() => setIndex((index - 1 + books.length) % books.length)}>
                <ArrowLeft aria-hidden="true" /> Previous
              </button>
              <span className="viewer__count" aria-label={`Book ${index + 1} of ${books.length}`}>
                {String(index + 1).padStart(2, '0')} / {String(books.length).padStart(2, '0')}
              </span>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => setIndex((index + 1) % books.length)}>
                Next <ArrowRight aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      )}
    </Dialog>
  );
}
