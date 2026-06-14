import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useSimulatedLoading, useMediaQuery } from '@/lib/hooks';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useAppStore } from '@/lib/appStore';
import {
  EDGES,
  NODES,
  getNode,
  getRoutesBetween,
  TARGET_NODE_ID,
  type CareerNode,
  type Route as RouteType,
} from '@/lib/mockData';
import { MapGraph } from '@/components/MapGraph';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, Badge, Skeleton, SkeletonText, useToast } from '@/ui/components';

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

const NODE_ACCENT_DOT: Record<CareerNode['accent'], string> = {
  teal: 'bg-teal',
  amber: 'bg-amber',
  wine: 'bg-wine',
  navy: 'bg-navy dark:bg-brand',
};

function priorityScore(route: RouteType, priorities: string[]) {
  const p = new Set(priorities);
  let score = route.feasibility * 1.5;
  if (p.has('comp')) score += route.salaryDelta * 1.25;
  if (p.has('growth') || p.has('impact')) score += route.feasibility * 0.35;
  if (p.has('stability')) score += route.path.length <= 3 ? 12 : -8;
  if (p.has('balance') || p.has('remote')) score += route.months <= 18 ? 10 : -8;
  score -= route.months * 0.35;
  return score;
}

function rankRoutes(routes: RouteType[], priorities: string[]) {
  const ranked = [...routes].sort(
    (a, b) => priorityScore(b, priorities) - priorityScore(a, priorities),
  );
  return ranked.map((route, index) => ({ ...route, recommended: index === 0 }));
}

