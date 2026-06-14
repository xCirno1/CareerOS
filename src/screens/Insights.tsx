import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icons, getIcon, type LucideIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useSimulatedLoading, useReducedMotion } from '@/lib/hooks';
import {
  NODES,
  DEMAND_META,
  CURRENT_NODE_ID,
  TARGET_NODE_ID,
  getNodeIcon,
  getNodeKindMeta,
  type CareerNode,
  type Demand,
} from '@/lib/mockData';
import {
  Card,
  Badge,
  Skeleton,
  SkeletonText,
  SegmentedControl,
  type Segment,
} from '@/ui/components';

/* ------------------------------------------------------------------ */
/*  Shared market math + palettes                                      */
/* ------------------------------------------------------------------ */

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

/** Distinct, on-brand series colors so every role reads apart in a chart. */
const SERIES_COLOR: Record<string, string> = {
  'frontend-dev': '#2f7f8f',
  'fullstack-dev': '#0ea5e9',
  'design-eng': '#7e3041',
  'eng-manager': '#17324d',
  'product-lead': '#f2b95e',
  'data-analyst': '#10b981',
  devrel: '#f43f5e',
  'ai-eng': '#8b5cf6',
  mba: '#64748b',
  'startup-founder': '#f59e0b',
};
const roleColor = (id: string) => SERIES_COLOR[id] ?? '#2f7f8f';

/** A coarse demand index so "Demand" can be ranked + plotted numerically. */
const DEMAND_SCORE: Record<Demand, number> = {
  surging: 96,
  high: 78,
  steady: 58,
  cooling: 34,
};
const DEMAND_COLOR: Record<Demand, string> = {
  surging: '#10b981',
  high: '#2f7f8f',
  steady: '#17324d',
  cooling: '#7e3041',
};
const DEMAND_ORDER: Demand[] = ['surging', 'high', 'steady', 'cooling'];

const medianSalary = (n: CareerNode) => (n.salary.max ? (n.salary.min + n.salary.max) / 2 : 0);
const fmtK = (v: number) => (v ? `$${Math.round(v)}k` : '—');

/** Last `n` calendar quarters as compact labels, e.g. Q1'25 … Q2'26. */
function lastQuarters(n: number): string[] {
  const now = new Date();
  let q = Math.floor(now.getMonth() / 3);
  let y = now.getFullYear();
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.unshift(`Q${q + 1}'${String(y).slice(2)}`);
    q -= 1;
    if (q < 0) {
      q = 3;
      y -= 1;
    }
  }
  return out;
}

const ink = (alpha = 1) => `rgb(var(--c-ink) / ${alpha})`;
const inkMute = `rgb(var(--c-ink-mute))`;
const lineStroke = (alpha = 1) => `rgb(var(--c-line) / ${alpha})`;

/* ------------------------------------------------------------------ */
/*  Inner navigation bar                                               */
/* ------------------------------------------------------------------ */

type TabId = 'rankings' | 'salary' | 'demand' | 'history';

const TABS: { id: TabId; label: string; icon: LucideIcon; blurb: string }[] = [
  { id: 'rankings', label: 'Rankings', icon: Icons.Trophy, blurb: 'Leaderboards across every signal' },
  { id: 'salary', label: 'Salary', icon: Icons.Banknote, blurb: 'Pay bands compared side by side' },
  { id: 'demand', label: 'Demand', icon: Icons.Flame, blurb: 'Hiring heat & where it concentrates' },
  { id: 'history', label: 'History', icon: Icons.LineChart, blurb: 'Six quarters of demand trajectory' },
];

const isTabId = (value: string | null): value is TabId =>
  Boolean(value && TABS.some((tab) => tab.id === value));

