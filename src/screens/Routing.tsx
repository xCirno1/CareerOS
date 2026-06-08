import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useSimulatedLoading, useMediaQuery } from '@/lib/hooks';
import {
  ROUTES,
  EDGES,
  getNode,
  CURRENT_NODE_ID,
  TARGET_NODE_ID,
  type Route as RouteType,
} from '@/lib/mockData';
import { MapGraph } from '@/components/MapGraph';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Badge, Skeleton, SkeletonText } from '@/ui/components';

const TONE: Record<string, string> = {
  good: 'text-emerald-500',
  warn: 'text-amber',
  neutral: 'text-ink-soft',
};

const EDGE_KIND_ICON: Record<string, typeof Icons.ChevronsRight> = {
  lateral: Icons.ChevronsRight,
  promotion: Icons.TrendingUp,
  pivot: Icons.GitBranch,
  study: Icons.GraduationCap,
};

export function Routing() {
  const loading = useSimulatedLoading(950);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [selectedRouteId, setSelectedRouteId] = useState(
    ROUTES.find((r) => r.recommended)?.id ?? ROUTES[0].id,
  );
  const selectedRoute = ROUTES.find((r) => r.id === selectedRouteId)!;

  const from = getNode(CURRENT_NODE_ID)!;
  const to = getNode(TARGET_NODE_ID)!;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <PageHeader
        eyebrow="Dynamic routing"
        icon={Icons.Route}
        title="Pathways to your target"
        subtitle="We compared every viable route and ranked them by feasibility, time and uplift."
      />

      {/* from → to bar */}
      <Card inset className="mt-5 flex flex-wrap items-center gap-3 p-3.5">
        <RouteEndpoint label="From" node={from.title} tone="teal" />
        <Icons.ArrowRight size={18} className="text-ink-mute" />
        <RouteEndpoint label="Target" node={to.title} tone="amber" />
        <Button size="sm" variant="secondary" icon={Icons.SlidersHorizontal} className="ml-auto">
          Change target
        </Button>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        {/* Route options */}
        <div className="space-y-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-36" rounded="rounded-3xl" />
              ))
            : ROUTES.map((r) => (
                <RouteCard
                  key={r.id}
                  route={r}
                  active={r.id === selectedRouteId}
                  onSelect={() => setSelectedRouteId(r.id)}
                />
              ))}
        </div>

        {/* Visual + breakdown */}
        <div className="space-y-4">
          {isDesktop && (
            <Card className="h-[320px] overflow-hidden p-0">
              {loading ? (
                <Skeleton className="h-full w-full" rounded="rounded-3xl" />
              ) : (
                <MapGraph
                  selectedId={null}
                  onSelect={() => {}}
                  highlightPath={selectedRoute.path}
                />
              )}
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <Icons.Workflow size={18} className="text-brand" />
              Step-by-step plan
            </h2>
            {loading ? (
              <div className="mt-4 space-y-3">
                <SkeletonText lines={2} />
                <Skeleton className="h-16" rounded="rounded-2xl" />
                <Skeleton className="h-16" rounded="rounded-2xl" />
              </div>
            ) : (
              <RouteSteps route={selectedRoute} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function RouteEndpoint({
  label,
  node,
  tone,
}: {
  label: string;
  node: string;
  tone: 'teal' | 'amber';
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-surface px-3.5 py-2">
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          tone === 'teal' ? 'bg-teal' : 'bg-amber',
        )}
      />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-mute">{label}</div>
        <div className="text-sm font-bold text-ink">{node}</div>
      </div>
    </div>
  );
}

function RouteCard({
  route,
  active,
  onSelect,
}: {
  route: RouteType;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'focus-ring w-full rounded-3xl border p-5 text-left transition',
        active
          ? 'border-brand bg-brand/[0.04] shadow-glass'
          : 'border-line/10 bg-surface hover:border-line/25 hover:shadow-soft',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-ink">{route.label}</h3>
            {route.recommended && (
              <Badge tone="amber" icon={Icons.Sparkles}>
                Recommended
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{route.tagline}</p>
        </div>
        <span
          className={cn(
            'grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition',
            active ? 'border-brand bg-brand text-white' : 'border-line/25',
          )}
        >
          {active && <Icons.Check size={13} />}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {route.tradeoffs.map((t) => (
          <div key={t.label} className="rounded-2xl bg-surface-2 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-mute">
              {t.label}
            </div>
            <div className={cn('mt-0.5 text-sm font-bold', TONE[t.tone])}>{t.value}</div>
          </div>
        ))}
      </div>

      {/* path preview */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {route.path.map((id, i) => (
          <span key={id} className="flex items-center gap-1.5">
            <span className="rounded-full bg-line/8 px-2.5 py-1 text-xs font-semibold text-ink-soft">
              {getNode(id)?.title}
            </span>
            {i < route.path.length - 1 && (
              <Icons.ChevronRight size={13} className="text-ink-mute" />
            )}
          </span>
        ))}
      </div>
    </button>
  );
}

function RouteSteps({ route }: { route: RouteType }) {
  return (
    <div className="mt-4">
      {route.path.map((id, i) => {
        const node = getNode(id)!;
        const nextId = route.path[i + 1];
        const edge = nextId
          ? EDGES.find((e) => e.from === id && e.to === nextId)
          : undefined;
        const isFirst = i === 0;
        const isLast = i === route.path.length - 1;
        const EdgeIcon = edge ? EDGE_KIND_ICON[edge.kind] : Icons.Flag;
        return (
          <div key={id} className="relative pl-9">
            {/* connector line */}
            {!isLast && (
              <span className="absolute left-[14px] top-7 h-[calc(100%-12px)] w-0.5 bg-line/15" />
            )}
            {/* dot */}
            <span
              className={cn(
                'absolute left-0 top-1 grid h-7 w-7 place-items-center rounded-full text-xs font-bold',
                isFirst
                  ? 'bg-teal text-white'
                  : isLast
                  ? 'bg-amber text-navy'
                  : 'bg-navy text-white dark:bg-brand dark:text-navy',
              )}
            >
              {isFirst ? <Icons.MapPin size={14} /> : isLast ? <Icons.Flag size={14} /> : i}
            </span>

            <div className="pb-6">
              <Link
                to={`/node/${id}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-brand"
              >
                {node.title}
                <Icons.ArrowUpRight size={14} className="text-ink-mute" />
              </Link>
              <div className="text-xs text-ink-mute">
                {isFirst ? 'Your starting node' : isLast ? 'Target node reached' : 'Stepping stone'}
              </div>

              {edge && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-2xl border border-line/10 bg-surface-2 p-2.5 text-xs font-semibold text-ink-soft">
                  <span className="inline-flex items-center gap-1 capitalize text-brand">
                    <EdgeIcon size={14} /> {edge.kind}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icons.Clock size={13} /> ~{edge.months} mo
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icons.Gauge size={13} /> {edge.feasibility}% feasible
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="mt-1 flex flex-wrap gap-2">
        <Link to={`/node/${route.path[route.path.length - 1]}`} className="flex-1">
          <Button block size="sm" icon={Icons.Target} iconRight={Icons.ArrowRight}>
            View target node
          </Button>
        </Link>
        <Button size="sm" variant="secondary" icon={Icons.Download}>
          Export plan
        </Button>
      </div>
    </div>
  );
}
