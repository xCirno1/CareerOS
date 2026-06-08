import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/ui/components';
import type { LucideIcon } from '@/lib/icons';

export function PageHeader({
  eyebrow,
  icon,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: string;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && (
          <Badge tone="brand" icon={icon}>
            {eyebrow}
          </Badge>
        )}
        <h1 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-ink-soft sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
