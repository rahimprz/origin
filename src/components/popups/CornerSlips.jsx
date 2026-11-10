import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, X } from 'lucide-react';
import { useSite } from '../../site/SiteContext.jsx';
import { gsap, prefersReducedMotion } from '../../lib/motion.js';
import { BRAND, contactOf, telHref } from '../../../shared/brand.js';

/** Storage notice: honest, small, and out of the way. */
export function CookieSlip() {
  const { consent, setConsent } = useSite();
  const ref = useRef(null);
  const [visible, setVisible] = useState(consent == null);

  useEffect(() => {
    if (consent == null) setVisible(true);
  }, [consent]);

  useLayoutEffect(() => {
    if (!visible || !ref.current || prefersReducedMotion()) return;
    gsap.fromTo(ref.current, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, delay: 1.6, duration: 0.8 });
  }, [visible]);

  const choose = (value) => {
    setConsent(value);
    if (ref.current && !prefersReducedMotion()) gsap.to(ref.current, { y: 30, autoAlpha: 0, duration: 0.35, ease: 'power2.in', onComplete: () => setVisible(false) });
    else setVisible(false);
  };

  if (!visible) return null;
  return (
    <section className="cookie" ref={ref} aria-label="Storage notice" data-ink="paper">
      <p>
        We store your choices in this browser and count page visits anonymously so we know which pages help authors. No advertising trackers.
      </p>
      <div className="cookie__actions">
        <button type="button" className="btn btn--small" onClick={() => choose('yes')}>
          Accept
        </button>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => choose('no')}>
          Essential only
        </button>
      </div>
    </section>
  );
}

/** "Talk to us": phone numbers and the inbox, one tap away. */
export function QuickContact() {
  const { content, openPlanner } = useSite();
  const { email, offices } = contactOf(content);
  const [open, setOpen] = useState(false);
  const [past, setPast] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);
  const { pathname } = useLocation();

  // on the home page the hero already carries the actions; arrive after it
  useEffect(() => {
    if (pathname !== '/') return setPast(true);
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.65);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current || prefersReducedMotion()) return;
    gsap.fromTo(panelRef.current, { y: 16, autoAlpha: 0, clipPath: 'inset(100% 0% 0% 0%)' }, { y: 0, autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [open]);

  return (
    <div className={`quick${past || open ? '' : ' is-away'}`}>
      {open && (
        <div className="quick__panel" ref={panelRef} id="quick-panel" role="dialog" aria-label={`Contact ${BRAND.name}`} data-ink="house">
          <button type="button" className="quick__x" onClick={() => setOpen(false)} aria-label="Close contact options">
            <X aria-hidden="true" />
          </button>
          <p className="quick__title">Talk to a publishing consultant</p>
          <ul>
            {offices
              .filter((o) => o.phone)
              .map((o) => (
                <li key={o.id || o.phone}>
                  <a href={telHref(o.phone)}>
                    <Phone aria-hidden="true" />
                    <span>
                      {o.phone}
                      {o.region && <span className="quick__sub">{o.region}</span>}
                    </span>
                  </a>
                </li>
              ))}
            <li>
              <a href={`mailto:${email}`}>
                <Mail aria-hidden="true" />
                <span>
                  {email}
                  <span className="quick__sub">Email</span>
                </span>
              </a>
            </li>
          </ul>
          <button
            type="button"
            className="btn btn--saffron btn--small"
            onClick={() => {
              setOpen(false);
              openPlanner();
            }}
          >
            Start my book online
          </button>
        </div>
      )}
      <button ref={btnRef} type="button" className="quick__btn" aria-expanded={open} aria-controls="quick-panel" onClick={() => setOpen((o) => !o)}>
        {open ? <X aria-hidden="true" /> : <Phone aria-hidden="true" />}
        <span>Talk to us</span>
      </button>
    </div>
  );
}
