import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  TimetableEvent,
  CompanyChannel,
  LifestyleGoal,
  ConnectedCalendar,
  AISuggestion,
} from './timetable.types';

const INITIAL_EVENTS: TimetableEvent[] = [
  { id: 'e1', title: 'COMM 201', subtitle: 'Lecture • Arts Building', day: 0, startHour: 9, durationHours: 2, category: 'uni', source: 'upload' },
  { id: 'e2', title: 'ECON 110', subtitle: 'Tutorial • Online', day: 1, startHour: 10, durationHours: 1, category: 'uni', source: 'upload' },
  { id: 'e3', title: 'Study group', subtitle: 'Library Room 3', day: 1, startHour: 14, durationHours: 2, category: 'personal', source: 'manual' },
  { id: 'e4', title: 'CS 301', subtitle: 'Lab • Engineering 2', day: 2, startHour: 8, durationHours: 2, category: 'uni', source: 'upload' },
  { id: 'e5', title: 'MKTG 220', subtitle: 'Lecture • Online', day: 3, startHour: 9, durationHours: 1, category: 'uni', source: 'upload' },
  { id: 'e6', title: 'PSYC 102', subtitle: 'Lecture • Wallace Hall', day: 4, startHour: 10, durationHours: 2, category: 'uni', source: 'upload' },
];

const INITIAL_COMPANIES: CompanyChannel[] = [
  {
    id: 'atlassian', name: 'Atlassian', tag: 'Tech • Grad programs', initials: 'AT', colorClass: 'ca-coral', subscribed: true,
    events: [{ title: 'Atlassian info session', subtitle: 'Events channel', day: 0, startHour: 13, durationHours: 1, category: 'company' }],
  },
  {
    id: 'canva', name: 'Canva', tag: 'Design • Internships', initials: 'CV', colorClass: 'ca-teal', subscribed: true,
    events: [{ title: 'Canva grad careers', subtitle: 'Events channel', day: 2, startHour: 12, durationHours: 1, category: 'company' }],
  },
  {
    id: 'google', name: 'Google', tag: 'Tech • Campus events', initials: 'GG', colorClass: 'ca-blue', subscribed: true,
    events: [{ title: 'Google developer day', subtitle: 'Events channel', day: 3, startHour: 11, durationHours: 2, category: 'company' }],
  },
  {
    id: 'deloitte', name: 'Deloitte', tag: 'Consulting • Networking', initials: 'DL', colorClass: 'ca-amber', subscribed: false,
    events: [{ title: 'Deloitte careers night', subtitle: 'Events channel', day: 4, startHour: 17, durationHours: 2, category: 'company' }],
  },
  {
    id: 'afterpay', name: 'Afterpay', tag: 'Fintech • Workshops', initials: 'AP', colorClass: 'ca-pink', subscribed: false,
    events: [{ title: 'Fintech workshop', subtitle: 'Events channel', day: 1, startHour: 16, durationHours: 1, category: 'company' }],
  },
  {
    id: 'bhp', name: 'BHP', tag: 'Mining • Grad fair', initials: 'BH', colorClass: 'ca-teal', subscribed: false,
    events: [{ title: 'BHP grad fair', subtitle: 'Events channel', day: 2, startHour: 14, durationHours: 2, category: 'company' }],
  },
];

const INITIAL_GOALS: LifestyleGoal[] = [
  { id: 'gym', label: 'Gym & fitness', icon: 'ti-barbell', enabled: true, detail: 'Schedule 3–4 gym sessions per week on low-class days' },
  { id: 'meal', label: 'Meal prep', icon: 'ti-soup', enabled: true, detail: 'Block Sunday afternoons for bulk cooking' },
  { id: 'social', label: 'Socialise', icon: 'ti-confetti', enabled: false, detail: 'Protect Friday evenings for social time' },
  { id: 'grind', label: 'Deep work', icon: 'ti-brain', enabled: true, detail: 'Reserve morning focus blocks for assignments' },
  { id: 'break', label: 'Recovery', icon: 'ti-zzz', enabled: false, detail: 'Add short breaks between back-to-back classes' },
];

const INITIAL_CALENDARS: ConnectedCalendar[] = [
  { id: 'google', name: 'Google Calendar', provider: 'google', email: 'sarah@gmail.com', connected: true, color: '#185FA5' },
  { id: 'ical', name: 'iCal / Apple', provider: 'ical', connected: false, color: '#534AB7' },
  { id: 'upload', name: 'Uni timetable', provider: 'upload', connected: true, color: '#0F6E56' },
];

