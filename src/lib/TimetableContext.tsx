import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type {
  TimetableEvent,
  CompanyChannel,
  ConnectedCalendar,
  AISuggestion,
  FocusSkill,
  Milestone,
} from './timetable.types';
import { CATEGORY_ICON, FREE_SLOTS, isCareerEvent, parseSlot, cellDate, TODAY_DAY_INDEX, toISODate } from './timetable.utils';
import { useAppStore } from './appStore';
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

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function seedMilestones(targetId: string): Milestone[] {
  const today = cellDate(0, TODAY_DAY_INDEX);
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
];

const INITIAL_CALENDARS: ConnectedCalendar[] = [
  { id: 'google', name: 'Google Calendar', provider: 'google', email: 'sarah@gmail.com', connected: true, color: '#185FA5' },
  { id: 'ical', name: 'iCal / Apple', provider: 'ical', connected: false, color: '#534AB7' },
  { id: 'upload', name: 'Uni timetable', provider: 'upload', connected: true, color: '#0F6E56' },
];

interface TimetableCtx {
  events: TimetableEvent[];
  companies: CompanyChannel[];
  calendars: ConnectedCalendar[];
  aiSuggestions: AISuggestion[];
  aiLoading: boolean;
  aiSummary: string;
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
  dismissSuggestion: (id: string) => void;
  runAIOptimization: () => Promise<void>;
  connectCalendar: (id: string) => void;
  addEvent: (event: Omit<TimetableEvent, 'id'>) => TimetableEvent;
  updateEvent: (id: string, patch: Partial<Omit<TimetableEvent, 'id'>>) => void;
  removeEvent: (id: string) => void;
}

const Ctx = createContext<TimetableCtx | null>(null);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const { mentorSessions, cancelMentorSession, target } = useAppStore();
  const targetNode = getNode(target) ?? getNode(TARGET_NODE_ID) ?? NODES[0];

  const [stored, setStored] = useState<TimetableEvent[]>(() => loadList(EVENTS_KEY, INITIAL_EVENTS));
  const [companies, setCompanies] = useState<CompanyChannel[]>(INITIAL_COMPANIES);
  const [calendars, setCalendars] = useState<ConnectedCalendar[]>(INITIAL_CALENDARS);
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadList(MILESTONES_KEY, seedMilestones(targetNode.id)));
  const [completedIds, setCompletedIds] = useState<string[]>(() => loadList(COMPLETED_KEY, []));
  const [disabledSkills, setDisabledSkills] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => { localStorage.setItem(EVENTS_KEY, JSON.stringify(stored)); }, [stored]);
  useEffect(() => { localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones)); }, [milestones]);
  useEffect(() => { localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedIds)); }, [completedIds]);

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

  const applySuggestion = useCallback((id: string) => {
    setAiSuggestions(prev => prev.map(s => {
      if (s.id !== id || s.applied) return s;
      setStored(evs => [...evs, {
        id: `ai-${id}-${Date.now()}`,
        title: s.title,
        subtitle: s.skill ? `Toward ${targetNode.title}` : undefined,
        day: s.day, startHour: s.startHour, durationHours: s.durationHours,
        category: s.type, source: 'ai', week: 0, nodeId: s.nodeId,
      }]);
      return { ...s, applied: true };
    }));
  }, [targetNode]);

  const dismissSuggestion = useCallback((id: string) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const connectCalendar = useCallback((id: string) => {
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  }, []);

  const addEvent = useCallback((event: Omit<TimetableEvent, 'id'>) => {
    const created: TimetableEvent = { week: 0, ...event, id: `manual-${Date.now()}` };
    setStored(prev => [...prev, created]);
    return created;
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<Omit<TimetableEvent, 'id'>>) => {
    setStored(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const removeEvent = useCallback((id: string) => {
    if (id.startsWith('mentor-')) {
      cancelMentorSession(id.slice('mentor-'.length));
      return;
    }
    setStored(prev => prev.filter(e => e.id !== id));
  }, [cancelMentorSession]);

  const runAIOptimization = useCallback(async () => {
    setAiLoading(true);
    setAiSuggestions([]);
    setAiSummary('');

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
      events, companies, calendars, aiSuggestions, aiLoading, aiSummary,
      targetNode, targetReadiness, focusSkills, toggleFocusSkill,
      milestones, addMilestone, removeMilestone,
      isComplete, toggleComplete,
      toggleCompany, addToLibrary, removeFromLibrary, applySuggestion, dismissSuggestion,
      runAIOptimization, connectCalendar, addEvent, updateEvent, removeEvent,
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
