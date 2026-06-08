import { useEffect, useRef, useState } from 'react';

/** Respect the user's reduced-motion preference. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Generic media-query hook (e.g. useMediaQuery('(min-width: 1024px)')). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/**
 * Smooth scroll "lerp": returns a ref to attach to a tall stage element and a
 * smoothed progress value 0..1 across that element. The smoothing follows the
 * classic `current += (target - current) * factor` integration in a rAF loop,
 * matching the original CareerOS landing feel (factor ~0.12).
 */
export function useScrollLerp(factor = 0.12) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let current = 0;
    let target = 0;
    let raf = 0;
    let running = true;

    const computeTarget = () => {
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        target = 0;
        return;
      }
      // -rect.top measures how far we've scrolled into the stage.
      target = Math.min(1, Math.max(0, -rect.top / scrollable));
    };

    const tick = () => {
      if (!running) return;
      if (reduced) {
        current = target;
      } else {
        current += (target - current) * factor;
        if (Math.abs(target - current) < 0.0002) current = target;
      }
      setProgress(current);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => computeTarget();

    computeTarget();
    raf = requestAnimationFrame(tick);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [factor, reduced]);

  return { stageRef, progress };
}

/**
 * Reveal-on-scroll. Returns a ref + boolean that flips true the first time the
 * element enters the viewport. Used for storytelling staggered reveals.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit & { once?: boolean },
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const once = options?.once ?? true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      {
        threshold: options?.threshold ?? 0.2,
        rootMargin: options?.rootMargin ?? '0px 0px -10% 0px',
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.once]);

  return { ref, inView };
}

/** Simulate async loading so skeletons are exercised. */
export function useSimulatedLoading(ms = 900): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

/** Count up to a target number for animated stats. */
export function useCountUp(target: number, active: boolean, duration = 1100) {
  const [value, setValue] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration, reduced]);
  return value;
}
