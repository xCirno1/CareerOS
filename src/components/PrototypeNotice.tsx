import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icons } from '@/lib/icons';
import {
  PLAN_META,
  PLAN_ORDER,
  useSubscription,
  type AccountMode,
  type Plan,
} from '@/lib/subscription';

const AUTO_COLLAPSE_MS = 3000;

const MODE_OPTIONS: { value: AccountMode; label: string; icon: typeof Icons.Compass }[] = [
  { value: 'candidate', label: 'Looking for mentoring', icon: Icons.Compass },
  { value: 'mentor', label: 'Become a mentor', icon: Icons.Banknote },
];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3">
      <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-mute">
        {label}
      </p>
      {children}
    </div>
  );
}

export function PrototypeNotice() {
  const location = useLocation();
  const { plan, setPlan, mode, setMode, authed, setAuthed, reset } = useSubscription();
  const [warningVisible, setWarningVisible] = useState(true);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSandboxOpen(false);
    setWarningVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setWarningVisible(false), AUTO_COLLAPSE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!sandboxOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrapRef.current?.contains(event.target)) {
        setSandboxOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSandboxOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sandboxOpen]);

  const openSandbox = () => {
    if (timer.current) clearTimeout(timer.current);
    setWarningVisible(false);
    setSandboxOpen(true);
  };

  const clearAll = () => {
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed bottom-20 right-4 z-[80] flex flex-col items-end gap-3 lg:bottom-6 lg:right-6"
    >
      {sandboxOpen && (
        <div
          role="dialog"
          aria-label="Prototype sandbox"
          className="pointer-events-auto w-72 animate-fade-up overflow-hidden rounded-3xl border border-line/12 bg-surface shadow-glass"
        >
          <div className="flex items-center gap-2 border-b border-line/10 bg-surface-2 px-4 py-3">
            <Icons.SlidersHorizontal size={17} strokeWidth={2.2} className="shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink">Prototype sandbox</p>
              <p className="text-[11px] text-ink-mute">Mock controls · no backend</p>
            </div>
            <button
              type="button"
              onClick={() => setSandboxOpen(false)}
              aria-label="Close sandbox"
              className="focus-ring grid h-7 w-7 place-items-center rounded-lg text-ink-mute transition hover:bg-line/10 hover:text-ink"
            >
              <Icons.X size={15} />
            </button>
          </div>

          <div className="divide-y divide-line/10">
            <Section label="Authentication">
              <button
                type="button"
                onClick={() => setAuthed(!authed)}
                className={cn(
                  'focus-ring flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                  authed
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-line/15 bg-surface text-ink-soft hover:border-line/30',
                )}
              >
                <span className="flex items-center gap-2">
                  {authed ? <Icons.BadgeCheck size={15} /> : <Icons.User size={15} />}
                  {authed ? 'Signed in' : 'Signed out'}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">
                  {authed ? 'Sign out' : 'Sign in'}
                </span>
              </button>
            </Section>

            <Section label="Subscription plan">
              <div className="grid grid-cols-3 gap-1.5">
                {PLAN_ORDER.map((p: Plan) => {
                  const meta = PLAN_META[p];
                  const active = plan === p;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlan(p)}
                      aria-pressed={active}
                      className={cn(
                        'focus-ring flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-bold transition',
                        active
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-line/12 bg-surface text-ink-mute hover:border-line/25',
                      )}
                    >
                      <Icon size={15} strokeWidth={2.2} />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] leading-4 text-ink-mute">
                Pro & Ultra unlock the Mentor Match paywall.
              </p>
            </Section>

            <Section label="Account mode">
              <div className="space-y-1.5">
                {MODE_OPTIONS.map((option) => {
                  const active = mode === option.value;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMode(option.value)}
                      aria-pressed={active}
                      className={cn(
                        'focus-ring flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                        active
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-line/12 bg-surface text-ink-mute hover:border-line/25',
                      )}
                    >
                      <Icon size={15} strokeWidth={2.2} />
                      {option.label}
                      {active && <Icons.Check size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section label="Reset">
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/pricing"
                  onClick={() => setSandboxOpen(false)}
                  className="focus-ring flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-line/5 hover:text-ink"
                >
                  <Icons.ExternalLink size={15} />
                  Open pricing & plans
                </Link>
                <button
                  type="button"
                  onClick={reset}
                  className="focus-ring flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-line/5 hover:text-ink"
                >
                  <Icons.Activity size={15} />
                  Reset plan, mode & auth
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="focus-ring flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-wine transition hover:bg-wine/5"
                >
                  <Icons.Flame size={15} />
                  Clear all local data
                </button>
              </div>
            </Section>
          </div>
        </div>
      )}

      {warningVisible && !sandboxOpen ? (
        <button
          type="button"
          onClick={openSandbox}
          className="focus-ring pointer-events-auto flex max-w-xs animate-fade-up items-start gap-3 rounded-2xl border border-wine/25 bg-wine/10 px-4 py-3 text-left shadow-glass backdrop-blur-xl transition hover:border-wine/35 hover:bg-wine/[0.14]"
        >
          <Icons.Flame size={18} strokeWidth={2.2} className="mt-0.5 shrink-0 text-wine" />
          <span className="min-w-0">
            <span className="block text-xs font-extrabold text-wine">Warning</span>
            <span className="mt-0.5 block text-[11px] leading-4 text-ink-soft">
              This prototype uses mock data and sandbox controls while the frontend flow is being tested.
            </span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setSandboxOpen((open) => !open)}
          aria-label="Prototype sandbox"
          aria-expanded={sandboxOpen}
          className={cn(
            'focus-ring pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full border border-line/12 bg-surface/95 px-4 text-sm font-extrabold text-ink shadow-glass backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-brand/30',
            sandboxOpen && 'border-brand/35 bg-brand/10 text-brand',
          )}
        >
          {sandboxOpen ? <Icons.X size={18} strokeWidth={2.2} /> : <Icons.SlidersHorizontal size={18} strokeWidth={2.2} />}
          Sandbox
        </button>
      )}
    </div>
  );
}