function InnerNav({ tab, onTab }: { tab: TabId; onTab: (t: TabId) => void }) {
  return (
    <div className="sticky top-16 z-10 -mx-1 mb-5 py-2">
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-line/10 bg-surface/80 p-1 shadow-soft backdrop-blur-xl">
        {TABS.map((t) => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'focus-ring flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                active
                  ? 'bg-navy text-white shadow-soft dark:bg-brand/15 dark:text-brand'
                  : 'text-ink-soft hover:bg-line/5 hover:text-ink',
              )}
            >
              <Icon size={17} strokeWidth={2.2} />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function Insights() {
  const loading = useSimulatedLoading(850);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: TabId = isTabId(tabParam) ? tabParam : 'rankings';

  const setInsightsParam = (key: string, value: string | null, defaultValue?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const asOf = useMemo(
    () => new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    [],
  );

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Icons.Activity size={13} /> Market Insights
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-[2.4rem]">
            How every role stacks up
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">
            A live read on salary, demand and momentum across the whole map — ranked, compared and
            tracked over time. Pick a lens below.
          </p>
        </div>
        <Badge tone="neutral" icon={Icons.Clock} className="shrink-0">
          Updated {asOf}
        </Badge>
      </div>

      {/* KPI strip */}
      <KpiStrip loading={loading} />

      {/* Inner navigation bar */}
      <InnerNav tab={tab} onTab={(value) => setInsightsParam('tab', value, 'rankings')} />

      <div className="flex items-center gap-2 text-sm text-ink-soft">
        <Icons.Info size={15} className="text-brand" />
        {TABS.find((t) => t.id === tab)?.blurb}
      </div>

      {/* Panels — keyed so each entrance/bar animation replays on switch */}
      <div key={tab} className="mt-4">
        {loading ? (
          <PanelSkeleton />
        ) : tab === 'rankings' ? (
          <RankingsPanel />
        ) : tab === 'salary' ? (
          <SalaryPanel />
        ) : tab === 'demand' ? (
          <DemandPanel />
        ) : (
          <HistoryPanel />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI strip                                                          */
/* ------------------------------------------------------------------ */

function KpiStrip({ loading }: { loading: boolean }) {
  const totalOpen = NODES.reduce((s, n) => s + n.openRoles, 0);
  const surgingRoles = NODES.filter((n) => n.demand === 'surging').length;
  const paidRoles = [...NODES]
    .filter((n) => n.salary.max > 0)
    .sort((a, b) => medianSalary(b) - medianSalary(a));
  const topPay = medianSalary(paidRoles[0]);
  const fastest = [...NODES].sort((a, b) => b.growth - a.growth)[0];
  const growthLeaders = [...NODES].sort((a, b) => b.growth - a.growth).slice(0, 4);
  const demandLeaders = [...NODES]
    .filter((n) => n.openRoles > 0)
    .sort((a, b) => DEMAND_SCORE[b.demand] + b.growth - (DEMAND_SCORE[a.demand] + a.growth))
    .slice(0, 3);
  const topSalaryRoles = paidRoles.slice(0, 3);
  const salaryMax = Math.max(...paidRoles.map((n) => n.salary.max));

  if (loading) return <Skeleton className="my-5 h-64" rounded="rounded-3xl" />;

  return (
    <section className="my-6 border-y border-line/10 py-5" aria-label="Market snapshot">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">
            Live market intelligence
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-ink">Market Snapshot</h2>
        </div>
        <p className="text-xs font-semibold text-ink-mute">{NODES.length} roles tracked</p>
      </div>

      <div className="mt-5 grid overflow-hidden rounded-2xl border border-line/10 sm:grid-cols-2 lg:grid-cols-4">
        <PlainStat label="Open roles" value={totalOpen.toLocaleString()} tone="teal" />
        <PlainStat label="Roles surging" value={String(surgingRoles)} tone="teal" />
        <PlainStat label="Top median salary" value={fmtK(topPay)} tone="amber" />
        <PlainStat
          label="Fastest growing"
          value={`+${fastest.growth}%`}
          caption={fastest.title}
          tone="magenta"
        />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ReportPanel title="Demand momentum" tone="teal">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-xs text-ink-mute">AI and platform roles are carrying the strongest signal.</p>
          </div>
          <div className="mt-3 space-y-3">
            {demandLeaders.map((n) => (
              <QuietBar
                key={n.id}
                label={n.title}
                value={DEMAND_SCORE[n.demand]}
                max={100}
                detail={`${DEMAND_META[n.demand].label} · ${n.openRoles.toLocaleString()} open`}
              />
            ))}
          </div>
        </ReportPanel>

        <ReportPanel title="Market move" tone="magenta">
          <Link
            to={`/node/${fastest.id}`}
            className="focus-ring mt-3 block rounded-lg transition hover:bg-line/5"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-ink">{fastest.title}</p>
                <p className="mt-1 text-xs text-ink-mute">
                  {fastest.openRoles.toLocaleString()} open roles · {DEMAND_META[fastest.demand].label} demand
                </p>
              </div>
              <span className="shrink-0 text-lg font-extrabold text-brand">+{fastest.growth}%</span>
            </div>
            <QuietSparkline data={fastest.trend} />
          </Link>
        </ReportPanel>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <SummaryList title="Top salary roles" tone="amber">
          {topSalaryRoles.map((n) => (
            <SalaryLine key={n.id} node={n} max={salaryMax} />
          ))}
        </SummaryList>

        <SummaryList title="Fastest growth" tone="magenta">
          {growthLeaders.slice(0, 3).map((n) => (
            <SimpleRoleRow key={n.id} node={n} value={`+${n.growth}%`} />
          ))}
        </SummaryList>

        <SummaryList title="Demand split" tone="teal">
          {DEMAND_ORDER.map((tier) => {
            const count = NODES.filter((n) => n.demand === tier).length;
            return (
              <QuietBar
                key={tier}
                label={DEMAND_META[tier].label}
                value={count}
                max={NODES.length}
                detail={`${count} roles`}
                tone={tier === 'cooling' ? 'muted' : 'teal'}
              />
            );
          })}
        </SummaryList>
      </div>
    </section>
  );
}

type ReportTone = 'teal' | 'amber' | 'magenta' | 'muted';

const REPORT_TONE: Record<ReportTone, { text: string; fill: string; soft: string }> = {
  teal: {
    text: 'text-brand',
    fill: '#2f7f8f',
    soft: '#2f7f8f18',
  },
  amber: {
    text: 'text-[#a66f20] dark:text-amber',
    fill: '#f2b95e',
    soft: '#f2b95e1c',
  },
  magenta: {
    text: 'text-fuchsia-500 dark:text-fuchsia-300',
    fill: '#c026d3',
    soft: '#c026d318',
  },
  muted: {
    text: 'text-ink-soft',
    fill: 'rgb(var(--c-ink-mute))',
    soft: 'rgb(var(--c-line) / 0.08)',
  },
};

function PlainStat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption?: string;
  tone: ReportTone;
}) {
  const t = REPORT_TONE[tone];
  return (
    <div
      className="min-w-0 border-b border-line/10 p-4 last:border-b-0 sm:[&:nth-child(2n)]:border-l lg:border-b-0 lg:border-l lg:first:border-l-0"
      style={{ backgroundColor: t.soft }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-mute">{label}</p>
      <p className={cn('mt-1 text-2xl font-extrabold leading-none tracking-tight sm:text-[1.8rem]', t.text)}>
        {value}
      </p>
      {caption && <p className="mt-1 truncate text-xs text-ink-mute">{caption}</p>}
    </div>
  );
}

function ReportPanel({
  title,
  tone,
  children,
}: {
  title: string;
  tone: Exclude<ReportTone, 'muted'>;
  children: React.ReactNode;
}) {
  const t = REPORT_TONE[tone];
  return (
    <div className="rounded-2xl border border-line/10 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.fill }} />
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SummaryList({
  title,
  tone,
  children,
}: {
  title: string;
  tone: Exclude<ReportTone, 'muted'>;
  children: React.ReactNode;
}) {
  const t = REPORT_TONE[tone];
  return (
    <div className="min-w-0 rounded-2xl border border-line/10 p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.fill }} />
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function SimpleRoleRow({ node, value }: { node: CareerNode; value: string }) {
  return (
    <Link to={`/node/${node.id}`} className="focus-ring flex items-center justify-between gap-3 rounded-lg">
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{node.title}</span>
        <span className="block text-xs text-ink-mute">{node.openRoles.toLocaleString()} open roles</span>
      </span>
      <span className="shrink-0 text-sm font-bold text-ink">{value}</span>
    </Link>
  );
}

function QuietBar({
  label,
  value,
  max,
  detail,
  tone = 'teal',
}: {
  label: string;
  value: number;
  max: number;
  detail: string;
  tone?: ReportTone;
}) {
  const t = REPORT_TONE[tone];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold text-ink">{label}</p>
        <p className="shrink-0 text-xs text-ink-mute">{detail}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line/10">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max((value / max) * 100, 3)}%`, backgroundColor: t.fill }}
        />
      </div>
    </div>
  );
}

function SalaryLine({ node, max }: { node: CareerNode; max: number }) {
  const left = (node.salary.min / max) * 100;
  const width = ((node.salary.max - node.salary.min) / max) * 100;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-bold text-ink">{node.title}</span>
        <span className="shrink-0 text-xs font-bold text-ink-soft">{fmtK(medianSalary(node))}</span>
      </div>
      <div className="relative h-2 rounded-full bg-line/10">
        <div
          className="absolute top-0 h-2 rounded-full"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            backgroundColor: REPORT_TONE.amber.fill,
          }}
        />
      </div>
    </div>
  );
}

function QuietSparkline({ data }: { data: number[] }) {
  const W = 260;
  const H = 86;
  const pad = 10;
  const pts = data.map((v, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - v * (H - pad * 2);
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const area = `${d} L${W - pad},${H - pad} L${pad},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-5 w-full" role="img" aria-label="Role demand trend">
      <path d={area} fill={REPORT_TONE.magenta.fill} opacity="0.08" />
      <path
        d={d}
        fill="none"
        stroke={REPORT_TONE.magenta.fill}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.5 : 2} fill={REPORT_TONE.magenta.fill} />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Mount-grow hook (replays the bar/line draw on each panel mount)    */
/* ------------------------------------------------------------------ */

function useGrow() {
  const reduced = useReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduced) {
      setOn(true);
      return;
    }
    const r = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(r);
  }, [reduced]);
  return on;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Rankings (switchable leaderboards)                          */
/* ------------------------------------------------------------------ */

type MetricId = 'growth' | 'salary' | 'demand' | 'openRoles' | 'match';

interface Metric {
  id: MetricId;
  label: string;
  icon: LucideIcon;
  get: (n: CareerNode) => number;
  fmt: (n: CareerNode) => string;
  caption: string;
  note: string;
}

const METRICS: Metric[] = [
  {
    id: 'growth',
    label: 'Growth',
    icon: Icons.TrendingUp,
    get: (n) => n.growth,
    fmt: (n) => `${n.growth > 0 ? '+' : ''}${n.growth}%`,
    caption: 'YoY market growth',
    note: 'Year-over-year change in hiring volume. Negative bars mean the market is cooling.',
  },
  {
    id: 'salary',
    label: 'Salary',
    icon: Icons.Banknote,
    get: medianSalary,
    fmt: (n) => fmtK(medianSalary(n)),
    caption: 'Median salary band',
    note: 'Midpoint of the published salary band. Study/horizon routes with no posted band sit at the bottom.',
  },
  {
    id: 'demand',
    label: 'Demand',
    icon: Icons.Flame,
    get: (n) => DEMAND_SCORE[n.demand],
    fmt: (n) => DEMAND_META[n.demand].label,
    caption: 'Demand index',
    note: 'A composite of hiring heat and trajectory, bucketed into surging → cooling.',
  },
  {
    id: 'openRoles',
    label: 'Openings',
    icon: Icons.Briefcase,
    get: (n) => n.openRoles,
    fmt: (n) => (n.openRoles ? n.openRoles.toLocaleString() : '—'),
    caption: 'Open roles right now',
    note: 'Live count of active postings mapped to this role.',
  },
  {
    id: 'match',
    label: 'Your fit',
    icon: Icons.Target,
    get: (n) => n.match,
    fmt: (n) => `${n.match}%`,
    caption: 'Match to your profile',
    note: 'How closely your current skills line up with this role.',
  },
];

const isMetricId = (value: string | null): value is MetricId =>
  Boolean(value && METRICS.some((metric) => metric.id === value));

function RankingsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const metricParam = searchParams.get('metric');
  const metricId: MetricId = isMetricId(metricParam) ? metricParam : 'growth';
  const metric = METRICS.find((m) => m.id === metricId)!;
  const grown = useGrow();

  const setMetricId = (value: MetricId) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'growth') next.delete('metric');
    else next.set('metric', value);
    setSearchParams(next);
  };

  const ranked = useMemo(
    () => [...NODES].sort((a, b) => metric.get(b) - metric.get(a)),
    [metric],
  );
  const maxVal = Math.max(...ranked.map((n) => Math.max(metric.get(n), 0)), 1);

  const segments: Segment<MetricId>[] = METRICS.map((m) => ({
    value: m.id,
    label: m.label,
    icon: m.icon,
  }));

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <Icons.Trophy size={18} className="text-brand" /> Role leaderboard
          </h2>
          <p className="mt-1 text-xs text-ink-mute">Ranked by {metric.caption.toLowerCase()}.</p>
        </div>
        <SegmentedControl segments={segments} value={metricId} onChange={setMetricId} size="sm" />
      </div>

      <div className="mt-4 space-y-2">
        {ranked.map((n, i) => (
          <RankRow
            key={n.id}
            node={n}
            rank={i + 1}
            metric={metric}
            frac={Math.max(metric.get(n), 0) / maxVal}
            negative={metric.get(n) < 0}
            grown={grown}
          />
        ))}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-xs leading-5 text-ink-soft">
        <Icons.Info size={14} className="mt-0.5 shrink-0 text-brand" />
        {metric.note}
      </p>
    </Card>
  );
}

const RANK_MEDAL = ['#f2b95e', '#9aa6b2', '#b08056'];

function RankRow({
  node,
  rank,
  metric,
  frac,
  negative,
  grown,
}: {
  node: CareerNode;
  rank: number;
  metric: Metric;
  frac: number;
  negative: boolean;
  grown: boolean;
}) {
  const RoleIcon = getIcon(getNodeIcon(node));
  const accent = ACCENT_HEX[node.accent];
  const isCurrent = node.id === CURRENT_NODE_ID;
  const isTarget = node.id === TARGET_NODE_ID;
  const barColor = negative ? '#7e3041' : accent;

  return (
    <Link
      to={`/node/${node.id}`}
      className={cn(
        'focus-ring group flex items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:bg-surface hover:shadow-soft',
        isCurrent ? 'border-brand/40 bg-brand/[0.04]' : 'border-line/10 bg-surface-2 hover:border-line/25',
      )}
    >
      {/* rank */}
      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold"
        style={
          rank <= 3
            ? { backgroundColor: `${RANK_MEDAL[rank - 1]}22`, color: RANK_MEDAL[rank - 1] }
            : { backgroundColor: lineStroke(0.08), color: inkMute }
        }
      >
        {rank}
      </span>

      {/* icon */}
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border"
        style={{ backgroundColor: `${accent}16`, borderColor: `${accent}30`, color: accent }}
      >
        <RoleIcon size={19} strokeWidth={2.1} />
      </span>

      {/* title + bar */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-bold text-ink">{node.title}</p>
          {isCurrent && <Badge tone="brand">You</Badge>}
          {isTarget && <Badge tone="amber">Target</Badge>}
          <span className="text-[11px] font-medium capitalize text-ink-mute">
            · {getNodeKindMeta(node.kind).shortLabel}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/10">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: grown ? `${Math.max(frac * 100, 2)}%` : '0%', backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* value */}
      <div className="shrink-0 text-right">
        <div className={cn('text-sm font-extrabold', negative ? 'text-wine' : 'text-ink')}>
          {metric.fmt(node)}
        </div>
        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-mute">
          {metric.label}
        </div>
      </div>
      <Icons.ChevronRight size={16} className="shrink-0 text-ink-mute transition group-hover:translate-x-0.5 group-hover:text-brand" />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Salary comparison                                          */
/* ------------------------------------------------------------------ */

function SalaryPanel() {
  const grown = useGrow();
  const paid = useMemo(
    () => NODES.filter((n) => n.salary.max > 0).sort((a, b) => medianSalary(b) - medianSalary(a)),
    [],
  );
  const noBand = NODES.filter((n) => n.salary.max === 0);
  const scaleMax = Math.ceil(Math.max(...paid.map((n) => n.salary.max)) / 50) * 50; // → 250
  const currentMid = medianSalary(NODES.find((n) => n.id === CURRENT_NODE_ID)!);
  const ticks = Array.from({ length: scaleMax / 50 + 1 }, (_, i) => i * 50);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <Icons.Banknote size={18} className="text-brand" /> Salary bands compared
          </h2>
          <p className="mt-1 text-xs text-ink-mute">
            Floating bars span the min–max band; the notch marks the median. Deltas are vs your
            current role.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-full" style={{ backgroundColor: '#2f7f8f55' }} /> band
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-1 rounded-full bg-ink" /> median
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {paid.map((n) => {
          const delta = Math.round(medianSalary(n) - currentMid);
          const isCurrent = n.id === CURRENT_NODE_ID;
          const left = (n.salary.min / scaleMax) * 100;
          const width = ((n.salary.max - n.salary.min) / scaleMax) * 100;
          const mid = (medianSalary(n) / scaleMax) * 100;
          return (
            <div
              key={n.id}
              className={cn(
                'grid grid-cols-1 gap-3 rounded-2xl border p-3 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center lg:grid-cols-[16rem_minmax(0,1fr)]',
                isCurrent ? 'border-brand/40 bg-brand/[0.04]' : 'border-line/10 bg-surface-2',
              )}
            >
              <Link to={`/node/${n.id}`} className="focus-ring min-w-0 rounded-lg">
                <p className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm font-bold leading-tight text-ink">
                  <span>{n.title}</span>
                  {isCurrent && <Badge tone="brand">You</Badge>}
                </p>
                <p className="truncate text-[11px] text-ink-mute">{fmtK(medianSalary(n))} median</p>
              </Link>
              <div className="relative h-9">
                {/* track */}
                <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-line/8" />
                {/* band */}
                <div
                  className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full transition-[width,left] duration-700 ease-out"
                  style={{
                    left: `${left}%`,
                    width: grown ? `${width}%` : '0%',
                    background: `linear-gradient(90deg, ${roleColor(n.id)}99, ${roleColor(n.id)})`,
                  }}
                />
                {/* median notch */}
                <div
                  className="absolute top-1/2 h-5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink transition-opacity duration-700"
                  style={{ left: `${mid}%`, opacity: grown ? 1 : 0 }}
                />
                {/* labels */}
                <span
                  className="absolute -top-0.5 text-[10px] font-semibold text-ink-mute"
                  style={{ left: `calc(${left}% )` }}
                >
                  ${n.salary.min}k
                </span>
                <span
                  className="absolute -bottom-0.5 -translate-x-full text-[10px] font-semibold text-ink-mute"
                  style={{ left: `calc(${left + width}% )` }}
                >
                  ${n.salary.max}k
                </span>
                {/* delta chip */}
                {!isCurrent && (
                  <span
                    className={cn(
                      'absolute right-0 top-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      delta >= 0 ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-wine/10 text-wine',
                    )}
                  >
                    {delta >= 0 ? '+' : ''}
                    {delta}k
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* axis */}
      <div className="mt-1 hidden justify-between pl-3 text-[10px] font-semibold text-ink-mute sm:ml-[13rem] sm:flex lg:ml-[16rem]">
        {ticks.map((t) => (
          <span key={t}>${t}k</span>
        ))}
      </div>

      {noBand.length > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-surface-2 p-3 pr-28 text-xs text-ink-soft sm:pr-36">
          <Icons.Info size={14} className="shrink-0 text-brand" />
          No posted salary band:
          {noBand.map((n) => (
            <Link
              key={n.id}
              to={`/node/${n.id}`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              {n.title}
            </Link>
          ))}
          — they're study or 0→1 routes, not salaried postings.
        </p>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Demand comparison                                          */
/* ------------------------------------------------------------------ */

function DemandPanel() {
  const grown = useGrow();
  const total = NODES.length;
  const byTier = DEMAND_ORDER.map((tier) => ({
    tier,
    roles: NODES.filter((n) => n.demand === tier),
  }));
  const maxTier = Math.max(...byTier.map((t) => t.roles.length), 1);

  return (
    <div className="space-y-4">
      {/* Scatter */}
      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <Icons.Activity size={18} className="text-brand" /> Demand map
        </h2>
        <p className="mt-1 text-xs text-ink-mute">
          Growth vs. open roles. Bubble size = median salary, color = demand tier. Up-and-right is a
          hot, high-volume market.
        </p>
        <DemandScatter grown={grown} />
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-ink-soft">
          {DEMAND_ORDER.map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DEMAND_COLOR[d] }} />
              {DEMAND_META[d].label}
            </span>
          ))}
        </div>
      </Card>

      {/* Composition + tiers */}
      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <Icons.Flame size={18} className="text-brand" /> How demand splits
        </h2>
        <p className="mt-1 text-xs text-ink-mute">Share of tracked roles in each demand tier.</p>

        {/* stacked composition bar */}
        <div className="mt-4 flex h-3 overflow-hidden rounded-full">
          {byTier.map(({ tier, roles }) =>
            roles.length ? (
              <div
                key={tier}
                className="h-full transition-[width] duration-700 ease-out"
                style={{
                  width: grown ? `${(roles.length / total) * 100}%` : '0%',
                  backgroundColor: DEMAND_COLOR[tier],
                }}
                title={`${DEMAND_META[tier].label}: ${roles.length}`}
              />
            ) : null,
          )}
        </div>

        <div className="mt-5 space-y-3">
          {byTier.map(({ tier, roles }) => (
            <div key={tier} className="grid grid-cols-[6rem_1fr] items-start gap-3">
              <div className="flex items-center gap-2 pt-0.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DEMAND_COLOR[tier] }} />
                <span className="text-sm font-bold text-ink">{DEMAND_META[tier].label}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line/10">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: grown ? `${(roles.length / maxTier) * 100}%` : '0%',
                        backgroundColor: DEMAND_COLOR[tier],
                      }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-bold text-ink-soft">
                    {roles.length}
                  </span>
                </div>
                {roles.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {roles.map((n) => (
                      <Link
                        key={n.id}
                        to={`/node/${n.id}`}
                        className="focus-ring rounded-full border border-line/10 bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-soft transition hover:border-line/25 hover:text-ink"
                      >
                        {n.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DemandScatter({ grown }: { grown: boolean }) {
  const W = 760;
  const H = 360;
  const padL = 52;
  const padR = 24;
  const padT = 20;
  const padB = 44;
  const pts = NODES.filter((n) => n.openRoles > 0);

  const X0 = -10;
  const X1 = 45;
  const Y0 = 0;
  const Y1 = 6500;
  const xTicks = [-10, 0, 10, 20, 30, 40];
  const yTicks = [0, 1500, 3000, 4500, 6000];

  const px = (g: number) => padL + ((g - X0) / (X1 - X0)) * (W - padL - padR);
  const py = (o: number) => H - padB - ((o - Y0) / (Y1 - Y0)) * (H - padT - padB);
  const radius = (n: CareerNode) => {
    const m = medianSalary(n);
    return 9 + ((Math.min(m, 210) - 85) / (210 - 85)) * 15;
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-4 w-full"
      style={{ height: 'auto' }}
      role="img"
      aria-label="Scatter plot of role growth versus open roles"
    >
      {/* grid + y ticks */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={py(t)} y2={py(t)} stroke={lineStroke(0.35)} strokeWidth={1} />
          <text x={padL - 8} y={py(t) + 4} textAnchor="end" fontSize={11} fill={inkMute}>
            {t / 1000 ? `${t / 1000}k` : '0'}
          </text>
        </g>
      ))}
      {/* x ticks */}
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={px(t)} x2={px(t)} y1={padT} y2={H - padB} stroke={lineStroke(0.18)} strokeWidth={1} />
          <text x={px(t)} y={H - padB + 18} textAnchor="middle" fontSize={11} fill={inkMute}>
            {t > 0 ? `+${t}%` : `${t}%`}
          </text>
        </g>
      ))}
      {/* zero-growth emphasis */}
      <line x1={px(0)} x2={px(0)} y1={padT} y2={H - padB} stroke={lineStroke(0.55)} strokeWidth={1.5} />

      {/* axis labels */}
      <text x={(W + padL) / 2} y={H - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill={inkMute}>
        YoY growth →
      </text>
      <text
        x={14}
        y={(H - padB + padT) / 2}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={inkMute}
        transform={`rotate(-90 14 ${(H - padB + padT) / 2})`}
      >
        Open roles →
      </text>

      {/* bubbles */}
      {pts.map((n) => {
        const cx = px(n.growth);
        const cy = py(n.openRoles);
        const r = radius(n);
        const color = DEMAND_COLOR[n.demand];
        const isCurrent = n.id === CURRENT_NODE_ID;
        return (
          <g key={n.id} className="cursor-pointer" style={{ transition: 'opacity .5s', opacity: grown ? 1 : 0 }}>
            <title>{`${n.title} — ${n.growth}% growth, ${n.openRoles.toLocaleString()} open, ${fmtK(
              medianSalary(n),
            )} median`}</title>
            <circle cx={cx} cy={cy} r={grown ? r : 0} fill={`${color}26`} stroke={color} strokeWidth={isCurrent ? 2.5 : 1.5} style={{ transition: 'r .6s ease-out' }} />
            <circle cx={cx} cy={cy} r={3} fill={color} />
            <text
              x={cx}
              y={cy - r - 5}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={ink(0.85)}
            >
              {n.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 4 — History (demand trajectory)                                */
/* ------------------------------------------------------------------ */

function HistoryPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const quarters = useMemo(() => lastQuarters(6), []);
  const initial = useMemo(() => {
    const ids = new Set<string>([CURRENT_NODE_ID, TARGET_NODE_ID]);
    [...NODES]
      .sort((a, b) => b.trend[b.trend.length - 1] - a.trend[a.trend.length - 1])
      .forEach((n) => {
        if (ids.size < 5) ids.add(n.id);
    });
    return ids;
  }, []);
  const shown = useMemo(() => {
    const raw = searchParams.get('roles');
    if (!raw) return initial;
    const ids = new Set(
      raw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => NODES.some((node) => node.id === id)),
    );
    return ids.size ? ids : initial;
  }, [initial, searchParams]);

  const toggle = (id: string) => {
    const nextShown = new Set(shown);
    if (nextShown.has(id)) {
      if (nextShown.size > 1) nextShown.delete(id);
    } else {
      nextShown.add(id);
    }
    const next = new URLSearchParams(searchParams);
    const value = Array.from(nextShown).join(',');
    const defaultValue = Array.from(initial).join(',');
    if (value === defaultValue) next.delete('roles');
    else next.set('roles', value);
    setSearchParams(next);
  };

  // biggest movers over the window
  const movers = useMemo(
    () =>
      [...NODES]
        .map((n) => ({ n, delta: Math.round((n.trend[n.trend.length - 1] - n.trend[0]) * 100) }))
        .sort((a, b) => b.delta - a.delta),
    [],
  );
  const risers = movers.slice(0, 3);
  const fallers = movers.slice(-3).reverse();

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-ink">
          <Icons.LineChart size={18} className="text-brand" /> Demand trajectory
        </h2>
        <p className="mt-1 text-xs text-ink-mute">
          Demand index (0–100) over the last six quarters. Toggle roles in the legend to compare
          their paths.
        </p>

        <TrendChart quarters={quarters} shown={shown} />

        <div className="mt-4 flex flex-wrap gap-2">
          {NODES.map((n) => {
            const on = shown.has(n.id);
            return (
              <button
                key={n.id}
                onClick={() => toggle(n.id)}
                className={cn(
                  'focus-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                  on
                    ? 'border-line/20 bg-surface text-ink'
                    : 'border-line/10 bg-surface-2 text-ink-mute hover:text-ink-soft',
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full transition-opacity"
                  style={{ backgroundColor: roleColor(n.id), opacity: on ? 1 : 0.3 }}
                />
                {n.title}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <MoversCard title="Biggest risers" icon={Icons.TrendingUp} rows={risers} positive />
        <MoversCard title="Cooling fastest" icon={Icons.TrendingDown} rows={fallers} positive={false} />
      </div>
    </div>
  );
}

function TrendChart({ quarters, shown }: { quarters: string[]; shown: Set<string> }) {
  const grown = useGrow();
  const W = 760;
  const H = 320;
  const padL = 40;
  const padR = 80;
  const padT = 16;
  const padB = 36;
  const cols = quarters.length;

  const px = (i: number) => padL + (i / (cols - 1)) * (W - padL - padR);
  const py = (v: number) => H - padB - v * (H - padT - padB); // v is 0..1
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const series = NODES.filter((n) => shown.has(n.id));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-4 w-full"
      style={{ height: 'auto' }}
      role="img"
      aria-label="Line chart of demand index over six quarters"
    >
      {/* y grid */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={py(t)} y2={py(t)} stroke={lineStroke(0.35)} strokeWidth={1} />
          <text x={padL - 8} y={py(t) + 4} textAnchor="end" fontSize={11} fill={inkMute}>
            {Math.round(t * 100)}
          </text>
        </g>
      ))}
      {/* x labels */}
      {quarters.map((q, i) => (
        <text key={q} x={px(i)} y={H - padB + 18} textAnchor="middle" fontSize={11} fill={inkMute}>
          {q}
        </text>
      ))}

      {/* lines */}
      {series.map((n) => {
        const color = roleColor(n.id);
        const d = n.trend.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(v)}`).join(' ');
        const last = n.trend[n.trend.length - 1];
        return (
          <g key={n.id}>
            <path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                strokeDashoffset: grown ? 0 : 1,
                transition: 'stroke-dashoffset .9s ease-out',
              }}
            />
            <circle cx={px(cols - 1)} cy={py(last)} r={3.5} fill={color} style={{ opacity: grown ? 1 : 0, transition: 'opacity .4s ease-out .7s' }} />
            <text
              x={px(cols - 1) + 8}
              y={py(last) + 4}
              fontSize={11}
              fontWeight={700}
              fill={color}
              style={{ opacity: grown ? 1 : 0, transition: 'opacity .4s ease-out .7s' }}
            >
              {n.title.length > 14 ? `${n.title.slice(0, 13)}…` : n.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function MoversCard({
  title,
  icon: Icon,
  rows,
  positive,
}: {
  title: string;
  icon: LucideIcon;
  rows: { n: CareerNode; delta: number }[];
  positive: boolean;
}) {
  return (
    <Card className="p-5">
      <h3 className={cn('flex items-center gap-2 text-sm font-bold', positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-wine')}>
        <Icon size={16} /> {title}
      </h3>
      <div className="mt-3 space-y-2">
        {rows.map(({ n, delta }) => {
          const RoleIcon = getIcon(getNodeIcon(n));
          const accent = ACCENT_HEX[n.accent];
          const up = delta >= 0;
          return (
            <Link
              key={n.id}
              to={`/node/${n.id}`}
              className="focus-ring group flex items-center gap-3 rounded-xl border border-line/10 bg-surface-2 p-2.5 transition hover:border-line/25 hover:bg-surface"
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: `${accent}16`, color: accent }}
              >
                <RoleIcon size={16} strokeWidth={2.1} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{n.title}</span>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-sm font-extrabold',
                  up ? 'text-emerald-500' : 'text-wine',
                )}
              >
                {up ? <Icons.ArrowUp size={13} /> : <Icons.ArrowDown size={13} />}
                {Math.abs(delta)}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function PanelSkeleton() {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" rounded="rounded-full" />
        <Skeleton className="h-9 w-64" rounded="rounded-2xl" />
      </div>
      <div className="mt-5 space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" rounded="rounded-2xl" />
        ))}
      </div>
      <SkeletonText className="mt-4" lines={2} />
    </Card>
  );
}
