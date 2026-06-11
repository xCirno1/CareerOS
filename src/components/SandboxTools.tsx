import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icons } from '@/lib/icons';
import {
  useSubscription,
  PLAN_META,
  PLAN_ORDER,
  type Plan,
  type AccountMode,
} from '@/lib/subscription';

/**
 * Prototype-only "wizard of oz" control panel. A floating circular button in
 * the bottom-right corner opens a sheet that lets anyone flip the simulated
 * auth, subscription plan, and account mode without a backend. None of this
 * ships to a real product — it exists so reviewers can exercise every gated
 * state (e.g. the Pro-only Mentor Match paywall) on demand.
 */

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

export function SandboxTools() {
  const { plan, setPlan, mode, setMode, authed, setAuthed, reset } = useSubscription();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && !wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

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
      className="fixed bottom-20 right-4 z-[80] flex flex-col items-end gap-3 lg:bottom-6 lg:right-6"
    >
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Prototype sandbox tools"
          className="w-72 animate-fade-up overflow-hidden rounded-3xl border border-line/12 bg-surface shadow-glass"
        >
          <div className="flex items-center gap-2 border-b border-line/10 bg-surface-2 px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber/20 text-[#8a6530] dark:text-amber">
              <Icons.Wand2 size={16} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-ink">Sandbox</p>
              <p className="text-[11px] text-ink-mute">Prototype overrides · no backend</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close sandbox"
              className="focus-ring grid h-7 w-7 place-items-center rounded-lg text-ink-mute transition hover:bg-line/10 hover:text-ink"
            >
              <Icons.X size={15} />
            </button>
          </div>

          <div className="divide-y divide-line/10">
            {/* Authentication */}
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

            {/* Subscription plan */}
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

            {/* Account mode */}
            <Section label="Account mode">
              <div className="space-y-1.5">
                {MODE_OPTIONS.map((opt) => {
                  const active = mode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMode(opt.value)}
                      aria-pressed={active}
                      className={cn(
                        'focus-ring flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                        active
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-line/12 bg-surface text-ink-mute hover:border-line/25',
                      )}
                    >
                      <opt.icon size={15} strokeWidth={2.2} />
                      {opt.label}
                      {active && <Icons.Check size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Quick links + reset */}
            <Section label="Reset">
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/pricing"
                  onClick={() => setOpen(false)}
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

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Prototype sandbox tools"
        aria-expanded={open}
        className={cn(
          'focus-ring group grid h-12 w-12 place-items-center rounded-full border border-line/12 bg-surface text-ink shadow-glass transition hover:scale-105 active:scale-95',
          open && 'bg-brand text-white',
        )}
      >
        {open ? (
          <Icons.X size={20} strokeWidth={2.2} />
        ) : (
          <Icons.Wand2 size={20} strokeWidth={2.1} className="transition-transform group-hover:rotate-12" />
        )}
      </button>
    </div>
  );
}
