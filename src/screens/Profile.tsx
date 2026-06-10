import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Icons, getIcon, type LucideIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useSimulatedLoading, useReducedMotion } from '@/lib/hooks';
import { useAppStore } from '@/lib/appStore';
import {
  useProfile,
  profileLinks,
  profileStrength,
  DEFAULT_EDITABLE,
  type EditableProfile,
  type ExperienceItem,
  type Profile as UserProfile,
  type ResumeImportPatch,
  type SkillProf,
} from '@/lib/profile';
import {
  getNode,
  getNodeIcon,
  getNodeKindMeta,
  getRoutesTo,
  DEMAND_META,
  ASSESSMENT,
  type CareerNode,
} from '@/lib/mockData';
import {
  Card,
  Badge,
  Button,
  Avatar,
  ProgressRing,
  Sparkline,
  Skeleton,
  SkeletonText,
  TextField,
  Toggle,
  useToast,
} from '@/ui/components';

const ACCENT_HEX: Record<string, string> = {
  teal: '#2f7f8f',
  wine: '#7e3041',
  amber: '#f2b95e',
  navy: '#17324d',
};

const SKILL_GROUPS: SkillProf['group'][] = ['Frontend', 'Craft', 'Engineering', 'Product'];

/** Replays bar/ring growth when the screen (or a panel) mounts. */
function useGrow() {
  const reduced = useReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduced) {
      setOn(true);
      return;
    }
    const r = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(r);
  }, [reduced]);
  return on;
}

const PRIORITY_META = Object.fromEntries(ASSESSMENT.priorities.map((p) => [p.id, p])) as Record<
  string,
  (typeof ASSESSMENT.priorities)[number]
>;

const RESUME_SKILL_HINTS: Array<{
  name: string;
  group: SkillProf['group'];
  keywords: string[];
}> = [
  { name: 'React', group: 'Frontend', keywords: ['react', 'next.js', 'nextjs'] },
  { name: 'TypeScript', group: 'Frontend', keywords: ['typescript', 'type-safe', 'typed javascript'] },
  { name: 'CSS / Tailwind', group: 'Craft', keywords: ['tailwind', 'css', 'responsive ui'] },
  { name: 'UI Systems', group: 'Craft', keywords: ['design system', 'component library', 'ui system'] },
  { name: 'Accessibility', group: 'Craft', keywords: ['accessibility', 'wcag', 'a11y'] },
  { name: 'Figma', group: 'Craft', keywords: ['figma', 'design handoff', 'prototype'] },
  { name: 'Node.js', group: 'Engineering', keywords: ['node.js', 'nodejs', 'express'] },
  { name: 'Testing / CI', group: 'Engineering', keywords: ['testing', 'playwright', 'jest', 'ci/cd', 'continuous integration'] },
  { name: 'Cloud / AWS', group: 'Engineering', keywords: ['aws', 'cloud', 'lambda', 'serverless'] },
  { name: 'Product Discovery', group: 'Product', keywords: ['product discovery', 'roadmap', 'user research'] },
  { name: 'Analytics', group: 'Product', keywords: ['analytics', 'experimentation', 'activation', 'funnel'] },
  { name: 'AI Integration', group: 'Product', keywords: ['ai', 'llm', 'openai', 'machine learning', 'rag'] },
];

async function readResumeText(file: File): Promise<string> {
  if (file.size > 6_000_000) return file.name;
  const raw = await file.text();
  return raw.slice(0, 50_000);
}

