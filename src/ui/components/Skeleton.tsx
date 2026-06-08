import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * Base shimmer block. Uses an overlay sweep so it reads as "loading" without
 * a jarring opacity pulse. Compose these to mirror real content layout.
 */
export function Skeleton({
  className,
  rounded = 'rounded-lg',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { rounded?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-line/8',
        rounded,
        className,
      )}
      aria-hidden
      {...rest}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-surface/70 to-transparent dark:via-surface/40" />
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 48 }: { size?: number }) {
  return (
    <Skeleton rounded="rounded-full" style={{ width: size, height: size }} />
  );
}

/** A complete card-shaped placeholder used while a panel loads. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-center gap-3">
        <SkeletonCircle size={44} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText className="mt-4" lines={3} />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-7 w-20" rounded="rounded-full" />
        <Skeleton className="h-7 w-24" rounded="rounded-full" />
      </div>
    </div>
  );
}
