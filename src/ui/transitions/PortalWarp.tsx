import { useEffect, useMemo, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f', amber: '#f2b95e' };

type Star = { angle: number; dist: number; len: number; w: number; hue: string };

/**
 * Warp-speed transition: a field of stars streaks outward from the centre while
 * a glowing portal ring blooms open and swallows the screen. Drop-in compatible
 * with `RocketLaunch` — mount at the page root, flip `launching`, await `onDone`.
 */
export function PortalWarp({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  const stars = useMemo<Star[]>(() => {
    const hues = [ACCENT_HEX.teal, ACCENT_HEX.amber, '#cdeae9', '#ffffff'];
    return Array.from({ length: 80 }, (_, i) => ({
      angle: Math.random() * 360,
      dist: 40 + Math.random() * 80,
      len: 60 + Math.random() * 160,
      w: 1 + Math.random() * 2.5,
      hue: hues[i % hues.length],
    }));
  }, []);

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) {
      onDone();
      return;
    }
    const beams = overlay.querySelectorAll('.warp-star');
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(coreRef.current, { scale: 0, autoAlpha: 1 });
    gsap.set(ringRef.current, { scale: 0, autoAlpha: 0 });

    // Core pinpoint of light ignites.
    tl.to(coreRef.current, { scale: 1, duration: 0.4, ease: 'power2.out' }, 0);

    // Stars streak outward, accelerating into hyperspace.
    tl.fromTo(
      beams,
      { scaleY: 0, autoAlpha: 0, transformOrigin: '50% 0%' },
      {
        scaleY: 1,
        autoAlpha: 1,
        duration: 1.1,
        ease: 'power3.in',
        stagger: { each: 0.012, from: 'random' },
      },
      0.15,
    );
    tl.to(beams, { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, 1.2);

    // Portal ring blooms open and engulfs everything.
    tl.fromTo(
      ringRef.current,
      { scale: 0, autoAlpha: 0, rotate: 0 },
      { scale: 1, autoAlpha: 1, rotate: 220, duration: 1.5, ease: 'power2.inOut' },
      0.6,
    );
    tl.to(ringRef.current, { scale: 9, autoAlpha: 0, duration: 0.9, ease: 'power3.in' }, 1.7);
    tl.to(coreRef.current, { scale: 22, duration: 0.7, ease: 'power3.in' }, 1.85);
    tl.to(flashRef.current, { autoAlpha: 1, duration: 0.45, ease: 'power2.in' }, 2.2);
    tl.to({}, { duration: 0.2 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] overflow-hidden bg-[#0a1622] opacity-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {stars.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180;
          return (
            <span
              key={i}
              className="warp-star absolute block rounded-full"
              style={{
                width: s.w,
                height: s.len,
                left: Math.cos(rad) * s.dist,
                top: Math.sin(rad) * s.dist,
                background: `linear-gradient(to bottom, transparent, ${s.hue})`,
                transform: `rotate(${s.angle + 90}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Spinning portal ring */}
      <div
        ref={ringRef}
        className="absolute left-1/2 top-1/2 h-[44vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          border: `3px solid ${ACCENT_HEX.teal}`,
          boxShadow: `0 0 60px 10px ${ACCENT_HEX.teal}, inset 0 0 60px 6px ${ACCENT_HEX.amber}`,
          background: `conic-gradient(from 0deg, transparent, ${ACCENT_HEX.teal}55, ${ACCENT_HEX.amber}66, transparent, ${ACCENT_HEX.teal}55, transparent)`,
        }}
      />

      {/* Bright core */}
      <div
        ref={coreRef}
        className="absolute left-1/2 top-1/2 h-[8vmin] w-[8vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ boxShadow: `0 0 50px 18px ${ACCENT_HEX.amber}, 0 0 120px 40px ${ACCENT_HEX.teal}` }}
      />

      <div ref={flashRef} className="absolute inset-0 bg-white opacity-0" />
    </div>
  );
}