function inferResumeImportPatch(file: File, text: string, profile: UserProfile): ResumeImportPatch {
  const source = `${file.name} ${text}`.toLowerCase();
  const skillMap = new Map(profile.skills.map((s) => [s.name.toLowerCase(), { ...s }]));

  RESUME_SKILL_HINTS.forEach((hint) => {
    const matched = hint.keywords.some((keyword) => source.includes(keyword));
    if (!matched) return;

    const key = hint.name.toLowerCase();
    const existing = skillMap.get(key);
    if (existing) {
      skillMap.set(key, {
        ...existing,
        level: Math.min(96, Math.max(existing.level, existing.level + 4)),
        years: Math.max(existing.years, Math.min(profile.yearsExperience, existing.years + 1)),
      });
    } else {
      skillMap.set(key, {
        name: hint.name,
        group: hint.group,
        level: 58,
        years: Math.max(1, Math.min(profile.yearsExperience || 1, 3)),
      });
    }
  });

  const years = [...source.matchAll(/(\d{1,2})\+?\s*(?:years|yrs|year)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n));
  const yearsExperience = Math.max(profile.yearsExperience, ...years, profile.yearsExperience);
  const skills = [...skillMap.values()].sort(
    (a, b) => SKILL_GROUPS.indexOf(a.group) - SKILL_GROUPS.indexOf(b.group) || b.level - a.level,
  );

  const editable: ResumeImportPatch['editable'] = {};
  if (/\b(ai|llm|openai|machine learning|rag)\b/.test(source)) {
    editable.headline = 'Frontend Engineer · AI application interfaces';
    editable.availability = 'Open to frontend, AI product, and platform interface roles';
  } else if (/\b(product|roadmap|discovery|analytics|activation)\b/.test(source)) {
    editable.headline = 'Frontend Engineer · product-minded systems builder';
  }

  return {
    fileName: file.name,
    editable,
    static: {
      yearsExperience,
      skills,
    },
  };
}

/* ================================================================== */

