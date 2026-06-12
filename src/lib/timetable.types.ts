export type EventCategory = 'uni' | 'company' | 'personal' | 'gym' | 'meal' | 'social' | 'grind' | 'break';

export interface TimetableEvent {
  id: string;
  title: string;
  subtitle?: string;
  day: number; // 0=Mon, 4=Fri
  startHour: number; // e.g. 9 = 9:00 AM
  durationHours: number;
  category: EventCategory;
  source: 'manual' | 'google' | 'upload' | 'company' | 'ai';
  companyId?: string;
  color?: string;
}

export interface CompanyChannel {
  id: string;
  name: string;
  tag: string;
  initials: string;
  colorClass: string;
  subscribed: boolean;
  events: Omit<TimetableEvent, 'id' | 'companyId' | 'source'>[];
}

export interface LifestyleGoal {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
  detail: string;
}

export interface AIOptimizationResult {
  suggestions: AISuggestion[];
  summary: string;
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
}

export interface ConnectedCalendar {
  id: string;
  name: string;
  provider: 'google' | 'ical' | 'upload';
  email?: string;
  connected: boolean;
  color: string;
}