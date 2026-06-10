import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import {
  useScrollLerp,
  useCountUp,
  useReducedMotion,
  useMediaQuery,
} from '@/lib/hooks';
import { clamp01, lerp, smoothstep, bandOpacity } from '@/lib/math';
import { getNode } from '@/lib/mockData';
import { Button, Logo, ThemeToggle, Reveal } from '@/ui/components';
import { RocketLaunch, RocketSVG } from '@/ui/transitions';

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

/* ================================================================== */
/* Shared SVG primitive: a labelled graph node "chip"                  */
/* Looks like a real node in a flow/graph editor — not a bare circle.  */
/* ================================================================== */
type ChipState = 'dim' | 'idle' | 'active' | 'current' | 'target';

function NodeChip({
  x,
  y,
  label,
  accent,
  state = 'idle',
  tag,
}: {
  x: number;
  y: number;
  label: string;
  accent: keyof typeof ACCENT_HEX | string;
  state?: ChipState;
  tag?: string;
}) {
  const w = Math.max(108, label.length * 7.4 + 48);
  const h = 38;
  const left = x - w / 2;
  const top = y - h / 2;
  const tagW = tag ? tag.length * 7.2 + 20 : 0;
  const hex = ACCENT_HEX[accent] ?? ACCENT_HEX.navy;
  const hi = state === 'active' || state === 'current' || state === 'target';
  const ringHex =
    state === 'current' ? ACCENT_HEX.teal : state === 'target' ? ACCENT_HEX.amber : hex;

  return (
    <g style={{ opacity: state === 'dim' ? 0.38 : 1, transition: 'opacity .35s ease' }}>
      {tag && (
        <g>
          <rect
            x={left}
            y={top - 24}
            width={tagW}
            height={17}
            rx={5}
            fill={ringHex}
          />
          <text
            x={left + tagW / 2}
            y={top - 15.5}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9.5}
            fontWeight={700}
            letterSpacing={1.2}
            fill="#fff"
          >
            {tag.toUpperCase()}
          </text>
        </g>
      )}
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        rx={11}
        fill="rgb(var(--c-surface))"
        stroke={hi ? ringHex : 'rgb(var(--c-line))'}
        strokeOpacity={hi ? 1 : 0.16}
        strokeWidth={hi ? 2 : 1.4}
        style={hi ? { filter: `drop-shadow(0 8px 18px ${hex}30)` } : undefined}
      />
      <circle cx={left + 18} cy={y} r={5} fill={hex} />
      {state === 'current' || state === 'target' ? (
        <circle cx={left + 18} cy={y} r={5} fill="none" stroke={ringHex} strokeWidth={2} />
      ) : null}
      <text
        x={left + 32}
        y={y}
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
        fill="rgb(var(--c-ink))"
      >
        {label}
      </text>
    </g>
  );
}

/* ================================================================== */
/* GSAP helpers                                                        */
/* ================================================================== */
/** Slim scroll-progress bar pinned to the very top of the page. */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(el, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);
  return (
    <div
      ref={ref}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-brand to-accent"
    />
  );
}

/** Wraps a target so it eases toward the cursor — a "magnetic" button feel. */
function Magnetic({ children, strength = 0.4, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={cn('inline-block', className)}>
      {children}
    </div>
  );
}

/* ================================================================== */
/* Marketing top nav                                                   */
/* ================================================================== */
function MarketingNav({ hidden = false }: { hidden?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        hidden && '-translate-y-full opacity-0',
        scrolled ? 'border-b border-line/10 bg-canvas/85 backdrop-blur-md' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-5 sm:px-8">
        <Link to="/" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {[
            ['Product', true],
            ['Solutions', true],
            ['Community', true],
            ['Resources', true],
            ['Pricing', false],
          ].map(([l, caret]) => (
            <a
              key={l as string}
              href="#features"
              className="flex items-center gap-1 text-[15px] font-medium text-ink transition hover:text-brand"
            >
              {l}
              {caret && <Icons.ChevronDown size={15} className="text-ink-mute" strokeWidth={2.4} />}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <Link to="/map" className="hidden px-2 text-[15px] font-medium text-ink hover:text-brand sm:block">
            Log in
          </Link>
          <Link to="/map" className="hidden sm:block">
            <button className="focus-ring h-10 rounded-full border border-line/25 px-5 text-[15px] font-semibold text-ink transition hover:border-line/50">
              Contact sales
            </button>
          </Link>
          <Link to="/onboarding">
            <button className="focus-ring h-10 rounded-full bg-navy px-5 text-[15px] font-semibold text-white transition hover:bg-navy-600 dark:bg-brand dark:text-navy dark:hover:bg-teal-soft">
              Get started
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ================================================================== */
/* Eyebrow — plain letterspaced label, no icon chip                    */
/* ================================================================== */
function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-brand',
        className,
      )}
    >
      <span className="h-px w-6 bg-current opacity-50" />
      {children}
    </span>
  );
}

/* ================================================================== */
/* Hero — Figma-style: a scrolling gallery of product "thumbnails"      */
/* behind a floating headline card, with carousel controls.            */
/* ================================================================== */
function Spark({ vals, w, h, stroke }: { vals: number[]; w: number; h: number; stroke: string }) {
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - v * h}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - vals[vals.length - 1] * h} r={3} fill={stroke} />
    </svg>
  );
}

