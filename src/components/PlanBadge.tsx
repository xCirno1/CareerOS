import { cn } from '@/lib/cn';
import { PLAN_META, type Plan } from '@/lib/subscription';

/**
 * Small uppercase pill that surfaces the current candidate plan
 * (FREE / PRO / ULTRA). Used in the sidebar account card and paywalls.
 */
export function PlanBadge({
  plan,
  size = 'sm',
  withIcon = false,
  className,
}: {
  plan: Plan;
  size?: 'xs' | 'sm';
  withIcon?: boolean;
  className?: string;
}) {
  const meta = PLAN_META[plan];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-[0.08em]',
        size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
        meta.badgeClass,
        className,
      )}
    >
      {withIcon && <Icon size={size === 'xs' ? 9 : 11} strokeWidth={2.6} />}
      {meta.label}
    </span>
  );
}
