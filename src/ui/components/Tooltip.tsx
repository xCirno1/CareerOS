import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

/** CSS-only-ish tooltip (hover/focus) — no positioning lib needed. */
export function Tooltip({
  content,
  children,
  side = 'top',
  className,
  multiline = false,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
  className?: string;
  /** allow the bubble to wrap to a fixed width (for sentences, not labels) */
  multiline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!open) return;

    const position = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const gap = 8;
      const next: CSSProperties = { position: 'fixed' };

      if (side === 'top') {
        next.left = rect.left + rect.width / 2;
        next.top = rect.top - gap;
        next.transform = 'translate(-50%, -100%)';
      } else if (side === 'bottom') {
        next.left = rect.left + rect.width / 2;
        next.top = rect.bottom + gap;
        next.transform = 'translateX(-50%)';
      } else if (side === 'right') {
        next.left = rect.right + gap;
        next.top = rect.top + rect.height / 2;
        next.transform = 'translateY(-50%)';
      } else {
        next.left = rect.left - gap;
        next.top = rect.top + rect.height / 2;
        next.transform = 'translate(-100%, -50%)';
      }

      setStyle(next);
    };

    position();
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [open, side]);

  const tooltip =
    typeof document === 'undefined'
      ? null
      : createPortal(
          <span
            role="tooltip"
            style={style}
            className={cn(
              'pointer-events-none z-[100] rounded-xl bg-navy px-2.5 py-1.5 text-xs font-medium text-white opacity-100 shadow-glass transition-opacity duration-150 dark:border dark:border-line/10 dark:bg-surface dark:text-ink',
              multiline ? 'w-64 whitespace-normal text-left leading-snug' : 'whitespace-nowrap',
            )}
          >
            {content}
          </span>,
          document.body,
        );

  return (
    <span
      ref={triggerRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && tooltip}
    </span>
  );
}
