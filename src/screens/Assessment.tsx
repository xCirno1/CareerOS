import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { ASSESSMENT, getNode, CURRENT_NODE_ID } from '@/lib/mockData';
import {
  Button,
  Card,
  TextField,
  ProgressRing,
  Skeleton,
  SkeletonText,
  Badge,
} from '@/ui/components';

const STEPS = ['Background', 'Skills', 'Experience', 'Priorities'] as const;

export function Assessment() {
  const [step, setStep] = useState(0);
  const [computing, setComputing] = useState(false);
  const [done, setDone] = useState(false);

  // selections
  const [background, setBackground] = useState<string | null>(null);
  const [skills, setSkills] = useState<Set<string>>(new Set(['React', 'TypeScript']));
  const [years, setYears] = useState(4);
  const [role, setRole] = useState('Frontend Engineer');
  const [priorities, setPriorities] = useState<Set<string>>(new Set(['growth', 'impact']));

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
    step === 0 ? !!background : step === 1 ? skills.size > 0 : step === 2 ? !!role : true;

  const submit = () => {
    setComputing(true);
    setTimeout(() => {
      setComputing(false);
      setDone(true);
    }, 1600);
  };

  if (done) return <Result />;
  if (computing) return <Computing />;

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-5">
        <Badge tone="brand" icon={Icons.ClipboardCheck}>
          Career State Assessment
        </Badge>
        <h1 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Let’s find your current node
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Four quick steps. No résumé needed — answer what feels true today.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition',
                  i < step
                    ? 'bg-brand text-white'
                    : i === step
                    ? 'bg-navy text-white dark:bg-brand dark:text-navy'
                    : 'bg-line/10 text-ink-mute',
                )}
              >
                {i < step ? <Icons.Check size={14} /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-semibold sm:block',
                  i === step ? 'text-ink' : 'text-ink-mute',
                )}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line/10">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
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
                      active
                        ? 'border-brand bg-brand/5'
                        : 'border-line/12 bg-surface hover:border-line/25',
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

        {/* Nav */}
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
            <Button icon={Icons.Sparkles} onClick={submit}>
              Reveal my node
            </Button>
          )}
        </div>
      </Card>
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
  children: React.ReactNode;
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
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Card className="p-8 text-center">
        <div className="relative mx-auto grid h-24 w-24 place-items-center">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-line/10 border-t-brand" />
          <Icons.Compass size={32} className="text-brand" />
        </div>
        <h2 className="mt-5 font-display text-xl font-extrabold text-ink">
          Triangulating your node…
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Comparing your profile against millions of career journeys.
        </p>
        <div className="mx-auto mt-6 max-w-sm space-y-3 text-left">
          <SkeletonText lines={2} />
          <Skeleton className="h-20" rounded="rounded-2xl" />
        </div>
      </Card>
    </div>
  );
}

function Result() {
  const node = getNode(CURRENT_NODE_ID)!;
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-brand/10 to-transparent p-7 text-center sm:p-9">
          <Badge tone="emerald" icon={Icons.CheckCircle2} className="mx-auto">
            Node located
          </Badge>
          <div className="mt-5 flex justify-center">
            <ProgressRing value={node.match} sublabel="confidence" size={140} tone="brand" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink">
            You’re a <span className="text-gradient">{node.title}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{node.summary}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/map">
              <Button size="lg" icon={Icons.Network} iconRight={Icons.ArrowRight}>
                See me on the map
              </Button>
            </Link>
            <Link to="/routing">
              <Button size="lg" variant="secondary" icon={Icons.Route}>
                Plan a pathway
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
