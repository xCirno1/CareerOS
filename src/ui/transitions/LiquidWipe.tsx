import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f' };

// Two wavy top edges we morph between to fake fluid surface tension.
const WAVE_A =
  'M0,40 C160,8 320,72 480,40 C640,8 800,72 960,40 C1120,8 1280,72 1440,40 L1440,260 L0,260 Z';
const WAVE_B =
  'M0,40 C160,72 320,8 480,40 C640,72 800,8 960,40 C1120,72 1280,8 1440,40 L1440,260 L0,260 Z';

/**
 * Liquid wipe: a teal fluid surface swells up from the bottom, its crest
 * rippling, until it floods the viewport. Drop-in compatible with the other
 * transitions — mount at the page root, flip `launching`, await `onDone`.
 */
export function LiquidWipe({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const fluidRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<SVGPathElement>(null);
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
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(fluidRef.current, { yPercent: 100 });

    // Surface tension wobble runs continuously while the fluid rises.
    tl.fromTo(
      waveRef.current,
      { attr: { d: WAVE_A } },
      { attr: { d: WAVE_B }, duration: 0.9, ease: 'sine.inOut', repeat: 3, yoyo: true },
      0,
    );
    // Body of fluid floods upward.
    tl.to(fluidRef.current, { yPercent: 0, duration: 1.6, ease: 'power2.inOut' }, 0);
    tl.fromTo(
      labelRef.current,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      0.9,
    );
    tl.to(labelRef.current, { autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, 2.1);
    tl.to({}, { duration: 0.25 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] overflow-hidden opacity-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <div ref={fluidRef} className="absolute inset-0">
        {/* Crest of the wave, drawn just above the solid fill. */}
        <svg
          className="absolute inset-x-0 bottom-full block h-[18vh] w-full"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
        >
          <path
            ref={waveRef}
            d={WAVE_A}
            fill={ACCENT_HEX.teal}
          />
        </svg>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${ACCENT_HEX.teal}, ${ACCENT_HEX.navy})` }}
        />
      </div>

      <div
        ref={labelRef}
        className="absolute left-1/2 top-1/2 w-[min(90vw,640px)] -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
      >
        <div className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Diving in…
        </div>
      </div>
    </div>
  );
}
