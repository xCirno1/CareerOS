import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { Button, Card, Reveal } from '@/ui/components';
import { Link } from 'react-router-dom';

interface Trailer {
  id: string;
  title: string;
  cohort: string;
  duration: string;
  synopsis: string;
  compAccel: string;
  risk: string;
  plateau: string;
  nodes: { label: string; active?: boolean }[];
}

const TRAILERS: Trailer[] = [
  {
    id: 'TR-042',
    title: 'The Engineering-to-Product PM Pivot',
    cohort: '1,240 Singapore & Jakarta profiles',
    duration: '90s',
    synopsis: 'Follow the transition from Individual Contributor (IC) engineer to Product Manager. Observe the average 18-month compensation dip followed by a 40% compounding increase in year 3.',
    compAccel: '1.4x',
    risk: 'MEDIUM',
    plateau: '2.2 Yrs',
    nodes: [
      { label: 'Software Engineer', active: true },
      { label: 'Technical BA' },
      { label: 'Product Manager', active: true },
      { label: 'Product Lead' },
    ],
  },
  {
    id: 'TR-118',
    title: 'The Regional Commercial Expansion Leap',
    cohort: '840 Kuala Lumpur & Manila profiles',
    duration: '120s',
    synopsis: 'See how local Account Executives transitioned into regional commercial lead roles. Highlights the crucial step of managing cross-border logistics and distributed sales pipelines.',
    compAccel: '1.8x',
    risk: 'HIGH',
    plateau: '1.5 Yrs',
    nodes: [
      { label: 'Account Executive', active: true },
      { label: 'Senior AE' },
      { label: 'Regional Sales Manager', active: true },
      { label: 'VP of Expansion' },
    ],
  },
  {
    id: 'TR-095',
    title: 'The Autodidact Design Switch',
    cohort: '920 regional profiles',
    duration: '90s',
    synopsis: 'Trace the path from non-design academic backgrounds into Lead UX Roles. Highlights the common transition point of using internal transfers to build the first 12 months of proof.',
    compAccel: '1.3x',
    risk: 'MEDIUM',
    plateau: '3.0 Yrs',
    nodes: [
      { label: 'Marketing Assoc' },
      { label: 'Visual Specialist', active: true },
      { label: 'UX Designer', active: true },
      { label: 'Lead UX Designer' },
    ],
  },
];

export function Trailers() {
  const [activeId, setActiveId] = useState(TRAILERS[0].id);
  const activeTrailer = TRAILERS.find((t) => t.id === activeId)!;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            C.01 - Career Path Navigator Preview
          </span>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-ink sm:text-6xl">
            Preview the paths before you <span className="highlight-green">walk them.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl leading-relaxed">
            Interactive 90-second visual walkthroughs of real career trajectories. 
            See where they start, where they plateau, and where they branch.
          </p>
        </Reveal>
      </section>

      {/* Main Body */}
      <section className="mt-16 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: Accordion / Grid list */}
        <div className="space-y-4">
          {TRAILERS.map((t) => {
            const isActive = t.id === activeId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={cn(
                  'w-full text-left rounded-3xl border p-6 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/40',
                  isActive
                    ? 'border-brand bg-brand/[0.03] shadow-glass ring-1 ring-brand'
                    : 'border-line/10 bg-surface hover:border-line/25 hover:shadow-soft'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-ink-mute uppercase">{t.id}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-line/30" />
                  <span className="font-mono text-xs text-brand font-semibold">{t.duration} Playback</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft line-clamp-2">
                  {t.synopsis}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  {t.nodes.map((n, idx) => (
                    <span key={n.label} className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          n.active
                            ? 'bg-brand/10 text-brand'
                            : 'bg-line/10 text-ink-soft'
                        )}
                      >
                        {n.label}
                      </span>
                      {idx < t.nodes.length - 1 && (
                        <Icons.ChevronRight size={13} className="text-ink-mute" />
                      )}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Technical Telemetry Panel */}
        <div>
          <Card className="p-6 md:sticky md:top-24 h-fit border-line/10 shadow-soft">
            <div className="flex items-center justify-between border-b border-line/10 pb-4">
              <span className="font-mono text-sm font-semibold tracking-wider text-ink-mute">
                SYSTEM_TELEMETRY: {activeTrailer.id}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                  Compensation Acceleration
                </label>
                <div className="mt-1 font-display text-3xl font-extrabold text-brand">
                  {activeTrailer.compAccel}
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                  Cohort Base Size
                </label>
                <div className="mt-1 text-sm font-semibold text-ink">
                  {activeTrailer.cohort}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                    Transition Risk
                  </label>
                  <div
                    className={cn(
                      'mt-1 text-sm font-bold',
                      activeTrailer.risk === 'HIGH' ? 'text-wine' : 'text-emerald-500'
                    )}
                  >
                    {activeTrailer.risk}
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                    Typical Plateau
                  </label>
                  <div className="mt-1 text-sm font-bold text-ink">
                    {activeTrailer.plateau}
                  </div>
                </div>
              </div>

              <div className="border-t border-line/10 pt-4">
                <label className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                  Interactive Node Path
                </label>
                <div className="mt-3 relative pl-4 border-l border-line/10 space-y-4">
                  {activeTrailer.nodes.map((n) => (
                    <div key={n.label} className="relative flex items-center gap-2">
                      <span
                        className={cn(
                          'absolute -left-[21px] h-2.5 w-2.5 rounded-full ring-4 ring-canvas',
                          n.active ? 'bg-brand' : 'bg-line/40'
                        )}
                      />
                      <span className="text-xs font-semibold text-ink">{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-20">
        <Reveal>
          <div className="rounded-[2rem] border border-brand bg-brand/[0.02] p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-black tracking-tight text-ink sm:text-4xl">
              Want to map your own shape against these paths?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-ink-soft">
              Start building your proof. No file uploads. Simple, visual telemetry.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/onboarding">
                <Button icon={Icons.Rocket} size="lg">
                  Initialize Living Portfolio [C.02]
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
