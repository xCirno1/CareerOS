import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { Icons } from '@/lib/icons';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f', amber: '#f2b95e' };
const TOP_FLOOR = 12;

/**
 * Elevator transition (career-themed): a panel rises into frame, a floor
 * counter ticks up to the top, an arrow flips to a check, and "Arrived" lands.
 * Drop-in compatible with the other transitions — mount at the page root.
 */
export function ElevatorRise({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    const num = numberRef.current;
    if (!overlay || !num || prefersReducedMotion()) {
      onDone();
      return;
    }
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(panelRef.current, { yPercent: 100 });
    gsap.set(checkRef.current, { autoAlpha: 0, scale: 0.4 });

    // Cabin slides up into view.
    tl.to(panelRef.current, { yPercent: 0, duration: 0.6, ease: 'power3.out' }, 0);

    // Floor counter ticks up with a little bob, like a real indicator.
    const counter = { n: 1 };
    tl.to(
      counter,
      {
        n: TOP_FLOOR,
        duration: 1.6,
        ease: 'power2.inOut',
        snap: { n: 1 },
        onUpdate: () => {
          num.textContent = String(Math.round(counter.n));
        },
      },
      0.35,
    );
    tl.fromTo(
      arrowRef.current,
      { y: 4 },
      { y: -4, duration: 0.4, ease: 'sine.inOut', repeat: 3, yoyo: true },
      0.35,
    );

    // Arrival: arrow swaps to a check, label rises.
    tl.to(arrowRef.current, { autoAlpha: 0, scale: 0.4, duration: 0.25, ease: 'power1.in' }, 2.0);
    tl.to(checkRef.current, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 2.1);
    tl.fromTo(
      labelRef.current,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      2.2,
    );
    tl.to({}, { duration: 0.45 });
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
      <div
        ref={panelRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: `linear-gradient(160deg, ${ACCENT_HEX.navy}, #0c1d2e)` }}
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div ref={arrowRef} className="absolute" style={{ color: ACCENT_HEX.amber }}>
            <Icons.ArrowUp size={56} strokeWidth={2.4} />
          </div>
          <div ref={checkRef} className="absolute" style={{ color: ACCENT_HEX.teal }}>
            <Icons.Check size={56} strokeWidth={2.6} />
          </div>
        </div>
        <div
          ref={numberRef}
          className="mt-4 font-mono text-7xl font-extrabold tabular-nums text-white"
          style={{ textShadow: `0 0 30px ${ACCENT_HEX.teal}88` }}
        >
          1
        </div>
        <div
          ref={labelRef}
          className="mt-2 font-display text-xl font-bold tracking-wide text-white/80 opacity-0"
        >
          Top floor — you've arrived.
        </div>
      </div>
    </div>
  );
}
