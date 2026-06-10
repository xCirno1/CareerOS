import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { ThemeToggle } from '@/ui/components';
import {
  RocketLaunch,
  PortalWarp,
  LiquidWipe,
  ConstellationConnect,
  PaperPlane,
  RippleBloom,
  CloudBloom,
  ElevatorRise,
  CompassSpin,
  type TransitionComponent,
  type TransitionEntry,
  type TransitionId,
  type TransitionProps,
} from '@/ui/transitions';

const TRANSITIONS: TransitionEntry[] = [
  {
    id: 'rocket',
    name: 'Rocket Launch',
    blurb: 'Rocket boosts up through a bloom of clouds.',
    emoji: '🚀',
    Component: RocketLaunch,
  },
  {
    id: 'portal',
    name: 'Portal Warp',
    blurb: 'Stars streak to hyperspace as a portal ring engulfs the screen.',
    emoji: '🌀',
    Component: PortalWarp,
  },
  {
    id: 'liquid',
    name: 'Liquid Wipe',
    blurb: 'A rippling fluid surface floods upward and fills the view.',
    emoji: '🌊',
    Component: LiquidWipe,
  },
  {
    id: 'constellation',
    name: 'Constellation Connect',
    blurb: 'Career nodes link up and a comet races the route.',
    emoji: '✨',
    Component: ConstellationConnect,
  },
  {
    id: 'paper-plane',
    name: 'Paper Plane',
    blurb: 'A folded plane swoops a dashed arc, then a panel sweeps in.',
    emoji: '✈️',
    Component: PaperPlane,
  },
  {
    id: 'ripple',
    name: 'Ripple Bloom',
    blurb: 'Concentric ink rings burst outward and flood the screen.',
    emoji: '💠',
    Component: RippleBloom,
  },
  {
    id: 'cloud-bloom',
    name: 'Cloud Bloom',
    blurb: 'Soft cloud puffs expand and dissolve into a calm white cover.',
    emoji: '☁️',
    Component: CloudBloom,
  },
  {
    id: 'elevator',
    name: 'Elevator Rise',
    blurb: 'A floor counter ticks to the top — "you\'ve arrived".',
    emoji: '🛗',
    Component: ElevatorRise,
  },
  {
    id: 'compass',
    name: 'Compass Spin',
    blurb: 'A compass needle whirls, locks a heading, then sweeps in.',
    emoji: '🧭',
    Component: CompassSpin,
  },
];

/**
 * Mounts a transition idle, then flips `launching` true on the next frame — the
 * same lifecycle the real Landing page uses. Mounting already-launching would
 * let StrictMode's double-invoked mount effect kill the GSAP timeline at frame
 * zero (it freezes and `onDone` never fires), so we always start from idle.
 */
function Stage({
  Component,
  onDone,
}: {
  Component: TransitionComponent;
  onDone: () => void;
}) {
  const [launching, setLaunching] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLaunching(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return <Component launching={launching} onDone={onDone} />;
}

export function TransitionLab() {
  // `active` holds the running transition's id; `runId` forces a fresh mount so
  // it replays even when the same button is pressed twice.
  const [active, setActive] = useState<TransitionId | null>(null);
  const [runId, setRunId] = useState(0);

  const play = (id: TransitionId) => {
    setActive(id);
    setRunId((n) => n + 1);
  };
  const entry = TRANSITIONS.find((t) => t.id === active);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-8">
        <Link
          to="/"
          className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <Icons.ArrowLeft size={16} strokeWidth={2.2} />
          Back to landing
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="eyebrow">Internal · sandbox</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Transition Lab
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Click any card to play its full-screen transition. Each one is drop-in
          compatible with the rocket launch — same{' '}
          <code className="rounded bg-line/10 px-1.5 py-0.5 text-sm">{`{ launching, onDone }`}</code>{' '}
          contract — so it can be wired to any navigation. Reduced-motion is
          honored (transitions complete instantly).
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRANSITIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => play(t.id)}
              disabled={active !== null}
              className="card focus-ring group flex flex-col items-start gap-3 rounded-3xl p-6 text-left transition hover:-translate-y-1 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">{t.emoji}</span>
              <span className="font-display text-lg font-bold">{t.name}</span>
              <span className="text-sm text-ink-soft">{t.blurb}</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand">
                {active === t.id ? 'Playing…' : 'Play ▸'}
              </span>
            </button>
          ))}
        </div>
      </main>

      {/* Only the active transition is mounted; remount via key replays it. */}
      {entry && (
        <Stage
          key={runId}
          Component={entry.Component}
          onDone={() => setActive(null)}
        />
      )}
    </div>
  );
}
