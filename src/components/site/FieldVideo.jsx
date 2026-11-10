import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion.js';

/**
 * Decorative, muted footage. Plays only while on screen; with reduced motion
 * it stays on its poster frame.
 */
export default function FieldVideo({ src, poster, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <video ref={ref} className={className} src={src} poster={poster} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture />;
}
