import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f', amber: '#f2b95e' };

const RINGS = [
  { c: ACCENT_HEX.amber, delay: 0 },
  { c: ACCENT_HEX.teal, delay: 0.12 },
  { c: ACCENT_HEX.navy, delay: 0.24 },
];

/**
 * Ripple-bloom transition: concentric ink rings expand from the centre and the
 * last one floods the viewport — a Material-style reveal. Drop-in compatible
 * with the other transitions; mount at the page root, flip `launching`.
 */
export function RippleBloom({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) {
      onDone();
      return;
    }
    const rings = overlay.querySelectorAll<HTMLDivElement>('.ripple-ring');
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });

    // Each ring bursts outward; the final navy ring fills the screen.
    rings.forEach((ring, i) => {
      const isLast = i === rings.length - 1;
      gsap.set(ring, { scale: 0, autoAlpha: 1, transformOrigin: '50% 50%' });
      tl.to(
        ring,
        {
          scale: isLast ? 3 : 2.4,
          autoAlpha: isLast ? 1 : 0,
          duration: isLast ? 0.95 : 1.1,
          ease: isLast ? 'power3.in' : 'power2.out',
        },
        RINGS[i].delay,
      );
    });

    tl.fromTo(
      labelRef.current,
      { autoAlpha: 0, scale: 0.85 },
      { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
      0.8,
    );
    tl.to(labelRef.current, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, 1.5);
    tl.to({}, { duration: 0.25 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  // Rings are sized to the viewport diagonal so scale:1 already touches edges.
  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] flex items-center justify-center overflow-hidden opacity-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      {RINGS.map((r, i) => (
        <div
          key={i}
          className="ripple-ring absolute h-[150vmax] w-[150vmax] rounded-full"
          style={{ backgroundColor: r.c }}
        />
      ))}
      <div
        ref={labelRef}
        className="relative font-display text-4xl font-extrabold tracking-tight text-white opacity-0 sm:text-6xl"
      >
        Let's go.
      </div>
    </div>
  );
}
