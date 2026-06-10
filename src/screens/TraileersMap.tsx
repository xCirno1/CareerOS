import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useSimulatedLoading, useMediaQuery } from '@/lib/hooks';
import { useAppStore } from '@/lib/appStore';
import {
  NODES,
  CURRENT_NODE_ID,
  TARGET_NODE_ID,
  getNode,
  ROUTES,
  type NodeKind,
} from '@/lib/mockData';
import { MapGraph } from '@/components/MapGraph';
import { NodeSummary, NodeSummarySkeleton } from '@/components/NodeSummary';
import { PageHeader } from '@/components/PageHeader';
import { SegmentedControl, Button, type Segment } from '@/ui/components';

const KIND_FILTERS: Segment<NodeKind | 'all'>[] = [
  { value: 'all', label: 'All', icon: Icons.Boxes },
  { value: 'job', label: 'Jobs', icon: Icons.Briefcase },
  { value: 'career', label: 'Careers', icon: Icons.TrendingUp },
  { value: 'industry', label: 'Routes', icon: Icons.GraduationCap },
];

export function TraileersMap() {
  const loading = useSimulatedLoading(1000);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { saved } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(CURRENT_NODE_ID);
  const [kind, setKind] = useState<NodeKind | 'all'>('all');
  const [showRoute, setShowRoute] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [focusSaved, setFocusSaved] = useState(false);

  const selected = selectedId ? getNode(selectedId) : null;
  const recommended = ROUTES.find((r) => r.recommended)!;
  const filterKinds = kind === 'all' ? undefined : new Set([kind]);
  const focusIds = focusSaved && saved.length ? new Set(saved) : undefined;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 sm:p-6">
      <PageHeader
        eyebrow="Traileers™ Map"
        icon={Icons.Network}
        title="Your career landscape"
        subtitle="Each point is a job, career or route. Lines are transitions real people have made."
        actions={
          <>
            <Button
              variant={showRoute ? 'primary' : 'secondary'}
              size="sm"
              icon={Icons.Route}
              onClick={() => setShowRoute((s) => !s)}
            >
              {showRoute ? 'Hide route' : 'Show route'}
            </Button>
            <div className="relative">
              <Button
                variant={focusSaved ? 'primary' : 'secondary'}
                size="sm"
                icon={Icons.SlidersHorizontal}
                onClick={() => setFiltersOpen((o) => !o)}
              >
                Filters
              </Button>
              {filtersOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFiltersOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-64 animate-fade-up rounded-2xl border border-line/12 bg-surface p-3 shadow-glass">
                    <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                      Map filters
                    </p>
                    <FilterSwitch
                      label="Show recommended route"
                      on={showRoute}
                      onClick={() => setShowRoute((s) => !s)}
                    />
                    <FilterSwitch
                      label={`Focus saved roles${saved.length ? ` (${saved.length})` : ''}`}
                      on={focusSaved}
                      disabled={saved.length === 0}
                      onClick={() => setFocusSaved((f) => !f)}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          segments={KIND_FILTERS}
          value={kind}
          onChange={setKind}
          size="sm"
        />
        <div className="hidden items-center gap-2 text-xs font-semibold text-ink-mute sm:flex">
          <Icons.Sparkles size={14} className="text-amber" />
          Recommended route: {recommended.label}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_360px]">
        {/* graph */}
        <div className="relative min-h-[340px]">
          {loading ? (
            <div className="grid h-full w-full place-items-center rounded-3xl border border-line/10 bg-surface-2">
              <div className="flex flex-col items-center gap-3 text-ink-mute">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-line/20 border-t-brand" />
                <span className="text-sm font-semibold">Plotting your landscape…</span>
              </div>
            </div>
          ) : (
            <MapGraph
              selectedId={selectedId}
              onSelect={setSelectedId}
              highlightPath={showRoute ? recommended.path : undefined}
              filterKinds={filterKinds}
              focusIds={focusIds}
            />
          )}
        </div>

        {/* detail panel (desktop) / sheet (mobile) */}
        {isDesktop ? (
          <aside className="card min-h-0 overflow-y-auto p-5">
            {loading ? (
              <NodeSummarySkeleton />
            ) : selected ? (
              <NodeSummary node={selected} />
            ) : (
              <EmptyPanel />
            )}
          </aside>
        ) : (
          selected &&
          !loading && (
            <MobileSheet onClose={() => setSelectedId(null)}>
              <NodeSummary node={selected} />
            </MobileSheet>
          )
        )}
      </div>

      {/* quick legend chips on mobile */}
      {!loading && (
        <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
          {[CURRENT_NODE_ID, TARGET_NODE_ID, ...NODES.filter((n) => n.id !== CURRENT_NODE_ID && n.id !== TARGET_NODE_ID).map((n) => n.id)].map(
            (id) => {
              const n = getNode(id)!;
              const active = id === selectedId;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedId(id)}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                    active
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-line/12 bg-surface text-ink-soft',
                  )}
                >
                  {n.title}
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

function FilterSwitch({
  label,
  on,
  onClick,
  disabled,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-semibold transition',
        disabled ? 'cursor-not-allowed text-ink-mute/50' : 'text-ink hover:bg-line/5',
      )}
    >
      {label}
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition',
          on ? 'bg-brand' : 'bg-line/20',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
            on ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}

function EmptyPanel() {
  return (
    <div className="grid h-full place-items-center text-center">
      <div className="text-ink-mute">
        <Icons.Crosshair size={28} className="mx-auto mb-2" />
        <p className="text-sm font-semibold">Select a point</p>
        <p className="text-xs">Tap any point on the map to see its detail.</p>
      </div>
    </div>
  );
}

function MobileSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end lg:hidden">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[82vh] w-full animate-fade-up overflow-y-auto rounded-t-[2rem] border-t border-line/10 bg-surface p-5 pb-28 shadow-glass">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line/20" />
        <button
          onClick={onClose}
          className="focus-ring absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-surface-2 text-ink-soft"
        >
          <Icons.X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
