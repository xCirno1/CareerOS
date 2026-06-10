import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const CLOUDS = [
  { l: '-12%', t: '52%', s: '42vw', c: '#ffffff' },
  { l: '8%', t: '38%', s: '36vw', c: '#f6fbfd' },
  { l: '30%', t: '48%', s: '44vw', c: '#ffffff' },
  { l: '56%', t: '36%', s: '40vw', c: '#eef7fb' },
  { l: '78%', t: '50%', s: '42vw', c: '#ffffff' },
  { l: '6%', t: '72%', s: '44vw', c: '#ffffff' },
  { l: '42%', t: '72%', s: '46vw', c: '#f6fbfd' },
  { l: '72%', t: '70%', s: '40vw', c: '#ffffff' },
  { l: '20%', t: '12%', s: '34vw', c: '#eef7fb' },
  { l: '62%', t: '10%', s: '38vw', c: '#ffffff' },
];

/**
 * Cloud-bloom transition: soft puffs drift outward and fill the screen.
 * Drop-in compatible with the other
 * transitions — mount at the page root, flip `launching`, await `onDone`.
 */
export function CloudBloom({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) {
      onDone();
      return;
    }
    const clouds = overlay.querySelectorAll('.soft-cloud');
    const mist = overlay.querySelector('.cloud-mist');
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(mist, { autoAlpha: 0, scale: 1.06 });
    tl.fromTo(
      clouds,
      { autoAlpha: 0, scale: 0.18, y: 32 },
      {
        autoAlpha: 1,
        scale: 1.8,
        y: 0,
        duration: 1.15,
        ease: 'power2.out',
        stagger: { each: 0.055, from: 'center' },
      },
      0,
    );
    tl.to(mist, { autoAlpha: 1, scale: 1, duration: 0.65, ease: 'sine.out' }, 0.45);
    tl.to({}, { duration: 0.3 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] overflow-hidden opacity-0"
      style={{
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, #eaf3f6, #ffffff)',
      }}
      aria-hidden
    >
      {CLOUDS.map((cloud, i) => (
        <span
          key={i}
          className="soft-cloud absolute rounded-full blur-[1px]"
          style={{
            left: cloud.l,
            top: cloud.t,
            width: cloud.s,
            height: cloud.s,
            background: cloud.c,
            boxShadow: '0 18px 60px rgba(23, 50, 77, 0.08)',
          }}
        />
      ))}
      <div
        className="cloud-mist absolute inset-0 opacity-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.95), rgba(245,250,252,0.86) 42%, #ffffff 100%)',
        }}
      />
    </div>
  );
}
