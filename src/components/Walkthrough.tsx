import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icons } from '@/lib/icons';
import { WALK_STEPS, useWalkthrough } from '@/lib/walkthrough';

/** Routes where the tour may auto-start on a first visit. */
const APP_ROUTES = ['/map', '/routing', '/insights', '/timetable', '/community', '/mentors'];

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Full-screen guided tour overlay. Renders inside the router so it can navigate
 * between screens as the user steps through. State comes from useWalkthrough().
 */
export function Walkthrough() {
  const { active, index, steps, seen, start, next, back, skip } = useWalkthrough();
  const navigate = useNavigate();
  const location = useLocation();

  // First-visit auto-start: only once the user is actually inside the app
  // (not on the Landing / marketing pages), so we don't yank them off it.
  useEffect(() => {
    if (seen || active) return;
    if (APP_ROUTES.some((r) => location.pathname.startsWith(r))) {
      start();
    }
  }, [seen, active, location.pathname, start]);

  // Keep the route in sync with the current step.
  const step = steps[index];
  useEffect(() => {
    if (!active || !step) return;
    if (location.pathname !== step.route) {
      navigate(step.route);
    }
    // Only react to step changes — navigating is a side effect of stepping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, index]);

  // Keyboard: Esc skips, arrows step.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, next, back, skip]);

  if (!active || !step) return null;

  const Icon = step.icon;
  const total = WALK_STEPS.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const progress = ((index + 1) / total) * 100;
  const reduce = prefersReducedMotion();

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 pb-24 sm:items-center sm:pb-4">
      {/* Dimmed backdrop — clicking it skips the tour. */}
      <button
        type="button"
        aria-label="Skip walkthrough"
        onClick={skip}
        className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-[1px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Walkthrough — ${step.title}`}
        className={cn(
          'relative w-full max-w-md overflow-hidden rounded-3xl border border-line/12 bg-surface shadow-glass',
          !reduce && 'animate-fade-up',
        )}
      >
        {/* Progress bar */}
        <div className="h-1 w-full bg-line/10">
          <div
            className="h-full rounded-r-full bg-brand transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-brand">
                <Icon size={22} strokeWidth={2.2} />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                {step.eyebrow}
              </span>
            </span>
            <button
              type="button"
              onClick={skip}
              aria-label="Close walkthrough"
              className="focus-ring grid h-8 w-8 place-items-center rounded-xl text-ink-mute transition hover:bg-line/10 hover:text-ink"
            >
              <Icons.X size={16} />
            </button>
          </div>

          <h2 className="mt-4 font-display text-xl font-extrabold leading-7 text-ink">
            {step.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{step.body}</p>

          {step.bullets && step.bullets.length > 0 && (
            <ul className="mt-4 space-y-2">
              {step.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-ink-soft">
                  <Icons.Check
                    size={16}
                    strokeWidth={2.6}
                    className="mt-0.5 shrink-0 text-brand"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Step dots */}
          <div className="mt-6 flex items-center gap-1.5" aria-hidden>
            {WALK_STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-5 bg-brand' : 'w-1.5 bg-line/25',
                )}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={skip}
              className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-ink-mute transition hover:text-ink"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-semibold tabular-nums text-ink-mute">
                {index + 1} / {total}
              </span>
              {!isFirst && (
                <button
                  type="button"
                  onClick={back}
                  className="focus-ring inline-flex items-center gap-1 rounded-xl border border-line/15 bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-line/30 hover:text-ink"
                >
                  <Icons.ChevronLeft size={16} />
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 dark:bg-brand"
              >
                {isLast ? 'Finish' : 'Next'}
                {isLast ? <Icons.Check size={16} strokeWidth={2.6} /> : <Icons.ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
