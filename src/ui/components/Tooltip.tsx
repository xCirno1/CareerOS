import { useState, type ReactNode } from 'react';
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
  const pos: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 rounded-xl bg-navy px-2.5 py-1.5 text-xs font-medium text-white shadow-glass transition-all duration-150 dark:border dark:border-line/10 dark:bg-surface dark:text-ink',
          multiline ? 'w-64 whitespace-normal text-left leading-snug' : 'whitespace-nowrap',
          pos[side],
          open ? 'translate-y-0 opacity-100' : 'opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
