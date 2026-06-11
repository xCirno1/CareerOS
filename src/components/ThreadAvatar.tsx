import { cn } from '@/lib/cn';
import { avatarColor } from '@/lib/community';

/** Initials avatar used across community threads. */
export function ThreadAvatar({
  initials,
  colorClass,
  size = 'md',
}: {
  initials: string;
  colorClass?: string;
  size?: 'sm' | 'md';
}) {
  const resolved = colorClass ?? avatarColor(initials);
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-bold',
        size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs',
        resolved,
      )}
    >
      {initials}
    </span>
  );
}
