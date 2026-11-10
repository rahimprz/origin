import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { DEFAULT_CONTENT } from '../../shared/seed.js';

const SiteContext = createContext(null);

const CONSENT_KEY = 'obp-consent';

export function SiteProvider({ children }) {
  const [content, setContent] = useState(() => ({
    ...DEFAULT_CONTENT,
    testimonials: DEFAULT_CONTENT.testimonials,
    portfolio: DEFAULT_CONTENT.portfolio,
  }));
  const [planner, setPlanner] = useState({ open: false, prefill: null });
  const [video, setVideo] = useState({ open: false, chapter: 0 });
  const [service, setService] = useState({ open: false, id: null });
  const [cover, setCover] = useState({ open: false, index: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [plannerUsed, setPlannerUsed] = useState(false);
  const [consent, setConsentState] = useState(() => {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  });

  const refresh = useCallback(() => {
    api
      .site()
      .then((c) => c && setContent((prev) => ({ ...prev, ...c })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const onDemo = () => refresh();
    window.addEventListener('obp:demo-change', onDemo);
    window.addEventListener('storage', onDemo);
    return () => {
      window.removeEventListener('obp:demo-change', onDemo);
      window.removeEventListener('storage', onDemo);
    };
  }, [refresh]);

  const setConsent = useCallback((value) => {
    setConsentState(value);
    try {
      if (value == null) localStorage.removeItem(CONSENT_KEY);
      else localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      content,
      consent,
      setConsent,
      planner,
      plannerUsed,
      openPlanner: (prefill = null) => {
        setService((s) => ({ ...s, open: false }));
        setPlanner({ open: true, prefill });
        setPlannerUsed(true);
      },
      closePlanner: () => setPlanner((p) => ({ ...p, open: false })),
      video,
      openVideo: (chapter = 0) => setVideo({ open: true, chapter }),
      closeVideo: () => setVideo((v) => ({ ...v, open: false })),
      service,
      openService: (id) => setService({ open: true, id }),
      closeService: () => setService((s) => ({ ...s, open: false })),
      cover,
      openCover: (index) => setCover({ open: true, index }),
      closeCover: () => setCover((c) => ({ ...c, open: false })),
      menuOpen,
      setMenuOpen,
    }),
    [content, consent, setConsent, planner, plannerUsed, video, service, cover, menuOpen],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
