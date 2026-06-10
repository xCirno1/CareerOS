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
  const toneText: Record<string, string> = {
    brand: 'text-brand',
    amber: 'text-[#8a6530] dark:text-amber',
    wine: 'text-wine dark:text-wine-soft',
    navy: 'text-navy dark:text-brand',
  };
  const toneBar: Record<string, string> = {
    brand: 'bg-brand',
    amber: 'bg-amber',
    wine: 'bg-wine',
    navy: 'bg-navy dark:bg-brand',
  };
  const up = (delta ?? 0) >= 0;
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-line/10 bg-surface px-3.5 py-3 shadow-soft transition hover:-translate-y-0.5 hover:border-line/20 hover:shadow-glass',
        className,
      )}
    >
      {/* accent hairline — colour without the heavy icon chip */}
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-[3px] opacity-70 transition group-hover:opacity-100',
          toneBar[tone],
        )}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="text-xl font-extrabold leading-none tracking-tight text-ink sm:text-[1.6rem]">
          {value}
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
              up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-wine/10 text-wine',
            )}
          >
            {up ? <Icons.TrendingUp size={11} /> : <Icons.TrendingDown size={11} />}
            {up ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold leading-tight text-ink-mute">
        <Icon size={13} strokeWidth={2.3} className={cn('shrink-0', toneText[tone])} />
        <span>{label}</span>
      </div>
    </div>
  );
}
