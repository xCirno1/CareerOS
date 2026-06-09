import { useInView, useCountUp } from '@/lib/hooks';
import { cn } from '@/lib/cn';

/**
 * Circular feasibility/score ring with an animated sweep + count-up that fires
 * when scrolled into view.
 */
export function ProgressRing({
  value,
  size = 116,
  stroke = 9,
  label,
  sublabel,
  tone = 'brand',
  className,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  tone?: 'brand' | 'amber' | 'wine' | 'emerald';
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, threshold: 0.4 });
  const animated = useCountUp(value, inView);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (animated / 100) * c;

  const colors: Record<string, string> = {
    brand: 'stroke-brand',
    amber: 'stroke-amber',
    wine: 'stroke-wine',
    emerald: 'stroke-emerald-500',
  };
  const compact = size <= 72;
  const mid = size > 72 && size <= 100;

  return (
    <div
      ref={ref}
      className={cn('relative grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn('transition-[stroke-dashoffset] duration-300', colors[tone])}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className={cn(
              'flex items-baseline justify-center font-extrabold leading-none tracking-tight text-ink',
              compact ? 'text-[1.4rem]' : mid ? 'text-2xl' : 'text-3xl',
            )}
          >
            {Math.round(animated)}
            <span
              className={cn(
                'ml-px font-bold text-ink-mute',
                compact ? 'text-[0.7rem]' : mid ? 'text-sm' : 'text-base',
              )}
            >
              {label ?? '%'}
            </span>
          </div>
          {sublabel && (
            <div
              className={cn(
                'mt-1 font-semibold uppercase text-ink-mute',
                compact ? 'text-[8px] tracking-[0.1em]' : 'text-[10px] tracking-[0.14em]',
              )}
            >
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
