import { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type {
  TimetableEvent,
  CompanyChannel,
  ConnectedCalendar,
  AISuggestion,
  FocusSkill,
  Milestone,
} from './timetable.types';
import {
  CATEGORY_ICON, FREE_SLOTS, isCareerEvent, parseSlot, toISODate, TODAY,
  findConflicts, findNextFreeSlot, type Slot,
} from './timetable.utils';
import { useAppStore } from './appStore';
import { useProfile } from './profile';
import { getNode, NODES, TARGET_NODE_ID, type CareerNode } from './mockData';

// Builds career prep-block suggestions for the enabled target-role skills,
// slotting each into a known-free window. Replaces the old lifestyle optimiser.
function buildCareerSuggestions(target: CareerNode, skills: FocusSkill[]): AISuggestion[] {
  return skills
    .filter(s => s.enabled)
    .slice(0, FREE_SLOTS.length)
    .map((s, i) => {
      const slot = FREE_SLOTS[i % FREE_SLOTS.length];
      return {
        id: `cs${i + 1}`,
        type: 'grind' as const,
        title: `Build: ${s.label}`,
        reason: `Block focused time to build evidence in ${s.label} for ${target.title}.`,
        day: slot.day,
        startHour: slot.startHour,
        durationHours: 2,
        icon: CATEGORY_ICON.grind,
        applied: false,
        nodeId: target.id,
        skill: s.label,
      };
    });
}

const EVENTS_KEY = 'careeros-timetable-events';
const MILESTONES_KEY = 'careeros-timetable-milestones';
const COMPLETED_KEY = 'careeros-timetable-completed';
const COMPANIES_KEY = 'careeros-timetable-companies';
const CALENDARS_KEY = 'careeros-timetable-calendars';
const SKILLS_OFF_KEY = 'careeros-timetable-skills-off';

const INITIAL_EVENTS: TimetableEvent[] = [
  { id: 'e1', title: 'COMM 201', subtitle: 'Lecture • Arts Building', day: 0, startHour: 9, durationHours: 2, category: 'uni', source: 'upload' },
  { id: 'e2', title: 'ECON 110', subtitle: 'Tutorial • Online', day: 1, startHour: 10, durationHours: 1, category: 'uni', source: 'upload' },
  { id: 'e3', title: 'Study group', subtitle: 'Library Room 3', day: 1, startHour: 14, durationHours: 2, category: 'personal', source: 'manual' },
  { id: 'e4', title: 'CS 301', subtitle: 'Lab • Engineering 2', day: 2, startHour: 8, durationHours: 2, category: 'uni', source: 'upload' },
  { id: 'e5', title: 'MKTG 220', subtitle: 'Lecture • Online', day: 3, startHour: 9, durationHours: 1, category: 'uni', source: 'upload' },
  { id: 'e6', title: 'PSYC 102', subtitle: 'Lecture • Wallace Hall', day: 4, startHour: 10, durationHours: 2, category: 'uni', source: 'upload' },
];

function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function loadMap<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function seedMilestones(targetId: string): Milestone[] {
  const today = TODAY;
  return [
    { id: 'mi1', title: 'Resume final draft', type: 'deadline', date: toISODate(addDays(today, 4)), nodeId: targetId },
    { id: 'mi2', title: 'Mock interview prep', type: 'interview', date: toISODate(addDays(today, 6)), nodeId: targetId },
    { id: 'mi3', title: 'Google grad applications close', type: 'application', date: toISODate(addDays(today, 9)) },
    { id: 'mi4', title: 'Portfolio review', type: 'portfolio', date: toISODate(addDays(today, 15)), nodeId: targetId },
  ];
}

const INITIAL_COMPANIES: CompanyChannel[] = [
  {
    id: 'atlassian', name: 'Atlassian', tag: 'Tech • Grad programs', initials: 'AT', colorClass: 'ca-coral', inLibrary: true, enabled: true,
    events: [{ title: 'Atlassian info session', subtitle: 'Events channel', day: 0, startHour: 13, durationHours: 1, category: 'company' }],
  },
  {
    id: 'canva', name: 'Canva', tag: 'Design • Internships', initials: 'CV', colorClass: 'ca-teal', inLibrary: true, enabled: true,
    events: [{ title: 'Canva grad careers', subtitle: 'Events channel', day: 2, startHour: 12, durationHours: 1, category: 'company' }],
  },
  {
    id: 'google', name: 'Google', tag: 'Tech • Campus events', initials: 'GG', colorClass: 'ca-blue', inLibrary: true, enabled: true,
    events: [{ title: 'Google developer day', subtitle: 'Events channel', day: 3, startHour: 11, durationHours: 2, category: 'company' }],
  },
  {
    id: 'deloitte', name: 'Deloitte', tag: 'Consulting • Networking', initials: 'DL', colorClass: 'ca-amber', inLibrary: false, enabled: true,
    events: [{ title: 'Deloitte careers night', subtitle: 'Events channel', day: 4, startHour: 17, durationHours: 2, category: 'company' }],
  },
  {
    id: 'afterpay', name: 'Afterpay', tag: 'Fintech • Workshops', initials: 'AP', colorClass: 'ca-pink', inLibrary: false, enabled: true,
    events: [{ title: 'Fintech workshop', subtitle: 'Events channel', day: 1, startHour: 16, durationHours: 1, category: 'company' }],
  },
  {
    id: 'bhp', name: 'BHP', tag: 'Mining • Grad fair', initials: 'BH', colorClass: 'ca-teal', inLibrary: false, enabled: true,
    events: [{ title: 'BHP grad fair', subtitle: 'Events channel', day: 2, startHour: 14, durationHours: 2, category: 'company' }],
  },
  {
    id: 'microsoft', name: 'Microsoft', tag: 'Tech • Grad programs', initials: 'MS', colorClass: 'ca-blue', inLibrary: false, enabled: true,
    events: [{ title: 'Microsoft tech talk', subtitle: 'Events channel', day: 1, startHour: 12, durationHours: 1, category: 'company' }],
  },
  {
    id: 'stripe', name: 'Stripe', tag: 'Fintech • Engineering', initials: 'ST', colorClass: 'ca-purple', inLibrary: false, enabled: true,
    events: [{ title: 'Stripe eng open house', subtitle: 'Events channel', day: 3, startHour: 16, durationHours: 1, category: 'company' }],
  },
  {
    id: 'amazon', name: 'Amazon', tag: 'Tech • Internships', initials: 'AM', colorClass: 'ca-amber', inLibrary: false, enabled: true,
    events: [{ title: 'Amazon careers webinar', subtitle: 'Events channel', day: 0, startHour: 15, durationHours: 1, category: 'company' }],
  },
  {
    id: 'figma', name: 'Figma', tag: 'Design • Product', initials: 'FG', colorClass: 'ca-pink', inLibrary: false, enabled: true,
    events: [{ title: 'Figma design jam', subtitle: 'Events channel', day: 4, startHour: 11, durationHours: 2, category: 'company' }],
  },
  {
    id: 'mckinsey', name: 'McKinsey', tag: 'Consulting • Networking', initials: 'MK', colorClass: 'ca-coral', inLibrary: false, enabled: true,
    events: [{ title: 'McKinsey insight evening', subtitle: 'Events channel', day: 2, startHour: 18, durationHours: 2, category: 'company' }],
  },
  {
    id: 'spotify', name: 'Spotify', tag: 'Tech • Grad programs', initials: 'SP', colorClass: 'ca-teal', inLibrary: false, enabled: true,
    events: [{ title: 'Spotify grad mixer', subtitle: 'Events channel', day: 1, startHour: 17, durationHours: 1, category: 'company' }],
  },
  {
    id: 'nvidia', name: 'NVIDIA', tag: 'Tech • AI / Hardware', initials: 'NV', colorClass: 'ca-teal', inLibrary: false, enabled: true,
    events: [{ title: 'NVIDIA AI showcase', subtitle: 'Events channel', day: 3, startHour: 13, durationHours: 2, category: 'company' }],
  },
  {
    id: 'kpmg', name: 'KPMG', tag: 'Consulting • Grad fair', initials: 'KP', colorClass: 'ca-blue', inLibrary: false, enabled: true,
    events: [{ title: 'KPMG meet the team', subtitle: 'Events channel', day: 0, startHour: 16, durationHours: 1, category: 'company' }],
  },
  {
    id: 'airbnb', name: 'Airbnb', tag: 'Tech • Design', initials: 'AB', colorClass: 'ca-pink', inLibrary: false, enabled: true,
    events: [{ title: 'Airbnb design talk', subtitle: 'Events channel', day: 4, startHour: 14, durationHours: 1, category: 'company' }],
  },
  {
    id: 'goldman', name: 'Goldman Sachs', tag: 'Finance • Insight days', initials: 'GS', colorClass: 'ca-amber', inLibrary: false, enabled: true,
    events: [{ title: 'Goldman insight day', subtitle: 'Events channel', day: 2, startHour: 9, durationHours: 2, category: 'company' }],
  },
  {
    id: 'shopify', name: 'Shopify', tag: 'Tech • Commerce', initials: 'SH', colorClass: 'ca-purple', inLibrary: false, enabled: true,
    events: [{ title: 'Shopify build session', subtitle: 'Events channel', day: 1, startHour: 13, durationHours: 1, category: 'company' }],
  },
];

function buildInitialCalendars(email: string): ConnectedCalendar[] {
  return [
    { id: 'google', name: 'Google Calendar', provider: 'google', email, connected: true, color: '#185FA5' },
    { id: 'ical', name: 'iCal / Apple', provider: 'ical', connected: false, color: '#534AB7' },
    { id: 'upload', name: 'Uni timetable', provider: 'upload', connected: true, color: '#0F6E56' },
  ];
}

interface TimetableCtx {
  events: TimetableEvent[];
  companies: CompanyChannel[];
  calendars: ConnectedCalendar[];
  aiSuggestions: AISuggestion[];
  aiLoading: boolean;
  aiSummary: string;
  /** When set, the grid is armed for the user to click a slot for this block. */
  pendingPlacement: AISuggestion | null;
  // Career goal
  targetNode: CareerNode;
  targetReadiness: number;
  focusSkills: FocusSkill[];
  toggleFocusSkill: (id: string) => void;
  // Milestones
  milestones: Milestone[];
  addMilestone: (m: Omit<Milestone, 'id'>) => void;
  removeMilestone: (id: string) => void;
  // Completion
  isComplete: (id: string) => boolean;
  toggleComplete: (id: string) => void;
  // Actions
  toggleCompany: (id: string) => void;
  addToLibrary: (id: string) => void;
  removeFromLibrary: (id: string) => void;
  applySuggestion: (id: string) => void;
  beginManualPlacement: (id: string) => void;
  cancelPlacement: () => void;
  placeSuggestionAt: (day: number, startHour: number, week?: number) => void;
  dismissSuggestion: (id: string) => void;
  runAIOptimization: () => Promise<void>;
  connectCalendar: (id: string) => void;
  addEvent: (event: Omit<TimetableEvent, 'id'>) => TimetableEvent;
  updateEvent: (id: string, patch: Partial<Omit<TimetableEvent, 'id'>>) => void;
  /** Move an event, surfacing a conflict prompt if the target slot overlaps. */
  requestMove: (id: string, day: number, startHour: number, week: number) => void;
  removeEvent: (id: string) => void;
  // Conflicts
  conflict: ConflictRequest | null;
  resolveConflict: (choice: ConflictChoice) => void;
  dismissConflict: () => void;
  // Undo
  undo: () => void;
  canUndo: boolean;
}

export type ConflictChoice = 'anyway' | 'next' | 'replace';

/** A pending placement/move that overlaps existing events, awaiting a choice. */
export interface ConflictRequest {
  kind: 'move' | 'place';
  day: number;
  startHour: number;
  durationHours: number;
  week: number;
  conflicts: TimetableEvent[];
  /** Label of the block being placed/moved. */
  title: string;
  /** Set for kind 'move' — the event being relocated. */
  eventId?: string;
  /** Set for kind 'place' — the suggestion being materialized. */
  suggestion?: AISuggestion;
}

const Ctx = createContext<TimetableCtx | null>(null);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const { mentorSessions, cancelMentorSession, target } = useAppStore();
  const { profile } = useProfile();
  const targetNode = getNode(target) ?? getNode(TARGET_NODE_ID) ?? NODES[0];

  const [stored, setStored] = useState<TimetableEvent[]>(() => loadList(EVENTS_KEY, INITIAL_EVENTS));
  // Persisted library/enabled choices are merged over the static channel list.
  const [companies, setCompanies] = useState<CompanyChannel[]>(() => {
    const ov = loadMap<{ inLibrary: boolean; enabled: boolean }>(COMPANIES_KEY);
    return INITIAL_COMPANIES.map(c => (ov[c.id] ? { ...c, ...ov[c.id] } : c));
  });
  const [calendars, setCalendars] = useState<ConnectedCalendar[]>(() => {
    const ov = loadMap<boolean>(CALENDARS_KEY);
    return buildInitialCalendars(profile.email).map(c => (c.id in ov ? { ...c, connected: ov[c.id] } : c));
  });
  const [pendingPlacement, setPendingPlacement] = useState<AISuggestion | null>(null);
  const [conflict, setConflict] = useState<ConflictRequest | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadList(MILESTONES_KEY, seedMilestones(targetNode.id)));
  const [completedIds, setCompletedIds] = useState<string[]>(() => loadList(COMPLETED_KEY, []));
  const [disabledSkills, setDisabledSkills] = useState<string[]>(() => loadList(SKILLS_OFF_KEY, []));
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // Undo history (snapshots of the editable state before each move/place/delete).
  const undoRef = useRef<{ stored: TimetableEvent[]; aiSuggestions: AISuggestion[] }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const storedRef = useRef(stored);
  const aiRef = useRef(aiSuggestions);
  useEffect(() => { storedRef.current = stored; }, [stored]);
  useEffect(() => { aiRef.current = aiSuggestions; }, [aiSuggestions]);

  const snapshot = useCallback(() => {
    undoRef.current.push({ stored: storedRef.current, aiSuggestions: aiRef.current });
    if (undoRef.current.length > 30) undoRef.current.shift();
    setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const last = undoRef.current.pop();
    setCanUndo(undoRef.current.length > 0);
    if (!last) return;
    setStored(last.stored);
    setAiSuggestions(last.aiSuggestions);
    setConflict(null);
  }, []);

  // Keep the synced Google calendar tied to the user's stored profile email.
  useEffect(() => {
    setCalendars(prev => prev.map(c => c.provider === 'google' ? { ...c, email: profile.email } : c));
  }, [profile.email]);

  useEffect(() => { localStorage.setItem(EVENTS_KEY, JSON.stringify(stored)); }, [stored]);
  useEffect(() => { localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones)); }, [milestones]);
  useEffect(() => { localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedIds)); }, [completedIds]);
  useEffect(() => { localStorage.setItem(SKILLS_OFF_KEY, JSON.stringify(disabledSkills)); }, [disabledSkills]);
  useEffect(() => {
    const ov: Record<string, { inLibrary: boolean; enabled: boolean }> = {};
    companies.forEach(c => { ov[c.id] = { inLibrary: c.inLibrary, enabled: c.enabled }; });
    localStorage.setItem(COMPANIES_KEY, JSON.stringify(ov));
  }, [companies]);
  useEffect(() => {
    const ov: Record<string, boolean> = {};
    calendars.forEach(c => { ov[c.id] = c.connected; });
    localStorage.setItem(CALENDARS_KEY, JSON.stringify(ov));
  }, [calendars]);

  // Skills to build toward the target role (derived from the node's top skills).
  const focusSkills = useMemo<FocusSkill[]>(
    () => targetNode.topSkills.map(label => ({ id: label, label, gap: true, enabled: !disabledSkills.includes(label) })),
    [targetNode, disabledSkills],
  );

  const toggleFocusSkill = useCallback((id: string) => {
    setDisabledSkills(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  // Library events show when the channel is saved AND toggled on (current week).
  const companyEvents = useMemo<TimetableEvent[]>(() =>
    companies.flatMap(c =>
      c.inLibrary && c.enabled
        ? c.events.map((ev, i) => ({
            ...ev, id: `company-${c.id}-${i}`, companyId: c.id,
            source: 'company' as const, week: 0, locked: true,
          }))
        : [],
    ),
  [companies]);

  // Mentor sessions booked on the Mentors screen surface here automatically.
  const mentorEvents = useMemo<TimetableEvent[]>(() =>
    mentorSessions.map(s => {
      const pos = parseSlot(s.slot) ?? { day: 4, startHour: 15 };
      const firstName = s.mentorName.split(' ')[0];
      return {
        id: `mentor-${s.id}`,
        title: `Mentor: ${firstName}`,
        subtitle: `${s.role} · ${s.company}`,
        day: pos.day,
        startHour: pos.startHour,
        durationHours: 1,
        category: 'mentor' as const,
        source: 'mentor' as const,
        week: 0,
        mentorSessionId: s.id,
        nodeId: s.nodeId,
        locked: true,
      };
    }),
  [mentorSessions]);

  const events = useMemo<TimetableEvent[]>(
    () => [...stored, ...companyEvents, ...mentorEvents],
    [stored, companyEvents, mentorEvents],
  );

  // Readiness = node fit + a bump for completed career-building blocks.
  const targetReadiness = useMemo(() => {
    const completedCareer = events.filter(e => completedIds.includes(e.id) && isCareerEvent(e)).length;
    return Math.min(100, Math.round(targetNode.match + completedCareer * 2));
  }, [events, completedIds, targetNode]);

  const isComplete = useCallback((id: string) => completedIds.includes(id), [completedIds]);
  const toggleComplete = useCallback((id: string) => {
    setCompletedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const addMilestone = useCallback((m: Omit<Milestone, 'id'>) => {
    setMilestones(prev => [...prev, { ...m, id: `mi-${Date.now()}` }].sort((a, b) => a.date.localeCompare(b.date)));
  }, []);
  const removeMilestone = useCallback((id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  }, []);

  const toggleCompany = useCallback((id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  }, []);

  const addToLibrary = useCallback((id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, inLibrary: true, enabled: true } : c));
  }, []);

  const removeFromLibrary = useCallback((id: string) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, inLibrary: false } : c));
  }, []);

  // Build the stored event a suggestion becomes once placed at a slot.
  const eventFromSuggestion = useCallback((s: AISuggestion, day: number, startHour: number, week: number): TimetableEvent => ({
    id: `ai-${s.id}-${Date.now()}`,
    title: s.title,
    subtitle: s.skill ? `Toward ${targetNode.title}` : undefined,
    day, startHour, durationHours: s.durationHours,
    category: s.type, source: 'ai', week, nodeId: s.nodeId,
  }), [targetNode]);

  // Drop a suggestion onto the grid at a concrete slot (undoable) and mark it applied.
  const materializeSuggestion = useCallback((s: AISuggestion, day: number, startHour: number, week: number) => {
    snapshot();
    setStored(evs => [...evs, eventFromSuggestion(s, day, startHour, week)]);
    setAiSuggestions(prev => prev.map(x => x.id === s.id ? { ...x, applied: true } : x));
  }, [snapshot, eventFromSuggestion]);

  // Automatic placement: use the recommended slot, sliding to the next free
  // window if it's taken; only prompt when nothing is free at all.
  const applySuggestion = useCallback((id: string) => {
    const s = aiSuggestions.find(x => x.id === id);
    if (!s || s.applied) return;
    const slot: Slot = { day: s.day, startHour: s.startHour, durationHours: s.durationHours, week: 0 };
    const conflicts = findConflicts(events, slot);
    if (conflicts.length === 0) { materializeSuggestion(s, s.day, s.startHour, 0); return; }
    const free = findNextFreeSlot(events, slot);
    if (free) { materializeSuggestion(s, free.day, free.startHour, 0); return; }
    setConflict({ kind: 'place', day: s.day, startHour: s.startHour, durationHours: s.durationHours, week: 0, conflicts, title: s.title, suggestion: s });
  }, [aiSuggestions, events, materializeSuggestion]);

  // Manual placement: arm the grid so the next slot the user picks gets the block.
  const beginManualPlacement = useCallback((id: string) => {
    const s = aiSuggestions.find(x => x.id === id);
    if (!s || s.applied) return;
    setPendingPlacement(s);
  }, [aiSuggestions]);

  const cancelPlacement = useCallback(() => setPendingPlacement(null), []);

  const placeSuggestionAt = useCallback((day: number, startHour: number, week = 0) => {
    if (!pendingPlacement) return;
    const s = pendingPlacement;
    setPendingPlacement(null);
    const conflicts = findConflicts(events, { day, startHour, durationHours: s.durationHours, week });
    if (conflicts.length === 0) { materializeSuggestion(s, day, startHour, week); return; }
    setConflict({ kind: 'place', day, startHour, durationHours: s.durationHours, week, conflicts, title: s.title, suggestion: s });
  }, [pendingPlacement, events, materializeSuggestion]);

  const dismissSuggestion = useCallback((id: string) => {
    setPendingPlacement(p => (p?.id === id ? null : p));
    setConflict(c => (c?.suggestion?.id === id ? null : c));
    setAiSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const connectCalendar = useCallback((id: string) => {
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  }, []);

  const addEvent = useCallback((event: Omit<TimetableEvent, 'id'>) => {
    const created: TimetableEvent = { week: 0, ...event, id: `manual-${Date.now()}` };
    snapshot();
    setStored(prev => [...prev, created]);
    return created;
  }, [snapshot]);

  const updateEvent = useCallback((id: string, patch: Partial<Omit<TimetableEvent, 'id'>>) => {
    setStored(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  // Move an event; if the target slot overlaps, defer to a conflict prompt.
  const requestMove = useCallback((id: string, day: number, startHour: number, week: number) => {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const conflicts = findConflicts(events, { day, startHour, durationHours: ev.durationHours, week }, id);
    if (conflicts.length === 0) {
      snapshot();
      setStored(prev => prev.map(e => e.id === id ? { ...e, day, startHour } : e));
      return;
    }
    setConflict({ kind: 'move', day, startHour, durationHours: ev.durationHours, week, conflicts, title: ev.title, eventId: id });
  }, [events, snapshot]);

  const removeEvent = useCallback((id: string) => {
    if (id.startsWith('mentor-')) {
      cancelMentorSession(id.slice('mentor-'.length));
      return;
    }
    snapshot();
    setStored(prev => prev.filter(e => e.id !== id));
  }, [cancelMentorSession, snapshot]);

  const dismissConflict = useCallback(() => setConflict(null), []);

  const resolveConflict = useCallback((choice: ConflictChoice) => {
    const c = conflict;
    if (!c) return;
    let target = { day: c.day, startHour: c.startHour };
    if (choice === 'next') {
      const free = findNextFreeSlot(events, { day: c.day, startHour: c.startHour, durationHours: c.durationHours, week: c.week }, c.eventId);
      if (!free) return; // nothing free this week — leave the prompt open
      target = free;
    }
    const removeIds = choice === 'replace' ? c.conflicts.filter(e => !e.locked).map(e => e.id) : [];
    snapshot();
    setStored(prev => {
      let next = removeIds.length ? prev.filter(e => !removeIds.includes(e.id)) : prev;
      if (c.kind === 'move' && c.eventId) {
        next = next.map(e => e.id === c.eventId ? { ...e, day: target.day, startHour: target.startHour } : e);
      } else if (c.kind === 'place' && c.suggestion) {
        next = [...next, eventFromSuggestion(c.suggestion, target.day, target.startHour, c.week)];
      }
      return next;
    });
    if (c.kind === 'place' && c.suggestion) {
      const sid = c.suggestion.id;
      setAiSuggestions(prev => prev.map(x => x.id === sid ? { ...x, applied: true } : x));
    }
    setConflict(null);
  }, [conflict, events, snapshot, eventFromSuggestion]);

  const runAIOptimization = useCallback(async () => {
    setAiLoading(true);
    setAiSuggestions([]);
    setAiSummary('');
    setPendingPlacement(null);
    setConflict(null);

    const suggestions = buildCareerSuggestions(targetNode, focusSkills);
    await new Promise(res => setTimeout(res, 700)); // simulated "thinking"

    if (suggestions.length === 0) {
      setAiSummary(`Pick at least one skill to build toward ${targetNode.title}, then optimise to slot prep into your free time.`);
    } else {
      setAiSummary(
        `A plan to move toward ${targetNode.title}. I slotted ${suggestions.length} prep block${suggestions.length > 1 ? 's' : ''} ` +
        `into your free windows — add the ones you'll commit to, and consider booking a mentor for the trickier skills.`,
      );
      setAiSuggestions(suggestions);
    }
    setAiLoading(false);
  }, [targetNode, focusSkills]);

  return (
    <Ctx.Provider value={{
      events, companies, calendars, aiSuggestions, aiLoading, aiSummary, pendingPlacement,
      targetNode, targetReadiness, focusSkills, toggleFocusSkill,
      milestones, addMilestone, removeMilestone,
      isComplete, toggleComplete,
      toggleCompany, addToLibrary, removeFromLibrary, applySuggestion,
      beginManualPlacement, cancelPlacement, placeSuggestionAt, dismissSuggestion,
      runAIOptimization, connectCalendar, addEvent, updateEvent, requestMove, removeEvent,
      conflict, resolveConflict, dismissConflict,
      undo, canUndo,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTimetable() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTimetable must be used inside TimetableProvider');
  return ctx;
}
