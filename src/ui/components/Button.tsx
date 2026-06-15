import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import type { LucideIcon } from '@/lib/icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'wine';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-navy text-white hover:bg-navy-600 shadow-soft dark:bg-brand dark:text-navy dark:hover:bg-teal-soft',
  secondary:
    'bg-surface-2 text-ink hover:bg-surface border border-line/10',
  ghost: 'text-ink-soft hover:bg-line/5',
  outline: 'border border-line/20 text-ink hover:border-line/40 hover:bg-line/[0.03]',
  wine: 'bg-wine text-white hover:bg-wine-soft shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-sm gap-2 rounded-2xl',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-2xl [height:3.25rem]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading,
    block,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  const iconSize = size === 'lg' ? 18 : size === 'sm' ? 15 : 16;
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'focus-ring group inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        Icon && <Icon size={iconSize} strokeWidth={2.2} className="shrink-0" />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight
          size={iconSize}
          strokeWidth={2.2}
          className="shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      )}
    </button>
  );
});
