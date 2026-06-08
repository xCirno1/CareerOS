import { cn } from '@/lib/cn';

/** Initials avatar with a deterministic accent ring. */
export function Avatar({
  name,
  size = 36,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const accents = ['bg-brand/15 text-brand', 'bg-wine/15 text-wine dark:text-wine-soft', 'bg-amber/20 text-[#8a6530] dark:text-amber'];
  const idx = name.charCodeAt(0) % accents.length;
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-bold',
        accents[idx],
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}
