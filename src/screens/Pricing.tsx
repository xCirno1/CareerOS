import { Icons } from '@/lib/icons';
import { Button, Card, Reveal, Badge } from '@/ui/components';
import { Link } from 'react-router-dom';

export function Pricing() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-6xl">
            Straightforward pricing. <span className="highlight-green">No hidden fees.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft sm:text-xl leading-relaxed">
            We do not sell candidate data. Our business model is clean: candidates use the system for free; employers and universities pay for licenses.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Pricing Tiers */}
      <section className="mt-16 grid gap-8 md:grid-cols-3">
        {/* Tier 1: Candidate */}
        <Reveal delay={0}>
          <Card className="flex h-full flex-col p-6 border-line/10 relative overflow-hidden">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-brand tracking-wider">
                  FOR CANDIDATES
                </span>
                <Badge tone="brand">FREE</Badge>
              </div>
              <div className="mt-4">
                <span className="font-display text-4xl font-black text-ink">$0</span>
                <span className="text-sm font-semibold text-ink-mute"> / Forever</span>
              </div>
              <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                Map your trajectory, optimize your positioning, and get findable for matches.
              </p>

              <ul className="mt-6 space-y-3 border-t border-line/10 pt-6">
                {[
                  'C.01 Career Path Navigator',
                  'C.02 Living Portfolio compiler',
                  'C.03 Long-term Career Coach',
                  'C.04 Fair Pay Engine analytics',
                  'Privacy lock against current employer',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-ink-soft">
                    <Icons.Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-8">
              <span className="block mb-4 rounded-xl bg-brand/5 p-3 text-xs text-brand font-semibold text-center border border-brand/10">
                You own your profile details. Export or purge at any time.
              </span>
              <Link to="/onboarding" className="w-full block">
                <Button block>Create Account</Button>
              </Link>
            </div>
          </Card>
        </Reveal>

        {/* Tier 2: Employers */}
        <Reveal delay={80}>
          <Card className="flex h-full flex-col p-6 border-brand relative overflow-hidden ring-1 ring-brand">
            <div className="absolute top-0 right-0 bg-brand text-navy text-[10px] font-bold tracking-widest px-3 py-1 uppercase rounded-bl-xl font-mono">
              PREMIUM MATCHING
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-brand tracking-wider">
                  FOR EMPLOYERS
                </span>
              </div>
              <div className="mt-4">
                <span className="font-display text-4xl font-black text-ink">$150</span>
                <span className="text-sm font-semibold text-ink-mute"> / Seat / Mo</span>
              </div>
              <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                Connect with passive talent mapped directly to your future hiring paths.
              </p>

              <ul className="mt-6 space-y-3 border-t border-line/10 pt-6">
                {[
                  'E.01 Smart Talent Matching dashboard',
                  'E.03 Talent Reengagement portals',
                  '50 direct routing credits per seat/mo',
                  'Anonymized professional profile layout',
                  'Advanced filters for regional coordinates',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-ink-soft">
                    <Icons.Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              <div className="text-[10px] font-mono text-ink-mute text-center">
                Volume licenses scale for enterprise teams.
              </div>
              <Link to="/contact" className="w-full block">
                <Button variant="secondary" block>Request Demo</Button>
              </Link>
            </div>
          </Card>
        </Reveal>

        {/* Tier 3: Universities */}
        <Reveal delay={160}>
          <Card className="flex h-full flex-col p-6 border-line/10 relative overflow-hidden">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-brand tracking-wider">
                  FOR UNIVERSITIES
                </span>
              </div>
              <div className="mt-4">
                <span className="font-display text-4xl font-black text-ink">$2.50</span>
                <span className="text-sm font-semibold text-ink-mute"> / Student / Yr</span>
              </div>
              <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                Track graduate outcomes and alignment metrics automatically across decades.
              </p>

              <ul className="mt-6 space-y-3 border-t border-line/10 pt-6">
                {[
                  'U.01 Lifelong Outcome Loop tracking',
                  'U.02 Future State Curriculum Engine',
                  'U.03 Adaptive Readiness student profiles',
                  'U.04 Live Internship Marketplace portals',
                  'Dedicated outcome export API keys',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-ink-soft">
                    <Icons.Check size={14} className="text-brand shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link to="/contact" className="w-full block">
                <Button variant="secondary" block>Contact Academic Sales</Button>
              </Link>
            </div>
          </Card>
        </Reveal>
      </section>

      {/* Safety Notice */}
      <section className="mt-16 text-center max-w-2xl mx-auto">
        <p className="text-xs text-ink-mute">
          All payments are processed securely. Subscriptions can be upgraded, downgraded, or canceled at any time. Taxes and local regional transaction rates calculated during payment check.
        </p>
      </section>
    </div>
  );
}
