import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import '../styles/site.css';
import '../styles/popups.css';
import { SiteProvider, useSite } from './SiteContext.jsx';
import Header from '../components/site/Header.jsx';
import Spine from '../components/site/Spine.jsx';
import Footer from '../components/site/Footer.jsx';
import BookPlanner from '../components/popups/BookPlanner.jsx';
import ServiceSheet from '../components/popups/ServiceSheet.jsx';
import VideoLightbox from '../components/popups/VideoLightbox.jsx';
import CoverViewer from '../components/popups/CoverViewer.jsx';
import OfferSlip from '../components/popups/OfferSlip.jsx';
import { CookieSlip, QuickContact } from '../components/popups/CornerSlips.jsx';
import { api } from '../lib/api.js';
import { getLenis, ScrollTrigger, scrollToTarget, startSmoothScroll, stopSmoothScroll } from '../lib/motion.js';

function Shell() {
  const { pathname, hash } = useLocation();
  const { consent } = useSite();

  useEffect(() => {
    startSmoothScroll();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => stopSmoothScroll();
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (hash) {
      const t = setTimeout(() => scrollToTarget(hash, -8), 250);
      return () => clearTimeout(t);
    }
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    const r = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(r);
  }, [pathname, hash]);

  useEffect(() => {
    if (consent === 'yes') api.track(pathname);
  }, [pathname, consent]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Spine />
      <div className="site">
        <Header />
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
      </div>
      <BookPlanner />
      <ServiceSheet />
      <VideoLightbox />
      <CoverViewer />
      <OfferSlip />
      <CookieSlip />
      <QuickContact />
    </>
  );
}

export default function SiteLayout() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  );
}
