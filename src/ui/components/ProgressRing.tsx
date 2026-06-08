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
          <div className="text-2xl font-extrabold text-ink">
            {Math.round(animated)}
            <span className="text-base text-ink-mute">{label ?? '%'}</span>
          </div>
          {sublabel && (
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
