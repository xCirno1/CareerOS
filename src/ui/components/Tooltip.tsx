import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** CSS-only-ish tooltip (hover/focus) — no positioning lib needed. */
export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
  className?: string;
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
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-xl bg-navy px-2.5 py-1.5 text-xs font-medium text-white shadow-glass transition-all duration-150 dark:bg-surface dark:text-ink dark:border dark:border-line/10',
          pos[side],
          open ? 'opacity-100 translate-y-0' : 'opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
