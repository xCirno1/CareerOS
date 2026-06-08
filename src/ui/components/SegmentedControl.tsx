import { cn } from '@/lib/cn';
import type { LucideIcon } from '@/lib/icons';

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  size = 'md',
  className,
}: {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-2xl border border-line/10 bg-surface-2 p-1',
        className,
      )}
      role="tablist"
    >
      {segments.map((seg) => {
        const active = seg.value === value;
        const Icon = seg.icon;
        return (
          <button
            key={seg.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(seg.value)}
            className={cn(
              'focus-ring inline-flex items-center gap-1.5 rounded-xl font-semibold transition',
              size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-3.5 text-sm',
              active
                ? 'bg-surface text-ink shadow-soft'
                : 'text-ink-mute hover:text-ink-soft',
            )}
          >
            {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />}
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
