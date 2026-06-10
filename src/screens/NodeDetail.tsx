import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useSimulatedLoading } from '@/lib/hooks';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useAppStore } from '@/lib/appStore';
import {
  getNode,
  getNodeIcon,
  getNodeKindMeta,
  getNextActions,
  getNextHops,
  getSkillInfo,
  EDGE_KIND_META,
  DEMAND_META,
  PATTERNS,
  EMPLOYERS,
  edgesOf,
  CURRENT_NODE_ID,
  type NextAction,
  type NextHop,
  type NodeKind,
} from '@/lib/mockData';
import {
  Badge,
  Button,
  Card,
  ProgressRing,
  Sparkline,
  Tooltip,
  Avatar,
  Skeleton,
  SkeletonText,
  useToast,
} from '@/ui/components';

import type { LucideIcon } from '@/lib/icons';

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

/** Hero signal chips jump to the section that explains them. */
const SIGNAL_TARGET: Record<string, string> = {
  'Skill proximity': 'skills',
  'Open roles': 'employers',
  'Next-hop moves': 'next-hops',
  'Scope growth': 'patterns',
  'Trajectory fit': 'feasibility',
  'Leadership surface': 'patterns',
  'Time investment': 'actions',
  'Credential value': 'feasibility',
  'Network access': 'employers',
};

