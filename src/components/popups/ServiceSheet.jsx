import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Dialog from '../Dialog.jsx';
import { useSite } from '../../site/SiteContext.jsx';
import { SERVICES, serviceById, volumeBySlug } from '../../../shared/catalog.js';

export default function ServiceSheet() {
  const { service, closeService, openService, openPlanner } = useSite();
  const s = serviceById[service.id];
  const vol = s ? volumeBySlug[s.vol] : null;
  const index = s ? SERVICES.indexOf(s) : -1;
  const prev = index > 0 ? SERVICES[index - 1] : null;
  const next = index >= 0 && index < SERVICES.length - 1 ? SERVICES[index + 1] : null;

  return (
    <Dialog open={service.open && !!s} onClose={closeService} variant="sheet" labelledBy="service-title" className="sheet" closeLabel="Close service details">
      {s && (
        <article className="sheet__body">
          <header className="sheet__band" data-ink={vol.ink}>
            <p className="label">
              Vol. {vol.no} · {vol.name}
            </p>
            <p className="sheet__count">
              No. {String(s.no).padStart(2, '0')} <span>of {SERVICES.length}</span>
            </p>
          </header>
          <div className="sheet__content">
            <h2 id="service-title">{s.name}</h2>
            <p className="sheet__blurb">{s.blurb}</p>
            <h3 className="sheet__subhead">What the work usually involves</h3>
            <ul className="sheet__list">
              {s.involves.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="sheet__note">Every plan is shaped around your manuscript, so the exact scope is agreed with you before work begins.</p>
            <div className="sheet__actions">
              <button type="button" className="btn btn--saffron" onClick={() => openPlanner({ services: [s.id], source: 'planner' })}>
                Ask about this service <ArrowRight className="arrow" aria-hidden="true" />
              </button>
              <Link className="link-arrow" to={`/services/${vol.slug}`} onClick={closeService}>
                All {vol.short.toLowerCase()} services <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <nav className="sheet__pager" aria-label="Other services">
            <button type="button" disabled={!prev} onClick={() => prev && openService(prev.id)}>
              <ArrowLeft aria-hidden="true" />
              <span>
                <span className="label">Previous</span>
                {prev ? prev.name : 'Start of the list'}
              </span>
            </button>
            <button type="button" disabled={!next} onClick={() => next && openService(next.id)}>
              <span>
                <span className="label">Next</span>
                {next ? next.name : 'End of the list'}
              </span>
              <ArrowRight aria-hidden="true" />
            </button>
          </nav>
        </article>
      )}
    </Dialog>
  );
}
