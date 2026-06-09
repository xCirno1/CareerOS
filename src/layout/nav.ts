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
];

export const SECONDARY_NAV: NavItem[] = [
  { to: '/node/product-lead', label: 'Insights', icon: Icons.LineChart },
];
