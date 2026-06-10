import { useEffect, useMemo, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f' };
const COLS = 8;
const ROWS = 6;

// Each grid cell splits into two triangles that exactly tile it, so the shards
// reassemble into a seamless cover with no gaps.
const TRI_A = 'polygon(0 0, 100% 0, 0 100%)';
const TRI_B = 'polygon(100% 0, 100% 100%, 0 100%)';

type Shard = {
  col: number;
  row: number;
  clip: string;
  dx: number;
  dy: number;
  rot: number;
};

/**
 * Shatter transition: triangular shards fly in from beyond the edges, spinning,
 * and snap together into a solid pane. Drop-in compatible with the other
 * transitions — mount at the page root, flip `launching`, await `onDone`.
 */
export function ShatterShards({ launching, onDone }: TransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  const shards = useMemo<Shard[]>(() => {
    const list: Shard[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        [TRI_A, TRI_B].forEach((clip) => {
          const angle = Math.random() * Math.PI * 2;
          const reach = 90 + Math.random() * 60;
          list.push({
            col,
            row,
            clip,
            dx: Math.cos(angle) * reach,
            dy: Math.sin(angle) * reach,
            rot: (Math.random() - 0.5) * 220,
          });
        });
      }
    }
    return list;
  }, []);

  useEffect(() => {
    if (!launching || played.current) return;
    played.current = true;
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) {
      onDone();
      return;
    }
    const pieces = overlay.querySelectorAll('.shard');
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    tl.fromTo(
      pieces,
      {
        autoAlpha: 0,
        scale: 0.4,
        xPercent: (i) => shards[i].dx,
        yPercent: (i) => shards[i].dy,
        rotate: (i) => shards[i].rot,
      },
      {
        autoAlpha: 1,
        // Settle a touch oversized to hide hairline seams between triangles.
        scale: 1.04,
        xPercent: 0,
        yPercent: 0,
        rotate: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: { each: 0.01, from: 'edges', grid: [ROWS, COLS * 2] },
      },
      0,
    );
    tl.to({}, { duration: 0.3 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone, shards]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] grid opacity-0"
      style={{
        pointerEvents: 'none',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
      aria-hidden
    >
      {shards.map((s, i) => (
        <span
          key={i}
          className="shard block h-full w-full"
          style={{
            gridColumn: s.col + 1,
            gridRow: s.row + 1,
            clipPath: s.clip,
            background:
              s.clip === TRI_A
                ? `linear-gradient(135deg, ${ACCENT_HEX.teal}, ${ACCENT_HEX.navy})`
                : `linear-gradient(135deg, ${ACCENT_HEX.navy}, ${ACCENT_HEX.teal})`,
          }}
        />
      ))}
    </div>
  );
}
