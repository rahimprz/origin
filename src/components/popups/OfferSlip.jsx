import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useSite } from '../../site/SiteContext.jsx';
import { gsap, prefersReducedMotion } from '../../lib/motion.js';

const SNOOZE_KEY = 'obp-offer-snoozed';

function snoozed(days) {
  try {
    const at = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    return at && Date.now() - at < days * 86400000;
  } catch {
    return false;
  }
}

/**
 * A bookmark that slides out from the edge of the page. It never blocks the
 * page (no modal) and it respects the timing the team sets in the admin.
 */
export default function OfferSlip() {
  const { content, openPlanner, plannerUsed, planner } = useSite();
  const offer = content.offer || {};
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);
  const fired = useRef(false);

  useEffect(() => {
    if (!offer.enabled || fired.current || plannerUsed || snoozed(offer.snoozeDays || 7)) return;
    const fire = () => {
      if (fired.current) return;
      fired.current = true;
      setMounted(true);
      setShow(true);
    };
    const cleanups = [];
    if (offer.trigger === 'time') {
      const t = setTimeout(fire, Math.max(3, offer.delaySeconds || 20) * 1000);
      cleanups.push(() => clearTimeout(t));
    } else if (offer.trigger === 'exit') {
      const onOut = (e) => {
        if (!e.relatedTarget && e.clientY < 12) fire();
      };
      document.addEventListener('mouseout', onOut);
      cleanups.push(() => document.removeEventListener('mouseout', onOut));
      // touch devices have no exit intent; fall back to time
      if (window.matchMedia('(hover: none)').matches) {
        const t = setTimeout(fire, Math.max(3, offer.delaySeconds || 30) * 1000);
        cleanups.push(() => clearTimeout(t));
      }
    } else {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (max > 0 && (window.scrollY / max) * 100 >= (offer.scrollPercent || 45)) fire();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
    }
    return () => cleanups.forEach((c) => c());
  }, [offer.enabled, offer.trigger, offer.delaySeconds, offer.scrollPercent, offer.snoozeDays, plannerUsed, pathname]);

  // a planner opened from elsewhere makes the bookmark pointless
  useEffect(() => {
    if (planner.open && show) setShow(false);
  }, [planner.open, show]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    if (show) {
      if (!reduce) gsap.fromTo(el, { xPercent: 110, rotate: 2 }, { xPercent: 0, rotate: 0, duration: 0.9, ease: 'page' });
    } else if (mounted) {
      if (reduce) setMounted(false);
      else gsap.to(el, { xPercent: 115, duration: 0.45, ease: 'power3.in', onComplete: () => setMounted(false) });
    }
  }, [show, mounted]);

  const dismiss = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!mounted) return null;

  return (
    <aside className="offer" ref={ref} role="complementary" aria-labelledby="offer-title" data-ink="marketing">
      <button type="button" className="offer__close" onClick={dismiss} aria-label="Dismiss this suggestion">
        <X aria-hidden="true" />
      </button>
      <span className="nib offer__nib" aria-hidden="true" />
      <h2 id="offer-title">{offer.title}</h2>
      <p>{offer.body}</p>
      <button
        type="button"
        className="btn btn--field"
        onClick={() => {
          setShow(false);
          openPlanner({ source: 'offer' });
        }}
      >
        {offer.cta || 'Start my book'} <ArrowRight className="arrow" aria-hidden="true" />
      </button>
      <button type="button" className="offer__later" onClick={dismiss}>
        Not now
      </button>
    </aside>
  );
}
