import { Link } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { DEMAND_META, type CareerNode } from '@/lib/mockData';
import {
  Badge,
  Button,
  ProgressRing,
  Sparkline,
  Skeleton,
  SkeletonText,
} from '@/ui/components';

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

export function NodeSummary({ node }: { node: CareerNode }) {
  const demand = DEMAND_META[node.demand];
  const accent = ACCENT_HEX[node.accent];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Icons.CircleDot size={22} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <Badge tone="neutral" className="capitalize">
            {node.kind}
          </Badge>
          <h2 className="mt-1.5 text-lg font-bold leading-tight text-ink">{node.title}</h2>
        </div>
        <ProgressRing value={node.match} size={64} stroke={6} sublabel="match" />
      </div>

      <p className="mt-3 text-sm leading-6 text-ink-soft">{node.summary}</p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Metric
          icon={Icons.Banknote}
          label="Salary band"
          value={
            node.salary.max
              ? `${node.salary.currency}${node.salary.min}–${node.salary.max}k`
              : '—'
          }
        />
        <Metric
          icon={Icons.Activity}
          label="Demand"
          value={demand.label}
          valueClass={demand.tone}
        />
        <Metric
          icon={Icons.TrendingUp}
          label="Growth"
          value={`${node.growth > 0 ? '+' : ''}${node.growth}%`}
        />
        <Metric
          icon={Icons.Briefcase}
          label="Open roles"
          value={node.openRoles ? node.openRoles.toLocaleString() : '—'}
        />
      </div>

      <div className="mt-4 rounded-2xl bg-surface-2 p-3.5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">6-quarter demand</span>
          <Sparkline data={node.trend} tone={node.growth >= 0 ? 'emerald' : 'wine'} width={92} height={30} />
        </div>
      </div>

      <div className="mt-4">
        <span className="eyebrow">Top skills</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {node.topSkills.map((s) => (
            <span
              key={s}
              className="rounded-full bg-line/8 px-2.5 py-1 text-xs font-semibold text-ink-soft"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <Link to={`/node/${node.id}`} className="flex-1">
          <Button block size="sm" icon={Icons.Eye}>
            Full detail
          </Button>
        </Link>
        <Link to="/routing" className="flex-1">
          <Button block size="sm" variant="secondary" icon={Icons.Route}>
            Route here
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: typeof Icons.Banknote;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-line/10 bg-surface p-3">
      <div className="flex items-center gap-1.5 text-ink-mute">
        <Icon size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">{label}</span>
      </div>
      <div className={cn('mt-1 text-base font-bold text-ink', valueClass)}>{value}</div>
    </div>
  );
}

export function NodeSummarySkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11" rounded="rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" rounded="rounded-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <Skeleton className="h-16 w-16" rounded="rounded-full" />
      </div>
      <SkeletonText className="mt-4" lines={3} />
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16" rounded="rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-4 h-16" rounded="rounded-2xl" />
      <div className="mt-4 flex flex-wrap gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16" rounded="rounded-full" />
        ))}
      </div>
    </div>
  );
}