export function NodeDetail() {
  const { id } = useParams();
  const loading = useSimulatedLoading(950);
  const node = getNode(id ?? '');
  const { isSaved, toggleSaved, addRecent, setTarget } = useAppStore();
  const toast = useToast();
  const rootRef = useRef<HTMLDivElement>(null);
  const [doneSubtasks, setDoneSubtasks] = useState<Set<string>>(new Set());
  const [openAction, setOpenAction] = useState<NextAction | null>(null);

  useEffect(() => {
    if (node) addRecent(node.id);
  }, [node, addRecent]);

  useEffect(() => {
    if (loading || !rootRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.nd-reveal', {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.07,
      });
      gsap.from('.nd-bar', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.04,
        delay: 0.15,
      });
    }, rootRef);
    return () => ctx.revert();
  }, [loading]);

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
  const RoleIcon = getIcon(getNodeIcon(node));
  const kindMeta = getNodeKindMeta(node.kind);
  const KindIcon = getIcon(kindMeta.icon);
  const demand = DEMAND_META[node.demand];
  const inbound = edgesOf(node.id).filter((e) => e.to === node.id);
  const employers = EMPLOYERS.filter((e) => e.nodeId === node.id);
  const nextActions = getNextActions(node);
  const hops = getNextHops(node.id);

  const subKey = (actionId: string, i: number) => `${actionId}:${i}`;
  const actionDoneCount = (action: NextAction) =>
    action.subtasks.filter((_, i) => doneSubtasks.has(subKey(action.id, i))).length;
  const isActionDone = (action: NextAction) => actionDoneCount(action) === action.subtasks.length;
  const completedActions = nextActions.filter(isActionDone).length;
  const actionProgress = Math.round((completedActions / nextActions.length) * 100);

  const feasibility = inbound.length
    ? Math.round(inbound.reduce((s, e) => s + e.feasibility, 0) / inbound.length)
    : node.match;

  const makeTarget = () => {
    setTarget(node.id);
    toast(`${node.title} set as your target`, { icon: Icons.Target, tone: 'success' });
  };

  const toggleSubtask = (action: NextAction, i: number) => {
    setDoneSubtasks((prev) => {
      const next = new Set(prev);
      const k = subKey(action.id, i);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      const nowDone = action.subtasks.every((_, j) => next.has(subKey(action.id, j)));
      const wasDone = action.subtasks.every((_, j) => prev.has(subKey(action.id, j)));
      if (nowDone && !wasDone)
        toast(`Task complete — ${action.title}`, { icon: Icons.CheckCircle2, tone: 'success' });
      return next;
    });
  };

  const setAllSubtasks = (action: NextAction, value: boolean) => {
    setDoneSubtasks((prev) => {
      const next = new Set(prev);
      action.subtasks.forEach((_, i) => {
        const k = subKey(action.id, i);
        if (value) next.add(k);
        else next.delete(k);
      });
      return next;
    });
  };

  const jumpTo = (target?: string) => {
    if (!target) return;
    const el = document.getElementById(target);
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    el.classList.remove('nd-flash');
    void el.offsetWidth; // restart the flash animation
    el.classList.add('nd-flash');
    window.setTimeout(() => el.classList.remove('nd-flash'), 850);
  };

  return (
    <div ref={rootRef} className="mx-auto max-w-6xl p-4 sm:p-6">
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
        <Card className="nd-reveal overflow-hidden">
          <div className="relative p-6 sm:p-8" style={getKindHeroStyle(node.kind, accent)}>
            <div className="flex flex-wrap items-start gap-5">
              <span
                className={cn(
                  'grid h-16 w-16 shrink-0 place-items-center border shadow-soft',
                  node.kind === 'career'
                    ? 'rounded-[1.35rem]'
                    : node.kind === 'industry'
                      ? 'rounded-2xl border-dashed'
                      : 'rounded-3xl',
                )}
                style={{
                  backgroundColor: `${accent}1F`,
                  borderColor: `${accent}45`,
                  color: accent,
                }}
              >
                <RoleIcon size={30} strokeWidth={2.1} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={kindMeta.badgeTone} icon={KindIcon}>
                    {kindMeta.label}
                  </Badge>
                  <Badge
                    tone={node.growth >= 0 ? 'emerald' : 'wine'}
                    icon={node.growth >= 0 ? Icons.TrendingUp : Icons.TrendingDown}
                  >
                    {demand.label} demand
                  </Badge>
                </div>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  {node.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft sm:text-base">{node.summary}</p>
                <div className="mt-5 grid max-w-3xl gap-2 sm:grid-cols-3">
                  {kindMeta.signals.map((signal) => {
                    const target = SIGNAL_TARGET[signal];
                    return (
                      <button
                        key={signal}
                        type="button"
                        onClick={() => jumpTo(target)}
                        className={cn(
                          'group flex min-h-[56px] items-center gap-2 rounded-2xl border bg-surface/72 px-3 py-2 text-left text-sm font-semibold text-ink-soft backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-surface hover:text-ink hover:shadow-soft',
                          node.kind === 'industry' && 'border-dashed',
                        )}
                        style={{ borderColor: `${accent}30` }}
                      >
                        <KindIcon size={16} className="shrink-0" style={{ color: accent }} />
                        <span className="flex-1">{signal}</span>
                        <Icons.ArrowRight
                          size={14}
                          className="shrink-0 text-ink-mute opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/routing">
                    <Button
                      size="sm"
                      icon={Icons.Target}
                      iconRight={Icons.ArrowRight}
                      onClick={makeTarget}
                    >
                      Set target + plan
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant={isSaved(node.id) ? 'primary' : 'secondary'}
                    icon={isSaved(node.id) ? Icons.Check : Icons.Bookmark}
                    onClick={() => {
                      const nowSaved = toggleSaved(node.id);
                      toast(nowSaved ? `Saved ${node.title}` : `Removed ${node.title}`, {
                        icon: Icons.Bookmark,
                        tone: nowSaved ? 'success' : 'default',
                      });
                    }}
                  >
                    {isSaved(node.id) ? 'Saved' : 'Save role'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Icons.Share2}
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      toast('Link copied to clipboard', { icon: Icons.Share2, tone: 'info' });
                    }}
                  >
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
      <div className="nd-reveal mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,2fr)]">
        {loading ? (
          <Skeleton className="h-28" rounded="rounded-3xl" />
        ) : (
          <SpotlightCard
            accentHex={accent}
            className={cn('p-4', node.kind === 'industry' && 'border-dashed')}
            style={{ borderColor: `${accent}30` }}
          >
            <div className="flex items-start gap-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl"
                style={{ backgroundColor: `${accent}16`, color: accent }}
              >
                <KindIcon size={20} strokeWidth={2.3} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-ink">{kindMeta.detailTitle}</p>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{kindMeta.detailCopy}</p>
              </div>
            </div>
          </SpotlightCard>
        )}
        {loading ? (
          <Skeleton className="h-28 lg:h-full" rounded="rounded-3xl" />
        ) : (
          <SpotlightCard accentHex={accent} className="overflow-hidden p-0">
            <div className="grid h-full grid-cols-2 sm:grid-cols-4">
              <StatCell
                icon={Icons.Banknote}
                label="Median salary band"
                value={
                  node.salary.max
                    ? `${node.salary.currency}${node.salary.min}–${node.salary.max}k`
                    : '—'
                }
                tone="brand"
                cellClass={STAT_CELL_BORDERS[0]}
              />
              <StatCell
                icon={Icons.TrendingUp}
                label="YoY market growth"
                value={`${node.growth}%`}
                delta={node.growth}
                tone="amber"
                cellClass={STAT_CELL_BORDERS[1]}
              />
              <StatCell
                icon={Icons.Briefcase}
                label="Open roles now"
                value={node.openRoles.toLocaleString()}
                tone="navy"
                cellClass={STAT_CELL_BORDERS[2]}
              />
              <StatCell
                icon={Icons.Gauge}
                label="Avg feasibility in"
                value={`${feasibility}%`}
                tone="wine"
                cellClass={STAT_CELL_BORDERS[3]}
              />
            </div>
          </SpotlightCard>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="nd-reveal space-y-4">
          {/* Market demand */}
          <SpotlightCard accentHex={accent} id="demand" className="p-5 sm:p-6">
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
                <Sparkline
                  data={node.trend}
                  tone={node.growth >= 0 ? 'emerald' : 'wine'}
                  width={180}
                  height={56}
                />
              </div>
            )}
          </SpotlightCard>

          {/* Next-hop moves */}
          <SpotlightCard accentHex={accent} id="next-hops" className="p-5 sm:p-6">
            <SectionTitle
              icon={Icons.Footprints}
              title="Next-hop moves"
              hint={hops.length ? `${hops.length} reachable` : 'horizon node'}
            />
            {loading ? (
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" rounded="rounded-2xl" />
                ))}
              </div>
            ) : hops.length ? (
              <>
                <p className="mt-1.5 text-xs text-ink-mute">
                  Roles one realistic step from here — tap any to open it.
                </p>
                <div className="mt-3 space-y-2.5">
                  {hops.map((hop) => (
                    <NextHopRow key={hop.node.id} hop={hop} />
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-dashed border-line/15 bg-surface-2 p-4 text-sm text-ink-soft">
                <Icons.Compass size={18} className="mt-0.5 shrink-0 text-ink-mute" />
                A horizon node — no onward moves are mapped from here yet. It reads as a destination,
                not a stepping stone.
              </div>
            )}
          </SpotlightCard>

          {/* Prospects / skills */}
          <SpotlightCard accentHex={accent} id="skills" className="p-5 sm:p-6">
            <SectionTitle icon={Icons.Sparkles} title="Prospects & key skills" />
            {loading ? (
              <SkeletonText className="mt-4" lines={3} />
            ) : (
              <>
                <p className="mt-1 text-xs text-ink-mute">
                  Hover a skill to see how deep you’re expected to go.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {node.topSkills.map((s) => (
                    <Tooltip key={s} side="top" multiline content={getSkillInfo(s)}>
                      <span
                        tabIndex={0}
                        className="focus-ring inline-flex cursor-help items-center gap-1 rounded-full border border-line/10 bg-line/8 px-3 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-line/25 hover:bg-line/15 hover:text-ink"
                      >
                        {s}
                        <Icons.Info size={12} className="opacity-50" />
                      </span>
                    </Tooltip>
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
          </SpotlightCard>

          {/* Next actions */}
          <SpotlightCard accentHex={accent} id="actions" className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionTitle
                icon={Icons.ClipboardCheck}
                title="What to do next"
                hint={`${completedActions}/${nextActions.length} done`}
              />
              {!loading && (
                <span className="rounded-full bg-line/8 px-2.5 py-1 text-xs font-bold text-ink-soft">
                  {actionProgress}% ready
                </span>
              )}
            </div>
            {loading ? (
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" rounded="rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                <p className="mt-1.5 text-xs text-ink-mute">
                  Each step opens a checklist with subtasks and the “how”.
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-line/10">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${actionProgress}%` }}
                  />
                </div>
                <div className="mt-4 space-y-2.5">
                  {nextActions.map((action) => (
                    <ActionRow
                      key={action.id}
                      action={action}
                      accentHex={accent}
                      doneCount={actionDoneCount(action)}
                      isDone={isActionDone(action)}
                      onOpen={() => setOpenAction(action)}
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/routing" className="flex-1">
                    <Button
                      block
                      size="sm"
                      icon={Icons.Route}
                      iconRight={Icons.ArrowRight}
                      onClick={makeTarget}
                    >
                      Build my route
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant={isSaved(node.id) ? 'primary' : 'secondary'}
                    icon={isSaved(node.id) ? Icons.Check : Icons.Bookmark}
                    onClick={() => {
                      const nowSaved = toggleSaved(node.id);
                      toast(nowSaved ? `Saved ${node.title}` : `Removed ${node.title}`, {
                        icon: Icons.Bookmark,
                        tone: nowSaved ? 'success' : 'default',
                      });
                    }}
                  >
                    {isSaved(node.id) ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </>
            )}
          </SpotlightCard>

          {/* Historical patterns */}
          <SpotlightCard accentHex={accent} id="patterns" className="p-5 sm:p-6">
            <SectionTitle
              icon={Icons.GitBranch}
              title="Historical patterns"
              hint="How people reached this role"
            />
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
                        <div
                          className="nd-bar h-full rounded-full bg-brand"
                          style={{ width: `${p.share * 2.6}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-mute">{p.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* Right column */}
        <div className="nd-reveal space-y-4">
          {/* Feasibility */}
          <SpotlightCard accentHex={accent} id="feasibility" className="p-5 sm:p-6">
            <SectionTitle icon={Icons.Gauge} title="Feasibility for you" />
            {loading ? (
              <div className="mt-4 flex flex-col items-center gap-3">
                <Skeleton className="h-28 w-28" rounded="rounded-full" />
                <SkeletonText lines={2} className="w-full" />
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center text-center">
                <ProgressRing
                  value={feasibility}
                  size={132}
                  sublabel="reachable"
                  tone={feasibility >= 65 ? 'emerald' : feasibility >= 50 ? 'amber' : 'wine'}
                />
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
          </SpotlightCard>

          {/* Employer positions */}
          <SpotlightCard accentHex={accent} id="employers" className="p-5 sm:p-6">
            <SectionTitle
              icon={Icons.BadgeCheck}
              title="Employer positions"
              hint={`${employers.length} verified`}
            />
            {loading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" rounded="rounded-2xl" />
                ))}
              </div>
            ) : employers.length ? (
              <div className="mt-4 space-y-2.5">
                {employers.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-2xl border border-line/10 bg-surface-2 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={e.name} size={38} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-ink">{e.name}</p>
                          {e.verified && (
                            <Icons.BadgeCheck size={14} className="shrink-0 text-brand" />
                          )}
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
          </SpotlightCard>
        </div>
      </div>

      {openAction && (
        <TaskDetailModal
          action={openAction}
          accentHex={accent}
          doneSubtasks={doneSubtasks}
          onToggle={(i) => toggleSubtask(openAction, i)}
          onToggleAll={(value) => setAllSubtasks(openAction, value)}
          onClose={() => setOpenAction(null)}
        />
      )}
    </div>
  );
}

/**
 * Card with a lightweight cursor-following spotlight sheen. The sheen is a
 * pointer-events:none overlay, and we only update two CSS vars (rAF-throttled),
 * so it never interferes with hover/click on the card's contents.
 */
function SpotlightCard({
  accentHex,
  className,
  style,
  children,
  ...rest
}: ComponentProps<typeof Card> & { accentHex: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      const { clientX, clientY } = e;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--my', `${((clientY - r.top) / r.height) * 100}%`);
      });
    };
    el.addEventListener('pointermove', onMove);
    return () => {
      el.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <Card
      ref={ref}
      className={cn('spotlight', className)}
      style={{ ...(style as CSSProperties), '--spot': `${accentHex}26` } as CSSProperties}
      {...rest}
    >
      {children}
    </Card>
  );
}

/**
 * Per-cell dividers for the 4-up stats card. Index order matters: clean lines
 * for a 2×2 grid on mobile and a single row of 4 on desktop.
 */
const STAT_CELL_BORDERS = [
  '',
  'border-l border-line/10',
  'border-t border-line/10 sm:border-t-0 sm:border-l',
  'border-l border-t border-line/10 sm:border-t-0',
];

const STAT_TONE_TEXT: Record<string, string> = {
  brand: 'text-brand',
  amber: 'text-[#8a6530] dark:text-amber',
  wine: 'text-wine dark:text-wine-soft',
  navy: 'text-navy dark:text-brand',
};

function StatCell({
  icon: Icon,
  label,
  value,
  delta,
  tone,
  cellClass,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number;
  tone: 'brand' | 'amber' | 'wine' | 'navy';
  cellClass?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className={cn('flex h-full min-h-[7.75rem] flex-col justify-center px-4 py-3.5', cellClass)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-mute">
        <Icon size={13} strokeWidth={2.3} className={cn('shrink-0', STAT_TONE_TEXT[tone])} />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-xl font-extrabold leading-none tracking-tight text-ink sm:text-[1.45rem]">
          {value}
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center text-[11px] font-bold',
              up ? 'text-emerald-500' : 'text-wine',
            )}
          >
            {up ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
    </div>
  );
}

function NextHopRow({ hop }: { hop: NextHop }) {
  const meta = EDGE_KIND_META[hop.edge.kind];
  const RoleIcon = getIcon(getNodeIcon(hop.node));
  const KindIcon = getIcon(meta.icon);
  const accentHex = ACCENT_HEX[hop.node.accent];
  return (
    <Link
      to={`/node/${hop.node.id}`}
      className="nd-hop focus-ring group flex items-center gap-3 rounded-2xl border border-line/10 bg-surface-2 p-3 transition hover:-translate-y-0.5 hover:border-line/25 hover:bg-surface hover:shadow-soft"
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border"
        style={{ backgroundColor: `${accentHex}16`, borderColor: `${accentHex}30`, color: accentHex }}
      >
        <RoleIcon size={20} strokeWidth={2.1} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-bold text-ink">{hop.node.title}</p>
          <Icons.ArrowUpRight
            size={14}
            className="shrink-0 text-ink-mute transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
          />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className={cn('inline-flex items-center gap-1 font-semibold', meta.tone)}>
            <KindIcon size={12} /> {meta.label}
          </span>
          <span className="inline-flex items-center gap-1 text-ink-mute">
            <Icons.Clock size={12} /> ~{hop.edge.months} mo
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm font-extrabold text-ink">{hop.edge.feasibility}%</div>
        <div className="mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-line/12">
          <div
            className="nd-bar h-full rounded-full"
            style={{ width: `${hop.edge.feasibility}%`, backgroundColor: accentHex }}
          />
        </div>
        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-mute">
          feasible
        </div>
      </div>
    </Link>
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
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <h2 className="flex min-w-0 items-center gap-2 text-base font-bold text-ink">
        <Icon size={18} className="text-brand" />
        <span className="min-w-0 truncate">{title}</span>
      </h2>
      {hint && <span className="shrink-0 text-xs font-semibold text-ink-mute">{hint}</span>}
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

function ActionRow({
  action,
  accentHex,
  doneCount,
  isDone,
  onOpen,
}: {
  action: NextAction;
  accentHex: string;
  doneCount: number;
  isDone: boolean;
  onOpen: () => void;
}) {
  const total = action.subtasks.length;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'focus-ring group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition',
        isDone
          ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
          : 'border-line/10 bg-surface-2 hover:-translate-y-0.5 hover:border-line/25 hover:bg-surface hover:shadow-soft',
      )}
    >
      <SubtaskRing count={doneCount} total={total} done={isDone} accentHex={accentHex} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">
            {action.timeframe}
          </span>
          <span className="rounded-full bg-line/8 px-2 py-0.5 text-[11px] font-semibold text-ink-soft">
            {action.effort}
          </span>
        </span>
        <span
          className={cn(
            'mt-1 block text-sm font-bold text-ink',
            isDone && 'text-ink-mute line-through decoration-emerald-500/60',
          )}
        >
          {action.title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-ink-soft">{action.description}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-line/8 px-2 py-0.5 text-[10px] font-bold text-ink-mute">
          <Icons.ListChecks size={11} /> {doneCount}/{total}
        </span>
        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-brand">
          How
          <Icons.ChevronRight size={13} className="transition group-hover:translate-x-0.5" />
        </span>
      </span>
    </button>
  );
}

function SubtaskRing({
  count,
  total,
  done,
  accentHex,
}: {
  count: number;
  total: number;
  done: boolean;
  accentHex: string;
}) {
  const size = 36;
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total ? count / total : 0;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line/15" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - pct * c}
          className="transition-[stroke-dashoffset] duration-500"
          style={{ stroke: done ? '#10b981' : accentHex }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        {done ? (
          <Icons.Check size={15} strokeWidth={3} className="text-emerald-500" />
        ) : (
          <span className="text-[11px] font-extrabold text-ink-soft">{count}</span>
        )}
      </span>
    </span>
  );
}

function TaskDetailModal({
  action,
  accentHex,
  doneSubtasks,
  onToggle,
  onToggleAll,
  onClose,
}: {
  action: NextAction;
  accentHex: string;
  doneSubtasks: Set<string>;
  onToggle: (index: number) => void;
  onToggleAll: (value: boolean) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (prefersReducedMotion() || !panelRef.current) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .from(panelRef.current, {
          yPercent: 6,
          autoAlpha: 0,
          scale: 0.96,
          duration: 0.38,
          ease: 'power3.out',
        })
        .from(
          '.td-sub',
          {
            x: -10,
            opacity: 0,
            stagger: 0.06,
            duration: 0.3,
            ease: 'power2.out',
            // render visible by default; only animate when the tween actually
            // plays, and clear inline styles afterwards so nothing can leave the
            // subtasks stuck hidden.
            immediateRender: false,
            clearProps: 'transform,opacity',
          },
          '-=0.12',
        );
    }, panelRef);
    return () => ctx.revert();
  }, []);

  const total = action.subtasks.length;
  const done = action.subtasks.filter((_, i) => doneSubtasks.has(`${action.id}:${i}`)).length;
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={action.title}
    >
      <div className="absolute inset-0 bg-navy/45 backdrop-blur-[3px]" onClick={onClose} />
      <div
        ref={panelRef}
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-[1.75rem] border border-line/10 bg-surface shadow-glass sm:max-w-lg sm:rounded-[1.75rem]"
      >
        <div
          className="relative overflow-hidden p-5 sm:p-6"
          style={{ background: `linear-gradient(130deg, ${accentHex}24, transparent 72%)` }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-surface/70 text-ink-mute transition hover:text-ink"
          >
            <Icons.X size={16} />
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: `${accentHex}24`, color: accentHex }}
            >
              <Icons.Clock size={12} /> {action.timeframe}
            </span>
            <span className="rounded-full bg-line/10 px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
              {action.effort}
            </span>
          </div>
          <h3 className="mt-3 pr-8 text-xl font-extrabold leading-tight text-ink">{action.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{action.detail}</p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
              <Icons.ListChecks size={16} className="text-brand" /> Subtasks
            </h4>
            <span className="text-xs font-bold text-ink-soft">{done}/{total} done</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: allDone ? '#10b981' : accentHex }}
            />
          </div>

          <div className="mt-4 space-y-2">
            {action.subtasks.map((st, i) => {
              const checked = doneSubtasks.has(`${action.id}:${i}`);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onToggle(i)}
                  className={cn(
                    'td-sub focus-ring flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                    checked
                      ? 'border-emerald-500/30 bg-emerald-500/8'
                      : 'border-line/10 bg-surface-2 hover:border-line/25',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
                      checked
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-line/30 text-transparent',
                    )}
                  >
                    <Icons.Check size={12} strokeWidth={3} />
                  </span>
                  <span
                    className={cn(
                      'text-sm font-medium text-ink',
                      checked && 'text-ink-mute line-through',
                    )}
                  >
                    {st}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex gap-2">
            <Button
              block
              size="sm"
              variant={allDone ? 'primary' : 'secondary'}
              icon={allDone ? Icons.Check : Icons.ListChecks}
              onClick={() => onToggleAll(!allDone)}
            >
              {allDone ? 'Completed — reset' : 'Mark all complete'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
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

function getKindHeroStyle(kind: NodeKind, accent: string): CSSProperties {
  if (kind === 'career') {
    return {
      background: `
        linear-gradient(120deg, ${accent}18, transparent 62%),
        radial-gradient(circle at 88% 18%, ${accent}18 0 14%, transparent 15%),
        linear-gradient(135deg, rgb(var(--c-surface)) 0%, rgb(var(--c-surface-2)) 100%)
      `,
    };
  }
  if (kind === 'industry') {
    return {
      background: `
        repeating-linear-gradient(135deg, ${accent}10 0 10px, transparent 10px 22px),
        linear-gradient(120deg, ${accent}16, transparent 58%),
        rgb(var(--c-surface))
      `,
    };
  }
  return {
    background: `
      linear-gradient(120deg, ${accent}14, transparent 60%),
      radial-gradient(circle at 86% 22%, rgb(var(--c-brand) / 0.10), transparent 28%),
      rgb(var(--c-surface))
    `,
  };
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
