import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f', amber: '#f2b95e' };

// Dashed flight arc the plane traces across the viewport.
const TRAIL = 'M -60 660 C 300 560 380 200 720 300 C 1040 396 1120 120 1520 120';

function PlaneSVG() {
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M6 32 L58 8 L40 58 L33 38 Z" fill="#ffffff" stroke={ACCENT_HEX.navy} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M33 38 L58 8 L24 44 Z" fill="#dbe7ea" stroke={ACCENT_HEX.navy} strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Paper-plane transition: a folded plane swoops along a dashed arc across the
 * screen, then a clean panel sweeps in behind it. Drop-in compatible with the
 * other transitions — mount at the page root, flip `launching`, await `onDone`.
 */
export function PaperPlane({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    const trail = trailRef.current;
    const plane = planeRef.current;
    if (!overlay || !trail || !plane || prefersReducedMotion()) {
      onDone();
      return;
    }
    const len = trail.getTotalLength();
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(trail, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(panelRef.current, { yPercent: -100 });

    // Drive the plane along the path by sampling points; rotate to face travel.
    const proxy = { t: 0 };
    tl.to(proxy, {
      t: 1,
      duration: 1.9,
      ease: 'power1.inOut',
      onUpdate: () => {
        const p = trail.getPointAtLength(proxy.t * len);
        const ahead = trail.getPointAtLength(Math.min(len, proxy.t * len + 1));
        const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
        gsap.set(plane, { x: p.x - 32, y: p.y - 32, rotate: angle });
      },
    }, 0);

    // Dashed trail draws in just behind the plane.
    tl.to(trail, { strokeDashoffset: 0, duration: 1.7, ease: 'power1.inOut' }, 0.05);

    // Panel sweeps down to cover everything as the plane exits.
    tl.to(panelRef.current, { yPercent: 0, duration: 0.7, ease: 'power3.in' }, 1.35);
    tl.to(plane, { autoAlpha: 0, duration: 0.3 }, 1.7);
    tl.to({}, { duration: 0.2 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] overflow-hidden opacity-0"
      style={{ pointerEvents: 'none', background: `linear-gradient(to bottom, #eaf3f6, #ffffff)` }}
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice">
        <path
          ref={trailRef}
          d={TRAIL}
          fill="none"
          stroke={ACCENT_HEX.teal}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
      </svg>

      <div ref={planeRef} className="absolute left-0 top-0">
        <PlaneSVG />
      </div>

      <div
        ref={panelRef}
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${ACCENT_HEX.navy}, ${ACCENT_HEX.teal})` }}
      />
    </div>
  );
}
