import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import type { TransitionProps } from './types';

const ACCENT_HEX = { navy: '#17324d', teal: '#2f7f8f' };
const SLATS = 14;

/**
 * Venetian-blind transition: horizontal slats rotate shut top-to-bottom until
 * the screen is closed. Drop-in compatible with the other transitions — mount
 * at the page root, flip `launching`, await `onDone`.
 */
export function VenetianSlats({ launching, onDone }: TransitionProps) {
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
    const slats = overlay.querySelectorAll('.slat');
    const tl = gsap.timeline({ onComplete: onDone });
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    tl.fromTo(
      slats,
      { rotationX: 88, autoAlpha: 0.4, transformOrigin: '50% 0%' },
      {
        rotationX: 0,
        autoAlpha: 1,
        duration: 0.6,
        ease: 'power2.inOut',
        stagger: 0.05,
      },
      0,
    );
    tl.to({}, { duration: 0.35 });
    return () => {
      tl.kill();
    };
  }, [launching, onDone]);

  return (
    <div
      ref={overlayRef}
      className="invisible fixed inset-0 z-[100] flex flex-col opacity-0"
      style={{ pointerEvents: 'none', perspective: '900px' }}
      aria-hidden
    >
      {Array.from({ length: SLATS }).map((_, i) => (
        <span
          key={i}
          className="slat block w-full flex-1"
          style={{
            // Alternating tint gives the closed blind a brushed-metal sheen.
            background:
              i % 2 === 0
                ? `linear-gradient(to bottom, ${ACCENT_HEX.navy}, ${ACCENT_HEX.teal})`
                : `linear-gradient(to bottom, ${ACCENT_HEX.teal}, ${ACCENT_HEX.navy})`,
            // Overlap each slat slightly so no gaps show mid-rotation.
            marginBottom: '-1px',
          }}
        />
      ))}
    </div>
  );
}
