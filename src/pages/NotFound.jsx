import { Link } from 'react-router-dom';
import { usePageTitle } from '../site/usePageTitle.js';
import { BRAND } from '../../shared/brand.js';

export default function NotFound() {
  usePageTitle(`Page not found | ${BRAND.name}`);
  return (
    <section className="notfound" data-ink="writing" data-spine="404|Missing page|writing" aria-labelledby="nf-title">
      <p className="notfound__no" aria-hidden="true">404</p>
      <h1 id="nf-title">This page could not be found</h1>
      <p>The link may be old, or the page may have moved. Every service is one click away from the home page.</p>
      <Link to="/" className="btn btn--field">
        Back to the home page
      </Link>
    </section>
  );
}
