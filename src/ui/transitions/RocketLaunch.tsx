import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

/** Reusable rocket — usable as a decorative shape or the launch hero. */
export function RocketSVG({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 100 155" fill="none" aria-hidden>
      <path d="M50 6 C72 22 80 60 76 102 L24 102 C20 60 28 22 50 6Z" fill="#ffffff" stroke="#17324d" strokeWidth="3.5" />
      <path d="M24 90 L8 120 L24 108 Z" fill="#7e3041" />
      <path d="M76 90 L92 120 L76 108 Z" fill="#7e3041" />
      <circle cx="50" cy="48" r="14" fill="#2f7f8f" stroke="#17324d" strokeWidth="3.5" />
      <circle cx="50" cy="48" r="6" fill="#cdeae9" />
      <rect x="38" y="100" width="24" height="12" rx="3" fill="#17324d" />
      <g className="rocket-flame">
        <path className="rocket-flame-outer" d="M38 112 L50 150 L62 112 Z" fill="#f2b95e" />
        <path className="rocket-flame-inner" d="M44 112 L50 136 L56 112 Z" fill="#ffd98a" />
      </g>
    </svg>
  );
}

const LAUNCH_CLOUDS = [
  { l: '-8%', t: '52%', s: '46vw' },
  { l: '22%', t: '66%', s: '42vw' },
  { l: '48%', t: '58%', s: '52vw' },
  { l: '74%', t: '64%', s: '44vw' },
  { l: '4%', t: '78%', s: '44vw' },
  { l: '40%', t: '82%', s: '46vw' },
  { l: '68%', t: '82%', s: '42vw' },
  { l: '-6%', t: '28%', s: '38vw' },
  { l: '64%', t: '26%', s: '40vw' },
  { l: '30%', t: '40%', s: '36vw' },
];

/**
 * Full-screen rocket-launch transition that ends covered in cloud. Mount it at
 * the page root (outside any `isolate`/transformed ancestor) so the fixed
 * overlay covers everything; flip `launching` true to play, then `onDone` fires.
 */
export function RocketLaunch({ launching, onDone }: { launching: boolean; onDone: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const launchTextRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    const rocket = rocketRef.current;
    const flame = rocket?.querySelector('.rocket-flame');
    if (!overlay || !rocket || !flame || prefersReducedMotion()) {
      onDone();
      return;
    }
    const clouds = overlay.querySelectorAll('.launch-cloud');
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(rocket, {
      x: 0,
      y: () => window.innerHeight * 0.28 + 190,
      rotate: -3,
      transformOrigin: '50% 50%',
    });
    tl.fromTo(skyRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, 0);
    tl.to(
      rocket,
      {
        y: () => -window.innerHeight - 430,
        rotate: 4,
        duration: 2.75,
        ease: 'power2.in',
      },
      0.1,
    );
    tl.fromTo(
      flame,
      { autoAlpha: 0.72 },
      {
        autoAlpha: 1,
        duration: 0.06,
        ease: 'sine.inOut',
        repeat: 44,
        yoyo: true,
      },
      0.1,
    );
    tl.fromTo(
      clouds,
      { scale: 0, autoAlpha: 0 },
      {
        scale: 1.9,
        autoAlpha: 1,
        duration: 1.2,
        ease: 'power2.out',
        stagger: { each: 0.06, from: 'random' },
      },
      2.1,
    );
    tl.fromTo(
      launchTextRef.current,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      2.35,
    );
    tl.to(
      launchTextRef.current,
      { autoAlpha: 0, y: -12, duration: 0.35, ease: 'power1.in' },
      3.85,
    );
    tl.to(whiteRef.current, { autoAlpha: 1, duration: 0.55, ease: 'power1.in' }, 3.6);
    tl.to({}, { duration: 0.2 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] opacity-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <div ref={skyRef} className="absolute inset-0 bg-gradient-to-b from-[#bfe0ee] via-[#dcecf2] to-white" />
      {LAUNCH_CLOUDS.map((c, i) => (
        <div
          key={i}
          className="launch-cloud absolute rounded-full bg-white"
          style={{ left: c.l, top: c.t, width: c.s, height: c.s }}
        />
      ))}
      <div
        ref={launchTextRef}
        className="absolute left-1/2 top-1/2 w-[min(90vw,680px)] -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
      >
        <div
          className="font-display text-4xl font-extrabold tracking-normal text-[#17324d] sm:text-6xl"
          style={{ textShadow: '0 12px 34px rgba(23, 50, 77, 0.22)' }}
        >
          Boosting your career trajectory...
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <div ref={rocketRef}>
          <RocketSVG size={150} />
        </div>
      </div>
      <div ref={whiteRef} className="absolute inset-0 bg-white opacity-0" />
    </div>
  );
}
