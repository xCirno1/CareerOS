import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { Button, Card, Reveal, Badge, SegmentedControl, useToast } from '@/ui/components';
import { useSubscription, PLAN_META, type Plan } from '@/lib/subscription';
import { PlanBadge } from '@/components/PlanBadge';

type View = 'mentoring' | 'mentor';

interface Tier {
  plan: Plan;
  tagline: string;
  price: string;
  period: string;
  featured?: boolean;
  ribbon?: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    plan: 'free',
    tagline: 'Map your trajectory, optimize your positioning, and get findable for matches.',
    price: '$0',
    period: '/ Forever',
    features: [
      'Career Path Navigator',
      'Living Portfolio compiler',
      'Fair Pay Engine analytics',
      'Save & compare target roles',
      'Browse the community',
    ],
  },
  {
    plan: 'pro',
    tagline: 'Get matched, message mentors, and turn your route into a concrete plan.',
    price: '$18',
    period: '/ Month',
    featured: true,
    ribbon: 'Most popular',
    features: [
      'Everything in Free',
      'Mentor Match — define & message your mentor',
      'Personalized route coaching',
      'Unlimited target roles & comparisons',
      'Priority support',
    ],
  },
  {
    plan: 'ultra',
    tagline: 'Maximum leverage: priority mentors, concierge routing, and early access.',
    price: '$39',
    period: '/ Month',
    features: [
      'Everything in Pro',
      'Priority access to top-rated mentors',
      '1:1 concierge route planning',
      'Verified candidate profile',
      'Early access to new features',
    ],
  },
];

function PricingTier({ tier }: { tier: Tier }) {
  const { plan: current, setPlan } = useSubscription();
  const toast = useToast();
  const navigate = useNavigate();
  const meta = PLAN_META[tier.plan];
  const isCurrent = current === tier.plan;

  const select = () => {
    setPlan(tier.plan);
    toast(
      tier.plan === 'free' ? 'Switched to the Free plan' : `You're now on ${meta.label} — Mentor Match unlocked`,
      { icon: meta.icon, tone: tier.plan === 'free' ? 'default' : 'success' },
    );
    if (tier.plan !== 'free') navigate('/mentors');
  };

  return (
    <Card
      className={cn(
        'relative flex h-full flex-col overflow-hidden p-6',
        tier.featured ? 'border-brand ring-1 ring-brand' : 'border-line/10',
      )}
    >
      {tier.ribbon && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-brand px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-navy">
          {tier.ribbon}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold tracking-wider text-brand">
            FOR CANDIDATES
          </span>
          <PlanBadge plan={tier.plan} withIcon />
        </div>
        <div className="mt-4">
          <span className="font-display text-4xl font-black text-ink">{tier.price}</span>
          <span className="text-sm font-semibold text-ink-mute"> {tier.period}</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{tier.tagline}</p>

        <ul className="mt-6 space-y-3 border-t border-line/10 pt-6">
          {tier.features.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-xs text-ink-soft">
              <Icons.Check size={14} className="mt-0.5 shrink-0 text-brand" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        {isCurrent ? (
          <Button block variant="secondary" disabled icon={Icons.Check}>
            Current plan
          </Button>
        ) : (
          <Button
            block
            variant={tier.featured ? 'primary' : 'secondary'}
            icon={tier.plan === 'free' ? undefined : Icons.Sparkles}
            onClick={select}
          >
            {tier.plan === 'free' ? 'Switch to Free' : `Go ${meta.label}`}
          </Button>
        )}
      </div>
    </Card>
  );
}

const MENTOR_STEPS = [
  {
    icon: Icons.BadgeCheck,
    title: 'Apply & verify',
    body: 'Tell us your current role, the career nodes you know, and the topics you can coach. We verify your background.',
  },
  {
    icon: Icons.Calendar,
    title: 'Set your availability',
    body: 'Pick the hours and session types you want to offer. You stay in control of your calendar and your rate.',
  },
  {
    icon: Icons.Banknote,
    title: 'Get matched & paid',
    body: 'We route candidates whose target maps to your experience. You get paid per session — we never charge mentors a fee.',
  },
];

function MentorPanel() {
  const { mode, setMode } = useSubscription();
  const toast = useToast();
  const navigate = useNavigate();
  const isMentor = mode === 'mentor';

  const become = () => {
    setMode('mentor');
    toast("You're set up as a mentor — candidates can now match with you", {
      icon: Icons.BadgeCheck,
      tone: 'success',
    });
    navigate('/mentors');
  };

  return (
    <div className="mt-16">
      <Reveal>
        <Card className="overflow-hidden border-line/10 p-0">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
            <div className="p-8 sm:p-10">
              <Badge tone="amber" icon={Icons.Banknote}>
                You earn — you don't pay
              </Badge>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
                Get paid to guide the next generation.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
                Becoming a mentor is free. Set your own rate, keep{' '}
                <span className="font-bold text-ink">85%</span> of every session, and only meet
                candidates whose target route actually maps to your experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-6">
                <div>
                  <div className="font-display text-2xl font-black text-ink">85%</div>
                  <div className="text-xs font-semibold text-ink-mute">You keep per session</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-black text-ink">$0</div>
                  <div className="text-xs font-semibold text-ink-mute">Cost to join</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-black text-ink">You</div>
                  <div className="text-xs font-semibold text-ink-mute">Set the rate & hours</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {isMentor ? (
                  <Button variant="secondary" icon={Icons.Check} disabled>
                    You're a mentor
                  </Button>
                ) : (
                  <Button icon={Icons.BadgeCheck} onClick={become}>
                    Become a mentor
                  </Button>
                )}
                <Link to="/mentors" className="text-sm font-semibold text-brand hover:underline">
                  See how matching works →
                </Link>
              </div>
            </div>

            <div className="border-t border-line/10 bg-surface-2 p-8 sm:p-10 lg:border-l lg:border-t-0">
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-mute">
                How it works
              </p>
              <ol className="mt-5 space-y-5">
                {MENTOR_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                      <step.icon size={17} strokeWidth={2.2} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {i + 1}. {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-soft">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      </Reveal>
    </div>
  );
}

export function Pricing() {
  const { mode } = useSubscription();
  const [view, setView] = useState<View>(mode === 'mentor' ? 'mentor' : 'mentoring');

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      {/* Hero */}
      <section className="py-8 text-center">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-6xl">
            Straightforward pricing. <span className="highlight-green">No hidden fees.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">
            We don't sell candidate data. Map your career for free, go Pro when you want a mentor —
            or flip it around and get paid to mentor others.
          </p>
          <div className="mt-8 flex justify-center">
            <SegmentedControl<View>
              value={view}
              onChange={setView}
              segments={[
                { value: 'mentoring', label: 'Looking for mentoring', icon: Icons.Compass },
                { value: 'mentor', label: 'Become a mentor', icon: Icons.Banknote },
              ]}
            />
          </div>
        </Reveal>
      </section>

      {view === 'mentoring' ? (
        <>
          <section className="mt-12 grid gap-8 md:grid-cols-3">
            {TIERS.map((tier, i) => (
              <Reveal key={tier.plan} delay={i * 80}>
                <div className="relative h-full">
                  <PricingTier tier={tier} />
                </div>
              </Reveal>
            ))}
          </section>

          <section className="mx-auto mt-16 max-w-2xl text-center">
            <p className="text-xs text-ink-mute">
              All payments are processed securely. Subscriptions can be upgraded, downgraded, or
              canceled at any time. Mentor Match requires a Pro plan or above.
            </p>
          </section>
        </>
      ) : (
        <MentorPanel />
      )}
    </div>
  );
}
