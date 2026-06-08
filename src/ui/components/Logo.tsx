import { cn } from '@/lib/cn';

/** CareerOS wordmark + node-graph glyph. */
export function Logo({
  size = 'md',
  showWord = true,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  showWord?: boolean;
  className?: string;
}) {
  const dim = size === 'lg' ? 40 : size === 'sm' ? 28 : 34;
  const word = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="relative grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-navy via-navy-600 to-teal text-white shadow-soft dark:from-brand dark:via-teal dark:to-navy-600"
        style={{ width: dim, height: dim }}
      >
        <svg width={dim * 0.62} height={dim * 0.62} viewBox="0 0 24 24" fill="none">
          <circle cx="5" cy="6" r="2.4" fill="currentColor" />
          <circle cx="19" cy="9" r="2.4" fill="currentColor" opacity="0.85" />
          <circle cx="11" cy="18" r="2.4" fill="currentColor" opacity="0.7" />
          <path
            d="M6.8 7 17.2 8.3M17.5 11 12.5 16M9 16.5 6 8.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </span>
      {showWord && (
        <span className={cn('font-display font-extrabold tracking-tight text-ink', word)}>
          Career<span className="text-brand">OS</span>
        </span>
      )}
    </span>
  );
}
