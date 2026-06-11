import { Icons, type LucideIcon } from '@/lib/icons';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV: NavItem[] = [
  { to: '/map', label: 'Traileers Map', icon: Icons.Network },
  { to: '/routing', label: 'Pathways', icon: Icons.Route },
  { to: '/insights', label: 'Insights', icon: Icons.LineChart },
  { to: '/community', label: 'Community', icon: Icons.Users },
  { to: '/mentors', label: 'Mentors', icon: Icons.GraduationCap },
];
