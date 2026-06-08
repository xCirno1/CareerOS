import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  interactive?: boolean;
  inset?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { glass, interactive, inset, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border transition',
        glass
          ? 'glass'
          : 'border-line/10 bg-surface shadow-soft',
        interactive &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-line/20 hover:shadow-glass',
        inset && 'bg-surface-2',
        className,
      )}
      {...rest}
    />
  );
});
