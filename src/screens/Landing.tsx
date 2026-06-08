import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import {
  useScrollLerp,
  useInView,
  useCountUp,
  useReducedMotion,
} from '@/lib/hooks';
import { clamp01, lerp, smoothstep, subProgress, bandOpacity } from '@/lib/math';
import {
  NODES,
  EDGES,
  getNode,
  CURRENT_NODE_ID,
  TARGET_NODE_ID,
} from '@/lib/mockData';
import { Button, Logo, ThemeToggle, Badge, Reveal } from '@/ui/components';

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

/* ------------------------------------------------------------------ */
/* Marketing top nav                                                   */
/* ------------------------------------------------------------------ */
function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-line/10 bg-canvas/80 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 sm:px-8">
        <Link to="/" className="focus-ring rounded-xl">
          <Logo />
        </Link>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {['Product', 'Traileers', 'Employers', 'Pricing'].map((l) => (
            <a
              key={l}
              href="#features"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-line/5 hover:text-ink"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link to="/map" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/map">
            <Button size="sm" iconRight={Icons.ArrowRight}>
              Open app
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero floating node-graph backdrop                                   */
/* ------------------------------------------------------------------ */
function HeroBackdrop({ parallax }: { parallax: number }) {
  // a few decorative nodes positioned in %; float independently
  const nodes = [
    { x: 12, y: 24, d: 56, accent: 'teal', icon: Icons.Compass, delay: 0 },
    { x: 82, y: 18, d: 64, accent: 'amber', icon: Icons.TrendingUp, delay: 1.1 },
    { x: 70, y: 64, d: 72, accent: 'wine', icon: Icons.Target, delay: 0.6 },
    { x: 22, y: 70, d: 50, accent: 'navy', icon: Icons.Briefcase, delay: 1.6 },
    { x: 46, y: 12, d: 44, accent: 'teal', icon: Icons.Sparkles, delay: 0.3 },
    { x: 90, y: 46, d: 40, accent: 'navy', icon: Icons.GraduationCap, delay: 2 },
  ];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ transform: `translateY(${parallax * 40}px)` }}
    >
      {/* glow blobs */}
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-amber/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-wine/10 blur-3xl" />
      {/* connecting lines */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <line x1="14%" y1="28%" x2="48%" y2="16%" className="stroke-line/15" strokeWidth="1.5" />
        <line x1="48%" y1="16%" x2="84%" y2="22%" className="stroke-line/15" strokeWidth="1.5" />
        <line x1="84%" y1="22%" x2="72%" y2="66%" className="stroke-line/15" strokeWidth="1.5" />
        <line x1="24%" y1="72%" x2="72%" y2="66%" className="stroke-line/15" strokeWidth="1.5" />
        <line x1="14%" y1="28%" x2="24%" y2="72%" className="stroke-line/15" strokeWidth="1.5" />
      </svg>
      {nodes.map((n, i) => {
        const Icon = n.icon;
        return (
          <div
            key={i}
            className="absolute grid animate-float place-items-center rounded-2xl border border-line/10 bg-surface/70 shadow-glass backdrop-blur-md"
            style={{
              left: `${n.x}%`,
              top: `${n.y}%`,
              width: n.d,
              height: n.d,
              animationDelay: `${n.delay}s`,
              color: ACCENT_HEX[n.accent],
            }}
          >
            <Icon size={n.d * 0.4} strokeWidth={2} />
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Story stage — the scroll-lerp cinematic map build                   */
/* ------------------------------------------------------------------ */
const STORY = [
  {
    badge: 'Career State Assessment',
    title: 'This is you, today.',
    body: 'CareerOS pinpoints your exact node from your background, skills and the work you’ve actually shipped.',
    icon: Icons.Crosshair,
  },
  {
    badge: 'The Traileers™ map',
    title: 'Every realistic move, mapped.',
    body: 'Jobs, careers and industries become nodes — connected by transitions real people have made.',
    icon: Icons.Network,
  },
  {
    badge: 'Dynamic routing',
    title: 'We draw the route with the best odds.',
    body: 'Tradeoffs, qualifications and your interests resolve into one recommended path to your target.',
    icon: Icons.Route,
  },
  {
    badge: 'Feasibility engine',
    title: 'Backed by how thousands got there.',
    body: 'Every step is scored against historical trajectories — so the plan is grounded in evidence, not vibes.',
    icon: Icons.Gauge,
  },
];

function StoryStage() {
  const reduced = useReducedMotion();
  const { stageRef, progress } = useScrollLerp(0.12);

  const current = getNode(CURRENT_NODE_ID)!;
  const target = getNode(TARGET_NODE_ID)!;

  // camera pans horizontally from current node to target node
  const eased = smoothstep(progress);
  const focusX = lerp(current.x, target.x, eased);
  const focusY = lerp(current.y + 20, target.y, eased);
  const scale = lerp(1.18, 1.32, eased);
  const tx = 500 - focusX * scale;
  const ty = 340 - focusY * scale;

  const edgesIn = subProgress(progress, 0.22, 0.5);
  const routeDrawn = subProgress(progress, 0.48, 0.84);
  const feasIn = subProgress(progress, 0.82, 0.98);

  // recommended route nodes light up sequentially
  const routePath = ['frontend-dev', 'data-analyst', 'product-lead'];
  const routeThresholds: Record<string, number> = {
    'frontend-dev': 0,
    'data-analyst': 0.45,
    'product-lead': 0.7,
  };
  const routePoints = routePath.map((id) => getNode(id)!);
  const routeD = routePoints
    .map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x},${n.y}`)
    .join(' ');

  const feas = useCountUp(74, feasIn > 0.1, 900);

  return (
    <section ref={stageRef} className="relative h-[420vh]">
      <div className="welcome-stage sticky top-0 h-screen overflow-hidden">
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'linear-gradient(rgb(var(--c-line)/0.05) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--c-line)/0.05) 1px,transparent 1px)',
            backgroundSize: '46px 46px',
          }}
        />

        {/* the map */}
        <svg
          viewBox="0 0 1000 680"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <g
            transform={`translate(${tx} ${ty}) scale(${scale})`}
            style={{ transition: reduced ? undefined : 'none' }}
          >
            {/* all edges */}
            {EDGES.map((e, i) => {
              const a = getNode(e.from)!;
              const b = getNode(e.to)!;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="rgb(var(--c-line))"
                  strokeOpacity={0.18 * edgesIn}
                  strokeWidth={1.4}
                />
              );
            })}

            {/* recommended route (draws in) */}
            <path
              d={routeD}
              fill="none"
              stroke={ACCENT_HEX.amber}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - routeDrawn}
              style={{ filter: 'drop-shadow(0 2px 8px rgba(242,185,94,0.5))' }}
            />

            {/* nodes */}
            {NODES.map((n) => {
              const isCurrent = n.id === CURRENT_NODE_ID;
              const isTarget = n.id === TARGET_NODE_ID;
              const onRoute = n.id in routeThresholds;
              const active = onRoute ? progress >= routeThresholds[n.id] : false;
              const r = isCurrent || isTarget ? 30 : 22;
              return (
                <g key={n.id}>
                  {(isCurrent || isTarget) && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill="none"
                      stroke={isTarget ? ACCENT_HEX.amber : ACCENT_HEX.teal}
                      strokeWidth={2}
                      className={reduced ? '' : 'animate-pulse-ring'}
                      style={{ transformOrigin: `${n.x}px ${n.y}px`, opacity: active ? 1 : 0.2 }}
                    />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r}
                    fill="rgb(var(--c-surface))"
                    stroke={ACCENT_HEX[n.accent]}
                    strokeWidth={active ? 3.5 : 2}
                    style={{
                      opacity: active ? 1 : lerp(0.35, 0.6, edgesIn),
                      transition: 'opacity 0.2s',
                    }}
                  />
                  <text
                    x={n.x}
                    y={n.y + r + 16}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={700}
                    fill="rgb(var(--c-ink))"
                    style={{ opacity: active ? 1 : 0.45 }}
                  >
                    {n.title}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* feasibility chip */}
        <div
          className="absolute right-6 top-24 hidden rounded-3xl border border-line/10 bg-surface/85 p-5 shadow-glass backdrop-blur-xl sm:block"
          style={{ opacity: feasIn, transform: `translateY(${(1 - feasIn) * 16}px)` }}
        >
          <p className="eyebrow">Feasibility</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-4xl font-extrabold text-ink">{Math.round(feas)}%</span>
            <Badge tone="emerald" icon={Icons.TrendingUp} className="mb-1.5">
              strong
            </Badge>
          </div>
          <p className="mt-1 max-w-[200px] text-xs text-ink-mute">
            Frontend → Product Analyst → Product Lead
          </p>
        </div>

        {/* captions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-16 sm:px-10 lg:bottom-24">
          <div className="relative mx-auto h-44 max-w-2xl">
            {STORY.map((s, i) => {
              const start = i * 0.25;
              const op = bandOpacity(progress, start, start + 0.25, 0.06);
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="absolute inset-x-0 bottom-0 rounded-4xl border border-line/10 bg-surface/85 p-6 shadow-glass backdrop-blur-xl"
                  style={{
                    opacity: op,
                    transform: `translateY(${(1 - op) * 20}px)`,
                  }}
                >
                  <div className="flex items-center gap-2 text-brand">
                    <Icon size={18} strokeWidth={2.2} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-soft sm:text-base">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* progress rail */}
        <div className="absolute left-1/2 top-6 flex -translate-x-1/2 gap-1.5">
          {STORY.map((_, i) => {
            const fill = clamp01((progress - i * 0.25) / 0.25);
            return (
              <span key={i} className="h-1 w-10 overflow-hidden rounded-full bg-line/15">
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${fill * 100}%` }}
                />
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Feature grid                                                        */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    icon: Icons.Crosshair,
    title: 'Career State Assessment',
    body: 'We locate your current node from background, skills, experience and what you actually want.',
    accent: 'teal',
  },
  {
    icon: Icons.Route,
    title: 'Dynamic routing',
    body: 'See every viable path to a target node, with one recommended route based on real tradeoffs.',
    accent: 'amber',
  },
  {
    icon: Icons.LineChart,
    title: 'Node detail & live demand',
    body: 'Per-node prospects, salary bands and market demand — personalized to your profile.',
    accent: 'teal',
  },
  {
    icon: Icons.GitBranch,
    title: 'Historical patterns',
    body: 'Common trajectories, lateral shifts, career gaps and higher-study routes others have taken.',
    accent: 'wine',
  },
  {
    icon: Icons.Gauge,
    title: 'Feasibility recommendation',
    body: 'Data-driven odds from comparing your state to thousands of historical journeys.',
    accent: 'navy',
  },
  {
    icon: Icons.BadgeCheck,
    title: 'Employer positions',
    body: 'Verified companies pin open roles onto nodes, showing the paths they actually hire from.',
    accent: 'amber',
  },
];

function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge tone="brand" icon={Icons.Layers}>
          One platform
        </Badge>
        <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Everything the map knows about{' '}
          <span className="text-gradient">your next move</span>
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          Six capabilities, one continuous picture of where you are and where you could go.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="card group h-full p-6 transition hover:-translate-y-1 hover:shadow-glass">
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl shadow-soft"
                  style={{
                    backgroundColor: `${ACCENT_HEX[f.accent]}1A`,
                    color: ACCENT_HEX[f.accent],
                  }}
                >
                  <Icon size={22} strokeWidth={2.1} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{f.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand opacity-0 transition group-hover:opacity-100">
                  Explore <Icons.ArrowRight size={15} />
                </span>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stats band with count-up                                            */
/* ------------------------------------------------------------------ */
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, threshold: 0.5 });
  const n = useCountUp(value, inView);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl font-extrabold text-ink sm:text-5xl">
        {Math.round(n).toLocaleString()}
        {suffix}
      </div>
      <div className="mt-1 text-sm font-medium text-ink-mute">{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <section className="border-y border-line/10 bg-surface/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-5 py-16 sm:px-8 md:grid-cols-4">
        <StatItem value={2400000} suffix="+" label="Career journeys analyzed" />
        <StatItem value={18000} suffix="" label="Mapped nodes" />
        <StatItem value={92} suffix="%" label="Route confidence accuracy" />
        <StatItem value={3400} suffix="" label="Verified employer roles" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA + footer                                                        */
/* ------------------------------------------------------------------ */
function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Reveal direction="scale">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy via-navy-600 to-teal p-10 text-white shadow-glow sm:p-16 dark:from-navy-700 dark:to-brand">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber/30 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <Badge tone="amber" icon={Icons.Sparkles} className="bg-white/15 text-white">
              Start free
            </Badge>
            <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Stop guessing your next move. See the map.
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Run your Career State Assessment in minutes and watch CareerOS route you to where you
              want to be — with the odds attached.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/assessment">
                <Button
                  size="lg"
                  iconRight={Icons.ArrowRight}
                  className="bg-white text-navy hover:bg-white/90 dark:bg-white dark:text-navy"
                >
                  Take the assessment
                </Button>
              </Link>
              <Link to="/map">
                <Button
                  size="lg"
                  variant="outline"
                  icon={Icons.Network}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Explore the map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-center sm:px-8">
        <Logo />
        <p className="text-sm text-ink-mute sm:ml-4">
          The career-navigation platform. © {new Date().getFullYear()} CareerOS.
        </p>
        <div className="flex gap-5 text-sm font-semibold text-ink-soft sm:ml-auto">
          <a href="#features" className="hover:text-ink">Product</a>
          <a href="#features" className="hover:text-ink">Employers</a>
          <a href="#features" className="hover:text-ink">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const parallax = clamp01(scrollY / 600);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <HeroBackdrop parallax={parallax} />
      <div
        className="relative mx-auto w-full max-w-7xl px-5 sm:px-8"
        style={{ opacity: 1 - parallax * 0.6, transform: `translateY(${parallax * 30}px)` }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Badge tone="brand" icon={Icons.Sparkles} className="mx-auto">
              Introducing Traileers™
            </Badge>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Navigate your career like a{' '}
              <span className="text-gradient">map</span>, not a guess.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">
              CareerOS turns the entire job landscape into an interactive map — then routes you from
              where you are to where you want to be, with the feasibility of every step.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/assessment">
                <Button size="lg" icon={Icons.Compass} iconRight={Icons.ArrowRight}>
                  Find my node
                </Button>
              </Link>
              <Link to="/map">
                <Button size="lg" variant="secondary" icon={Icons.Network}>
                  See a live map
                </Button>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-mute">
              <Icons.ShieldCheck size={16} className="text-brand" />
              No résumé upload required · 2-minute assessment
            </p>
          </Reveal>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-ink-mute">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Scroll to explore</span>
        <Icons.ChevronDown size={18} className="animate-bounce" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function Landing() {
  return (
    <div className="bg-canvas">
      <MarketingNav />
      <Hero />
      <StoryStage />
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}
