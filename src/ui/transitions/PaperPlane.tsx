import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f', amber: '#f2b95e' };

const CLOUDS = [
  { l: '-10%', t: '58%', s: '42vw', c: '#ffffff' },
  { l: '12%', t: '46%', s: '38vw', c: '#f7fbfd' },
  { l: '36%', t: '52%', s: '46vw', c: '#ffffff' },
  { l: '63%', t: '40%', s: '44vw', c: '#f3f9fc' },
  { l: '82%', t: '56%', s: '38vw', c: '#ffffff' },
  { l: '2%', t: '24%', s: '34vw', c: '#eef7fb' },
  { l: '29%', t: '18%', s: '40vw', c: '#ffffff' },
  { l: '58%', t: '20%', s: '36vw', c: '#eef7fb' },
  { l: '78%', t: '18%', s: '40vw', c: '#ffffff' },
  { l: '24%', t: '76%', s: '44vw', c: '#ffffff' },
  { l: '58%', t: '74%', s: '48vw', c: '#f6fbfd' },
];

function PlaneSVG() {
  return (
    <g aria-hidden>
      <path
        d="M0 0 L-58 -24 L-38 2 L-50 28 Z"
        fill="#ffffff"
        stroke={ACCENT_HEX.navy}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d="M-38 2 L0 0 L-56 20 Z"
        fill="#dbe7ea"
        stroke={ACCENT_HEX.navy}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </g>
  );
}

function buildTrail(width: number, height: number) {
  const startX = -90;
  const endX = width + 110;
  const startY = height * 0.72;
  const endY = height * 0.18;

  return [
    `M ${startX} ${startY}`,
    `C ${width * 0.18} ${height * 0.63}`,
    `${width * 0.28} ${height * 0.2}`,
    `${width * 0.5} ${height * 0.36}`,
    `C ${width * 0.72} ${height * 0.52}`,
    `${width * 0.78} ${height * 0.2}`,
    `${endX} ${endY}`,
  ].join(' ');
}

/**
 * Paper-plane transition: a folded plane swoops along a dashed arc across the
 * screen, then disappears into a soft cloud bloom. Drop-in compatible with the other
 * transitions — mount at the page root, flip `launching`, await `onDone`.
 */
export function PaperPlane({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const cloudLayerRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    const svg = svgRef.current;
    const trail = trailRef.current;
    const plane = planeRef.current;
    const cloudLayer = cloudLayerRef.current;
    if (!overlay || !svg || !trail || !plane || !cloudLayer || prefersReducedMotion()) {
      onDone();
      return;
    }
    const { width, height } = overlay.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    trail.setAttribute('d', buildTrail(width, height));

    const clouds = cloudLayer.querySelectorAll('.plane-cloud');
    const len = trail.getTotalLength();
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(trail, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(cloudLayer, { autoAlpha: 1 });
    gsap.set(clouds, {
      autoAlpha: 0,
      scale: 0.16,
      y: 28,
      transformOrigin: '50% 50%',
    });
    gsap.set(mistRef.current, {
      autoAlpha: 0,
      scale: 1.04,
    });

    // Drive the plane along the path by sampling points; rotate to face travel.
    const proxy = { t: 0 };
    const setPlaneAt = (progress: number) => {
      const current = progress * len;
      const p = trail.getPointAtLength(current);
      const ahead = trail.getPointAtLength(Math.min(len, current + 6));
      const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
      gsap.set(plane, {
        attr: {
          transform: `translate(${p.x} ${p.y}) rotate(${angle})`,
        },
      });
      gsap.set(trail, { strokeDashoffset: (1 - progress) * len });
    };
    setPlaneAt(0);

    tl.to(proxy, {
      t: 1,
      duration: 1.9,
      ease: 'power1.inOut',
      onUpdate: () => {
        setPlaneAt(proxy.t);
      },
    }, 0);

    // The plane disappears into a soft cloud bloom instead of a hard panel wipe.
    tl.to(
      clouds,
      {
        autoAlpha: 1,
        scale: 1.72,
        y: 0,
        duration: 1.15,
        ease: 'power2.out',
        stagger: { each: 0.055, from: 'center' },
      },
      1.25,
    );
    tl.to(
      mistRef.current,
      { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'sine.out' },
      1.62,
    );
    tl.to(plane, { autoAlpha: 0, duration: 0.24 }, 1.68);
    tl.to({}, { duration: 0.25 });
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
      <svg ref={svgRef} className="absolute inset-0 h-full w-full" viewBox="0 0 1440 760" preserveAspectRatio="none">
        <path
          ref={trailRef}
          d={buildTrail(1440, 760)}
          fill="none"
          stroke={ACCENT_HEX.teal}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        <g ref={planeRef}>
          <PlaneSVG />
        </g>
      </svg>

      <div ref={cloudLayerRef} className="absolute inset-0 opacity-0">
        {CLOUDS.map((cloud, i) => (
          <div
            key={i}
            className="plane-cloud absolute rounded-full blur-[1px]"
            style={{
              left: cloud.l,
              top: cloud.t,
              width: cloud.s,
              height: cloud.s,
              background: cloud.c,
              boxShadow: '0 18px 55px rgba(23, 50, 77, 0.08)',
            }}
          />
        ))}
      </div>
      <div
        ref={mistRef}
        className="absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(circle at 70% 24%, rgba(255,255,255,0.96), rgba(255,255,255,0.7) 34%, rgba(242,248,251,0.96) 68%, #ffffff 100%)',
        }}
      />
    </div>
  );
}