interface TimetableCtx {
  events: TimetableEvent[];
  companies: CompanyChannel[];
  goals: LifestyleGoal[];
  calendars: ConnectedCalendar[];
  aiSuggestions: AISuggestion[];
  aiLoading: boolean;
  aiSummary: string;
  toggleCompany: (id: string) => void;
  toggleGoal: (id: string) => void;
  applySuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  runAIOptimization: () => Promise<void>;
  connectCalendar: (id: string) => void;
  addEvent: (event: Omit<TimetableEvent, 'id'>) => void;
}

const Ctx = createContext<TimetableCtx | null>(null);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<TimetableEvent[]>(INITIAL_EVENTS);
  const [companies, setCompanies] = useState<CompanyChannel[]>(INITIAL_COMPANIES);
  const [goals, setGoals] = useState<LifestyleGoal[]>(INITIAL_GOALS);
  const [calendars, setCalendars] = useState<ConnectedCalendar[]>(INITIAL_CALENDARS);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const toggleCompany = useCallback((id: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id !== id) return c;
      const nowSubscribed = !c.subscribed;
      setEvents(evs => {
        const filtered = evs.filter(e => e.companyId !== id);
        if (nowSubscribed) {
          const newEvs = c.events.map((ev, i) => ({
            ...ev, id: `${id}-${i}`, companyId: id, source: 'company' as const,
          }));
          return [...filtered, ...newEvs];
        }
        return filtered;
      });
      return { ...c, subscribed: nowSubscribed };
    }));
  }, []);

  const toggleGoal = useCallback((id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g));
  }, []);

  const applySuggestion = useCallback((id: string) => {
    setAiSuggestions(prev => prev.map(s => {
      if (s.id !== id) return s;
      setEvents(evs => [...evs, {
        id: `ai-${id}`, title: s.title, day: s.day,
        startHour: s.startHour, durationHours: s.durationHours,
        category: s.type, source: 'ai',
      }]);
      return { ...s, applied: true };
    }));
  }, []);

  const dismissSuggestion = useCallback((id: string) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const connectCalendar = useCallback((id: string) => {
    setCalendars(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  }, []);

  const addEvent = useCallback((event: Omit<TimetableEvent, 'id'>) => {
    setEvents(prev => [...prev, { ...event, id: `manual-${Date.now()}` }]);
  }, []);

  const runAIOptimization = useCallback(async () => {
    setAiLoading(true);
    setAiSuggestions([]);
    setAiSummary('');

    const enabledGoals = goals.filter(g => g.enabled).map(g => g.label).join(', ');
    const busyDays = ['Monday', 'Wednesday', 'Thursday'];
    const lightDays = ['Tuesday', 'Friday'];

    const prompt = `You are a student lifestyle optimizer. A student has the following university schedule this week:
- Monday: COMM 201 (9-11am), Atlassian info session (1-2pm)
- Tuesday: ECON 110 (10-11am), Study group (2-4pm)  
- Wednesday: CS 301 (8-10am), Canva careers (12-1pm)
- Thursday: MKTG 220 (9-10am), Google dev day (11am-1pm)
- Friday: PSYC 102 (10am-12pm)

Their lifestyle goals: ${enabledGoals}
Busy days: ${busyDays.join(', ')}
Lighter days: ${lightDays.join(', ')}

Return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
  "summary": "2-3 sentence overview of the optimized week",
  "suggestions": [
    {
      "id": "s1",
      "type": "gym",
      "title": "Morning gym session",
      "reason": "Tuesday is light — hit the gym before your 10am class to start fresh",
      "day": 1,
      "startHour": 7,
      "durationHours": 1,
      "icon": "ti-barbell"
    }
  ]
}

Types allowed: gym, meal, social, grind, break
Days: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
startHour is 24h integer (7=7am, 13=1pm)
Generate 4-6 suggestions based on the enabled goals. Be specific and friendly in reasons.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAiSuggestions((parsed.suggestions ?? []).map((s: AISuggestion) => ({ ...s, applied: false })));
      setAiSummary(parsed.summary ?? '');
    } catch (err) {
      setAiSummary('Could not generate suggestions right now. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }, [goals]);

  return (
    <Ctx.Provider value={{
      events, companies, goals, calendars, aiSuggestions, aiLoading, aiSummary,
      toggleCompany, toggleGoal, applySuggestion, dismissSuggestion,
      runAIOptimization, connectCalendar, addEvent,
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