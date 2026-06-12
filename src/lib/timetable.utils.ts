import type { EventCategory, MilestoneType, TimetableEvent } from '@/lib/timetable.types';
import type { IconName } from '@/lib/icons';

// Lucide icon name (resolvable via getIcon) for each category.
export const CATEGORY_ICON: Record<EventCategory, IconName> = {
  uni: 'GraduationCap',
  company: 'Building2',
  mentor: 'Users',
  personal: 'User',
  gym: 'Dumbbell',
  meal: 'UtensilsCrossed',
  social: 'PartyPopper',
  grind: 'Brain',
  break: 'Coffee',
};

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  uni: 'University',
  company: 'Company event',
  mentor: 'Mentor session',
  personal: 'Personal',
  gym: 'Gym',
  meal: 'Meal prep',
  social: 'Social',
  grind: 'Deep work',
  break: 'Break',
};

// Raw color values for inline styles (needed for calendar grid blocks)
export const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; accent: string }> = {
  uni: { bg: '#B5D4F4', text: '#0C447C', accent: '#185FA5' },
  company: { bg: '#9FE1CB', text: '#085041', accent: '#0F6E56' },
  mentor: { bg: '#F3CDD6', text: '#6A2230', accent: '#7E3041' },
  personal: { bg: '#CECBF6', text: '#3C3489', accent: '#534AB7' },
  gym: { bg: '#FAC775', text: '#633806', accent: '#BA7517' },
  meal: { bg: '#FAC775', text: '#633806', accent: '#854F0B' },
  social: { bg: '#F4C0D1', text: '#72243E', accent: '#D4537E' },
  grind: { bg: '#CECBF6', text: '#26215C', accent: '#7F77DD' },
  break: { bg: '#D3D1C7', text: '#444441', accent: '#888780' },
};

// Categories a user can manually assign (mentor/company are system-managed).
export const ALL_CATEGORIES: EventCategory[] = [
  'uni', 'personal', 'grind', 'gym', 'meal', 'social', 'break', 'company',
];

export const HOURS = Array.from({ length: 24 }, (_, i) => i); // full 24h day
export const FOCUS_HOUR = 7; // grid scrolls here on open (the daytime "focus")
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const SLOT_HEIGHT = 48; // px per hour

