import { Link } from 'react-router-dom';
import { useSite } from '../../site/SiteContext.jsx';
import { useSectionLink } from './Header.jsx';
import { VOLUMES } from '../../../shared/catalog.js';
import { BRAND, contactOf, telHref } from '../../../shared/brand.js';

export default function Footer() {
  const { content, openPlanner, setConsent } = useSite();
  const { email, offices } = contactOf(content);
  const sectionLink = useSectionLink();
  return (
    <footer className="footer" data-ink="house" data-spine="00|Colophon|house">
      <div className="footer__top">
        <div className="footer__brand">
          <span className="nib footer__nib" aria-hidden="true" />
          <p className="footer__name">{BRAND.name}</p>
          <p className="footer__tag">{BRAND.tagline}</p>
          <p className="footer__about">Writing, editing, design, publishing and marketing for authors, from the first idea to the first reader.</p>
          <button type="button" className="btn btn--saffron" onClick={() => openPlanner()}>
            Start my book
          </button>
        </div>
        <nav className="footer__col" aria-label="Explore">
          <h2 className="label">Explore</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="/#process" onClick={sectionLink('process')}>Process</a></li>
            <li><a href="/#publishing" onClick={sectionLink('publishing')}>Publishing</a></li>
            <li><a href="/#about" onClick={sectionLink('about')}>About</a></li>
            <li><a href="/#faq" onClick={sectionLink('faq')}>Common questions</a></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
        <nav className="footer__col" aria-label="Services">
          <h2 className="label">Services</h2>
          <ul>
            {VOLUMES.map((v) => (
              <li key={v.slug}>
                <Link to={`/services/${v.slug}`}>{v.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer__col footer__offices">
          <h2 className="label">Contact</h2>
          {offices.map((o) => (
            <address key={o.id || o.region}>
              {o.region && <strong>{o.region}</strong>}
              {o.phone && <a href={telHref(o.phone)}>{o.phone}</a>}
              {String(o.address || '')
                .split('\n')
                .filter(Boolean)
                .map((line) => (
                  <span key={line}>{line}</span>
                ))}
            </address>
          ))}
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </div>
      <div className="footer__base">
        <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        <p className="footer__links">
          <button type="button" onClick={() => setConsent(null)}>
            Storage preferences
          </button>
          <Link to="/admin">Team sign in</Link>
        </p>
      </div>
    </footer>
  );
}
