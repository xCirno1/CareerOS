import { cn } from '@/lib/cn';
import type { LucideIcon } from '@/lib/icons';
import { Icons } from '@/lib/icons';

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  tone = 'brand',
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number;
  tone?: 'brand' | 'amber' | 'wine' | 'navy';
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand/10 text-brand',
    amber: 'bg-amber/15 text-[#8a6530] dark:text-amber',
    wine: 'bg-wine/10 text-wine dark:text-wine-soft',
    navy: 'bg-navy/8 text-navy dark:bg-brand/10 dark:text-brand',
  };
  const up = (delta ?? 0) >= 0;
  return (
    <div className={cn('card p-4', className)}>
      <div className="flex items-center justify-between">
        <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tones[tone])}>
          <Icon size={17} strokeWidth={2.2} />
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-bold',
              up ? 'text-emerald-500' : 'text-wine',
            )}
          >
            {up ? <Icons.TrendingUp size={13} /> : <Icons.TrendingDown size={13} />}
            {up ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-extrabold tracking-tight text-ink">{value}</div>
      <div className="text-xs font-medium text-ink-mute">{label}</div>
    </div>
  );
}
