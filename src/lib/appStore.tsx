import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { CURRENT_NODE_ID, TARGET_NODE_ID } from '@/lib/mockData';

/**
 * Lightweight client-side app state for the prototype. This is the local
 * "wizard of oz" profile: onboarding answers create a believable
 * career state, then map/routing/detail screens read that same state.
 */
export interface CareerProfile {
  name: string;
  background: string;
  skills: string[];
  yearsExperience: number;
  currentRole: string;
  currentNodeId: string;
  targetNodeId: string;
  priorities: string[];
  resumeName: string;
  source: 'default' | 'onboarding' | 'resume';
  updatedAt: string;
}

export type CareerProfilePatch = Partial<
  Omit<CareerProfile, 'currentNodeId' | 'targetNodeId' | 'updatedAt'>
> & {
  currentNodeId?: string;
  targetNodeId?: string;
};

/**
 * A mentor session the user has booked. Lives in the global store (not the
 * timetable provider) so the Mentors screen can create one and the Timetable
 * screen can render it — the two features stay in sync.
 */
export interface MentorSession {
  id: string;
  mentorId: string;
  mentorName: string;
  initials: string;
  colorClass: string;
  role: string;
  company: string;
  /** Human slot string, e.g. "Friday, 2:30 PM". */
  slot: string;
  topic?: string;
  /** Career node this mentor maps to — links the session back to the map. */
  nodeId?: string;
  bookedAt: string;
}

interface AppStore {
  saved: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => boolean; // returns the new saved state
  recents: string[];
  addRecent: (id: string) => void;
  careerProfile: CareerProfile;
  updateCareerProfile: (patch: CareerProfilePatch) => CareerProfile;
  target: string;
  setTarget: (id: string) => void;
  mentorSessions: MentorSession[];
  /** Books (or re-books) a session — one per mentor; returns the saved session. */
  bookMentorSession: (session: Omit<MentorSession, 'id' | 'bookedAt'>) => MentorSession;
  cancelMentorSession: (id: string) => void;
}

const Ctx = createContext<AppStore | null>(null);
const SAVED_KEY = 'careeros-saved';
const TARGET_KEY = 'careeros-target';
const CAREER_PROFILE_KEY = 'careeros-career-profile';
const MENTOR_SESSIONS_KEY = 'careeros-mentor-sessions';

