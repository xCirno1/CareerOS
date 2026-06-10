import { Icons } from '@/lib/icons';
import { Card, Reveal } from '@/ui/components';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Building the navigation layer we <span className="highlight-green">wish existed.</span>
          </h1>
        </Reveal>
      </section>

      {/* Main Body - Mission & Premise */}
      <section className="mt-12 space-y-12">
        <Reveal>
          <div className="space-y-6 text-base leading-relaxed text-ink-soft sm:text-lg">
            <p>
              Across Asia, careers are built spontaneously, unpredictably, alone. People make some of the most consequential decisions of their lives — what to study, where to start, when to switch — with no map, no signal, no co-pilot.
            </p>
            
            <div className="border-l-4 border-amber pl-4 my-8 font-medium text-ink bg-amber/5 p-4 rounded-r-2xl">
              <span className="font-mono text-xs uppercase tracking-wider text-amber font-semibold block mb-1">THE LANDSCAPE CRISIS</span>
              Job boards are inventory dumps. ATS systems are filters, not matchmakers. Generic advice is everywhere; personal context is missing.
            </div>

            <p>
              We wanted to build something different: a way for someone to see the paths available to them, and the realistic ranges of outcomes for people with similar professional profiles.
            </p>
          </div>
        </Reveal>

        {/* Brand Focus Cards */}
        <Reveal>
          <div className="grid gap-6 sm:grid-cols-2 mt-8">
            <Card className="p-5 border-line/10">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-brand">01_THE_COORDINATES</span>
                <Icons.Target size={16} className="text-brand" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-ink">We show the landscape, not a single answer</h3>
              <p className="mt-2 text-sm text-ink-soft">
                We surface the realistic range of trajectories for people with a similar shape — skills, education, prior roles, geography — and explain the trade-offs of each path.
              </p>
            </Card>

            <Card className="p-5 border-line/10">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-brand">02_THE_ARC</span>
                <Icons.Layers size={16} className="text-brand" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-ink">We map a 40-year arc, not a single job</h3>
              <p className="mt-2 text-sm text-ink-soft">
                A career isn't a sequence of job applications. It's a continuous timeline with phases, plateaus, pivots, and compounding skills. The system is designed to capture that long view.
              </p>
            </Card>

            <Card className="p-5 border-line/10">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-brand">03_THE_LANGUAGE</span>
                <Icons.Workflow size={16} className="text-brand" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-ink">No black-box scores or false precision</h3>
              <p className="mt-2 text-sm text-ink-soft">
                We speak human language back to humans. We explain why a recommendation makes sense and where the uncertainty sits.
              </p>
            </Card>

            <Card className="p-5 border-line/10">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold text-brand">04_THE_GATEWAY</span>
                <Icons.Globe size={16} className="text-brand" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-ink">Connect both sides honestly</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Candidates must be findable at the right moment for the right reason. Employers need to spot the right person before they are publicly looking — without the spam.
              </p>
            </Card>
          </div>
        </Reveal>

        {/* Scope and Limits */}
        <Reveal>
          <div className="rounded-3xl border border-line/10 bg-surface-2/40 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Icons.ShieldCheck size={18} className="text-brand" />
              Scope & Limitations
            </h2>
            <p className="mt-4 text-sm text-ink-soft leading-relaxed">
              Career OS is a navigation tool, not a prediction tool. Anyone who tells you AI can calculate your exact future career is overselling. Careers are too chaotic, luck-driven, and sensitive to events that haven't occurred. 
            </p>
            <div className="mt-4 font-semibold text-brand text-sm">
              We show the landscape, map the trade-offs honestly, and leave the agency with you.
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mt-16 border-t border-line/10 pt-12 text-center">
        <Link to="/onboarding">
          <button className="focus-ring h-11 rounded-full bg-navy px-6 font-semibold text-white transition hover:bg-navy-600 dark:bg-brand dark:text-navy">
            Create Free Account
          </button>
        </Link>
      </section>
    </div>
  );
}
