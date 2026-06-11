import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/appStore';
import { useProfile } from '@/lib/profile';
import { ASSESSMENT, getNode } from '@/lib/mockData';
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
const BASE_SKILL_COUNT = 5;
const MAX_VISIBLE_SKILL_CHIPS = 10;
const MAX_SELECTED_SKILLS = 10;

export function Assessment() {
  const { careerProfile, updateCareerProfile } = useAppStore();
  const { update } = useProfile();
  const [step, setStep] = useState(0);
  const [computing, setComputing] = useState(false);
  const [done, setDone] = useState(false);

  // selections
  const [background, setBackground] = useState<string | null>(null);
  const [otherBackground, setOtherBackground] = useState('');
  const [skills, setSkills] = useState<Set<string>>(new Set());
  const [customSkill, setCustomSkill] = useState('');
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
    step === 0
      ? !!background && (background !== 'other' || otherBackground.trim().length > 0)
      : step === 1
        ? skills.size > 0
        : step === 2
          ? !!role
          : true;

  const skillOptions = ASSESSMENT.skills as readonly string[];
  const visibleSkillCount = Math.min(
    skillOptions.length,
    MAX_VISIBLE_SKILL_CHIPS,
    BASE_SKILL_COUNT + skills.size,
  );
  const visibleSkills = skillOptions.slice(0, visibleSkillCount);
  const customSkills = Array.from(skills).filter((skill) => !skillOptions.includes(skill));
  const skillLimitReached = skills.size >= MAX_SELECTED_SKILLS;

  const addCustomSkill = () => {
    const nextSkill = customSkill.trim();
    if (!nextSkill || skillLimitReached) return;

    setSkills((prev) => {
      if (prev.size >= MAX_SELECTED_SKILLS) return prev;
      const duplicate = Array.from(prev).some(
        (skill) => skill.toLowerCase() === nextSkill.toLowerCase(),
      );
      if (duplicate) return prev;
      return new Set(prev).add(nextSkill);
    });
    setCustomSkill('');
  };

  const submit = () => {
    setComputing(true);
    setTimeout(() => {
      updateCareerProfile({
        background: background === 'other' ? otherBackground : background ?? careerProfile.background,
        skills: Array.from(skills),
        yearsExperience: years,
        currentRole: role,
        priorities: Array.from(priorities),
        source: 'assessment',
      });
      update({
        headline: `${role} · ${years} yrs experience`,
        priorities: Array.from(priorities),
      });
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
          Let’s find your starting point
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
          <Step
            title="Which path best describes your background?"
            hint="Choose the field, training route, or work experience that most shaped your current skills."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ASSESSMENT.background.map((b) => {
                  const Icon = getIcon(b.icon);
                  const active = background === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setBackground(b.id)}
                      className={cn(
                        'focus-ring flex min-h-[132px] flex-col items-start gap-3 rounded-2xl border p-4 text-left transition',
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
                      <span className="text-sm font-bold leading-snug text-ink">{b.label}</span>
                    </button>
                  );
                })}
              </div>
              {background === 'other' && (
                <TextField
                  label="Tell us your actual background"
                  icon={Icons.Shapes}
                  value={otherBackground}
                  onChange={(e) => setOtherBackground(e.target.value)}
                  placeholder="e.g. healthcare, education, trades, finance"
                />
              )}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="Which skills are you strongest in?" hint="Choose up to 10, or add your own.">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {visibleSkills.map((s) => {
                  const active = skills.has(s);
                  const disabled = !active && skillLimitReached;
                  return (
                    <button
                      key={s}
                      onClick={() => setSkills((prev) => toggle(prev, s, MAX_SELECTED_SKILLS))}
                      disabled={disabled}
                      className={cn(
                        'focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition',
                        active
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-line/15 bg-surface text-ink-soft hover:border-line/30',
                        disabled && 'cursor-not-allowed opacity-45 hover:border-line/15',
                      )}
                    >
                      {active && <Icons.Check size={14} />}
                      {s}
                    </button>
                  );
                })}
              </div>
              {customSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => setSkills((prev) => toggle(prev, skill))}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand/10 px-3.5 py-2 text-sm font-semibold text-brand transition"
                    >
                      {skill}
                      <Icons.X size={13} />
                    </button>
                  ))}
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <TextField
                  label="Add a custom skill"
                  icon={Icons.Sparkles}
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="e.g. Python, sales, cybersecurity, teaching"
                  disabled={skillLimitReached}
                />
                <Button
                  variant="secondary"
                  icon={Icons.Plus}
                  onClick={addCustomSkill}
                  disabled={!customSkill.trim() || skillLimitReached}
                >
                  Add
                </Button>
              </div>
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
              Reveal my starting point
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
          Triangulating your starting point…
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Comparing your answers with the prototype career graph.
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
  const { careerProfile } = useAppStore();
  const node = getNode(careerProfile.currentNodeId)!;
  const target = getNode(careerProfile.targetNodeId);
  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-brand/10 to-transparent p-7 text-center sm:p-9">
          <Badge tone="emerald" icon={Icons.CheckCircle2} className="mx-auto">
            Starting point located
          </Badge>
          <div className="mt-5 flex justify-center">
            <ProgressRing value={node.match} sublabel="confidence" size={140} tone="brand" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink">
            You’re a <span className="text-gradient">{node.title}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{node.summary}</p>
          {target && (
            <p className="mx-auto mt-2 max-w-md text-xs font-semibold text-ink-mute">
              Best-fit target for now: {target.title}
            </p>
          )}
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
