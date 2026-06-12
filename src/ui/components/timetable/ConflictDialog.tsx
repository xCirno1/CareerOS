import { useTimetable } from '@/lib/TimetableContext';
import {
  CATEGORY_COLORS, CATEGORY_ICON, DAY_LABELS, DAYS, formatHour, formatRange, findNextFreeSlot,
} from '@/lib/timetable.utils';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

/** Overlap prompt shown when a move or AI placement lands on existing events. */
export function ConflictDialog() {
  const { conflict, events, resolveConflict, dismissConflict } = useTimetable();
  if (!conflict) return null;

  const isMove = conflict.kind === 'move';
  const anyLocked = conflict.conflicts.some(e => e.locked);
  const free = findNextFreeSlot(
    events,
    { day: conflict.day, startHour: conflict.startHour, durationHours: conflict.durationHours, week: conflict.week },
    conflict.eventId,
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-[fade-up_0.15s_ease] bg-navy/40 backdrop-blur-sm" onClick={dismissConflict} />
      <div className="relative w-full max-w-sm animate-fade-up overflow-hidden rounded-3xl border border-line/12 bg-surface shadow-glass">
        <div className="flex items-center gap-2.5 border-b border-line/10 px-4 py-3">
          <Icons.AlertTriangle size={18} strokeWidth={2.3} className="shrink-0 text-amber" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">Time conflict</h2>
            <p className="truncate text-[11px] text-ink-mute">
              {isMove ? 'Moving' : 'Placing'} <span className="font-medium text-ink-soft">{conflict.title}</span>
            </p>
          </div>
        </div>

        <div className="px-4 py-3">
          <p className="mb-2 text-[12px] text-ink-soft">
            {DAY_LABELS[conflict.day]}, {formatRange(conflict.startHour, conflict.durationHours)} overlaps:
          </p>
          <div className="mb-1 space-y-1.5">
            {conflict.conflicts.map(e => {
              const colors = CATEGORY_COLORS[e.category];
              const Icon = getIcon(CATEGORY_ICON[e.category]);
              return (
                <div key={e.id} className="flex items-center gap-2 rounded-xl border border-line/10 bg-surface-2 px-2.5 py-1.5">
                  <Icon size={13} strokeWidth={2.4} className="shrink-0" style={{ color: colors.accent }} />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink">{e.title}</span>
                  <span className="shrink-0 text-[10px] text-ink-mute">{formatRange(e.startHour, e.durationHours)}</span>
                  {e.locked && <Icons.ShieldCheck size={12} className="shrink-0 text-ink-mute" />}
                </div>
              );
            })}
          </div>
          {anyLocked && (
            <p className="mt-2 text-[11px] text-ink-mute">
              Locked mentor/company events can't be replaced — choose another slot or place anyway.
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-line/10 px-4 py-3">
          <button
            onClick={() => resolveConflict('next')}
            disabled={!free}
            className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy py-2.5 text-[13px] font-semibold text-white shadow-soft transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand dark:text-navy"
          >
            <Icons.Sparkles size={15} />
            {free ? `Find next free slot (${DAYS[free.day]} ${formatHour(free.startHour)})` : 'No free slot this week'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => resolveConflict('anyway')}
              className="focus-ring flex-1 rounded-xl border border-line/15 py-2 text-[12px] font-semibold text-ink-soft transition hover:bg-line/5"
            >
              {isMove ? 'Move anyway' : 'Place anyway'}
            </button>
            <button
              onClick={() => resolveConflict('replace')}
              disabled={anyLocked}
              className={cn(
                'focus-ring flex-1 rounded-xl border py-2 text-[12px] font-semibold transition',
                anyLocked
                  ? 'cursor-not-allowed border-line/10 text-ink-mute opacity-50'
                  : 'border-wine/30 text-wine hover:bg-wine/10',
              )}
            >
              Replace
            </button>
          </div>
          <button
            onClick={dismissConflict}
            className="focus-ring w-full rounded-xl py-1.5 text-[12px] font-medium text-ink-mute transition hover:text-ink-soft"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
