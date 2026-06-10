import { useEffect, useMemo, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f', amber: '#f2b95e' };
const COLS = 10;
const ROWS = 7;

/**
 * Mosaic-flip transition: a grid of tiles flips in from edge-on across a
 * diagonal wave until the screen is tiled. Drop-in compatible with the other
 * transitions — mount at the page root, flip `launching`, await `onDone`.
 */
export function MosaicFlip({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  // Pre-pick a tint per tile so the finished pane has subtle depth.
  const tints = useMemo(
    () =>
      Array.from({ length: COLS * ROWS }, () => {
        const r = Math.random();
        return r < 0.12 ? ACCENT_HEX.amber : r < 0.5 ? ACCENT_HEX.teal : ACCENT_HEX.navy;
      }),
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
    const tiles = overlay.querySelectorAll('.mosaic-tile');
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    tl.fromTo(
      tiles,
      { rotationY: -92, autoAlpha: 0, transformOrigin: '50% 50%' },
      {
        rotationY: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: 'power2.out',
        // Diagonal wave: tiles near the top-left land first.
        stagger: { each: 0.035, from: 'start', grid: [ROWS, COLS] },
      },
      0,
    );
    tl.to({}, { duration: 0.3 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] grid opacity-0"
      style={{
        pointerEvents: 'none',
        perspective: '1200px',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
      aria-hidden
    >
      {tints.map((c, i) => (
        <span
          key={i}
          className="mosaic-tile block h-full w-full"
          // Slight overlap hides sub-pixel seams between tiles.
          style={{ background: c, boxShadow: `inset 0 0 0 0.5px ${c}` }}
        />
      ))}
    </div>
  );
}
