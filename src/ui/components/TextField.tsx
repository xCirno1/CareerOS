import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import type { LucideIcon } from '@/lib/icons';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ icon: Icon, label, hint, className, id, ...rest }, ref) {
    return (
      <label className={cn('block', className)} htmlFor={id}>
        {label && (
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">
            {label}
          </span>
        )}
        <span
          className={cn(
            'flex h-11 items-center gap-2.5 rounded-2xl border border-line/15 bg-surface px-3.5',
            'transition focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/30',
          )}
        >
          {Icon && <Icon size={17} className="shrink-0 text-ink-mute" />}
          <input
            ref={ref}
            id={id}
            className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute"
            {...rest}
          />
        </span>
        {hint && <span className="mt-1.5 block text-xs text-ink-mute">{hint}</span>}
      </label>
    );
  },
);
