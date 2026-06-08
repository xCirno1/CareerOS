import { useTheme } from '@/lib/theme';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={cn(
        'focus-ring relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-line/12 bg-surface text-ink-soft transition hover:text-ink',
        className,
      )}
    >
      <span
        className={cn(
          'absolute transition-all duration-500',
          isDark ? 'translate-y-0 opacity-100 rotate-0' : '-translate-y-8 opacity-0 -rotate-90',
        )}
      >
        <Icons.Moon size={18} strokeWidth={2.2} />
      </span>
      <span
        className={cn(
          'absolute transition-all duration-500',
          isDark ? 'translate-y-8 opacity-0 rotate-90' : 'translate-y-0 opacity-100 rotate-0',
        )}
      >
        <Icons.Sun size={18} strokeWidth={2.2} />
      </span>
    </button>
  );
}