function loadMentorSessions(): MentorSession[] {
  try {
    const raw = localStorage.getItem(MENTOR_SESSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const DEFAULT_CAREER_PROFILE: CareerProfile = {
  name: 'Avery Quinn',
  background: 'cs',
  skills: ['Software engineering', 'Product strategy', 'Design / UX'],
  yearsExperience: 6,
  currentRole: 'Frontend Engineer',
  currentNodeId: CURRENT_NODE_ID,
  targetNodeId: TARGET_NODE_ID,
  priorities: ['growth', 'impact'],
  resumeName: '',
  source: 'default',
  updatedAt: '2026-06-12T00:00:00.000Z',
};

function hasAny(source: string, words: string[]) {
  return words.some((word) => source.includes(word));
}

function inferCurrentNode(patch: CareerProfilePatch, fallback: CareerProfile): string {
  if (patch.currentNodeId) return patch.currentNodeId;

  const role = (patch.currentRole ?? fallback.currentRole).toLowerCase();
  const background = (patch.background ?? fallback.background).toLowerCase();
  const skills = (patch.skills ?? fallback.skills).join(' ').toLowerCase();
  const source = `${role} ${background} ${skills}`;

  if (hasAny(source, ['ai', 'llm', 'machine learning', 'rag', 'automation'])) return 'ai-eng';
  if (hasAny(source, ['data', 'analytics', 'sql', 'experiment', 'analyst'])) return 'data-analyst';
  if (hasAny(source, ['design', 'ux', 'figma', 'prototype'])) return 'design-eng';
  if (hasAny(source, ['manager', 'leadership', 'mentor', 'hiring'])) return 'eng-manager';
  if (hasAny(source, ['full-stack', 'fullstack', 'node', 'database', 'api', 'cloud'])) {
    return 'fullstack-dev';
  }
  if (hasAny(source, ['advocate', 'community', 'speaking', 'writing', 'devrel'])) return 'devrel';
  if (hasAny(source, ['product manager', 'product lead', 'product strategy'])) return 'product-lead';
  return CURRENT_NODE_ID;
}

function inferTargetNode(patch: CareerProfilePatch, currentNodeId: string, fallback: CareerProfile): string {
  if (patch.targetNodeId) return patch.targetNodeId;

  const priorities = (patch.priorities ?? fallback.priorities).join(' ').toLowerCase();
  const skills = (patch.skills ?? fallback.skills).join(' ').toLowerCase();
  const role = (patch.currentRole ?? fallback.currentRole).toLowerCase();
  const source = `${priorities} ${skills} ${role}`;

  if (currentNodeId === 'product-lead') return 'startup-founder';
  if (currentNodeId === 'ai-eng') return 'product-lead';
  if (hasAny(source, ['ai', 'automation', 'llm'])) return 'ai-eng';
  if (hasAny(source, ['leadership', 'stability', 'management'])) return 'eng-manager';
  if (hasAny(source, ['comp', 'compensation', 'growth', 'impact', 'product'])) return 'product-lead';
  if (hasAny(source, ['remote', 'community', 'writing', 'speaking'])) return 'devrel';
  if (hasAny(source, ['design', 'craft', 'ux'])) return 'design-eng';
  return TARGET_NODE_ID;
}

function loadSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function loadCareerProfile(): CareerProfile {
  try {
    const raw = localStorage.getItem(CAREER_PROFILE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object') return DEFAULT_CAREER_PROFILE;
    return {
      ...DEFAULT_CAREER_PROFILE,
      ...parsed,
      skills: Array.isArray(parsed.skills)
        ? parsed.skills.filter((x: unknown): x is string => typeof x === 'string')
        : DEFAULT_CAREER_PROFILE.skills,
      priorities: Array.isArray(parsed.priorities)
        ? parsed.priorities.filter((x: unknown): x is string => typeof x === 'string')
        : DEFAULT_CAREER_PROFILE.priorities,
    };
  } catch {
    return DEFAULT_CAREER_PROFILE;
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>(loadSaved);
  const [recents, setRecents] = useState<string[]>([]);
  const [careerProfile, setCareerProfile] = useState<CareerProfile>(loadCareerProfile);
  const [target, setTargetState] = useState<string>(
    () => localStorage.getItem(TARGET_KEY) || loadCareerProfile().targetNodeId || TARGET_NODE_ID,
  );
  const [mentorSessions, setMentorSessions] = useState<MentorSession[]>(loadMentorSessions);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem(MENTOR_SESSIONS_KEY, JSON.stringify(mentorSessions));
  }, [mentorSessions]);

  useEffect(() => {
    localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify(careerProfile));
  }, [careerProfile]);

  const isSaved = useCallback((id: string) => saved.includes(id), [saved]);

  const toggleSaved = useCallback((id: string) => {
    let nowSaved = false;
    setSaved((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      nowSaved = true;
      return [id, ...prev];
    });
    return nowSaved;
  }, []);

  const addRecent = useCallback((id: string) => {
    setRecents((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 6));
  }, []);

  const updateCareerProfile = useCallback((patch: CareerProfilePatch) => {
    const currentNodeId = inferCurrentNode(patch, careerProfile);
    const targetNodeId = inferTargetNode(patch, currentNodeId, careerProfile);
    const nextProfile = {
      ...careerProfile,
      ...patch,
      currentNodeId,
      targetNodeId,
      updatedAt: new Date().toISOString(),
    };
    setCareerProfile(nextProfile);
    setTargetState(nextProfile.targetNodeId);
    localStorage.setItem(CAREER_PROFILE_KEY, JSON.stringify(nextProfile));
    localStorage.setItem(TARGET_KEY, nextProfile.targetNodeId);
    return nextProfile;
  }, [careerProfile]);

  const setTarget = useCallback((id: string) => {
    setTargetState(id);
    localStorage.setItem(TARGET_KEY, id);
    setCareerProfile((prev) => ({ ...prev, targetNodeId: id, updatedAt: new Date().toISOString() }));
  }, []);

  const bookMentorSession = useCallback((session: Omit<MentorSession, 'id' | 'bookedAt'>) => {
    const created: MentorSession = {
      ...session,
      id: `ms-${session.mentorId}-${Date.now()}`,
      bookedAt: new Date().toISOString(),
    };
    // One active session per mentor — replace any existing one.
    setMentorSessions((prev) => [...prev.filter((s) => s.mentorId !== session.mentorId), created]);
    return created;
  }, []);

  const cancelMentorSession = useCallback((id: string) => {
    setMentorSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <Ctx.Provider
      value={{
        saved,
        isSaved,
        toggleSaved,
        recents,
        addRecent,
        careerProfile,
        updateCareerProfile,
        target,
        setTarget,
        mentorSessions,
        bookMentorSession,
        cancelMentorSession,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAppStore(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
