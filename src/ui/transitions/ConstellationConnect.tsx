import { useEffect, useMemo, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f', amber: '#f2b95e', wine: '#7e3041' };

// A hand-laid path of nodes that reads like a career route drawing itself.
const NODES = [
  { x: 140, y: 620, c: ACCENT_HEX.teal },
  { x: 320, y: 470, c: ACCENT_HEX.teal },
  { x: 520, y: 540, c: ACCENT_HEX.amber },
  { x: 700, y: 360, c: ACCENT_HEX.teal },
  { x: 900, y: 430, c: ACCENT_HEX.wine },
  { x: 1080, y: 250, c: ACCENT_HEX.amber },
  { x: 1280, y: 320, c: ACCENT_HEX.teal },
];
const W = 1440;
const H = 760;

/**
 * Constellation transition (on-theme with Traileers): scattered career nodes
 * fade in, edges draw between them one by one, a comet pulse races the route,
 * then the whole field blooms to white. Drop-in compatible with the others.
 */
export function ConstellationConnect({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  const edgeLen = useMemo(
    () =>
      NODES.slice(1).map((n, i) =>
        Math.hypot(n.x - NODES[i].x, n.y - NODES[i].y),
      ),
    [],
  );

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) {
      onDone();
      return;
    }
    const dots = overlay.querySelectorAll('.cc-node');
    const edges = overlay.querySelectorAll<SVGPathElement>('.cc-edge');
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });

    // Nodes pop in.
    tl.fromTo(
      dots,
      { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' },
      { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.07 },
      0,
    );

    // Edges draw sequentially, chasing the nodes.
    edges.forEach((edge, i) => {
      const len = edgeLen[i];
      gsap.set(edge, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 1 });
      tl.to(edge, { strokeDashoffset: 0, duration: 0.32, ease: 'power1.inOut' }, 0.45 + i * 0.26);
    });

    // Comet pulse rides the route from first node to last.
    const lastEnd = 0.45 + (NODES.length - 1) * 0.26;
    gsap.set(pulseRef.current, { autoAlpha: 0 });
    tl.set(pulseRef.current, { autoAlpha: 1 }, 0.55);
    NODES.forEach((n, i) => {
      tl.to(
        pulseRef.current,
        { attr: { cx: n.x, cy: n.y }, duration: 0.26, ease: 'power1.inOut' },
        0.55 + i * 0.26,
      );
    });

    // Final node flares, then the field blooms to white.
    tl.to(pulseRef.current, { attr: { r: 60 }, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, lastEnd);
    tl.to(flashRef.current, { autoAlpha: 1, duration: 0.6, ease: 'power2.in' }, lastEnd + 0.1);
    tl.to({}, { duration: 0.25 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone, edgeLen]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] overflow-hidden opacity-0"
      style={{ pointerEvents: 'none', background: `radial-gradient(circle at 50% 40%, #15304a, #0a1622)` }}
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        {NODES.slice(1).map((n, i) => (
          <path
            key={`e${i}`}
            className="cc-edge"
            d={`M ${NODES[i].x} ${NODES[i].y} L ${n.x} ${n.y}`}
            stroke={ACCENT_HEX.teal}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            opacity={0}
          />
        ))}
        {NODES.map((n, i) => (
          <g key={`n${i}`} className="cc-node">
            <circle cx={n.x} cy={n.y} r={22} fill={n.c} opacity={0.18} />
            <circle cx={n.x} cy={n.y} r={11} fill={n.c} stroke="#ffffff" strokeWidth={2.5} />
          </g>
        ))}
        <circle ref={pulseRef} cx={NODES[0].x} cy={NODES[0].y} r={9} fill="#ffffff">
        </circle>
      </svg>
      <div ref={flashRef} className="absolute inset-0 bg-white opacity-0" />
    </div>
  );
}
