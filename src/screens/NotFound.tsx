import { Link } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { Button, Reveal } from '@/ui/components';

// Brand accents — kept in sync with ACCENT_HEX in MapGraph.tsx (raw SVG needs hex).
const ACCENT = {
  teal: '#2f7f8f',
  amber: '#f2b95e',
};

/** A node on the mini career-map used in the 404 illustration. */
interface MiniNode {
  x: number;
  y: number;
  r: number;
}

const PATH_NODES: MiniNode[] = [
  { x: 56, y: 188, r: 13 }, // start — "you are here"
  { x: 150, y: 112, r: 9 },
  { x: 244, y: 168, r: 9 },
];

// Faint background nodes that give the canvas some depth.
const SCATTER: MiniNode[] = [
  { x: 110, y: 56, r: 5 },
  { x: 312, y: 60, r: 6 },
  { x: 196, y: 222, r: 5 },
  { x: 350, y: 200, r: 4 },
];

const DESTINATIONS = [
  { to: '/map', label: 'The map', desc: 'Explore every career node', icon: Icons.Map },
  { to: '/onboarding', label: 'Onboarding', desc: 'Find your starting point', icon: Icons.ClipboardCheck },
  { to: '/routing', label: 'Routing', desc: 'Plot a path to your target', icon: Icons.Route },
];

/**
 * 404 — "off the map". Themed around the Traileers metaphor: the route the user
 * followed runs off the edge of the known graph and dangles into a node that
 * was never charted. Standalone (its own canvas + footer), like Landing/Login.
 */
export function NotFound() {
  return (
    <div className="relative h-screen max-h-screen h-dvh max-h-dvh overflow-hidden bg-canvas">
      {/* Ambient grid + glow, echoing the map canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.6]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--c-line)/0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-line)/0.06) 1px, transparent 1px)',
          backgroundSize: '38px 38px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
      />

      <div className="relative mx-auto flex h-full max-h-dvh max-w-5xl flex-col items-center justify-center px-4 py-4 sm:px-8 sm:py-6">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            {/* Off-map illustration */}
            <div className="w-full max-w-[13rem] sm:max-w-sm">
              <svg viewBox="0 0 400 260" className="h-auto w-full" role="img" aria-label="A career route running off the edge of the map">
                {/* charted edges */}
                <g stroke={ACCENT.teal} strokeOpacity="0.28" strokeWidth="1.5" fill="none">
                  <path d="M56 188 L150 112 L244 168" />
                  <path d="M150 112 L110 56" strokeOpacity="0.14" />
                  <path d="M244 168 L196 222" strokeOpacity="0.14" />
                </g>

                {/* the recommended (amber) route, flowing forward */}
                <path
                  d="M56 188 L150 112 L244 168"
                  fill="none"
                  stroke={ACCENT.amber}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="2 7"
                  className="motion-safe:animate-dash-flow"
                />

                {/* the broken segment — route runs off the charted graph */}
                <path
                  d="M244 168 C 300 150, 320 120, 352 96"
                  fill="none"
                  stroke={ACCENT.amber}
                  strokeOpacity="0.5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="2 9"
                  className="motion-safe:animate-dash-flow"
                />

                {/* faint scattered nodes */}
                {SCATTER.map((n, i) => (
                  <circle key={i} cx={n.x} cy={n.y} r={n.r} fill="rgb(var(--c-line)/0.18)" />
                ))}

                {/* charted nodes on the route */}
                {PATH_NODES.map((n, i) => (
                  <g key={i}>
                    <circle cx={n.x} cy={n.y} r={n.r + 5} fill={ACCENT.teal} fillOpacity="0.1" />
                    <circle cx={n.x} cy={n.y} r={n.r} fill="rgb(var(--c-surface))" stroke={ACCENT.teal} strokeWidth="2" />
                    {i === 0 && <circle cx={n.x} cy={n.y} r={4} fill={ACCENT.teal} />}
                  </g>
                ))}

                {/* the uncharted node — never existed */}
                <g className="motion-safe:animate-float" style={{ transformOrigin: '352px 96px' }}>
                  <circle cx="352" cy="96" r="22" fill={ACCENT.amber} fillOpacity="0.12" className="motion-safe:animate-pulse-ring" style={{ transformOrigin: '352px 96px' }} />
                  <circle
                    cx="352"
                    cy="96"
                    r="16"
                    fill="rgb(var(--c-surface))"
                    stroke={ACCENT.amber}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <text x="352" y="96" textAnchor="middle" dominantBaseline="central" fontSize="16" fontWeight="800" fill={ACCENT.amber} fontFamily="'JetBrains Mono', monospace">
                    ?
                  </text>
                </g>

                {/* "you are here" marker label */}
                <text x="56" y="218" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="1.5" fill={ACCENT.teal} fontFamily="'JetBrains Mono', monospace">
                  YOU
                </text>
              </svg>
            </div>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              <Icons.Crosshair size={13} className="text-amber" />
              Error 404 · Route not found
            </div>

            <h1 className="mt-4 font-display text-5xl font-black tracking-tighter text-ink sm:mt-5 sm:text-7xl">
              <span className="text-gradient">404</span>
            </h1>

            <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight text-ink sm:text-3xl">
              You've wandered off the map
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft sm:mt-3 sm:text-base">
              This route doesn't connect to any node we've charted. The page may have
              moved, been retired, or simply never existed on the Traileers graph.
            </p>

            <div className="mt-4 flex w-full max-w-xs flex-col items-center gap-2 sm:mt-6 sm:w-auto sm:max-w-none sm:flex-row sm:gap-3">
              <Link to="/" className="w-full sm:w-auto">
                <Button block size="md" icon={Icons.Compass}>
                  Back to base camp
                </Button>
              </Link>
              <Link to="/map" className="w-full sm:w-auto">
                <Button block size="md" variant="outline" iconRight={Icons.ArrowUpRight}>
                  Open the map
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Suggested destinations */}
        <Reveal>
          <div className="mt-5 w-full max-w-3xl sm:mt-8">
            <div className="mb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-mute sm:mb-3 sm:text-[11px]">
              Or re-route from here
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {DESTINATIONS.map((d) => (
                <Link
                  key={d.to}
                  to={d.to}
                  className="focus-ring group flex min-w-0 flex-col items-center gap-1 rounded-xl border border-line/10 bg-surface px-2 py-2 text-center shadow-soft transition hover:-translate-y-0.5 hover:border-brand/30 sm:flex-row sm:items-start sm:gap-3 sm:rounded-2xl sm:p-4 sm:text-left"
                >
                  <d.icon size={18} strokeWidth={2.2} className="shrink-0 text-brand transition group-hover:text-ink sm:mt-0.5 sm:size-5" />
                  <span className="min-w-0">
                    <span className="flex items-center justify-center gap-1 text-[11px] font-bold leading-tight text-ink sm:justify-start sm:text-sm">
                      {d.label}
                      <Icons.ChevronRight size={14} className="hidden text-ink-mute transition-transform group-hover:translate-x-0.5 sm:block" />
                    </span>
                    <span className="mt-0.5 hidden text-xs text-ink-soft sm:block">{d.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
