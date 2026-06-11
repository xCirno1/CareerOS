import { Link } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { getIcon } from '@/lib/icons';
import { useAppStore } from '@/lib/appStore';
import {
  DEMAND_META,
  getNextActions,
  getNodeIcon,
  getNodeKindMeta,
  getSkillInfo,
  type CareerNode,
} from '@/lib/mockData';
import {
  Button,
  ProgressRing,
  Sparkline,
  Skeleton,
  SkeletonText,
  Tooltip,
  useToast,
} from '@/ui/components';

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

function matchTone(match: number): 'emerald' | 'brand' | 'amber' | 'wine' {
  if (match >= 80) return 'emerald';
  if (match >= 60) return 'brand';
  if (match >= 40) return 'amber';
  return 'wine';
}

export function NodeSummary({ node }: { node: CareerNode }) {
  const demand = DEMAND_META[node.demand];
  const accent = ACCENT_HEX[node.accent];
  const { isSaved, toggleSaved, setTarget } = useAppStore();
  const toast = useToast();
  const saved = isSaved(node.id);
  const RoleIcon = getIcon(getNodeIcon(node));
  const kindMeta = getNodeKindMeta(node.kind);
  const KindIcon = getIcon(kindMeta.icon);
  const nextAction = getNextActions(node)[0];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4">
        <span
          className={cn(
            'grid h-12 w-12 shrink-0 place-items-center border',
            node.kind === 'career'
              ? 'rounded-[1.15rem]'
              : node.kind === 'industry'
                ? 'rounded-xl border-dashed'
                : 'rounded-2xl',
          )}
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <RoleIcon size={24} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-line/8 px-2 py-1 text-[11px] font-bold uppercase text-ink-mute"
            style={{ color: accent }}
          >
            <KindIcon size={12} strokeWidth={2.4} />
            {kindMeta.label}
          </span>
          <h2 className="mt-0.5 line-clamp-2 text-xl font-extrabold leading-[1.15] text-ink">
            {node.title}
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <ProgressRing value={node.match} size={60} stroke={6} tone={matchTone(node.match)} />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-mute">
            Match
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink-soft">{node.summary}</p>

      <div
        className={cn(
          'mt-4 rounded-2xl border p-3.5',
          node.kind === 'industry' ? 'border-dashed' : 'border-line/10',
        )}
        style={{ backgroundColor: `${accent}10` }}
      >
        <div className="flex items-start gap-2.5">
          <KindIcon size={17} className="mt-0.5 shrink-0" style={{ color: accent }} />
          <div>
            <p className="text-sm font-bold text-ink">{kindMeta.detailTitle}</p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">{kindMeta.detailCopy}</p>
          </div>
        </div>
      </div>

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
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow">6-quarter demand</span>
          <Sparkline
            data={node.trend}
            tone={node.growth >= 0 ? 'emerald' : 'wine'}
            width={92}
            height={30}
            className="shrink-0"
          />
        </div>
      </div>

      <div className="mt-4">
        <span className="eyebrow">Top skills</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {node.topSkills.map((s) => (
            <Tooltip key={s} side="top" multiline content={getSkillInfo(s)}>
              <span
                tabIndex={0}
                className="focus-ring inline-flex cursor-help items-center gap-1 rounded-full border border-line/10 bg-line/8 px-2.5 py-1 text-xs font-semibold text-ink-soft transition hover:border-line/25 hover:bg-line/15 hover:text-ink"
              >
                {s}
                <Icons.Info size={11} className="opacity-50" />
              </span>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line/10 bg-surface-2 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow">Next move</span>
          <span className="rounded-full bg-line/8 px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
            {nextAction.effort}
          </span>
        </div>
        <p className="mt-2 text-sm font-bold text-ink">{nextAction.title}</p>
        <p className="mt-1 text-xs leading-5 text-ink-soft">{nextAction.description}</p>
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <Link to={`/node/${node.id}`} className="flex-1">
          <Button block size="sm" icon={Icons.Eye}>
            Full detail
          </Button>
        </Link>
        <Link to="/routing" className="flex-1">
          <Button
            block
            size="sm"
            variant="secondary"
            icon={Icons.Target}
            onClick={() => setTarget(node.id)}
          >
            Plan path
          </Button>
        </Link>
        <button
          onClick={() => {
            const nowSaved = toggleSaved(node.id);
            toast(nowSaved ? `Saved ${node.title}` : `Removed ${node.title}`, {
              icon: Icons.Bookmark,
              tone: nowSaved ? 'success' : 'default',
            });
          }}
          aria-label={saved ? 'Remove from saved' : 'Save role'}
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition',
            saved
              ? 'border-brand bg-brand/10 text-brand'
              : 'border-line/15 bg-surface text-ink-soft hover:border-line/30 hover:text-ink',
          )}
        >
          <Icons.Bookmark size={16} className={cn(saved && 'fill-current')} />
        </button>
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
    <div className="flex min-h-[84px] flex-col justify-between rounded-2xl border border-line/10 bg-surface p-3">
      <div className="flex items-center gap-1.5 text-ink-mute">
        <Icon size={14} className="shrink-0" />
        <span className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.08em]">{label}</span>
      </div>
      <div className={cn('mt-2 text-base font-bold leading-none text-ink', valueClass)}>{value}</div>
    </div>
  );
}

export function NodeSummarySkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12" rounded="rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-12" rounded="rounded-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-[60px] w-[60px]" rounded="rounded-full" />
          <Skeleton className="h-2.5 w-9" rounded="rounded-full" />
        </div>
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