export function Routing() {
  const loading = useSimulatedLoading(950);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { target, setTarget, careerProfile } = useAppStore();
  const toast = useToast();
  const rootRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [targetPickerOpen, setTargetPickerOpen] = useState(false);
  const targetParam = searchParams.get('target');
  const selectedRouteId = searchParams.get('route');
  const urlTarget = targetParam && NODES.some((n) => n.id === targetParam) ? targetParam : null;

  const from = getNode(careerProfile.currentNodeId)!;
  const to = getNode(urlTarget ?? target) ?? getNode(TARGET_NODE_ID)!;
  const routesForTarget = rankRoutes(
    getRoutesBetween(from.id, to.id),
    careerProfile.priorities,
  );
  const defaultRoute = routesForTarget.find((r) => r.recommended) ?? routesForTarget[0];
  // selection falls back to the recommended (or first) route — so it always
  // resolves to a valid route for the *current* target after a target change.
  const selectedRoute =
    routesForTarget.find((r) => r.id === selectedRouteId) ??
    defaultRoute;
  const routeHeaderNodes = (selectedRoute?.path ?? (from.id === to.id ? [from.id] : [from.id, to.id]))
    .map((id) => getNode(id))
    .filter((node): node is CareerNode => Boolean(node));

  useEffect(() => {
    if (loading || !rootRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.rt-reveal', {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.07,
        // Drop the inline transform when done — a lingering transform creates a
        // stacking context that would trap the "Change target" dropdown beneath
        // the later map column.
        clearProps: 'transform',
      });
    }, rootRef);
    return () => ctx.revert();
  }, [loading, target, to.id]);

  useEffect(() => {
    if (urlTarget && urlTarget !== target) setTarget(urlTarget);
  }, [setTarget, target, urlTarget]);

  const setRoutingParam = (key: string, value: string | null, defaultValue?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === defaultValue) next.delete(key);
    else next.set(key, value);
    if (key === 'target') next.delete('route');
    setSearchParams(next);
  };

  const exportPlan = () => {
    if (!selectedRoute) return;
    const lines = [
      'CareerOS — Pathway plan',
      `From:   ${from.title}`,
      `Target: ${to.title}`,
      `Route:  ${selectedRoute.label} · ${selectedRoute.feasibility}% feasible · ~${selectedRoute.months} mo · +${selectedRoute.salaryDelta}% salary`,
      '',
      'Steps:',
      ...selectedRoute.path.map((id, i) => {
        const n = getNode(id)!;
        const nextId = selectedRoute.path[i + 1];
        const edge = nextId ? EDGES.find((e) => e.from === id && e.to === nextId) : undefined;
        const via = edge ? `  → ${edge.kind}, ~${edge.months} mo, ${edge.feasibility}% feasible` : '';
        return `  ${i + 1}. ${n.title}${via}`;
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `careeros-plan-${selectedRoute.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Plan exported', { icon: Icons.Download, tone: 'success' });
  };

  const pickTarget = (id: string) => {
    setTarget(id);
    setRoutingParam('target', id, TARGET_NODE_ID);
    setTargetPickerOpen(false);
    toast(`Target set to ${getNode(id)?.title ?? 'role'}`, { icon: Icons.Target, tone: 'info' });
  };

  return (
    <div ref={rootRef} className="mx-auto max-w-7xl p-4 sm:p-6">
      <PageHeader
        eyebrow="Dynamic routing"
        icon={Icons.Route}
        title="Pathways to your target"
        subtitle="We compared every viable route and ranked them by feasibility, time and uplift."
      />

      {/* from → to bar */}
      <Card
        inset
        className={cn(
          'rt-reveal mt-5 flex flex-wrap items-center gap-3 p-3.5',
          targetPickerOpen && 'relative z-50',
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {routeHeaderNodes.map((node, i) => {
            const isFirst = i === 0;
            const isLast = i === routeHeaderNodes.length - 1;
            const label = isFirst ? 'From' : isLast ? 'Target' : routeHeaderNodes.length > 3 ? `Step ${i}` : 'Via';
            return (
              <div key={`${node.id}-${i}`} className="flex min-w-0 items-center gap-2">
                <RouteEndpoint label={label} node={node} />
                {!isLast && <Icons.ArrowRight size={18} className="shrink-0 text-ink-mute" />}
              </div>
            );
          })}
        </div>
        <div className="relative ml-auto">
          <Button
            size="sm"
            variant="secondary"
            icon={Icons.Target}
            onClick={() => setTargetPickerOpen((o) => !o)}
          >
            Change target
          </Button>
          {targetPickerOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setTargetPickerOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-line/12 bg-surface p-1.5 shadow-glass">
                <div className="max-h-[min(20rem,60vh)] space-y-0.5 overflow-y-auto overscroll-contain pr-0.5">
                  {NODES.filter((n) => n.id !== from.id).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => pickTarget(n.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-line/5',
                        n.id === to.id && 'bg-brand/8',
                      )}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-amber" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {n.title}
                        </span>
                        <span className="block truncate text-xs capitalize text-ink-mute">
                          {n.kind}
                        </span>
                      </span>
                      {n.id === to.id && <Icons.Check size={15} className="shrink-0 text-brand" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {!loading && routesForTarget.length === 0 ? (
        <Card className="rt-reveal mt-4 grid place-items-center p-10 text-center">
          <div className="max-w-sm">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber/15 text-amber">
              <Icons.Route size={24} />
            </span>
            <h3 className="mt-4 font-display text-xl font-extrabold text-ink">
              Still mapping routes to {to.title}
            </h3>
            <p className="mt-1.5 text-sm text-ink-soft">
              We don’t have precomputed pathways to this target yet. Switch back to a charted
              destination to see the plan.
            </p>
            <Button
              className="mt-5"
              size="sm"
              icon={Icons.ArrowLeft}
              onClick={() => pickTarget(TARGET_NODE_ID)}
            >
              Back to {getNode(TARGET_NODE_ID)?.title}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          {/* Route options */}
          <div className="rt-reveal space-y-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-36" rounded="rounded-3xl" />
                ))
              : routesForTarget.map((r) => (
                  <RouteCard
                    key={r.id}
                    route={r}
                    active={r.id === selectedRoute?.id}
                    onSelect={() => setRoutingParam('route', r.id, defaultRoute?.id)}
                  />
                ))}
          </div>

          {/* Visual + breakdown */}
          <div className="rt-reveal space-y-4">
            {isDesktop && (
              <Card className="h-[320px] overflow-hidden p-0">
                {loading || !selectedRoute ? (
                  <Skeleton className="h-full w-full" rounded="rounded-3xl" />
                ) : (
                  <MapGraph
                    selectedId={null}
                    onSelect={() => {}}
                    highlightPath={selectedRoute.path}
                    currentId={from.id}
                    targetId={to.id}
                  />
                )}
              </Card>
            )}

            <Card className="p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <Icons.Workflow size={18} className="text-brand" />
                Step-by-step plan
              </h2>
              {loading || !selectedRoute ? (
                <div className="mt-4 space-y-3">
                  <SkeletonText lines={2} />
                  <Skeleton className="h-16" rounded="rounded-2xl" />
                  <Skeleton className="h-16" rounded="rounded-2xl" />
                </div>
              ) : (
                <RouteSteps route={selectedRoute} onExport={exportPlan} />
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function RouteEndpoint({
  label,
  node,
}: {
  label: string;
  node: CareerNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-surface px-3.5 py-2">
      <span
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          NODE_ACCENT_DOT[node.accent],
        )}
      />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-mute">{label}</div>
        <div className="truncate text-sm font-bold text-ink">{node.title}</div>
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

function RouteSteps({ route, onExport }: { route: RouteType; onExport: () => void }) {
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
                {isFirst ? 'Your starting point' : isLast ? 'Destination reached' : 'Stepping stone'}
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
            View destination
          </Button>
        </Link>
        <Button size="sm" variant="secondary" icon={Icons.Download} onClick={onExport}>
          Export plan
        </Button>
      </div>
    </div>
  );
}
