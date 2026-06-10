import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CURRENT_NODE_ID } from '@/lib/mockData';

/**
 * The signed-in user's profile. Split into two halves:
 *  - `EditableProfile`: personal details the user can change. Persisted to
 *    localStorage so edits survive reloads and feed the rest of the app
 *    (sidebar name, greeting, etc.).
 *  - `StaticProfile`: the career record — work history, education, skills.
 *    Treated as factual data the user doesn't free-form edit here.
 */

export interface ProfileLink {
  id: 'website' | 'email' | 'linkedin' | 'github';
  label: string;
  value: string; // raw value the user types (handle / url / email)
  href: string; // resolved href
  icon: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  current?: boolean;
  location: string;
  type: string;
  summary: string;
  highlights: string[];
  stack: string[];
  nodeId?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  credential: string;
  field: string;
  period: string;
  note?: string;
}

export interface CertItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface SkillProf {
  name: string;
  level: number; // 0..100 self-assessed proficiency
  years: number;
  group: 'Frontend' | 'Engineering' | 'Product' | 'Craft';
}

export interface LanguageItem {
  name: string;
  level: string;
  pct: number;
}

export interface EditableProfile {
  name: string;
  pronouns: string;
  headline: string;
  location: string;
  timezone: string;
  availability: string;
  openToWork: boolean;
  bio: string;
  email: string;
  website: string;
  linkedin: string;
  github: string;
  /** ASSESSMENT.priorities ids */
  priorities: string[];
  resumeFileName: string;
  resumeImportedAt: string;
}

export interface StaticProfile {
  currentNodeId: string;
  joined: string; // ISO
  yearsExperience: number;
  background: string; // ASSESSMENT.background id
  backgroundLabel: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: CertItem[];
  skills: SkillProf[];
  languages: LanguageItem[];
  interests: string[];
}

export type Profile = EditableProfile & StaticProfile;

/* ------------------------------------------------------------------ */
/*  Default persona — Avery Quinn, the app's frontend-engineer user.   */
/* ------------------------------------------------------------------ */

export const DEFAULT_EDITABLE: EditableProfile = {
  name: 'Avery Quinn',
  pronouns: 'they/them',
  headline: 'Frontend Engineer · React & design systems',
  location: 'Austin, TX',
  timezone: 'CST (UTC−6)',
  availability: 'Open to Senior Frontend & product-minded roles',
  openToWork: true,
  bio: "Frontend engineer who likes living where design and code overlap. I build accessible, fast interfaces and the design systems that keep them consistent — most recently leading the web UI for a B2B platform. I'm now angling toward product: I want to own outcomes, not just the pixels.",
  email: 'avery.quinn.carreros@example.com',
  website: 'averyquinn-carreros.dev',
  linkedin: 'in/averyquinn-carreros',
  github: 'averyq-carreros',
  priorities: ['growth', 'impact', 'remote'],
  resumeFileName: '',
  resumeImportedAt: '',
};

