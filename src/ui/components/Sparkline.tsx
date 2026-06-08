import { useId } from 'react';
import { cn } from '@/lib/cn';

/** Lightweight inline sparkline with an area fill, driven by 0..1 values. */
export function Sparkline({
  data,
  width = 120,
  height = 40,
  tone = 'brand',
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  tone?: 'brand' | 'amber' | 'wine' | 'emerald';
  className?: string;
}) {
  const id = useId();
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pad = 3;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (d - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]},${height} L${pts[0][0]},${height} Z`;

  const strokes: Record<string, string> = {
    brand: 'stroke-brand',
    amber: 'stroke-amber',
    wine: 'stroke-wine',
    emerald: 'stroke-emerald-500',
  };
  const fills: Record<string, string> = {
    brand: 'text-brand',
    amber: 'text-amber',
    wine: 'text-wine',
    emerald: 'text-emerald-500',
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', fills[tone], className)}
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} stroke="none" />
      <path
        d={line}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokes[tone]}
      />
      <circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r={2.6}
        className={cn('fill-current', strokes[tone])}
      />
    </svg>
  );
}
