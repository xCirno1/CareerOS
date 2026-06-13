import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons, getIcon, type LucideIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useTheme } from '@/lib/theme';
import { NODES, getNodeIcon } from '@/lib/mockData';

interface Result {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  group: 'Actions' | 'Roles';
  run: () => void;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { toggle } = useTheme();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const go = (to: string) => () => {
    navigate(to);
    onClose();
  };

  const results = useMemo<Result[]>(() => {
    const actions: Result[] = [
      { id: 'a-map', label: 'Open the Traileers map', icon: Icons.Network, group: 'Actions', run: go('/map') },
      { id: 'a-route', label: 'Plan a pathway', icon: Icons.Route, group: 'Actions', run: go('/routing') },
      { id: 'a-onboarding', label: 'Start onboarding', icon: Icons.ClipboardCheck, group: 'Actions', run: go('/onboarding') },
      {
        id: 'a-theme',
        label: 'Toggle light / dark theme',
        icon: Icons.Sun,
        group: 'Actions',
        run: () => {
          toggle();
          onClose();
        },
      },
    ];
    const roleResults: Result[] = NODES.map((n) => ({
      id: `n-${n.id}`,
      label: n.title,
      hint: n.kind,
      icon: getIcon(getNodeIcon(n)),
      group: 'Roles',
      run: go(`/node/${n.id}`),
    }));
    const term = q.trim().toLowerCase();
    const all = [...actions, ...roleResults];
    if (!term) return all;
    return all.filter((r) => r.label.toLowerCase().includes(term) || r.hint?.includes(term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      results[active]?.run();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]" onKeyDown={onKey}>
      <div className="absolute inset-0 animate-[fade-up_0.2s_ease] bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-fade-up overflow-hidden rounded-3xl border border-line/12 bg-surface shadow-glass">
        <div className="flex items-center gap-3 border-b border-line/10 px-4">
          <Icons.Search size={18} className="text-ink-mute" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search roles, jump anywhere…"
            className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-mute"
          />
          <kbd className="rounded-md border border-line/15 px-1.5 py-0.5 text-[10px] font-semibold text-ink-mute">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-mute">No matches for “{q}”.</p>
          ) : (
            results.map((r, i) => {
              const Icon = r.icon;
              const showGroup = i === 0 || results[i - 1].group !== r.group;
              return (
                <div key={r.id}>
                  {showGroup && (
                    <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                      {r.group}
                    </p>
                  )}
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={r.run}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition',
                      i === active ? 'bg-brand/10 text-ink' : 'text-ink-soft hover:bg-line/5',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-xl',
                        i === active ? 'bg-brand text-white' : 'bg-surface-2 text-ink-mute',
                      )}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    <span className="flex-1 text-sm font-semibold">{r.label}</span>
                    {r.hint && (
                      <span className="shrink-0 text-[11px] font-semibold capitalize text-ink-mute">
                        {r.hint}
                      </span>
                    )}
                    {i === active && <span className="text-ink-mute">↵</span>}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