export const STATIC_PROFILE: StaticProfile = {
  currentNodeId: CURRENT_NODE_ID,
  joined: '2026-06-12',
  yearsExperience: 6,
  background: 'cs',
  backgroundLabel: 'Computer Science degree',
  experience: [
    {
      id: 'exp-lumen',
      role: 'Senior Frontend Engineer',
      company: 'Lumen Labs',
      period: 'Mar 2022 — Present',
      current: true,
      location: 'Austin, TX · Remote',
      type: 'Full-time',
      summary:
        'Lead the web client for a B2B analytics platform and own the in-house design system used by 4 product teams.',
      highlights: [
        'Shipped a component library that cut new-feature UI time ~40%',
        'Drove the dark-mode + accessibility (WCAG AA) overhaul across the app',
        'Mentor 3 engineers; run the frontend guild and review cadence',
      ],
      stack: ['React', 'TypeScript', 'Design Systems', 'Accessibility'],
      nodeId: 'frontend-dev',
    },
    {
      id: 'exp-northwind',
      role: 'Frontend Engineer',
      company: 'Northwind',
      period: 'Jul 2020 — Feb 2022',
      location: 'Austin, TX',
      type: 'Full-time',
      summary:
        'Built customer-facing growth surfaces and the marketing-site framework on a small product team.',
      highlights: [
        'Owned the onboarding funnel; lifted activation by 12%',
        'Introduced TypeScript and a testing baseline to the codebase',
      ],
      stack: ['React', 'TypeScript', 'CSS', 'Node.js'],
      nodeId: 'frontend-dev',
    },
    {
      id: 'exp-brightback',
      role: 'UI Developer',
      company: 'Brightback',
      period: 'Aug 2018 — Jun 2020',
      location: 'Remote',
      type: 'Full-time',
      summary: 'First engineering role — turned design files into production UI for a SaaS dashboard.',
      highlights: [
        'Rebuilt the dashboard UI; halved time-to-interactive',
        'Partnered daily with design to tighten the handoff loop',
      ],
      stack: ['JavaScript', 'CSS', 'Figma'],
    },
  ],
  education: [
    {
      id: 'edu-ut',
      school: 'University of Texas at Austin',
      credential: 'B.S. Computer Science',
      field: 'Human–Computer Interaction focus',
      period: '2014 — 2018',
      note: 'Graduated with honors · HCI capstone on accessible data viz',
    },
  ],
  certifications: [
    { id: 'cert-gux', name: 'Google UX Design Certificate', issuer: 'Google', year: '2023' },
    { id: 'cert-aws', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2022' },
    { id: 'cert-a11y', name: 'Web Accessibility (WAS)', issuer: 'IAAP', year: '2021' },
  ],
  skills: [
    { name: 'React', level: 92, years: 6, group: 'Frontend' },
    { name: 'TypeScript', level: 88, years: 5, group: 'Frontend' },
    { name: 'CSS / Tailwind', level: 90, years: 6, group: 'Craft' },
    { name: 'UI Systems', level: 85, years: 4, group: 'Craft' },
    { name: 'Accessibility', level: 80, years: 4, group: 'Craft' },
    { name: 'Figma', level: 72, years: 5, group: 'Craft' },
    { name: 'Node.js', level: 62, years: 3, group: 'Engineering' },
    { name: 'Testing / CI', level: 66, years: 4, group: 'Engineering' },
    { name: 'Product Discovery', level: 48, years: 2, group: 'Product' },
    { name: 'Analytics', level: 44, years: 2, group: 'Product' },
  ],
  languages: [
    { name: 'English', level: 'Native', pct: 100 },
    { name: 'Spanish', level: 'Professional', pct: 65 },
  ],
  interests: ['Design systems', 'Type design', 'Climbing', 'Generative art', 'Mechanical keyboards'],
};

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

const KEY = 'careeros-profile';
const IMPORT_KEY = 'careeros-profile-import';

type ImportedStaticProfile = Partial<
  Pick<StaticProfile, 'yearsExperience' | 'experience' | 'skills' | 'currentNodeId' | 'backgroundLabel'>
>;

export interface ResumeImportPatch {
  fileName: string;
  editable?: Partial<EditableProfile>;
  static?: ImportedStaticProfile;
}

function loadEditable(): Partial<EditableProfile> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function loadStaticImport(): ImportedStaticProfile {
  try {
    const raw = localStorage.getItem(IMPORT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function resolveLink(id: ProfileLink['id'], value: string): string {
  const v = value.trim();
  if (!v) return '';
  switch (id) {
    case 'email':
      return `mailto:${v}`;
    case 'website':
      return v.startsWith('http') ? v : `https://${v}`;
    case 'linkedin':
      return v.startsWith('http') ? v : `https://linkedin.com/${v.replace(/^\/+/, '')}`;
    case 'github':
      return v.startsWith('http') ? v : `https://github.com/${v.replace(/^@|^\/+/, '')}`;
  }
}

/** The links block, derived from the editable contact fields. */
export function profileLinks(p: EditableProfile): ProfileLink[] {
  const defs: { id: ProfileLink['id']; label: string; value: string; icon: string }[] = [
    { id: 'email', label: 'Email', value: p.email, icon: 'Mail' },
    { id: 'website', label: 'Website', value: p.website, icon: 'Link2' },
    { id: 'linkedin', label: 'LinkedIn', value: p.linkedin, icon: 'AtSign' },
    { id: 'github', label: 'GitHub', value: p.github, icon: 'Code2' },
  ];
  return defs
    .filter((d) => d.value.trim())
    .map((d) => ({ ...d, href: resolveLink(d.id, d.value) }));
}

/** % of the editable profile that's meaningfully filled in. */
export function profileStrength(p: EditableProfile): number {
  const checks = [
    p.name.trim().length > 0,
    p.headline.trim().length > 0,
    p.location.trim().length > 0,
    p.bio.trim().length > 40,
    p.pronouns.trim().length > 0,
    p.availability.trim().length > 0,
    p.email.trim().length > 0,
    p.website.trim().length > 0,
    p.linkedin.trim().length > 0,
    p.github.trim().length > 0,
    p.priorities.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

interface ProfileStore {
  profile: Profile;
  update: (patch: Partial<EditableProfile>) => void;
  importResume: (patch: ResumeImportPatch) => void;
  reset: () => void;
}

const Ctx = createContext<ProfileStore | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [editable, setEditable] = useState<EditableProfile>(() => ({
    ...DEFAULT_EDITABLE,
    ...loadEditable(),
  }));
  const [staticImport, setStaticImport] = useState<ImportedStaticProfile>(() => loadStaticImport());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(editable));
  }, [editable]);

  useEffect(() => {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(staticImport));
  }, [staticImport]);

  const update = useCallback((patch: Partial<EditableProfile>) => {
    setEditable((prev) => ({ ...prev, ...patch }));
  }, []);

  const importResume = useCallback((patch: ResumeImportPatch) => {
    const importedAt = new Date().toISOString();
    setEditable((prev) => ({
      ...prev,
      ...patch.editable,
      resumeFileName: patch.fileName,
      resumeImportedAt: importedAt,
    }));
    if (patch.static) setStaticImport((prev) => ({ ...prev, ...patch.static }));
  }, []);

  const reset = useCallback(() => {
    setEditable(DEFAULT_EDITABLE);
    setStaticImport({});
  }, []);

  const value = useMemo<ProfileStore>(
    () => ({ profile: { ...editable, ...STATIC_PROFILE, ...staticImport }, update, importResume, reset }),
    [editable, staticImport, update, importResume, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile(): ProfileStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
