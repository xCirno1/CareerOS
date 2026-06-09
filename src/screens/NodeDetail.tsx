import { Link, useParams } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useSimulatedLoading } from '@/lib/hooks';
import {
  getNode,
  DEMAND_META,
  PATTERNS,
  EMPLOYERS,
  edgesOf,
  CURRENT_NODE_ID,
} from '@/lib/mockData';
import {
  Badge,
  Button,
  Card,
  ProgressRing,
  Sparkline,
  StatCard,
  Avatar,
  Skeleton,
  SkeletonText,
} from '@/ui/components';

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

export function NodeDetail() {
  const { id } = useParams();
  const loading = useSimulatedLoading(950);
  const node = getNode(id ?? '');

  if (!node) {
    return (
      <div className="grid min-h-[60vh] place-items-center p-6 text-center">
        <div>
          <Icons.Crosshair size={32} className="mx-auto text-ink-mute" />
          <p className="mt-3 font-bold text-ink">Role not found</p>
          <Link to="/map" className="mt-3 inline-block">
            <Button size="sm" icon={Icons.ArrowLeft}>
              Back to map
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const accent = ACCENT_HEX[node.accent];
  const demand = DEMAND_META[node.demand];
  const inbound = edgesOf(node.id).filter((e) => e.to === node.id);
  const employers = EMPLOYERS.filter((e) => e.nodeId === node.id);
  const feasibility = inbound.length
    ? Math.round(inbound.reduce((s, e) => s + e.feasibility, 0) / inbound.length)
    : node.match;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <Link
        to="/map"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-mute transition hover:text-ink"
      >
        <Icons.ArrowLeft size={16} /> Back to map
      </Link>

      {/* Hero */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <Card className="overflow-hidden">
          <div
            className="relative p-6 sm:p-8"
            style={{
              background: `linear-gradient(120deg, ${accent}14, transparent 60%)`,
            }}
          >
            <div className="flex flex-wrap items-start gap-5">
              <span
                className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl shadow-soft"
                style={{ backgroundColor: `${accent}1F`, color: accent }}
              >
                <Icons.CircleDot size={30} strokeWidth={2.1} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral" className="capitalize">
                    {node.kind}
                  </Badge>
                  <Badge tone={node.growth >= 0 ? 'emerald' : 'wine'} icon={node.growth >= 0 ? Icons.TrendingUp : Icons.TrendingDown}>
                    {demand.label} demand
                  </Badge>
                </div>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  {node.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft sm:text-base">{node.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/routing">
                    <Button size="sm" icon={Icons.Route}>
                      Route from here
                    </Button>
                  </Link>
                  <Button size="sm" variant="secondary" icon={Icons.Bookmark}>
                    Save role
                  </Button>
                  <Button size="sm" variant="ghost" icon={Icons.Share2}>
                    Share
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <ProgressRing value={node.match} sublabel="your match" tone="brand" />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" rounded="rounded-3xl" />
            ))
          : (
            <>
              <StatCard
                icon={Icons.Banknote}
                label="Median salary band"
                value={node.salary.max ? `${node.salary.currency}${node.salary.min}–${node.salary.max}k` : '—'}
                tone="brand"
              />
              <StatCard icon={Icons.TrendingUp} label="YoY market growth" value={`${node.growth}%`} delta={node.growth} tone="amber" />
              <StatCard icon={Icons.Briefcase} label="Open roles now" value={node.openRoles.toLocaleString()} tone="navy" />
              <StatCard icon={Icons.Gauge} label="Avg feasibility in" value={`${feasibility}%`} tone="wine" />
            </>
          )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="space-y-4">
          {/* Market demand */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.Activity} title="Live market demand" hint="Last 6 quarters" />
            {loading ? (
              <Skeleton className="mt-4 h-24" rounded="rounded-2xl" />
            ) : (
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <div className={cn('text-3xl font-extrabold', demand.tone)}>{demand.label}</div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {node.openRoles.toLocaleString()} active roles · trending{' '}
                    {node.growth >= 0 ? 'up' : 'down'} {Math.abs(node.growth)}% YoY
                  </p>
                </div>
                <Sparkline data={node.trend} tone={node.growth >= 0 ? 'emerald' : 'wine'} width={180} height={56} />
              </div>
            )}
          </Card>

          {/* Prospects / skills */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.Sparkles} title="Prospects & key skills" />
            {loading ? (
              <SkeletonText className="mt-4" lines={3} />
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {node.topSkills.map((s) => (
                    <span key={s} className="rounded-full bg-line/8 px-3 py-1.5 text-sm font-semibold text-ink-soft">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Prospect icon={Icons.Trophy} text="Strong upward mobility into leadership tracks" />
                  <Prospect icon={Icons.Globe} text="High remote availability across markets" />
                  <Prospect icon={Icons.Zap} text="Skills transfer to 4 adjacent roles" />
                  <Prospect icon={Icons.Flame} text={`${demand.label} hiring momentum this quarter`} />
                </div>
              </>
            )}
          </Card>

          {/* Historical patterns */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.GitBranch} title="Historical patterns" hint="How people reached this role" />
            {loading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" rounded="rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {PATTERNS.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-line/10 bg-surface-2 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <PatternIcon kind={p.kind} />
                        {p.label}
                      </div>
                      <span className="shrink-0 text-sm font-bold text-ink-soft">{p.share}%</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/10">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${p.share * 2.6}%` }} />
                      </div>
                      <span className="text-xs text-ink-mute">{p.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Feasibility */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.Gauge} title="Feasibility for you" />
            {loading ? (
              <div className="mt-4 flex flex-col items-center gap-3">
                <Skeleton className="h-28 w-28" rounded="rounded-full" />
                <SkeletonText lines={2} className="w-full" />
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center text-center">
                <ProgressRing value={feasibility} size={132} sublabel="reachable" tone={feasibility >= 65 ? 'emerald' : feasibility >= 50 ? 'amber' : 'wine'} />
                <p className="mt-3 text-sm text-ink-soft">
                  Based on {inbound.length || 3} inbound transitions and people with a profile like{' '}
                  <span className="font-semibold text-ink">{getNode(CURRENT_NODE_ID)?.title}</span>.
                </p>
                <Link to="/routing" className="mt-4 w-full">
                  <Button block size="sm" icon={Icons.Route} iconRight={Icons.ArrowRight}>
                    Plan the route
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Employer positions */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.BadgeCheck} title="Employer positions" hint={`${employers.length} verified`} />
            {loading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" rounded="rounded-2xl" />
                ))}
              </div>
            ) : employers.length ? (
              <div className="mt-4 space-y-2.5">
                {employers.map((e) => (
                  <div key={e.id} className="rounded-2xl border border-line/10 bg-surface-2 p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.name} size={38} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-ink">{e.name}</p>
                          {e.verified && <Icons.BadgeCheck size={14} className="shrink-0 text-brand" />}
                        </div>
                        <p className="truncate text-xs text-ink-mute">{e.role}</p>
                      </div>
                      <Icons.ArrowUpRight size={16} className="text-ink-mute" />
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                      <span className="inline-flex items-center gap-1">
                        <Icons.MapPin size={12} /> {e.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icons.Clock size={12} /> {e.posted}
                      </span>
                      {e.remote && <Badge tone="brand">Remote</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-mute">No pinned roles for this destination yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Icons.Activity;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <Icon size={18} className="text-brand" />
        {title}
      </h2>
      {hint && <span className="text-xs font-semibold text-ink-mute">{hint}</span>}
    </div>
  );
}

function Prospect({ icon: Icon, text }: { icon: typeof Icons.Zap; text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-sm text-ink-soft">
      <Icon size={16} className="mt-0.5 shrink-0 text-brand" />
      {text}
    </div>
  );
}

function PatternIcon({ kind }: { kind: string }) {
  const map: Record<string, typeof Icons.GitBranch> = {
    common: Icons.Workflow,
    lateral: Icons.ChevronsRight,
    study: Icons.GraduationCap,
    gap: Icons.Clock,
  };
  const Icon = map[kind] ?? Icons.GitBranch;
  return <Icon size={15} className="shrink-0 text-ink-mute" />;
}

function HeroSkeleton() {
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start gap-5">
        <Skeleton className="h-16 w-16" rounded="rounded-3xl" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" rounded="rounded-full" />
          <Skeleton className="h-9 w-2/3" />
          <SkeletonText lines={2} />
        </div>
        <Skeleton className="h-28 w-28" rounded="rounded-full" />
      </div>
    </Card>
  );
}
