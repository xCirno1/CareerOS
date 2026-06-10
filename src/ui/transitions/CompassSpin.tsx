import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f', amber: '#f2b95e' };

/**
 * Compass transition (navigation-themed): a compass face appears, the needle
 * whirls and locks onto a heading, then a sweep floods the screen. Drop-in
 * compatible with the other transitions — mount at the page root.
 */
export function CompassSpin({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
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
    gsap.set(faceRef.current, { scale: 0.6, autoAlpha: 0 });
    gsap.set(needleRef.current, { rotate: 0, transformOrigin: '50% 50%' });
    gsap.set(sweepRef.current, { scale: 0, autoAlpha: 1 });

    // Compass swings in.
    tl.to(faceRef.current, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0);
    // Needle whirls several turns, then settles on a heading with a wobble.
    tl.to(needleRef.current, { rotate: 720 + 48, duration: 1.5, ease: 'power3.out' }, 0.3);
    tl.to(needleRef.current, { rotate: 720 + 42, duration: 0.5, ease: 'elastic.out(1, 0.4)' }, 1.8);
    // Sweep blooms from the compass centre and floods the view.
    tl.to(faceRef.current, { scale: 1.05, duration: 0.3, ease: 'power1.in' }, 2.2);
    tl.to(sweepRef.current, { scale: 4, duration: 0.8, ease: 'power3.in' }, 2.3);
    tl.to(faceRef.current, { autoAlpha: 0, duration: 0.3 }, 2.6);
    tl.to({}, { duration: 0.2 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  const ticks = Array.from({ length: 24 });

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] flex items-center justify-center overflow-hidden opacity-0"
      style={{ pointerEvents: 'none', background: `radial-gradient(circle at 50% 50%, #15304a, #0a1622)` }}
      aria-hidden
    >
      {/* Sweep disc sized to the viewport diagonal. */}
      <div
        ref={sweepRef}
        className="absolute h-[120vmax] w-[120vmax] rounded-full"
        style={{ background: `linear-gradient(135deg, ${ACCENT_HEX.teal}, ${ACCENT_HEX.navy})` }}
      />

      <div ref={faceRef} className="relative">
        <svg width={260} height={260} viewBox="0 0 260 260" fill="none" aria-hidden>
          <circle cx={130} cy={130} r={120} fill="#0d2235" stroke={ACCENT_HEX.teal} strokeWidth={3} />
          <circle cx={130} cy={130} r={120} fill="none" stroke="#ffffff" strokeWidth={1} opacity={0.15} />
          {ticks.map((_, i) => {
            const a = (i / ticks.length) * Math.PI * 2;
            const major = i % 6 === 0;
            const r1 = major ? 96 : 104;
            return (
              <line
                key={i}
                x1={130 + Math.cos(a) * r1}
                y1={130 + Math.sin(a) * r1}
                x2={130 + Math.cos(a) * 114}
                y2={130 + Math.sin(a) * 114}
                stroke="#ffffff"
                strokeWidth={major ? 2.5 : 1}
                opacity={major ? 0.7 : 0.35}
              />
            );
          })}
          <g ref={needleRef}>
            <path d="M130 34 L146 130 L130 118 L114 130 Z" fill={ACCENT_HEX.amber} />
            <path d="M130 226 L114 130 L130 142 L146 130 Z" fill="#cdd9e3" />
          </g>
          <circle cx={130} cy={130} r={9} fill="#ffffff" stroke={ACCENT_HEX.navy} strokeWidth={2.5} />
        </svg>
      </div>
    </div>
  );
}
