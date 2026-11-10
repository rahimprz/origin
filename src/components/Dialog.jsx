import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { gsap, lockScroll, prefersReducedMotion } from '../lib/motion.js';

const OPEN = {
  center: { from: { y: 36, autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)' }, to: { y: 0, autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75 } },
  sheet: { from: { xPercent: 100 }, to: { xPercent: 0, duration: 0.7 } },
  full: { from: { autoAlpha: 0, scale: 0.97 }, to: { autoAlpha: 1, scale: 1, duration: 0.6 } },
};
const CLOSE = {
  center: { y: 18, autoAlpha: 0, duration: 0.28, ease: 'power2.in' },
  sheet: { xPercent: 100, duration: 0.4, ease: 'power3.in' },
  full: { autoAlpha: 0, scale: 0.98, duration: 0.3, ease: 'power2.in' },
};

/**
 * Native <dialog> (focus trap, Escape, inert page) with authored GSAP motion.
 * Stays mounted while the close animation plays.
 */
export default function Dialog({ open, onClose, variant = 'center', ink, labelledBy, className = '', children, closeLabel = 'Close' }) {
  const dialogRef = useRef(null);
  const panelRef = useRef(null);
  const scrimRef = useRef(null);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useLayoutEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg || !mounted) return;
    const reduce = prefersReducedMotion();
    if (open) {
      if (!dlg.open) dlg.showModal();
      lockScroll(true);
      if (reduce) return;
      gsap.fromTo(scrimRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: 'power1.out' });
      gsap.fromTo(panelRef.current, OPEN[variant].from, { ...OPEN[variant].to, ease: 'page', clearProps: 'clipPath' });
    } else if (dlg.open) {
      const finish = () => {
        dlg.close();
        lockScroll(false);
        setMounted(false);
      };
      if (reduce) return finish();
      gsap.to(scrimRef.current, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' });
      gsap.to(panelRef.current, { ...CLOSE[variant], onComplete: finish });
    }
  }, [open, mounted, variant]);

  useEffect(() => () => lockScroll(false), []);

  if (!mounted) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`dialog dialog--${variant} ${className}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="dialog__scrim" ref={scrimRef} onClick={onClose} aria-hidden="true" />
      <div className="dialog__panel" ref={panelRef} data-ink={ink} data-lenis-prevent>
        <button type="button" className="dialog__close" onClick={onClose} aria-label={closeLabel}>
          <X aria-hidden="true" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
