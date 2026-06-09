import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { ASSESSMENT } from '@/lib/mockData';
import { Button, Card, TextField, Logo, ProgressRing } from '@/ui/components';

const STEPS = ['Background', 'Skills', 'Experience', 'Priorities', 'Create account'] as const;

/**
 * One-time pre-account onboarding. This is the Career State Assessment, moved
 * out of the dashboard into a standalone flow that finishes by creating the
 * account and dropping the user into the app. Reached via the rocket-launch CTA.
 */
export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [computing, setComputing] = useState(false);

  const [background, setBackground] = useState<string | null>(null);
  const [skills, setSkills] = useState<Set<string>>(new Set(['React', 'TypeScript']));
  const [years, setYears] = useState(4);
  const [role, setRole] = useState('Frontend Engineer');
  const [priorities, setPriorities] = useState<Set<string>>(new Set(['growth', 'impact']));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggle = (set: Set<string>, v: string, max?: number) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else {
      if (max && next.size >= max) return next;
      next.add(v);
    }
    return next;
  };

  const canNext =
    step === 0
      ? !!background
      : step === 1
        ? skills.size > 0
        : step === 2
          ? !!role
          : step === 3
            ? true
            : !!name && /.+@.+\..+/.test(email) && password.length >= 6;

  const finish = () => {
    setComputing(true);
    setTimeout(() => navigate('/map'), 1900);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (computing) return <Computing />;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6 sm:px-6">
        <Link to="/" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        <span className="text-sm font-semibold text-ink-mute">
          Step {step + 1} of {STEPS.length}
        </span>
      </header>

      <div className="mx-auto max-w-3xl px-5 pb-16 sm:px-6">
        <div className="mb-5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-brand">
            Let’s set you up
          </span>
          <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
            {step < 4 ? 'Find your starting node' : 'Save your results'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            {step < 4
              ? 'A one-time setup — no résumé needed. Answer what feels true today.'
              : 'Create your account to lock in your node and unlock the map.'}
          </p>
        </div>

        {/* progress */}
        <div className="mb-6 flex gap-1.5">
          {STEPS.map((s, i) => (
            <span key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/12">
              <span
                className="block h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: i <= step ? '100%' : '0%' }}
              />
            </span>
          ))}
        </div>

        <Card className="p-5 sm:p-7">
          {step === 0 && (
            <Step title="What’s your background?" hint="Pick the closest match.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ASSESSMENT.background.map((b) => {
                  const Icon = getIcon(b.icon);
                  const active = background === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBackground(b.id)}
                      className={cn(
                        'focus-ring flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition',
                        active
                          ? 'border-brand bg-brand/5 shadow-soft'
                          : 'border-line/12 bg-surface hover:border-line/25',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-10 w-10 place-items-center rounded-xl',
                          active ? 'bg-brand text-white' : 'bg-surface-2 text-ink-soft',
                        )}
                      >
                        <Icon size={20} strokeWidth={2.1} />
                      </span>
                      <span className="text-sm font-bold text-ink">{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 1 && (
            <Step title="Which skills are you strongest in?" hint="Select all that apply.">
              <div className="flex flex-wrap gap-2">
                {ASSESSMENT.skills.map((s) => {
                  const active = skills.has(s);
                  return (
                    <button
                      key={s}
                      onClick={() => setSkills((prev) => toggle(prev, s))}
                      className={cn(
                        'focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition',
                        active
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-line/15 bg-surface text-ink-soft hover:border-line/30',
                      )}
                    >
                      {active && <Icons.Check size={14} />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step title="A little about your experience" hint="Helps us place you precisely.">
              <div className="space-y-5">
                <TextField
                  label="Current or most recent role"
                  icon={Icons.Briefcase}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                />
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink-soft">Years of experience</span>
                    <span className="text-sm font-bold text-brand">{years} yrs</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-line/15 accent-brand"
                  />
                  <div className="mt-1 flex justify-between text-[11px] font-semibold text-ink-mute">
                    <span>0</span>
                    <span>10</span>
                    <span>20+</span>
                  </div>
                </div>
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step title="What matters most right now?" hint="Pick up to 3.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ASSESSMENT.priorities.map((p) => {
                  const Icon = getIcon(p.icon);
                  const active = priorities.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPriorities((prev) => toggle(prev, p.id, 3))}
                      className={cn(
                        'focus-ring flex items-center gap-3 rounded-2xl border p-3.5 text-left transition',
                        active ? 'border-brand bg-brand/5' : 'border-line/12 bg-surface hover:border-line/25',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-9 w-9 place-items-center rounded-xl',
                          active ? 'bg-brand text-white' : 'bg-surface-2 text-ink-soft',
                        )}
                      >
                        <Icon size={18} strokeWidth={2.1} />
                      </span>
                      <span className="flex-1 text-sm font-bold text-ink">{p.label}</span>
                      {active && <Icons.CheckCircle2 size={18} className="text-brand" />}
                    </button>
                  );
                })}
              </div>
            </Step>
          )}

          {step === 4 && (
            <Step title="Create your account" hint="Almost there — your node is ready to save.">
              <div className="space-y-4">
                <TextField
                  label="Full name"
                  icon={Icons.User}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                />
                <TextField
                  label="Work email"
                  icon={Icons.Search}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
                <TextField
                  label="Password"
                  icon={Icons.ShieldCheck}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  hint="Minimum 6 characters."
                />
              </div>
            </Step>
          )}

          <div className="mt-7 flex items-center justify-between">
            <Button
              variant="ghost"
              icon={Icons.ArrowLeft}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button iconRight={Icons.ArrowRight} disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button icon={Icons.Sparkles} disabled={!canNext} onClick={finish}>
                Create account
              </Button>
            )}
          </div>
        </Card>

        <p className="mt-5 text-center text-sm text-ink-mute">
          Already have an account?{' '}
          <Link to="/map" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Step({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {hint && <p className="mb-5 mt-1 text-sm text-ink-mute">{hint}</p>}
      {children}
    </div>
  );
}

function Computing() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-6 text-center">
      <div>
        <div className="mx-auto flex justify-center">
          <ProgressRing value={100} sublabel="setting up" size={140} tone="brand" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-extrabold text-ink">Building your map…</h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          Placing your node and routing your first move.
        </p>
      </div>
    </div>
  );
}
