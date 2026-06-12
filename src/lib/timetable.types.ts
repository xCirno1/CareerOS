export type EventCategory = 'uni' | 'company' | 'mentor' | 'personal' | 'gym' | 'meal' | 'social' | 'grind' | 'break';

export interface TimetableEvent {
  id: string;
  title: string;
  subtitle?: string;
  day: number; // 0=Mon, 4=Fri
  startHour: number; // e.g. 9 = 9:00 AM
  durationHours: number;
  category: EventCategory;
  source: 'manual' | 'google' | 'upload' | 'company' | 'mentor' | 'ai';
  /** Week offset from the base week (0 = current). Navigation shifts the view. */
  week?: number;
  /** When true the block repeats on the same day/time every week. */
  recurring?: boolean;
  companyId?: string;
  /** Source mentor session id (for derived mentor events). */
  mentorSessionId?: string;
  /** Linked career node — ties the block back to the Traileers map / pathways. */
  nodeId?: string;
  /** Derived events (company channels, mentor sessions) aren't freely editable. */
  locked?: boolean;
  color?: string;
}

export interface CompanyChannel {
  id: string;
  name: string;
  tag: string;
  initials: string;
  colorClass: string;
  /** Saved to the user's event library. */
  inLibrary: boolean;
  /** When in the library, whether its events currently show on the timetable. */
  enabled: boolean;
  events: Omit<TimetableEvent, 'id' | 'companyId' | 'source'>[];
}

export interface AISuggestion {
  id: string;
  type: EventCategory;
  title: string;
  reason: string;
  day: number;
  startHour: number;
  durationHours: number;
  icon: string;
  applied: boolean;
  /** Career role this prep block builds toward. */
  nodeId?: string;
  /** Skill the block is meant to develop. */
  skill?: string;
}

/** A skill the user is building toward their target role. */
export interface FocusSkill {
  id: string;
  label: string;
  /** True when it's a gap the user hasn't evidenced yet. */
  gap: boolean;
  enabled: boolean;
}

export type MilestoneType = 'application' | 'interview' | 'portfolio' | 'deadline';

/** A dated career milestone (deadlines, interviews) — careers run on dates. */
export interface Milestone {
  id: string;
  title: string;
  type: MilestoneType;
  /** ISO 'YYYY-MM-DD'. */
  date: string;
  nodeId?: string;
}

export interface ConnectedCalendar {
  id: string;
  name: string;
  provider: 'google' | 'ical' | 'upload';
  email?: string;
  connected: boolean;
  color: string;
}