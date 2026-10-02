import { useEffect, useRef } from 'react';
import './cinematic.css';

type SceneImage = {
  src: string;
  alt?: string;
  width: number;
  height: number;
  priority?: boolean;
  testId?: string;
  imageClassName?: string;
};

/** A decorative camera move on the image only. Scrolling and content stay native. */
export function CinematicScene({ src, alt = '', width, height, priority, testId, imageClassName = '' }: SceneImage) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element || typeof IntersectionObserver === 'undefined' || typeof window.matchMedia !== 'function') return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame = 0;

    const paint = () => {
      frame = 0;
      if (!visible || preference.matches || document.hidden) return;
      const offset = Math.max(-28, Math.min(28, -element.getBoundingClientRect().top * .06));
      element.style.setProperty('--scene-offset', `${offset.toFixed(1)}px`);
    };
    const schedule = () => {
      if (visible && !preference.matches && !document.hidden && !frame) frame = requestAnimationFrame(paint);
    };
    const motionChanged = () => {
      if (preference.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        element.style.removeProperty('--scene-offset');
      } else schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      element.dataset.visible = String(visible);
      if (visible) schedule();
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(element);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    preference.addEventListener('change', motionChanged);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', schedule);
      preference.removeEventListener('change', motionChanged);
    };
  }, []);

  return <div ref={host} className="cinematic-scene" aria-hidden={alt ? undefined : true}>
    <img className={`cinematic-scene-image ${imageClassName}`} src={src} alt={alt} width={width} height={height}
      loading={priority ? 'eager' : 'lazy'} decoding="async" {...(priority ? { fetchpriority: 'high' } : {})} data-testid={testId} />
  </div>;
}
