import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';
import Dialog from '../Dialog.jsx';
import { useSite } from '../../site/SiteContext.jsx';

/** "How a book is made": a chaptered reel that plays clip after clip. */
export default function VideoLightbox() {
  const { video, closeVideo, content, openPlanner } = useSite();
  const chapters = content.videos?.showreel || [];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (video.open) {
      setIndex(Math.min(video.chapter || 0, Math.max(0, chapters.length - 1)));
      setPlaying(true);
    }
  }, [video.open, video.chapter, chapters.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !video.open) return;
    setProgress(0);
    el.load();
    if (playing) el.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, video.open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing]);

  useEffect(() => {
    if (!video.open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, chapters.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [video.open, chapters.length]);

  const current = chapters[index];
  const last = index >= chapters.length - 1;

  return (
    <Dialog open={video.open} onClose={closeVideo} variant="full" ink="house" labelledBy="reel-title" className="reel" closeLabel="Close the video">
      <div className="reel__layout">
        <div className="reel__stage">
          {current && (
            <video
              ref={ref}
              key={current.id}
              src={current.src}
              poster={current.poster}
              muted
              playsInline
              preload="auto"
              onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
              onEnded={() => (last ? setPlaying(false) : setIndex(index + 1))}
              onClick={() => setPlaying((p) => !p)}
            />
          )}
          <ol className="reel__bars" aria-hidden="true">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <span style={{ transform: `scaleX(${i < index ? 1 : i === index ? progress : 0})` }} />
              </li>
            ))}
          </ol>
          <div className="reel__controls">
            <button type="button" className="reel__btn" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
            <button type="button" className="reel__btn" onClick={() => setIndex(last ? 0 : index + 1)} aria-label={last ? 'Watch again from the start' : 'Next chapter'}>
              <SkipForward aria-hidden="true" />
            </button>
            <p className="reel__now" aria-live="polite">
              {current ? `${String(index + 1).padStart(2, '0')} · ${current.chapter}` : ''}
            </p>
          </div>
        </div>
        <aside className="reel__side">
          <h2 id="reel-title">How a book is made</h2>
          <p className="reel__intro">Five short chapters, one team: from the first typed page to the reader’s hands.</p>
          <ol className="reel__chapters">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button type="button" className={i === index ? 'is-on' : ''} aria-current={i === index ? 'step' : undefined} onClick={() => { setIndex(i); setPlaying(true); }}>
                  <span className="reel__chapno">{String(i + 1).padStart(2, '0')}</span>
                  {c.chapter}
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn--saffron" onClick={() => { closeVideo(); setTimeout(() => openPlanner(), 320); }}>
            Start my book
          </button>
          <p className="reel__credit">Footage: Mixkit free licence.</p>
        </aside>
      </div>
    </Dialog>
  );
}
