import { Icons } from '@/lib/icons';
import { Card, Reveal } from '@/ui/components';

export function Methodology() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            The data logic behind <span className="highlight-green">Career OS.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
            We reject black-box algorithms. You should know exactly why the system suggests a particular route or highlights a skill gap.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Core Principles */}
      <section className="mt-16 space-y-12">
        <Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 border-line/10">
              <span className="font-mono text-xs font-bold text-brand uppercase block mb-2">01_SHAPE_AGGREGATION</span>
              <h3 className="text-lg font-bold text-ink">Professional Shape Vectors</h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                Rather than executing string matches on keywords, we translate career paths into structural vectors ('shapes'). Shapes compile starting coordinates (location, education, age), skill compounds, and transition velocity. We execute similarity distances to route matches.
              </p>
            </Card>

            <Card className="p-6 border-line/10">
              <span className="font-mono text-xs font-bold text-brand uppercase block mb-2">02_GRAPH_DATABASES</span>
              <h3 className="text-lg font-bold text-ink">Directed Network Nodes</h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                The Path Navigator maps career positions as nodes and transitions as edges. Edge weights represent transition frequencies, average months-in-step, and typical compensation adjustments calculated from verified regional pools.
              </p>
            </Card>
          </div>
        </Reveal>

        {/* Warning Highlight Box */}
        <Reveal>
          <div className="border-l-4 border-amber pl-4 my-8 font-medium text-ink bg-amber/5 p-4 rounded-r-2xl">
            <span className="font-mono text-xs uppercase tracking-wider text-amber font-semibold block mb-1">PROBABILISTIC BOUNDARY</span>
            Careers are too chaotic, too luck-driven, and too sensitive to events that haven't happened yet to be computed by a single formula. We show the layout, not a single answer.
          </div>
        </Reveal>

        {/* Limitations and Data Inputs */}
        <Reveal>
          <div className="rounded-3xl border border-line/10 bg-surface p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Icons.ShieldCheck size={18} className="text-brand" /> Dataset Inputs & Recency
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Our graph maps compile data from regional public registry declarations, anonymized university outcome lists, and active candidate portfolios. The model updates every 14 days to adapt to hiring demand modifications and changing salary ranges across Asia.
            </p>
          </div>
        </Reveal>
      </section>

      {/* CTA report download */}
      <section className="mt-16 text-center border-t border-line/10 pt-12">
        <button className="focus-ring h-11 rounded-full border border-line/25 px-6 font-mono text-xs font-semibold text-ink transition hover:border-line/50">
          Review technical whitepaper (PDF)
        </button>
      </section>
    </div>
  );
}