export function Profile() {
  const loading = useSimulatedLoading(700);
  const { profile, update, importResume } = useProfile();
  const { saved, recents, target } = useAppStore();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const currentNode = getNode(profile.currentNodeId);
  const currentExp = profile.experience.find((e) => e.current) ?? profile.experience[0];
  const strength = profileStrength(profile);
  const links = profileLinks(profile);
  const joined = useMemo(
    () =>
      new Date(profile.joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [profile.joined],
  );

  const share = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast('Profile link copied', { icon: Icons.Share2, tone: 'info' });
  };

  const reimportResume = async (file: File) => {
    try {
      const text = await readResumeText(file);
      importResume(inferResumeImportPatch(file, text, profile));
      toast(`Resume re-imported from ${file.name}`, { icon: Icons.Upload, tone: 'success' });
    } catch {
      toast('Could not read that resume file', { icon: Icons.Upload, tone: 'warn' });
    } finally {
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* ---------- Cover / hero ---------- */}
      <Card className="overflow-hidden">
        <div
          className="relative h-32 sm:h-40"
          style={{
            background:
              'linear-gradient(120deg, rgb(var(--c-navy)) 0%, rgb(var(--c-brand)) 55%, rgb(var(--c-accent)) 120%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 18% 30%, rgba(255,255,255,.5) 0, transparent 12%), radial-gradient(circle at 82% 70%, rgba(255,255,255,.35) 0, transparent 14%)',
            }}
          />
          {profile.openToWork && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-soft backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Open to work
            </span>
          )}
        </div>

        <div className="px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="-mt-12 flex flex-wrap items-end gap-4 sm:-mt-14">
            <div className="rounded-full ring-4 ring-surface">
              <Avatar name={profile.name} size={104} className="text-3xl shadow-glass" />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {profile.name}
                </h1>
                {profile.pronouns && (
                  <span className="rounded-full bg-line/8 px-2 py-0.5 text-xs font-semibold text-ink-mute">
                    {profile.pronouns}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-ink-soft sm:text-base">
                {profile.headline}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-mute">
                <Meta icon={Icons.MapPin}>{profile.location}</Meta>
                <Meta icon={Icons.Clock}>{profile.timezone}</Meta>
                <Meta icon={Icons.Calendar}>Member since {joined}</Meta>
                <Meta icon={Icons.GraduationCap}>{profile.backgroundLabel}</Meta>
              </div>
            </div>
            <div className="flex shrink-0 gap-2 pb-1">
              <input
                ref={resumeInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.rtf"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) void reimportResume(file);
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                icon={Icons.Upload}
                onClick={() => resumeInputRef.current?.click()}
              >
                Re-import resume
              </Button>
              <Button size="sm" icon={Icons.Pencil} onClick={() => setEditing(true)}>
                Edit profile
              </Button>
              <Button size="sm" variant="secondary" icon={Icons.Share2} onClick={share}>
                Share
              </Button>
            </div>
          </div>

          {/* availability + links */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {profile.availability && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/[0.06] px-3 py-1.5 text-xs font-semibold text-brand">
                <Icons.Target size={13} /> {profile.availability}
              </span>
            )}
            {links.map((l) => {
              const Icon = getIcon(l.icon);
              return (
                <a
                  key={l.id}
                  href={l.href}
                  target={l.id === 'email' ? undefined : '_blank'}
                  rel="noreferrer"
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-line/12 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-line/25 hover:text-ink"
                >
                  <Icon size={13} /> {l.label}
                </a>
              );
            })}
            {profile.resumeImportedAt && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line/12 bg-line/8 px-3 py-1.5 text-xs font-semibold text-ink-mute">
                <Icons.Upload size={13} />
                Resume updated {new Date(profile.resumeImportedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* ---------- Stat strip ---------- */}
      <ProfileSignalStrip
        strength={strength}
        yearsExperience={profile.yearsExperience}
        roles={profile.experience.length}
        saved={saved.length}
        skills={profile.skills.length}
      />

      {/* ---------- Body ---------- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        {/* LEFT */}
        <div className="space-y-4">
          {/* About */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.User} title="About" />
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-soft">{profile.bio}</p>
            {profile.interests.length > 0 && (
              <>
                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-ink-mute">
                  Interests
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.interests.map((it) => (
                    <span
                      key={it}
                      className="rounded-full border border-line/10 bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-soft"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Current role */}
          {currentNode && <CurrentRoleCard node={currentNode} company={currentExp?.company} />}

          {/* Skills */}
          <SkillsCard skills={profile.skills} />

          {/* Experience */}
          <Card className="p-5 sm:p-6">
            <SectionTitle
              icon={Icons.Briefcase}
              title="Experience"
              hint={`${profile.yearsExperience} yrs total`}
            />
            <div className="mt-5">
              {profile.experience.map((exp, i) => (
                <ExperienceRow key={exp.id} exp={exp} last={i === profile.experience.length - 1} />
              ))}
            </div>
          </Card>

          {/* Education + certs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <SectionTitle icon={Icons.GraduationCap} title="Education" />
              <div className="mt-4 space-y-4">
                {profile.education.map((ed) => (
                  <div key={ed.id}>
                    <p className="text-sm font-bold text-ink">{ed.credential}</p>
                    <p className="text-sm text-ink-soft">{ed.school}</p>
                    <p className="mt-0.5 text-xs text-ink-mute">
                      {ed.field} · {ed.period}
                    </p>
                    {ed.note && <p className="mt-1 text-xs text-ink-mute">{ed.note}</p>}
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5 sm:p-6">
              <SectionTitle icon={Icons.Award} title="Certifications" />
              <div className="mt-4 space-y-2.5">
                {profile.certifications.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber/15 text-[#8a6530] dark:text-amber">
                      <Icons.BadgeCheck size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{c.name}</p>
                      <p className="text-xs text-ink-mute">
                        {c.issuer} · {c.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <TargetCard targetId={target} />

          {/* Priorities */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.Heart} title="What matters to me" />
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.priorities.length === 0 && (
                <p className="text-sm text-ink-mute">No priorities set — add some via Edit profile.</p>
              )}
              {profile.priorities.map((id) => {
                const p = PRIORITY_META[id];
                if (!p) return null;
                const Icon = getIcon(p.icon);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line/12 bg-line/8 px-3 py-1.5 text-xs font-semibold text-ink-soft"
                  >
                    <Icon size={13} className="text-brand" strokeWidth={2.2} />
                    {p.label}
                  </span>
                );
              })}
            </div>
          </Card>

          {/* Languages */}
          <LanguagesCard languages={profile.languages} />

          {/* Saved roles */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.Bookmark} title="Saved roles" hint={`${saved.length}`} />
            {saved.length ? (
              <div className="mt-3 space-y-2">
                {saved.map((id) => {
                  const n = getNode(id);
                  return n ? <RoleMiniRow key={id} node={n} /> : null;
                })}
              </div>
            ) : (
              <EmptyHint
                icon={Icons.Bookmark}
                text="Tap “Save role” on any role and it’ll show up here."
                cta={{ to: '/map', label: 'Explore the map' }}
              />
            )}
          </Card>

          {/* Recent activity */}
          <Card className="p-5 sm:p-6">
            <SectionTitle icon={Icons.Clock} title="Recently viewed" />
            {recents.length ? (
              <div className="mt-3 space-y-2">
                {recents.map((id) => {
                  const n = getNode(id);
                  return n ? <RoleMiniRow key={id} node={n} /> : null;
                })}
              </div>
            ) : (
              <EmptyHint icon={Icons.Eye} text="Roles you open will be listed here for quick access." />
            )}
          </Card>

        </div>
      </div>

      {editing && (
        <EditModal
          initial={profile}
          onSave={(patch) => {
            update(patch);
            setEditing(false);
            toast('Profile updated', { icon: Icons.Check, tone: 'success' });
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small shared bits                                                 */
/* ------------------------------------------------------------------ */

function Meta({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon size={13} /> {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <Icon size={18} className="text-brand" /> {title}
      </h2>
      {hint && <span className="shrink-0 text-xs font-semibold text-ink-mute">{hint}</span>}
    </div>
  );
}

function ProfileSignalStrip({
  strength,
  yearsExperience,
  roles,
  saved,
  skills,
}: {
  strength: number;
  yearsExperience: number;
  roles: number;
  saved: number;
  skills: number;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-line/10 bg-surface">
      <div className="grid gap-0 md:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr]">
        <div className="flex items-center gap-3 border-b border-line/10 p-4 md:border-b-0 md:border-r">
          <ProgressRing value={strength} size={58} tone="brand" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-mute">
              Profile strength
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {strength >= 100 ? 'Complete profile' : 'Ready for better matching'}
            </p>
          </div>
        </div>
        <SignalMetric
          label="Experience tracked"
          value={`${yearsExperience} yrs`}
          detail={`${roles} roles on timeline`}
          tone="brand"
        />
        <SignalMetric
          label="Skills tracked"
          value={String(skills)}
          detail="Grouped by domain"
          tone="amber"
        />
        <SignalMetric
          label="Saved roles"
          value={String(saved)}
          detail={saved ? 'On your shortlist' : 'Start from the map'}
          tone="wine"
        />
      </div>
    </div>
  );
}

function SignalMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'brand' | 'amber' | 'wine';
}) {
  const color =
    tone === 'amber' ? 'text-[#8a6530] dark:text-amber' : tone === 'wine' ? 'text-wine dark:text-wine-soft' : 'text-brand';
  return (
    <div className="border-b border-line/10 p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-mute">{label}</p>
      <p className={cn('mt-1 text-2xl font-extrabold leading-none tracking-tight', color)}>{value}</p>
      <p className="mt-1.5 truncate text-xs text-ink-soft">{detail}</p>
    </div>
  );
}

function RoleMiniRow({ node }: { node: CareerNode }) {
  const Icon = getIcon(getNodeIcon(node));
  const accent = ACCENT_HEX[node.accent];
  return (
    <Link
      to={`/node/${node.id}`}
      className="focus-ring group flex items-center gap-3 rounded-xl border border-line/10 bg-surface-2 p-2.5 transition hover:border-line/25 hover:bg-surface"
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: `${accent}16`, color: accent }}
      >
        <Icon size={17} strokeWidth={2.1} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{node.title}</p>
        <p className="truncate text-xs capitalize text-ink-mute">
          {getNodeKindMeta(node.kind).label} · {DEMAND_META[node.demand].label} demand
        </p>
      </div>
      <Icons.ArrowUpRight size={15} className="shrink-0 text-ink-mute transition group-hover:text-brand" />
    </Link>
  );
}

function EmptyHint({
  icon: Icon,
  text,
  cta,
}: {
  icon: LucideIcon;
  text: string;
  cta?: { to: string; label: string };
}) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-line/15 bg-surface-2 p-4 text-center">
      <Icon size={20} className="mx-auto text-ink-mute" />
      <p className="mt-2 text-xs text-ink-soft">{text}</p>
      {cta && (
        <Link to={cta.to} className="mt-2 inline-block text-xs font-bold text-brand hover:underline">
          {cta.label} →
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Current role                                                      */
/* ------------------------------------------------------------------ */

function CurrentRoleCard({ node, company }: { node: CareerNode; company?: string }) {
  const Icon = getIcon(getNodeIcon(node));
  const accent = ACCENT_HEX[node.accent];
  const demand = DEMAND_META[node.demand];
  return (
    <Card className="overflow-hidden">
      <div
        className="p-5 sm:p-6"
        style={{ background: `linear-gradient(120deg, ${accent}14, transparent 60%)` }}
      >
        <div className="flex items-center justify-between">
          <SectionTitle icon={Icons.Briefcase} title="Currently" />
          <Badge tone="brand">Your starting point</Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border shadow-soft"
            style={{ backgroundColor: `${accent}1F`, borderColor: `${accent}45`, color: accent }}
          >
            <Icon size={26} strokeWidth={2.1} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold text-ink">{node.title}</p>
            {company && <p className="text-sm text-ink-soft">{company}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={node.growth >= 0 ? 'emerald' : 'wine'} icon={node.growth >= 0 ? Icons.TrendingUp : Icons.TrendingDown}>
                {demand.label} demand
              </Badge>
              <span className="text-xs font-semibold text-ink-mute">
                {node.salary.currency}
                {node.salary.min}–{node.salary.max}k · {node.openRoles.toLocaleString()} open
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Sparkline data={node.trend} tone={node.growth >= 0 ? 'emerald' : 'wine'} width={120} height={40} />
            <span className="text-[11px] font-semibold text-ink-mute">6-quarter demand</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {node.topSkills.map((s) => (
            <span
              key={s}
              className="rounded-full border border-line/10 bg-surface px-2.5 py-1 text-xs font-semibold text-ink-soft"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link to={`/node/${node.id}`}>
            <Button size="sm" icon={Icons.LineChart} iconRight={Icons.ArrowRight}>
              Open role insights
            </Button>
          </Link>
          <Link to="/insights">
            <Button size="sm" variant="secondary" icon={Icons.Activity}>
              Compare market
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills                                                            */
/* ------------------------------------------------------------------ */

function SkillsCard({ skills }: { skills: SkillProf[] }) {
  const grown = useGrow();
  return (
    <Card className="p-5 sm:p-6">
      <SectionTitle icon={Icons.Sparkles} title="Skills & expertise" hint={`${skills.length} skills`} />
      <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {SKILL_GROUPS.map((group) => {
          const rows = skills.filter((s) => s.group === group);
          if (!rows.length) return null;
          return (
            <div key={group}>
              <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-ink-mute">{group}</p>
              <div className="space-y-2.5">
                {rows.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink">{s.name}</span>
                      <span className="text-xs font-semibold text-ink-mute">{s.years}y</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line/10">
                      <div
                        className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
                        style={{ width: grown ? `${s.level}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Experience timeline                                               */
/* ------------------------------------------------------------------ */

function ExperienceRow({ exp, last }: { exp: ExperienceItem; last: boolean }) {
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* rail */}
      {!last && <span className="absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-px bg-line/15" />}
      <span
        className={cn(
          'relative z-10 mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2',
          exp.current ? 'border-brand bg-brand/10 text-brand' : 'border-line/20 bg-surface text-ink-mute',
        )}
      >
        <Icons.Building size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-ink">{exp.role}</p>
          {exp.current && <Badge tone="emerald">Current</Badge>}
        </div>
        <p className="text-sm font-semibold text-ink-soft">{exp.company}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-mute">
          <span>{exp.period}</span> · <span>{exp.type}</span> · <span>{exp.location}</span>
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{exp.summary}</p>
        <ul className="mt-2 space-y-1">
          {exp.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
              <Icons.Check size={14} className="mt-1 shrink-0 text-brand" />
              {h}
            </li>
          ))}
        </ul>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {exp.stack.map((t) => (
            <span
              key={t}
              className="rounded-md bg-line/8 px-2 py-0.5 text-[11px] font-semibold text-ink-soft"
            >
              {t}
            </span>
          ))}
          {exp.nodeId && (
            <Link
              to={`/node/${exp.nodeId}`}
              className="ml-1 inline-flex items-center gap-0.5 text-[11px] font-bold text-brand hover:underline"
            >
              View role <Icons.ArrowUpRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Target + languages                                                */
/* ------------------------------------------------------------------ */

function TargetCard({ targetId }: { targetId: string }) {
  const target = getNode(targetId);
  const grown = useGrow();
  const routes = useMemo(() => getRoutesTo(targetId), [targetId]);
  const route = routes.find((r) => r.recommended) ?? routes[0];
  if (!target) return null;
  const Icon = getIcon(getNodeIcon(target));
  const accent = ACCENT_HEX[target.accent];

  return (
    <Card className="overflow-hidden">
      <div className="p-5 sm:p-6" style={{ background: `linear-gradient(120deg, ${accent}16, transparent 62%)` }}>
        <div className="flex items-center justify-between">
          <SectionTitle icon={Icons.Target} title="Career target" />
          <Link to="/routing" className="text-xs font-bold text-brand hover:underline">
            Plan route →
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border"
            style={{ backgroundColor: `${accent}1A`, borderColor: `${accent}40`, color: accent }}
          >
            <Icon size={22} strokeWidth={2.1} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-ink">{target.title}</p>
            <p className="text-xs text-ink-mute">
              {getNodeKindMeta(target.kind).label} · {target.salary.currency}
              {target.salary.min}–{target.salary.max}k
            </p>
          </div>
          <ProgressRing value={target.match} size={56} sublabel="match" tone="amber" />
        </div>

        {route && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Feasibility" value={`${route.feasibility}%`} />
              <MiniStat label="Time" value={`~${route.months}mo`} />
              <MiniStat label="Salary" value={`+${route.salaryDelta}%`} />
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-ink-mute">
                <span>{route.label}</span>
                <span>{route.path.length} steps</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line/10">
                <div
                  className="h-full rounded-full bg-amber transition-[width] duration-700 ease-out"
                  style={{ width: grown ? `${route.feasibility}%` : '0%' }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/10 bg-surface-2 px-2 py-2 text-center">
      <p className="text-sm font-extrabold text-ink">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-mute">{label}</p>
    </div>
  );
}

function LanguagesCard({ languages }: { languages: { name: string; level: string; pct: number }[] }) {
  const grown = useGrow();
  return (
    <Card className="p-5 sm:p-6">
      <SectionTitle icon={Icons.Languages} title="Languages" />
      <div className="mt-4 space-y-3">
        {languages.map((l) => (
          <div key={l.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">{l.name}</span>
              <span className="text-xs font-semibold text-ink-mute">{l.level}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/10">
              <div
                className="h-full rounded-full bg-brand/70 transition-[width] duration-700 ease-out"
                style={{ width: grown ? `${l.pct}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit modal                                                        */
/* ------------------------------------------------------------------ */

function EditModal({
  initial,
  onSave,
  onClose,
}: {
  initial: EditableProfile;
  onSave: (patch: Partial<EditableProfile>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditableProfile>({
    name: initial.name,
    pronouns: initial.pronouns,
    headline: initial.headline,
    location: initial.location,
    timezone: initial.timezone,
    availability: initial.availability,
    openToWork: initial.openToWork,
    bio: initial.bio,
    email: initial.email,
    website: initial.website,
    linkedin: initial.linkedin,
    github: initial.github,
    priorities: [...initial.priorities],
    resumeFileName: initial.resumeFileName,
    resumeImportedAt: initial.resumeImportedAt,
  });

  const set = <K extends keyof EditableProfile>(key: K, value: EditableProfile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const togglePriority = (id: string) =>
    setForm((f) => {
      const has = f.priorities.includes(id);
      if (has) return { ...f, priorities: f.priorities.filter((p) => p !== id) };
      if (f.priorities.length >= 4) return f;
      return { ...f, priorities: [...f.priorities, id] };
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Edit profile">
      <div className="absolute inset-0 bg-navy/45 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-[1.75rem] border border-line/10 bg-surface shadow-glass sm:max-w-2xl sm:rounded-[1.75rem]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/10 bg-surface/90 px-5 py-4 backdrop-blur sm:px-6">
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink">
            <Icons.Pencil size={18} className="text-brand" /> Edit profile
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-ink-mute transition hover:text-ink"
          >
            <Icons.X size={16} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <FieldGroup title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Full name" icon={Icons.User} value={form.name} onChange={(e) => set('name', e.target.value)} />
              <TextField label="Pronouns" icon={Icons.User} value={form.pronouns} onChange={(e) => set('pronouns', e.target.value)} placeholder="they/them" />
            </div>
            <TextField label="Headline" icon={Icons.Sparkles} value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="Frontend Engineer · React" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Location" icon={Icons.MapPin} value={form.location} onChange={(e) => set('location', e.target.value)} />
              <TextField label="Timezone" icon={Icons.Clock} value={form.timezone} onChange={(e) => set('timezone', e.target.value)} />
            </div>
          </FieldGroup>

          <FieldGroup title="About">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Bio</span>
              <textarea
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                rows={4}
                className="focus-ring w-full resize-y rounded-2xl border border-line/15 bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
                placeholder="A few sentences about who you are and where you're headed."
              />
            </label>
            <TextField label="Availability" icon={Icons.Target} value={form.availability} onChange={(e) => set('availability', e.target.value)} placeholder="Open to Senior Frontend roles" />
            <div className="flex items-center justify-between rounded-2xl border border-line/10 bg-surface-2 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">Open to work</p>
                <p className="text-xs text-ink-mute">Show the badge on your profile.</p>
              </div>
              <Toggle checked={form.openToWork} onChange={(v) => set('openToWork', v)} />
            </div>
          </FieldGroup>

          <FieldGroup title="Contact & links">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Email" icon={Icons.Mail} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@email.com" />
              <TextField label="Website" icon={Icons.Link2} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="yoursite.dev" />
              <TextField label="LinkedIn" icon={Icons.AtSign} value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="in/username" />
              <TextField label="GitHub" icon={Icons.Code2} value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="username" />
            </div>
          </FieldGroup>

          <FieldGroup title="What matters most" hint="Pick up to 4">
            <div className="flex flex-wrap gap-2">
              {ASSESSMENT.priorities.map((p) => {
                const Icon = getIcon(p.icon);
                const active = form.priorities.includes(p.id);
                const disabled = !active && form.priorities.length >= 4;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePriority(p.id)}
                    disabled={disabled}
                    className={cn(
                      'focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition',
                      active
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-line/15 bg-surface text-ink-soft hover:border-line/30',
                      disabled && 'cursor-not-allowed opacity-45',
                    )}
                  >
                    {active && <Icons.Check size={14} />}
                    <Icon size={14} /> {p.label}
                  </button>
                );
              })}
            </div>
          </FieldGroup>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-line/10 bg-surface/90 px-5 py-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setForm({ ...DEFAULT_EDITABLE })}
            className="text-xs font-semibold text-ink-mute transition hover:text-ink"
          >
            Reset to defaults
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button icon={Icons.Check} onClick={() => onSave(form)}>
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FieldGroup({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">{title}</p>
        {hint && <span className="text-[11px] font-semibold text-ink-mute">{hint}</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <Card className="overflow-hidden">
        <Skeleton className="h-32 sm:h-40" rounded="rounded-none" />
        <div className="px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
            <Skeleton className="h-[104px] w-[104px]" rounded="rounded-full" />
            <div className="flex-1 space-y-2 pb-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" rounded="rounded-full" />
            </div>
          </div>
          <SkeletonText className="mt-5" lines={2} />
        </div>
      </Card>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" rounded="rounded-3xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Skeleton className="h-96" rounded="rounded-3xl" />
        <Skeleton className="h-96" rounded="rounded-3xl" />
      </div>
    </div>
  );
}
