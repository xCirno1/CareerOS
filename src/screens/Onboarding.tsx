import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { ASSESSMENT } from '@/lib/mockData';
import { Button, TextField, Logo, ProgressRing } from '@/ui/components';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

const STAGES = [
  { key: 'name', label: 'You' },
  { key: 'background', label: 'Background' },
  { key: 'skills', label: 'Strengths' },
  { key: 'experience', label: 'Experience' },
  { key: 'priorities', label: 'Priorities' },
  { key: 'account', label: 'Account' },
] as const;
const TOTAL = STAGES.length;

const BASE_SKILL_COUNT = 5;
const MAX_VISIBLE_SKILL_CHIPS = 10;
const MAX_SELECTED_SKILLS = 10;

/**
 * One-time pre-account onboarding, told as a story. One prompt per screen, big
 * editorial type, GSAP step transitions, and copy that greets the user by name
 * so each "Continue" feels like a welcome. Finishes by creating the account and
 * dropping into the app. Reached via the rocket-launch CTA.
 */
export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [computing, setComputing] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [background, setBackground] = useState<string | null>(null);
  const [otherBackground, setOtherBackground] = useState('');
  const [skills, setSkills] = useState<Set<string>>(new Set());
  const [customSkill, setCustomSkill] = useState('');
  const [years, setYears] = useState(4);
  const [role, setRole] = useState('Frontend Engineer');
  const [priorities, setPriorities] = useState<Set<string>>(new Set(['growth', 'impact']));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeSkipped, setResumeSkipped] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const lock = useRef(false);

  const first = name.trim().split(/\s+/)[0] || 'there';

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
      ? name.trim().length > 0
      : step === 1
        ? !!background && (background !== 'other' || otherBackground.trim().length > 0)
        : step === 2
          ? skills.size > 0
          : step === 3
            ? !!role
            : step === 4
              ? true
              : /.+@.+\..+/.test(email) && password.length >= 6;

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

  // animate each step in
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    lock.current = false;
    const items = el.querySelectorAll('.story-item');
    if (prefersReducedMotion()) {
      gsap.set([el, ...Array.from(items)], { autoAlpha: 1, y: 0 });
      return;
    }
    gsap.set(el, { autoAlpha: 1, y: 0 });
    const tl = gsap.timeline();
    tl.fromTo(
      items,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 },
    );
    return () => {
      tl.kill();
    };
  }, [step]);

  const finish = () => {
    setComputing(true);
    setTimeout(() => navigate('/map'), 2100);
  };

  const leave = (run: () => void, dir: 1 | -1) => {
    if (prefersReducedMotion()) {
      run();
      return;
    }
    if (lock.current) return;
    lock.current = true;
    gsap.to(contentRef.current, {
      autoAlpha: 0,
      y: dir === 1 ? -28 : 28,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: run,
    });
  };

  const goNext = () => {
    if (!canNext) return;
    if (step === TOTAL - 1) leave(finish, 1);
    else leave(() => setStep((s) => s + 1), 1);
  };
  const goBack = () => {
    if (step === 0) return;
    leave(() => setStep((s) => (resumeSkipped && s === 4 ? 0 : s - 1)), -1);
  };
  const importResumeAndSkip = async (file: File) => {
    const text = file.size > 6_000_000 ? '' : await file.text().catch(() => '');
    const source = `${file.name} ${text}`.toLowerCase();
    const detectedSkills = ASSESSMENT.skills.filter((skill) =>
      source.includes(skill.toLowerCase().replace(/\s*\/\s*/g, ' ')) ||
      source.includes(skill.toLowerCase()),
    );
    const yearsFound = [...source.matchAll(/(\d{1,2})\+?\s*(?:years|yrs|year)/g)]
      .map((m) => Number(m[1]))
      .filter((n) => Number.isFinite(n));
    const guessedRole =
      source.match(/(frontend|front-end|react)/)
        ? 'Frontend Engineer'
        : source.match(/product/)
          ? 'Product Manager'
          : source.match(/data|analytics/)
            ? 'Data Analyst'
            : role;
    const guessedName = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/\b(resume|cv|curriculum|vitae)\b/gi, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (ch) => ch.toUpperCase());

    if (!name.trim() && guessedName) setName(guessedName);
    if (detectedSkills.length) setSkills(new Set(detectedSkills.slice(0, MAX_SELECTED_SKILLS)));
    if (yearsFound.length) setYears(Math.max(...yearsFound));
    setRole(guessedRole);
    setBackground('other');
    setOtherBackground('Imported from resume');
    setResumeName(file.name);
    setResumeSkipped(true);
    leave(() => setStep(4), 1);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };
  const onEnter = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      goNext();
    }
  };

  if (computing) return <Computing name={first} />;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas">
      {/* faint backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--c-line)/0.05) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--c-line)/0.05) 1px,transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black, transparent 75%)',
        }}
      />
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber/[0.06] blur-3xl" />

      {/* top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link to="/" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        <Link
          to="/map"
          className="text-sm font-semibold text-ink-mute transition hover:text-ink"
        >
          Sign in
        </Link>
      </header>

      {/* journey progress */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 sm:px-10">
        <div className="flex items-center gap-1.5">
          {STAGES.map((s, i) => (
            <span key={s.key} className="h-1 flex-1 overflow-hidden rounded-full bg-line/12">
              <span
                className="block h-full rounded-full bg-brand transition-all duration-500 ease-out"
                style={{ width: i < step ? '100%' : i === step ? '55%' : '0%' }}
              />
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-ink-mute">
          <span className="text-brand">{STAGES[step].label}</span>
          <span>
            {step + 1} / {TOTAL}
          </span>
        </div>
      </div>

      {/* content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
        <div ref={contentRef} className="w-full max-w-2xl">
          {/* ---- Name ---- */}
          {step === 0 && (
            <>
              <StoryHead
                eyebrow="Welcome to CareerOS"
                prompt="First — what should we call you?"
                helper="No pressure. We're just getting to know each other."
              />
              <div className="story-item">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={onEnter}
                  placeholder="Type your name"
                  className="w-full max-w-md border-b-2 border-line/20 bg-transparent pb-3 text-2xl font-bold text-ink outline-none transition-colors placeholder:text-ink-mute/40 focus:border-brand sm:text-3xl"
                />
                <input
                  ref={resumeInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) void importResumeAndSkip(file);
                  }}
                />
                <p className="mt-4 max-w-md text-sm leading-6 text-ink-mute">
                  or use your resume to skip! {' '}
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    className="focus-ring rounded font-bold text-brand underline-offset-4 transition hover:underline"
                  >
                    Import your resume now
                  </button>
                  {resumeName && <span className="block truncate text-xs font-semibold text-brand">{resumeName}</span>}
                </p>
              </div>
            </>
          )}

          {/* ---- Background ---- */}
          {step === 1 && (
            <>
              <StoryHead
                eyebrow="Chapter one"
                greet={`Lovely to meet you, ${first}.`}
                prompt="Where does your story begin?"
                helper="Pick the path that shaped your current skills the most."
              />
              <div className="story-item space-y-4">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {ASSESSMENT.background.map((b) => {
                    const Icon = getIcon(b.icon);
                    const active = background === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setBackground(b.id)}
                        className={cn(
                          'focus-ring flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition',
                          active
                            ? 'border-brand bg-brand/5 shadow-soft'
                            : 'border-line/12 bg-surface hover:border-line/25',
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                            active ? 'bg-brand text-white' : 'bg-surface-2 text-ink-soft',
                          )}
                        >
                          <Icon size={18} strokeWidth={2.1} />
                        </span>
                        <span className="flex-1 text-sm font-bold leading-snug text-ink">{b.label}</span>
                        {active && <Icons.Check size={16} className="shrink-0 text-brand" />}
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
                    onKeyDown={onEnter}
                    placeholder="e.g. healthcare, education, trades, finance"
                  />
                )}
              </div>
            </>
          )}

          {/* ---- Skills ---- */}
          {step === 2 && (
            <>
              <StoryHead
                eyebrow="Your strengths"
                prompt={`What are you great at, ${first}?`}
                helper="Choose everything you'd confidently bring to a team — up to 10, or add your own."
              />
              <div className="story-item space-y-4">
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
                          'focus-ring inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition',
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
                        className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-brand bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition"
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
            </>
          )}

          {/* ---- Experience ---- */}
          {step === 3 && (
            <>
              <StoryHead
                eyebrow="Where you stand"
                prompt="And where are you right now?"
                helper="A current role and a rough sense of time — that's plenty."
              />
              <div className="story-item space-y-6">
                <TextField
                  label="Current or most recent role"
                  icon={Icons.Briefcase}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onKeyDown={onEnter}
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
            </>
          )}

          {/* ---- Priorities ---- */}
          {step === 4 && (
            <>
              <StoryHead
                eyebrow="What you're chasing"
                prompt={`What matters most to you, ${first}?`}
                helper="Pick up to three. This shapes the routes we'll suggest."
              />
              <div className="story-item grid grid-cols-1 gap-3 sm:grid-cols-2">
                {ASSESSMENT.priorities.map((p) => {
                  const Icon = getIcon(p.icon);
                  const active = priorities.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPriorities((prev) => toggle(prev, p.id, 3))}
                      className={cn(
                        'focus-ring flex items-center gap-3 rounded-2xl border p-4 text-left transition',
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
            </>
          )}

          {/* ---- Account ---- */}
          {step === 5 && (
            <>
              <StoryHead
                eyebrow="One last thing"
                greet={`You're all set, ${first}.`}
                prompt="Let's save your map."
                helper="Create your account to lock in your starting point and see your first route."
              />
              <div className="story-item space-y-4">
                <TextField
                  label="Email"
                  icon={Icons.Search}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={onEnter}
                  placeholder="you@company.com"
                />
                <TextField
                  label="Password"
                  icon={Icons.ShieldCheck}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={onEnter}
                  placeholder="At least 6 characters"
                  hint="Minimum 6 characters."
                />
              </div>
            </>
          )}

          {/* nav */}
          <div className="story-item mt-10 flex items-center gap-3">
            {step > 0 && (
              <Button variant="ghost" icon={Icons.ArrowLeft} onClick={goBack}>
                Back
              </Button>
            )}
            {step < TOTAL - 1 ? (
              <Button
                size="lg"
                iconRight={Icons.ArrowRight}
                disabled={!canNext}
                onClick={goNext}
                className="ml-auto"
              >
                Continue
              </Button>
            ) : (
              <Button
                size="lg"
                icon={Icons.Sparkles}
                disabled={!canNext}
                onClick={goNext}
                className="ml-auto"
              >
                Create my account
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StoryHead({
  eyebrow,
  greet,
  prompt,
  helper,
}: {
  eyebrow: string;
  greet?: string;
  prompt: ReactNode;
  helper?: string;
}) {
  return (
    <div className="mb-8">
      <span className="story-item block text-[12px] font-bold uppercase tracking-[0.2em] text-brand">
        {eyebrow}
      </span>
      {greet && (
        <p className="story-item mt-3 text-lg font-medium text-ink-soft sm:text-xl">{greet}</p>
      )}
      <h1 className="story-item mt-2 font-display text-4xl font-black leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
        {prompt}
      </h1>
      {helper && (
        <p className="story-item mt-4 max-w-xl text-base leading-relaxed text-ink-soft">{helper}</p>
      )}
    </div>
  );
}

function Computing({ name }: { name: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas p-6 text-center">
      <div className="animate-fade-up">
        <div className="mx-auto flex justify-center">
          <ProgressRing value={100} sublabel="setting up" size={140} tone="brand" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-extrabold text-ink">
          Building your map, {name}…
        </h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          Placing your starting point and routing your first move.
        </p>
      </div>
    </div>
  );
}
