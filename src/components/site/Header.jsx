import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useSite } from '../../site/SiteContext.jsx';
import { gsap, ScrollTrigger, lockScroll, prefersReducedMotion, scrollToTarget } from '../../lib/motion.js';
import { VOLUMES, servicesIn } from '../../../shared/catalog.js';
import { BRAND, contactOf, telHref } from '../../../shared/brand.js';

const SECTIONS = [
  { id: 'process', label: 'Process' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'about', label: 'About' },
  { id: 'faq', label: 'FAQ' },
];

export function useSectionLink() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (id) => (e) => {
    e?.preventDefault();
    if (pathname === '/') scrollToTarget(`#${id}`, -8);
    else navigate(`/#${id}`);
  };
}

export default function Header() {
  const { content, openPlanner, menuOpen, setMenuOpen } = useSite();
  const [contentsOpen, setContentsOpen] = useState(false);
  const [hideBar, setHideBar] = useState(() => sessionStorage.getItem('obp-bar-hidden') === '1');
  const headerRef = useRef(null);
  const contentsRef = useRef(null);
  const contentsBtn = useRef(null);
  const mobileRef = useRef(null);
  const sectionLink = useSectionLink();
  const { pathname } = useLocation();
  const announcement = content.announcement;
  const phone = contactOf(content).offices.find((o) => o.phone)?.phone;

  // hide on the way down, return on the way up
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      start: 240,
      end: 'max',
      onUpdate(self) {
        if (contentsOpen) return;
        gsap.to(el, { yPercent: self.direction === 1 ? -100 : 0, duration: 0.45, ease: 'page', overwrite: 'auto' });
      },
      onLeaveBack() {
        gsap.to(el, { yPercent: 0, duration: 0.3, overwrite: 'auto' });
      },
    });
    return () => st.kill();
  }, [contentsOpen, pathname]);

  useEffect(() => {
    setContentsOpen(false);
    setMenuOpen(false);
    if (headerRef.current) gsap.set(headerRef.current, { yPercent: 0 });
  }, [pathname, setMenuOpen]);

  // contents dropdown: escape + outside click
  useEffect(() => {
    if (!contentsOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setContentsOpen(false);
        contentsBtn.current?.focus();
      }
    };
    const onDown = (e) => {
      if (!contentsRef.current?.contains(e.target) && !contentsBtn.current?.contains(e.target)) setContentsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [contentsOpen]);

  useLayoutEffect(() => {
    if (!contentsOpen || !contentsRef.current || prefersReducedMotion()) return;
    const spines = contentsRef.current.querySelectorAll('.contents__vol');
    gsap.fromTo(contentsRef.current, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 });
    gsap.fromTo(spines, { yPercent: 18, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.05, duration: 0.6, delay: 0.08 });
  }, [contentsOpen]);

  // mobile menu
  useLayoutEffect(() => {
    lockScroll(menuOpen);
    if (!menuOpen || !mobileRef.current || prefersReducedMotion()) return;
    gsap.fromTo(mobileRef.current, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 });
    gsap.fromTo(mobileRef.current.querySelectorAll('.mobile__item'), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.04, delay: 0.1 });
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, setMenuOpen]);

  const barVisible = !!announcement?.enabled && !hideBar;
  useEffect(() => {
    document.documentElement.style.setProperty('--announce-h', barVisible ? '40px' : '0px');
  }, [barVisible]);

  const runAction = () => (announcement?.action === 'video' ? null : openPlanner());

  return (
    <header className="site-header" ref={headerRef}>
      {announcement?.enabled && !hideBar && (
        <div className="announce" data-ink="marketing">
          <p>
            {announcement.text}{' '}
            {announcement.linkLabel && (
              <button type="button" className="announce__link" onClick={runAction}>
                {announcement.linkLabel} <ArrowRight aria-hidden="true" />
              </button>
            )}
          </p>
          <button
            type="button"
            className="announce__x"
            aria-label="Hide this message"
            onClick={() => {
              sessionStorage.setItem('obp-bar-hidden', '1');
              setHideBar(true);
            }}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="masthead" data-ink="house">
        <Link to="/" className="brand" aria-label={`${BRAND.name}, home`}>
          <span className="nib brand__nib" aria-hidden="true" />
          <span className="brand__words">
            <span className="brand__name">{BRAND.short}</span>
            <span className="brand__line">{BRAND.line}</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Main">
          <button
            ref={contentsBtn}
            type="button"
            className={`nav__item nav__contents${contentsOpen ? ' is-open' : ''}`}
            aria-expanded={contentsOpen}
            aria-controls="contents-panel"
            onClick={() => setContentsOpen((o) => !o)}
          >
            Services <ChevronDown aria-hidden="true" />
          </button>
          {SECTIONS.map((s) => (
            <a key={s.id} className="nav__item" href={`/#${s.id}`} onClick={sectionLink(s.id)}>
              {s.label}
            </a>
          ))}
          <NavLink className="nav__item" to="/contact">
            Contact
          </NavLink>
        </nav>

        <div className="masthead__end">
          {phone && (
            <a className="masthead__phone" href={telHref(phone)}>
              {phone}
            </a>
          )}
          <button type="button" className="btn btn--saffron btn--small masthead__cta" onClick={() => openPlanner()}>
            Start my book
          </button>
          <button type="button" className="masthead__menu" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      {contentsOpen && (
        <div className="contents" id="contents-panel" ref={contentsRef} data-lenis-prevent>
          <div className="contents__vols">
            {VOLUMES.map((v) => (
              <Link key={v.slug} to={`/services/${v.slug}`} className="contents__vol" data-ink={v.ink}>
                <span className="contents__no">Vol. {v.no}</span>
                <span className="contents__name">{v.name}</span>
                <span className="contents__count">{servicesIn(v.slug).length} services</span>
                <span className="contents__line">{v.line}</span>
                <ArrowRight className="contents__arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="mobile" id="mobile-menu" ref={mobileRef} data-ink="house" data-lenis-prevent>
          <nav aria-label="Mobile">
            <ul className="mobile__list">
              <li className="mobile__item">
                <Link to="/">Home</Link>
              </li>
              {SECTIONS.map((s) => (
                <li key={s.id} className="mobile__item">
                  <a
                    href={`/#${s.id}`}
                    onClick={(e) => {
                      setMenuOpen(false);
                      sectionLink(s.id)(e);
                    }}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li className="mobile__item">
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
            <p className="label mobile__item mobile__label">Services</p>
            <ul className="mobile__vols">
              {VOLUMES.map((v) => (
                <li key={v.slug} className="mobile__item">
                  <Link to={`/services/${v.slug}`} data-ink={v.ink}>
                    <span>Vol. {v.no}</span> {v.name}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn--saffron mobile__item"
              onClick={() => {
                setMenuOpen(false);
                openPlanner();
              }}
            >
              Start my book
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
