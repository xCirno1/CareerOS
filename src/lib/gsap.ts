/**
 * Single place that registers GSAP plugins so the whole app shares one
 * instance. Import `gsap` / `ScrollTrigger` from here, not from 'gsap'.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** Honor the user's reduced-motion setting before running any animation. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
