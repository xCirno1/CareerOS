import type { EventCategory } from '@/lib/timetable.types';

export interface CategoryStyle {
  bg: string;
  text: string;
  border: string;
  label: string;
  icon: string;
}

export const CATEGORY_STYLES: Record<EventCategory, CategoryStyle> = {
  uni: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-400',
    label: 'University',
    icon: 'ti-school',
  },
  company: {
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-400',
    label: 'Company event',
    icon: 'ti-building',
  },
  personal: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-400',
    label: 'Personal',
    icon: 'ti-user',
  },
  gym: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-400',
    label: 'Gym',
    icon: 'ti-barbell',
  },
  meal: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-400',
    label: 'Meal prep',
    icon: 'ti-soup',
  },
  social: {
    bg: 'bg-pink-50',
    text: 'text-pink-800',
    border: 'border-pink-400',
    label: 'Social',
    icon: 'ti-confetti',
  },
  grind: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-400',
    label: 'Deep work',
    icon: 'ti-brain',
  },
  break: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-300',
    label: 'Break',
    icon: 'ti-zzz',
  },
};

// Raw color values for inline styles (needed for calendar grid blocks)
export const CATEGORY_COLORS: Record<EventCategory, { bg: string; text: string; accent: string }> = {
  uni:      { bg: '#B5D4F4', text: '#0C447C', accent: '#185FA5' },
  company:  { bg: '#9FE1CB', text: '#085041', accent: '#0F6E56' },
  personal: { bg: '#CECBF6', text: '#3C3489', accent: '#534AB7' },
  gym:      { bg: '#FAC775', text: '#633806', accent: '#BA7517' },
  meal:     { bg: '#FAC775', text: '#633806', accent: '#854F0B' },
  social:   { bg: '#F4C0D1', text: '#72243E', accent: '#D4537E' },
  grind:    { bg: '#CECBF6', text: '#26215C', accent: '#7F77DD' },
  break:    { bg: '#D3D1C7', text: '#444441', accent: '#888780' },
};

export const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am–7pm
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const SLOT_HEIGHT = 48; // px per hour

export function formatHour(h: number): string {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}