export function formatHour(h: number): string {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export function formatRange(startHour: number, durationHours: number): string {
  return `${formatHour(startHour)} – ${formatHour(startHour + durationHours)}`;
}

// ---- Week / date model -----------------------------------------------------
// Single demo clock: everything (headers, labels, "today", countdowns) derives
// from the real current date so the calendar is never out of sync.
export const NOW = new Date();

export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export const TODAY = startOfDay(NOW);

/** Weekday as Mon=0 … Sun=6. */
function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

// Monday of the current real week.
export const BASE_MONDAY = (() => {
  const m = new Date(TODAY);
  m.setDate(m.getDate() - weekdayIndex(TODAY));
  return m;
})();

// Index of "today" within the Mon–Fri grid, or -1 on weekends (no column).
export const TODAY_DAY_INDEX = weekdayIndex(TODAY) <= 4 ? weekdayIndex(TODAY) : -1;

// A weekday to default new events onto (today, or Monday on weekends).
export const DEFAULT_DAY_INDEX = TODAY_DAY_INDEX >= 0 ? TODAY_DAY_INDEX : 0;

export function weekMonday(weekOffset: number): Date {
  const d = new Date(BASE_MONDAY);
  d.setDate(d.getDate() + weekOffset * 7);
  return d;
}

export function cellDate(weekOffset: number, dayIndex: number): Date {
  const d = weekMonday(weekOffset);
  d.setDate(d.getDate() + dayIndex);
  return d;
}

export function formatWeekLabel(weekOffset: number): string {
  const mon = weekMonday(weekOffset);
  const fri = cellDate(weekOffset, 4);
  const monthFmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const sameMonth = mon.getMonth() === fri.getMonth();
  return sameMonth
    ? `${mon.toLocaleDateString('en-US', monthFmt)} – ${fri.getDate()}`
    : `${mon.toLocaleDateString('en-US', monthFmt)} – ${fri.toLocaleDateString('en-US', monthFmt)}`;
}

// ---- Career classification -------------------------------------------------
// Time that actively moves the user toward their target role (vs fixed/life).
const CAREER_CATEGORIES = new Set<EventCategory>(['mentor', 'grind', 'company']);

export function isCareerEvent(ev: TimetableEvent): boolean {
  return CAREER_CATEGORIES.has(ev.category) || Boolean(ev.nodeId);
}

// ---- Milestones ------------------------------------------------------------
export const MILESTONE_META: Record<MilestoneType, { label: string; icon: IconName; accent: string }> = {
  application: { label: 'Application', icon: 'Briefcase', accent: '#185FA5' },
  interview: { label: 'Interview', icon: 'Megaphone', accent: '#7E3041' },
  portfolio: { label: 'Portfolio', icon: 'PenTool', accent: '#854F0B' },
  deadline: { label: 'Deadline', icon: 'Flag', accent: '#0F6E56' },
};

export const MILESTONE_TYPES: MilestoneType[] = ['application', 'interview', 'portfolio', 'deadline'];

/** Whole-day difference from today (the real current date). */
export function daysUntil(dateISO: string): number {
  const target = new Date(`${dateISO}T00:00:00`);
  return Math.round((startOfDay(target).getTime() - TODAY.getTime()) / 86_400_000);
}

export function formatCountdown(dateISO: string): string {
  const d = daysUntil(dateISO);
  if (d < 0) return `${Math.abs(d)}d ago`;
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  return `in ${d} days`;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ---- Conflict detection ----------------------------------------------------
export interface Slot {
  day: number;
  startHour: number;
  durationHours: number;
  week: number;
}

/** Do two same-day time ranges overlap? */
function rangesOverlap(aStart: number, aDur: number, bStart: number, bDur: number): boolean {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

/** True when an event occupies the given week (recurring blocks span all weeks). */
function eventInWeek(ev: TimetableEvent, week: number): boolean {
  return Boolean(ev.recurring) || (ev.week ?? 0) === week;
}

/** Events that overlap the proposed slot (same day + week, ignoring `ignoreId`). */
export function findConflicts(
  events: TimetableEvent[],
  slot: Slot,
  ignoreId?: string,
): TimetableEvent[] {
  return events.filter(e =>
    e.id !== ignoreId &&
    e.day === slot.day &&
    eventInWeek(e, slot.week) &&
    rangesOverlap(slot.startHour, slot.durationHours, e.startHour, e.durationHours),
  );
}

/**
 * Next conflict-free slot at/after `from`, scanning later hours then later days
 * and wrapping back to Monday. Returns null when the week is fully booked.
 */
export function findNextFreeSlot(
  events: TimetableEvent[],
  from: Slot,
  ignoreId?: string,
): { day: number; startHour: number } | null {
  const lastStart = HOURS[HOURS.length - 1] + 1 - from.durationHours;
  const free = (day: number, startHour: number) =>
    findConflicts(events, { day, startHour, durationHours: from.durationHours, week: from.week }, ignoreId).length === 0;

  for (let day = from.day; day <= 4; day++) {
    const startH = day === from.day ? from.startHour : HOURS[0];
    for (let h = startH; h <= lastStart; h++) {
      if (free(day, h)) return { day, startHour: h };
    }
  }
  for (let day = 0; day < from.day; day++) {
    for (let h = HOURS[0]; h <= lastStart; h++) {
      if (free(day, h)) return { day, startHour: h };
    }
  }
  return null;
}

// ---- AI placement ----------------------------------------------------------
// Free 2-hour windows around the known class schedule, used to slot prep blocks.
export const FREE_SLOTS: { day: number; startHour: number }[] = [
  { day: 1, startHour: 7 },  // Tue morning
  { day: 4, startHour: 13 }, // Fri early afternoon
  { day: 2, startHour: 14 }, // Wed afternoon
  { day: 3, startHour: 14 }, // Thu afternoon
  { day: 0, startHour: 7 },  // Mon morning
  { day: 1, startHour: 16 }, // Tue late afternoon
  { day: 4, startHour: 7 },  // Fri morning
  { day: 3, startHour: 16 }, // Thu late afternoon
];

// Mon–Fri map; weekend slots fall back onto Friday so they still render.
const WEEKDAY_INDEX: Record<string, number> = {
  mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 4, sun: 0,
};

/**
 * Parses a human slot string like "Friday, 2:30 PM" into a grid position.
 * Weekend slots are clamped onto Friday; out-of-range hours clamp into 7am–6pm.
 */
export function parseSlot(slot: string): { day: number; startHour: number } | null {
  const m = slot.match(/([a-z]{3})[a-z]*,?\s+(\d{1,2})(?::\d{2})?\s*(am|pm)/i);
  if (!m) return null;
  const day = WEEKDAY_INDEX[m[1].toLowerCase()];
  if (day === undefined) return null;
  let hour = parseInt(m[2], 10) % 12;
  if (/pm/i.test(m[3])) hour += 12;
  hour = Math.min(HOURS[HOURS.length - 1] - 1, Math.max(HOURS[0], hour));
  return { day, startHour: hour };
}