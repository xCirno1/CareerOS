import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import type { LucideIcon } from '@/lib/icons';

type Tone = 'brand' | 'amber' | 'wine' | 'neutral' | 'emerald' | 'navy';

const tones: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  amber: 'bg-amber/15 text-[#8a6530] dark:text-amber',
  wine: 'bg-wine/10 text-wine dark:text-wine-soft',
  emerald: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
  navy: 'bg-navy/8 text-navy dark:bg-brand/10 dark:text-brand',
  neutral: 'bg-line/8 text-ink-soft',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: LucideIcon;
  dot?: boolean;
}

export function Badge({
  tone = 'neutral',
  icon: Icon,
  dot,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {Icon && <Icon size={12} strokeWidth={2.4} />}
      {children}
    </span>
  );
}