function CardFrame({
  className,
  label,
  children,
}: {
  className?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex h-full w-full select-none flex-col overflow-hidden rounded-[20px] p-5 shadow-[0_18px_50px_-12px_rgba(16,33,50,0.45)] ring-1 ring-black/5',
        className,
      )}
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-60">{label}</span>
      <div className="mt-3 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

/* Each card is a distinct, vivid CareerOS "surface" — like Figma's row of
   real-site thumbnails. Fixed colors so they read the same in light/dark. */
const GALLERY: ReactNode[] = [
  // Assessment (navy)
  <CardFrame key="assess" label="Assessment" className="bg-navy text-white">
    <p className="font-display text-xl font-extrabold leading-tight">Where are you, really?</p>
    <div className="mt-auto flex flex-wrap gap-2 pt-4">
      {['Self-taught', 'Fast growth', 'Remote', 'React', 'Design'].map((c) => (
        <span key={c} className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold text-white/90">
          {c}
        </span>
      ))}
    </div>
  </CardFrame>,

  // Map (mint)
  <CardFrame key="map" label="Traileers map" className="bg-[#e7f1ec] text-navy">
    <svg viewBox="0 0 220 230" className="flex-1" preserveAspectRatio="xMidYMid meet">
      <line x1="40" y1="60" x2="120" y2="40" stroke="#17324d" strokeOpacity="0.18" strokeWidth="2" />
      <line x1="120" y1="40" x2="180" y2="120" stroke="#17324d" strokeOpacity="0.18" strokeWidth="2" />
      <line x1="40" y1="60" x2="90" y2="160" stroke="#17324d" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M40,60 L90,160 L180,120" fill="none" stroke="#f2b95e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {[
        [40, 60, '#2f7f8f'],
        [120, 40, '#7e3041'],
        [90, 160, '#2f7f8f'],
        [180, 120, '#f2b95e'],
      ].map(([x, y, c], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="11" fill="#fff" stroke={c as string} strokeWidth="3.5" />
      ))}
      <text x="40" y="92" textAnchor="middle" fontSize="12" fontWeight="700" fill="#17324d">You</text>
      <text x="180" y="152" textAnchor="middle" fontSize="12" fontWeight="700" fill="#17324d">Target</text>
    </svg>
  </CardFrame>,

  // Feasibility (wine → amber)
  <CardFrame key="feas" label="Feasibility" className="bg-gradient-to-br from-wine to-amber text-white">
    <div className="mt-auto">
      <p className="font-display text-6xl font-black leading-none">74%</p>
      <p className="mt-2 text-sm font-semibold text-white/90">Strong route to Product Lead</p>
      <p className="mt-1 text-xs text-white/70">Frontend → Analyst → Product</p>
    </div>
  </CardFrame>,

  // Role detail (white)
  <CardFrame key="node" label="Role detail" className="bg-white text-navy">
    <p className="font-display text-2xl font-extrabold">Product Lead</p>
    <div className="mt-3 space-y-2 text-sm">
      <div className="flex justify-between"><span className="opacity-60">Salary</span><span className="font-bold">$145–210k</span></div>
      <div className="flex justify-between"><span className="opacity-60">Demand</span><span className="font-bold text-[#2f7f8f]">Surging</span></div>
      <div className="flex justify-between"><span className="opacity-60">Match</span><span className="font-bold">54%</span></div>
    </div>
    <div className="mt-auto pt-4">
      <Spark vals={[0.3, 0.45, 0.4, 0.6, 0.72, 0.9]} w={150} h={40} stroke="#2f7f8f" />
    </div>
  </CardFrame>,

  // Patterns (teal)
  <CardFrame key="pat" label="Historical patterns" className="bg-[#2f7f8f] text-white">
    <div className="mt-auto space-y-3">
      {[
        ['Frontend → Full-Stack → Product', 31],
        ['Frontend → Analyst → Product', 22],
        ['Frontend → Design Eng → Product', 14],
      ].map(([l, v]) => (
        <div key={l as string}>
          <div className="flex justify-between text-xs font-semibold text-white/90">
            <span className="truncate pr-2">{l}</span>
            <span>{v}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${(v as number) * 2.2}%` }} />
          </div>
        </div>
      ))}
    </div>
  </CardFrame>,

  // Demand (amber)
  <CardFrame key="dem" label="Live demand" className="bg-amber text-navy">
    <div className="mt-auto">
      <p className="font-display text-5xl font-black leading-none">+28%</p>
      <p className="mt-2 text-sm font-bold">Design Engineer demand</p>
      <div className="mt-3">
        <Spark vals={[0.3, 0.38, 0.5, 0.6, 0.74, 0.95]} w={150} h={36} stroke="#17324d" />
      </div>
    </div>
  </CardFrame>,

  // Testimonial (wine)
  <CardFrame key="quote" label="From the field" className="bg-wine text-white">
    <p className="font-display text-[17px] font-semibold leading-snug">
      “CareerOS mapped a route from frontend to PM I didn’t know existed — with the odds to back
      every step.”
    </p>
    <div className="mt-auto flex items-center gap-3 pt-5">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-sm font-bold">
        JL
      </span>
      <div className="text-xs leading-tight">
        <p className="font-bold">Jordan Lee</p>
        <p className="opacity-70">Product Lead, Meridian</p>
      </div>
    </div>
  </CardFrame>,
];

function Hero({ onLaunch }: { onLaunch: () => void }) {
  const reduced = useReducedMotion();
  const lg = useMediaQuery('(min-width: 1024px)');
  const cardW = lg ? 290 : 210;
  const gap = 18;
  const step = cardW + gap;
  const cardH = Math.round(cardW * 1.42);
  const [paused, setPaused] = useState(false);

  // Continuous marquee: two identical copies, animate the track -50% forever.
  const track = [...GALLERY, ...GALLERY];
  const duration = (GALLERY.length * step) / 50; // ~150px/s

  return (
    <section className="relative overflow-hidden pb-16 pt-24 sm:pt-28">
      {/* gallery row (full-bleed; cards cut off at the screen edges) */}
      <div className="relative" style={{ height: cardH }}>
        <div
          className="flex w-max will-change-transform"
          style={{
            animation: reduced ? undefined : `marquee ${duration}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {track.map((card, i) => (
            <div key={i} style={{ width: cardW, height: cardH, marginRight: gap }} className="shrink-0">
              {card}
            </div>
          ))}
        </div>

        {/* floating headline card */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
          <Reveal direction="scale" className="pointer-events-auto w-full max-w-2xl">
            <div className="rounded-[28px] bg-surface p-7 shadow-[0_30px_80px_-20px_rgba(16,33,50,0.55)] ring-1 ring-line/10 sm:p-10">
              <h1 className="font-display text-4xl font-black leading-[1.05] tracking-[-0.02em] text-ink sm:text-6xl">
                Navigate your career
                <br />
                like a <span className="text-brand">map.</span>
              </h1>
              <div className="mt-6 flex items-end justify-between gap-4">
                <p className="hidden max-w-xs text-sm text-ink-mute sm:block">
                  Find your starting point. See the route. Move with the odds.
                </p>
                <Magnetic className="ml-auto">
                  <Button type="button" size="lg" iconRight={Icons.ArrowRight} onClick={onLaunch}>
                    Find my starting point
                  </Button>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </div>

        {/* pause / play */}
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play' : 'Pause'}
          className="focus-ring absolute bottom-3 right-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-line/15 bg-surface/90 text-ink backdrop-blur transition hover:border-line/35 sm:right-8"
        >
          {paused ? <Icons.Play size={17} /> : <Icons.Pause size={17} />}
        </button>
      </div>

      {/* subhead */}
      <div className="mx-auto mt-12 max-w-2xl px-5 text-center">
        <p className="text-xl font-medium leading-relaxed text-ink sm:text-2xl">
          CareerOS turns the entire job landscape into one interactive map. Find your starting point,
          design, and route your next move with confidence.
        </p>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Logo / trust strip                                                  */
/* ================================================================== */
function TrustStrip() {
  const names = ['Northwind', 'Acre Labs', 'Vantage', 'Meridian', 'Lumen', 'Foundry'];
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-mute">
        Hiring teams routing talent with CareerOS
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {names.map((n) => (
          <span
            key={n}
            className="font-display text-lg font-bold tracking-tight text-ink-mute/70"
          >
            {n}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* Story stage — scroll-lerp cinematic map build                       */
/* ================================================================== */
const STORY = [
  {
    step: '01',
    label: 'Your starting point',
    title: 'Start from where you really are.',
    body: 'CareerOS places you at a clear starting point — inferred from your background, skills and the work you’ve actually shipped.',
  },
  {
    step: '02',
    label: 'One connected step',
    title: 'Each role links to the next realistic move.',
    body: 'No leaps. Every point connects to the one above it by a transition real people have actually made.',
  },
  {
    step: '03',
    label: 'Always climbing',
    title: 'We route you toward higher opportunity.',
    body: 'The path keeps moving up — more scope, more compensation, more leverage — one feasible hop at a time.',
  },
  {
    step: '04',
    label: 'Backed by evidence',
    title: 'Every step scored on how thousands moved.',
    body: 'Each hop carries honest odds and a typical timeline, grounded in historical trajectories — not vibes.',
  },
];

/** A single ascending chain — bottom node is "you", each step climbs higher. */
const LADDER: {
  title: string;
  sub: string;
  accent: string;
  x: number;
  y: number;
  opp: number;
  tag?: string;
}[] = [
    { title: 'Frontend Engineer', sub: '$95–140k', accent: 'teal', x: 340, y: 1040, opp: 117, tag: 'You' },
    { title: 'Full-Stack Engineer', sub: '$110–165k', accent: 'teal', x: 580, y: 820, opp: 137 },
    { title: 'Product Analyst', sub: '$120–170k', accent: 'wine', x: 400, y: 600, opp: 145 },
    { title: 'Product Lead', sub: '$145–210k', accent: 'amber', x: 610, y: 380, opp: 177, tag: 'Target' },
    { title: 'Director of Product', sub: '$210–300k', accent: 'navy', x: 470, y: 160, opp: 255 },
  ];

function StoryStage() {
  const { stageRef, progress } = useScrollLerp(0.12);
  const N = LADDER.length;

  const eased = smoothstep(progress);
  const reach = eased * (N - 1); // how far up the chain we've climbed

  // camera climbs from the bottom node to the top node
  const focusY = lerp(LADDER[0].y, LADDER[N - 1].y, eased);
  const tx = 500 - 480;
  const ty = 340 - focusY;

  const routeD = LADDER.map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x},${n.y}`).join(' ');
  const drawn = clamp01(reach / (N - 1));

  // live "opportunity" number that climbs with the camera
  const lo = Math.min(N - 1, Math.floor(reach));
  const hi = Math.min(N - 1, lo + 1);
  const oppNow = useCountUp(
    Math.round(lerp(LADDER[lo].opp, LADDER[hi].opp, reach - lo)),
    true,
    180,
  );
  const reached = LADDER[Math.min(N - 1, Math.round(reach))];

  return (
    <section ref={stageRef} className="relative h-[440vh]">
      <div className="welcome-stage sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              'linear-gradient(rgb(var(--c-line)/0.05) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--c-line)/0.05) 1px,transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <svg
          viewBox="0 0 1000 680"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <g transform={`translate(${tx} ${ty})`}>
            {/* the single connecting line, drawing upward as you climb */}
            <path
              d={routeD}
              fill="none"
              stroke="rgb(var(--c-line))"
              strokeOpacity={0.14}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={routeD}
              fill="none"
              stroke={ACCENT_HEX.amber}
              strokeWidth={4.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawn}
              style={{ filter: 'drop-shadow(0 2px 10px rgba(242,185,94,0.5))' }}
            />

            {LADDER.map((n, i) => {
              const lit = reach >= i - 0.25;
              const near = reach >= i - 1.3;
              const isTarget = n.tag === 'Target';
              const state: ChipState =
                i === 0
                  ? 'current'
                  : isTarget
                    ? lit
                      ? 'target'
                      : near
                        ? 'idle'
                        : 'dim'
                    : lit
                      ? 'active'
                      : near
                        ? 'idle'
                        : 'dim';
              return (
                <g key={n.title}>
                  <NodeChip
                    x={n.x}
                    y={n.y}
                    label={n.title}
                    accent={n.accent}
                    state={state}
                    tag={i === 0 ? 'You' : isTarget && lit ? 'Target' : undefined}
                  />
                  <text
                    x={n.x}
                    y={n.y + 32}
                    textAnchor="middle"
                    fontSize={12.5}
                    fontWeight={600}
                    fill="rgb(var(--c-ink-soft))"
                    style={{ opacity: state === 'dim' ? 0.35 : 1, transition: 'opacity .35s' }}
                  >
                    {n.sub}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* "higher opportunity" axis */}
        <div className="pointer-events-none absolute left-3 top-0 hidden h-full flex-col items-center justify-center gap-3 sm:flex">
          <Icons.TrendingUp size={18} className="text-brand" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-mute [writing-mode:vertical-rl] [transform:rotate(180deg)]">
            Higher opportunity
          </span>
        </div>

        {/* live opportunity readout */}
        <div className="absolute right-5 top-24 hidden rounded-2xl border border-line/12 bg-surface/90 p-5 shadow-soft backdrop-blur-sm sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
            Opportunity
          </p>
          <div className="mt-1 flex items-end gap-1">
            <span className="font-display text-4xl font-extrabold text-ink">
              ${Math.round(oppNow)}k
            </span>
            <Icons.TrendingUp size={20} className="mb-2 text-emerald-500" />
          </div>
          <p className="mt-1 max-w-[200px] text-xs text-ink-mute">{reached.title}</p>
        </div>

        {/* captions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-14 sm:px-10 lg:bottom-20">
          <div className="relative mx-auto h-40 max-w-2xl">
            {STORY.map((s, i) => {
              const start = i * 0.25;
              const op = bandOpacity(progress, start, start + 0.25, 0.06);
              return (
                <div
                  key={i}
                  className="absolute inset-x-0 bottom-0 rounded-2xl border border-line/12 bg-surface/95 p-6 shadow-soft"
                  style={{ opacity: op, transform: `translateY(${(1 - op) * 16}px)` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-brand">{s.step}</span>
                    <span className="h-px w-5 bg-line/20" />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                      {s.label}
                    </span>
                  </div>
                  <h3 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
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

/* ================================================================== */
/* Feature sections — alternating editorial rows w/ real visuals       */
/* ================================================================== */
function VisualAssessment() {
  // a focused node with concentric "match" rings + faint neighbours
  return (
    <svg viewBox="0 0 460 320" className="w-full">
      {[90, 64, 40].map((r, i) => (
        <circle
          key={r}
          className="pop"
          cx={230}
          cy={160}
          r={r}
          fill="none"
          stroke={ACCENT_HEX.teal}
          strokeOpacity={0.1 + i * 0.06}
          strokeWidth={1.4}
          style={{ transformOrigin: '230px 160px' }}
        />
      ))}
      <line x1={230} y1={160} x2={92} y2={70} stroke="rgb(var(--c-line))" strokeOpacity={0.16} />
      <line x1={230} y1={160} x2={372} y2={86} stroke="rgb(var(--c-line))" strokeOpacity={0.16} />
      <line x1={230} y1={160} x2={356} y2={252} stroke="rgb(var(--c-line))" strokeOpacity={0.16} />
      <NodeChip x={92} y={70} label="Design Eng" accent="wine" state="dim" />
      <NodeChip x={372} y={86} label="Full-Stack" accent="teal" state="dim" />
      <NodeChip x={356} y={252} label="Dev Advocate" accent="wine" state="dim" />
      <NodeChip x={230} y={160} label="Frontend Engineer" accent="teal" state="current" tag="You" />
      <g className="pop" style={{ transformOrigin: '343px 209px' }}>
        <rect x={300} y={196} width={86} height={26} rx={13} fill={ACCENT_HEX.teal} />
        <text x={343} y={213} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">
          100% match
        </text>
      </g>
    </svg>
  );
}

function VisualRouting() {
  const ids = ['frontend-dev', 'fullstack-dev', 'data-analyst', 'product-lead'];
  const pos: Record<string, [number, number]> = {
    'frontend-dev': [70, 90],
    'fullstack-dev': [240, 60],
    'data-analyst': [200, 250],
    'product-lead': [400, 160],
  };
  const route = ['frontend-dev', 'data-analyst', 'product-lead'];
  const routeD = route.map((id, i) => `${i ? 'L' : 'M'}${pos[id][0]},${pos[id][1]}`).join(' ');
  return (
    <svg viewBox="0 0 460 320" className="w-full">
      <line x1={70} y1={90} x2={240} y2={60} stroke="rgb(var(--c-line))" strokeOpacity={0.16} />
      <line x1={240} y1={60} x2={400} y2={160} stroke="rgb(var(--c-line))" strokeOpacity={0.16} />
      <path
        className="draw-line"
        d={routeD}
        fill="none"
        stroke={ACCENT_HEX.amber}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(242,185,94,0.4))' }}
      />
      {ids.map((id) => {
        const n = getNode(id)!;
        const [x, y] = pos[id];
        const state: ChipState =
          id === 'frontend-dev'
            ? 'current'
            : id === 'product-lead'
              ? 'target'
              : route.includes(id)
                ? 'active'
                : 'idle';
        return (
          <NodeChip
            key={id}
            x={x}
            y={y}
            label={n.title}
            accent={n.accent}
            state={state}
            tag={id === 'frontend-dev' ? 'You' : id === 'product-lead' ? 'Target' : undefined}
          />
        );
      })}
    </svg>
  );
}

function VisualFeasibility() {
  const steps = [
    { label: 'Frontend → Product Analyst', v: 72 },
    { label: 'Product Analyst → Product Lead', v: 81 },
    { label: 'Frontend → Full-Stack → Product', v: 63 },
    { label: 'Frontend → Design Eng → Product', v: 67 },
  ];
  return (
    <svg viewBox="0 0 460 320" className="w-full">
      {steps.map((s, i) => {
        const y = 40 + i * 64;
        const w = (s.v / 100) * 300;
        return (
          <g key={s.label}>
            <text x={20} y={y - 12} fontSize={12.5} fontWeight={600} fill="rgb(var(--c-ink-soft))">
              {s.label}
            </text>
            <rect x={20} y={y} width={300} height={14} rx={7} fill="rgb(var(--c-line))" fillOpacity={0.1} />
            <rect
              className="grow-bar"
              x={20}
              y={y}
              width={w}
              height={14}
              rx={7}
              fill={s.v >= 70 ? ACCENT_HEX.teal : ACCENT_HEX.amber}
              style={{ transformOrigin: `20px ${y + 7}px` }}
            />
            <text x={332} y={y + 11} fontSize={13} fontWeight={700} fill="rgb(var(--c-ink))">
              {s.v}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function VisualDemand() {
  const vals = [0.22, 0.34, 0.3, 0.5, 0.62, 0.84, 1];
  const W = 400;
  const H = 150;
  const X = 30;
  const Y = 210;
  const d = vals
    .map((v, i) => `${i ? 'L' : 'M'}${X + (i / (vals.length - 1)) * W},${Y - v * H}`)
    .join(' ');
  return (
    <svg viewBox="0 0 460 320" className="w-full">
      <text x={20} y={34} fontSize={15} fontWeight={700} fill="rgb(var(--c-ink))">
        Product Lead · demand
      </text>
      <text x={20} y={56} fontSize={12.5} fill="rgb(var(--c-ink-mute))">
        Surging · last 6 quarters
      </text>
      <line x1={X} y1={Y} x2={X + W} y2={Y} stroke="rgb(var(--c-line))" strokeOpacity={0.15} />
      <path
        className="draw-line"
        d={d}
        fill="none"
        stroke={ACCENT_HEX.teal}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={0}
        style={{ filter: 'drop-shadow(0 3px 10px rgba(47,127,143,0.35))' }}
      />
      <circle
        className="pop"
        cx={X + W}
        cy={Y - vals[vals.length - 1] * H}
        r={6}
        fill={ACCENT_HEX.teal}
        style={{ transformOrigin: `${X + W}px ${Y - vals[vals.length - 1] * H}px` }}
      />
      <g className="pop" style={{ transformOrigin: '385px 262px' }}>
        <rect x={326} y={244} width={118} height={36} rx={18} fill={ACCENT_HEX.teal} opacity={0.12} />
        <text x={385} y={267} textAnchor="middle" fontSize={15} fontWeight={800} fill={ACCENT_HEX.teal}>
          +28% YoY
        </text>
      </g>
    </svg>
  );
}

function VisualPatterns() {
  const rows: [string, number][] = [
    ['Frontend → Full-Stack → Product', 31],
    ['Frontend → Analyst → Product', 22],
    ['Frontend → Design Eng → Product', 14],
    ['Career gap → cert → re-entry', 9],
  ];
  const max = 31;
  return (
    <svg viewBox="0 0 460 320" className="w-full">
      {rows.map(([l, v], i) => {
        const y = 44 + i * 64;
        const w = (v / max) * 330;
        return (
          <g key={l}>
            <text x={20} y={y - 12} fontSize={12.5} fontWeight={600} fill="rgb(var(--c-ink-soft))">
              {l}
            </text>
            <rect x={20} y={y} width={330} height={14} rx={7} fill="rgb(var(--c-line))" fillOpacity={0.1} />
            <rect
              className="grow-bar"
              x={20}
              y={y}
              width={w}
              height={14}
              rx={7}
              fill={ACCENT_HEX.wine}
              style={{ transformOrigin: `20px ${y + 7}px` }}
            />
            <text x={362} y={y + 11} fontSize={13} fontWeight={700} fill="rgb(var(--c-ink))">
              {v}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const FEATURES: {
  header: string;
  body: string;
  to: string;
  link: string;
  visual: ReactNode;
}[] = [
    {
      header: 'Find your real starting point',
      body: 'Answer a two-minute assessment and CareerOS places you on the map from your background, skills and what you actually want next — no résumé upload required.',
      to: '/onboarding',
      link: 'Take the assessment',
      visual: <VisualAssessment />,
    },
    {
      header: 'See every move — then the best route',
      body: 'Every viable path to your destination is laid out at once, with one recommended route resolved from real tradeoffs: time, qualifications, pay and your own interests.',
      to: '/routing',
      link: 'Explore routing',
      visual: <VisualRouting />,
    },
    {
      header: 'Score every step on real outcomes',
      body: 'Each hop carries honest odds and a typical timeline, compared against thousands of historical trajectories. Grounded in evidence, not vibes.',
      to: '/routing',
      link: 'See feasibility',
      visual: <VisualFeasibility />,
    },
    {
      header: 'Track live demand & salary',
      body: 'Per-role prospects, salary bands and market demand — personalized to your profile and refreshed as the market moves underneath you.',
      to: '/map',
      link: 'Open the map',
      visual: <VisualDemand />,
    },
    {
      header: 'Learn from how thousands moved',
      body: 'Common trajectories, lateral shifts, career gaps and higher-study routes other people have actually taken to reach the destination you’re aiming for.',
      to: '/map',
      link: 'View patterns',
      visual: <VisualPatterns />,
    },
  ];

function FeatureSections() {
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = panelRef.current;
    if (!el || prefersReducedMotion()) return;

    const runIn = () => {
      gsap.fromTo(el, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      el.querySelectorAll<SVGPathElement>('.draw-line').forEach((p) =>
        gsap.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' }),
      );
      const bars = el.querySelectorAll('.grow-bar');
      if (bars.length) gsap.from(bars, { scaleX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 });
      const pops = el.querySelectorAll('.pop');
      if (pops.length)
        gsap.from(pops, { scale: 0, opacity: 0, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.08 });
    };

    let st: ScrollTrigger | undefined;
    const ctx = gsap.context(() => {
      if (first.current) {
        st = ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: runIn });
      } else {
        runIn();
      }
    }, el);
    first.current = false;
    return () => {
      st?.kill();
      ctx.revert();
    };
  }, [active]);

  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <Reveal className="max-w-3xl">
        <Eyebrow>One continuous picture</Eyebrow>
        <h2 className="mt-5 font-display text-4xl font-black tracking-[-0.02em] text-ink sm:text-6xl">
          Everything the map knows about your next move.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-16">
        {/* left: pressable accordion */}
        <div>
          {FEATURES.map((f, i) => {
            const open = i === active;
            return (
              <div key={f.header} className="border-b border-line/12 first:border-t">
                <button
                  onClick={() => setActive(i)}
                  aria-expanded={open}
                  className="focus-ring group flex w-full items-center gap-4 py-6 text-left"
                >
                  <span
                    className={cn(
                      'font-display text-2xl font-bold tracking-tight transition-colors sm:text-[1.7rem]',
                      open ? 'text-ink' : 'text-ink-mute group-hover:text-ink',
                    )}
                  >
                    {f.header}
                  </span>
                  <span
                    className={cn(
                      'ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300',
                      open
                        ? 'rotate-45 border-brand bg-brand text-white'
                        : 'border-line/20 text-ink-mute group-hover:border-line/40',
                    )}
                  >
                    <Icons.Plus size={16} strokeWidth={2.5} />
                  </span>
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-md pb-1 text-lg leading-relaxed text-ink-soft">{f.body}</p>
                    <Link
                      to={f.to}
                      className="mb-6 mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:gap-2.5"
                    >
                      {f.link}
                      <Icons.ArrowRight size={15} strokeWidth={2.4} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* right: swapping visual panel */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div
            ref={panelRef}
            className="rounded-3xl border border-line/12 bg-surface p-6 shadow-soft sm:p-10"
          >
            <div key={active}>{FEATURES[active].visual}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* "Everything else" → How it works (routes onward, not a recap)        */
/* ================================================================== */
const HOW_STEPS: {
  n: string;
  title: string;
  body: string;
  to: string;
  cta: string;
  accent: keyof typeof ACCENT_HEX;
}[] = [
    {
      n: '01',
      title: 'Find your route',
      body: 'A two-minute assessment places you on the map from your real background, skills and goals.',
      to: '/onboarding',
      cta: 'Start the assessment',
      accent: 'teal',
    },
    {
      n: '02',
      title: 'See every route',
      body: 'Open the live map to explore every realistic move from where you are — and the one we recommend.',
      to: '/map',
      cta: 'Open the map',
      accent: 'amber',
    },
    {
      n: '03',
      title: 'Move with the odds',
      body: 'Plan a pathway with feasibility, timelines and tradeoffs scored for each step to your target.',
      to: '/routing',
      cta: 'Plan a pathway',
      accent: 'wine',
    },
  ];

function HowItWorks() {
  return (
    <section className="border-t border-line/10">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>Everything else</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-black tracking-[-0.02em] text-ink sm:text-4xl">
            How it works, end to end.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Three steps from “I’m not sure” to a routed plan you can act on — jump in wherever you like.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {HOW_STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <Link
                to={s.to}
                className="group flex h-full flex-col rounded-3xl border border-line/12 bg-surface p-7 transition duration-300 hover:-translate-y-1 hover:shadow-glass"
              >
                <span
                  className="font-display text-5xl font-black leading-none"
                  style={{ color: ACCENT_HEX[s.accent] }}
                >
                  {s.n}
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{s.body}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-all group-hover:gap-2.5">
                  {s.cta}
                  <Icons.ArrowRight size={15} strokeWidth={2.4} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Promise band — honest value pillars with GSAP decorations           */
/* ================================================================== */
const PROMISES: { decor: 'ring' | 'dots' | 'bars' | 'spark'; color: string; value: string; label: string }[] = [
  { decor: 'ring', color: '#2f7f8f', value: '2 min', label: 'to your first mapped route' },
  { decor: 'dots', color: '#5aa6b3', value: 'No résumé', label: 'needed to get started' },
  { decor: 'bars', color: '#f2b95e', value: 'Every step', label: 'scored on real feasibility' },
  { decor: 'spark', color: '#94394e', value: 'Live demand', label: 'and salary on every role' },
];

function PromiseDecor({ kind, color }: { kind: string; color: string }) {
  if (kind === 'ring') {
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r="16" fill="none" stroke="rgb(var(--c-line))" strokeOpacity="0.14" strokeWidth="4" />
        <circle
          className="decor-ring"
          cx="22"
          cy="22"
          r="16"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="26 80"
        />
      </svg>
    );
  }
  if (kind === 'dots') {
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
        {[8, 22, 36].map((x) => (
          <circle key={x} className="decor-dot" cx={x} cy="22" r="5" fill={color} />
        ))}
      </svg>
    );
  }
  if (kind === 'bars') {
    return (
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
        {[8, 20, 32].map((x) => (
          <rect key={x} className="decor-bar" x={x} y="10" width="8" height="26" rx="3" fill={color} />
        ))}
      </svg>
    );
  }
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
      <polyline
        points="6,30 16,18 24,24 34,10 40,14"
        fill="none"
        stroke="rgb(var(--c-line))"
        strokeOpacity="0.14"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        className="decor-spark"
        points="6,30 16,18 24,24 34,10 40,14"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="7 9"
      />
      <circle className="decor-spark-dot" cx="40" cy="14" r="3.5" fill={color} />
    </svg>
  );
}

function Stats() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to('.decor-ring', { rotation: 360, svgOrigin: '22 22', duration: 5.5, ease: 'none', repeat: -1 });
      gsap.to('.decor-dot', {
        scale: 0.45,
        transformOrigin: '50% 50%',
        duration: 0.7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.16 },
      });
      gsap.to('.decor-bar', {
        scaleY: () => gsap.utils.random(0.4, 1),
        transformOrigin: '50% 100%',
        duration: 0.55,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        repeatRefresh: true,
        stagger: { each: 0.12, from: 'random' },
      });
      gsap.to('.decor-spark', { strokeDashoffset: -32, duration: 1.3, ease: 'none', repeat: -1 });
      gsap.to('.decor-spark-dot', {
        scale: 1.3,
        transformOrigin: '50% 50%',
        duration: 0.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="border-t border-line/10 bg-surface-2/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-12 px-5 py-20 sm:px-8 md:grid-cols-4">
        {PROMISES.map((p, i) => (
          <Reveal key={p.label} delay={(i % 4) * 70}>
            <div className="flex flex-col items-start">
              <PromiseDecor kind={p.decor} color={p.color} />
              <div className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {p.value}
              </div>
              <div className="mt-1.5 text-sm font-medium text-ink-mute">{p.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/* CTA                                                                 */
/* ================================================================== */
/* Career-themed decorative shapes scattered around the launch button. */
const SHAPE_CLS = 'cta-shape pointer-events-none absolute';
function CtaShapes() {
  return (
    <>
      <div className={SHAPE_CLS} style={{ left: '7%', top: '15%' }}>
        <RocketSVG size={66} />
      </div>
      <div className={cn(SHAPE_CLS, 'hidden sm:block')} style={{ left: '19%', top: '34%' }}>
        <svg width="116" height="72" viewBox="0 0 116 72">
          <rect width="116" height="72" rx="12" fill="#7e3041" />
          <path
            d="M14 50 C30 18 38 18 54 50 C70 18 78 18 94 50"
            stroke="#f2b95e"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className={SHAPE_CLS} style={{ left: '13%', top: '62%' }}>
        <svg width="70" height="70" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="34" fill="#2f7f8f" />
          <circle cx="36" cy="36" r="22" fill="#e7f1ec" />
          <circle cx="36" cy="36" r="11" fill="#2f7f8f" />
        </svg>
      </div>
      <div className={cn(SHAPE_CLS, 'hidden sm:block')} style={{ left: '6%', top: '80%' }}>
        <svg width="76" height="64" viewBox="0 0 76 64">
          <rect x="4" y="34" width="14" height="30" rx="3" fill="#17324d" />
          <rect x="24" y="22" width="14" height="42" rx="3" fill="#2f7f8f" />
          <rect x="44" y="10" width="14" height="54" rx="3" fill="#f2b95e" />
          <path d="M6 28 L30 16 L52 6" stroke="#7e3041" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className={SHAPE_CLS} style={{ right: '9%', top: '16%', left: 'auto' }}>
        <svg width="70" height="70" viewBox="0 0 70 70">
          <path
            d="M35 2 C40 26 44 30 68 35 C44 40 40 44 35 68 C30 44 26 40 2 35 C26 30 30 26 35 2Z"
            fill="#f2b95e"
          />
        </svg>
      </div>
      <div className={cn(SHAPE_CLS, 'hidden sm:block')} style={{ right: '8%', top: '34%', left: 'auto' }}>
        <svg width="84" height="64" viewBox="0 0 84 64">
          <path d="M42 8 L80 24 L42 40 L4 24 Z" fill="#17324d" />
          <path d="M22 32 L22 48 C22 56 62 56 62 48 L62 32" stroke="#17324d" strokeWidth="5" fill="none" />
          <circle cx="80" cy="24" r="3.5" fill="#f2b95e" />
          <path d="M80 24 L80 40" stroke="#17324d" strokeWidth="3" />
        </svg>
      </div>
      <div className={SHAPE_CLS} style={{ right: '12%', top: '60%', left: 'auto' }}>
        <svg width="92" height="80" viewBox="0 0 92 80">
          <line x1="16" y1="20" x2="74" y2="30" stroke="#17324d" strokeWidth="3" />
          <line x1="74" y1="30" x2="40" y2="64" stroke="#17324d" strokeWidth="3" />
          <circle cx="16" cy="20" r="11" fill="#2f7f8f" />
          <circle cx="74" cy="30" r="11" fill="#f2b95e" />
          <circle cx="40" cy="64" r="11" fill="#7e3041" />
        </svg>
      </div>
      <div className={cn(SHAPE_CLS, 'hidden sm:block')} style={{ right: '20%', top: '80%', left: 'auto' }}>
        <svg width="56" height="72" viewBox="0 0 56 72">
          <path d="M28 6 L52 34 L38 34 L38 66 L18 66 L18 34 L4 34 Z" fill="#7e3041" />
        </svg>
      </div>
    </>
  );
}

function CTA({ onLaunch }: { onLaunch: () => void }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.cta-shape', {
        scale: 0,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'back.out(1.6)',
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 72%' },
      });
      gsap.utils.toArray<HTMLElement>('.cta-shape').forEach((s, i) => {
        gsap.to(s, {
          y: gsap.utils.random(-16, 16),
          rotate: gsap.utils.random(-9, 9),
          duration: gsap.utils.random(2.6, 4.2),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 0.7 + i * 0.08,
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative isolate overflow-hidden bg-canvas py-28 sm:py-36">
      <CtaShapes />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center">
        <Magnetic strength={0.3}>
          <button
            onClick={onLaunch}
            className="focus-ring group inline-flex items-center gap-4 rounded-[1.75rem] bg-navy px-8 py-6 font-display text-2xl font-black leading-tight text-white shadow-[0_34px_80px_-22px_rgba(16,33,50,0.65)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.99] sm:px-12 sm:py-8 sm:text-4xl dark:bg-brand dark:text-navy"
          >
            Ready to boost your career?
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-transform group-hover:-translate-y-1 dark:bg-navy/15 dark:text-navy sm:h-14 sm:w-14">
              <Icons.Rocket size={26} strokeWidth={2.2} />
            </span>
          </button>
        </Magnetic>
        <p className="mt-6 text-sm font-medium text-ink-mute">
          2-minute setup · no résumé needed · free to start
        </p>
      </div>
    </section>
  );
}

/* ================================================================== */
/* Footer                                                              */
/* ================================================================== */
const FOOTER_COLS: [string, string[]][] = [
  ['Product', ['Traileers map', 'Assessment', 'Routing', 'Pricing']],
  ['Company', ['About', 'Careers', 'Blog', 'Contact']],
  ['Resources', ['Help center', 'Methodology', 'Changelog', 'Status']],
  ['Legal', ['Privacy', 'Terms', 'Security', 'Cookies']],
];

function Footer() {
  return (
    <footer className="border-t border-line/10">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-mute">
              The career-navigation platform. Map where you are, route where you’re going.
            </p>
          </div>
          {FOOTER_COLS.map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-mute">
                {heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#features" className="text-sm text-ink-soft transition hover:text-ink">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-line/10 pt-6 text-sm text-ink-mute sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CareerOS. All rights reserved.</p>
          <p className="sm:ml-auto">Traileers™ is a trademark of CareerOS.</p>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================== */
export function Landing() {
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);
  const onDone = useCallback(() => navigate('/onboarding'), [navigate]);

  return (
    <div className="bg-canvas">
      <ScrollProgress />
      <MarketingNav hidden={launching} />
      <Hero onLaunch={() => setLaunching(true)} />
      <TrustStrip />
      <StoryStage />
      <FeatureSections />
      <HowItWorks />
      <Stats />
      <CTA onLaunch={() => setLaunching(true)} />
      <Footer />
      {/* Lives at the page root (outside the CTA's `isolate` stacking context)
          so the fixed full-screen overlay covers the nav + footer. */}
      <RocketLaunch launching={launching} onDone={onDone} />
    </div>
  );
}
