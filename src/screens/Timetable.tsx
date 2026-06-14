import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TimetableProvider, useTimetable } from '@/lib/TimetableContext';
import { WeekGrid } from '@/ui/components/timetable/WeekGrid';
import { RightPanel } from '@/ui/components/timetable/RightPanel';
import { ConflictDialog } from '@/ui/components/timetable/ConflictDialog';
import { Icons } from '@/lib/icons';
import { ProgressRing, useToast } from '@/ui/components';
import { useMediaQuery } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { formatWeekLabel, DEFAULT_DAY_INDEX, isCareerEvent } from '@/lib/timetable.utils';

const topBtn =
  'focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-line/15 bg-surface px-3 text-[13px] font-medium text-ink-soft transition hover:bg-line/5';

function TimetableInner() {
  const { addEvent, events, removeEvent, targetNode, targetReadiness, isComplete, pendingPlacement, undo, canUndo } = useTimetable();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [sheetOpen, setSheetOpen] = useState(false);
  const weekParam = Number(searchParams.get('week'));
  const viewWeek = Number.isFinite(weekParam) ? weekParam : 0;
  const eventParam = searchParams.get('event');
  const selectedId = eventParam && events.some((event) => event.id === eventParam) ? eventParam : null;

  const setTimetableParams = (updates: { week?: number; event?: string | null }) => {
    const next = new URLSearchParams(searchParams);
    if (updates.week !== undefined) {
      if (updates.week === 0) next.delete('week');
      else next.set('week', String(updates.week));
    }
    if (updates.event !== undefined) {
      if (updates.event) next.set('event', updates.event);
      else next.delete('event');
    }
    setSearchParams(next);
  };

  // Manual placement needs the grid: drop the mobile sheet so it's reachable.
  useEffect(() => {
    if (pendingPlacement) setSheetOpen(false);
  }, [pendingPlacement]);

  function select(id: string | null) {
    setTimetableParams({ event: id });
    if (id && !isDesktop) setSheetOpen(true);
  }

  function goToWeek(updater: number | ((w: number) => number)) {
    const nextWeek = typeof updater === 'function' ? updater(viewWeek) : updater;
    setTimetableParams({ week: nextWeek, event: null }); // a selected block may not exist in the new week
  }

  function handleUndo() {
    if (!canUndo) return;
    undo();
    select(null);
    toast('Change undone', { icon: Icons.Undo2, tone: 'info' });
  }

  function handleAdd() {
    const ev = addEvent({
      title: 'New event', subtitle: '',
      day: viewWeek === 0 ? DEFAULT_DAY_INDEX : 0,
      startHour: 12, durationHours: 1, category: 'personal', source: 'manual', week: viewWeek,
    });
    select(ev.id);
  }

  function handleCreate(day: number, startHour: number) {
    const ev = addEvent({ title: 'New event', subtitle: '', day, startHour, durationHours: 1, category: 'personal', source: 'manual', week: viewWeek });
    select(ev.id);
  }

  // Keyboard: Delete removes the selected event, Escape clears selection / sheet.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
      if (e.key === 'Escape') {
        select(null);
        setSheetOpen(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z') && !typing) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !typing) {
        const ev = events.find(x => x.id === selectedId);
        if (ev && ev.source === 'company') return; // company events are managed via subscriptions
        e.preventDefault();
        removeEvent(selectedId); // handles mentor cancellation + stored deletion
        select(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, events, removeEvent, canUndo, undo]);

  // Career-investment stats for the week in view.
  const weekCareer = events.filter(e => (e.week ?? 0) === viewWeek && isCareerEvent(e));
  const weekCareerHours = weekCareer.reduce((s, e) => s + e.durationHours, 0);
  const weekCareerTotal = weekCareer.length;
  const weekCareerDone = weekCareer.filter(e => isComplete(e.id)).length;

  return (
    <div className="relative flex h-[calc(100dvh-9rem)] flex-col overflow-hidden bg-surface lg:h-[calc(100dvh-4rem)]">
      {/* Single combined header: career goal (left) + week controls (right) */}
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-line/10 bg-surface px-3 py-2 sm:px-5">
        <button
          onClick={() => navigate(`/node/${targetNode.id}`)}
          className="focus-ring flex min-w-0 items-center gap-2.5 rounded-xl text-left"
          title={`Open ${targetNode.title} on the map`}
        >
          <ProgressRing value={targetReadiness} size={42} stroke={5} />
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[13px] font-semibold text-ink sm:text-sm">
              <span className="truncate">Path to {targetNode.title}</span>
              <Icons.ArrowUpRight size={13} className="shrink-0 text-ink-mute" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink-mute">
              <span className="flex items-center gap-1">
                <Icons.Flame size={11} className="text-accent" /> {weekCareerHours}h
              </span>
              <span aria-hidden>·</span>
              <span>{weekCareerDone}/{weekCareerTotal} done</span>
            </div>
          </div>
        </button>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="mr-1 hidden text-sm font-medium text-ink-soft md:inline">{formatWeekLabel(viewWeek)}</span>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl/⌘ + Z)"
            aria-label="Undo last change"
            className={cn(topBtn, 'w-9 px-0', !canUndo && 'cursor-not-allowed opacity-40')}
          >
            <Icons.Undo2 size={16} />
          </button>
          <button onClick={() => goToWeek(w => w - 1)} className={cn(topBtn, 'w-9 px-0')} aria-label="Previous week">
            <Icons.ChevronLeft size={16} />
          </button>
          <button
            onClick={() => goToWeek(0)}
            className={cn(topBtn, viewWeek === 0 && 'border-brand/40 text-brand')}
          >
            Today
          </button>
          <button onClick={() => goToWeek(w => w + 1)} className={cn(topBtn, 'w-9 px-0')} aria-label="Next week">
            <Icons.ChevronRight size={16} />
          </button>
          <button
            onClick={handleAdd}
            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-xl bg-navy px-3 text-[13px] font-semibold text-white shadow-soft transition hover:bg-navy-600 dark:bg-brand dark:text-navy sm:px-3.5"
          >
            <Icons.CalendarPlus size={16} /> <span className="hidden sm:inline">Add event</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <WeekGrid selectedId={selectedId} onSelect={(e) => select(e.id)} onCreate={handleCreate} viewWeek={viewWeek} />

        {/* Desktop side panel */}
        {isDesktop && (
          <aside className="flex w-[300px] flex-shrink-0 flex-col overflow-hidden border-l border-line/10 bg-surface">
            <RightPanel
              selectedId={selectedId}
              onSelect={select}
              onOpenNode={(id) => navigate(`/node/${id}`)}
              onOpenMentors={() => navigate('/mentors')}
            />
          </aside>
        )}
      </div>

      {/* Mobile: floating panel toggle */}
      {!isDesktop && !sheetOpen && (
        <button
          onClick={() => { select(null); setSheetOpen(true); }}
          aria-label="Open panel"
          className="focus-ring absolute bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white shadow-glass dark:bg-brand dark:text-navy"
        >
          <Icons.SlidersHorizontal size={20} />
        </button>
      )}

      {/* Mobile: bottom sheet */}
      {!isDesktop && sheetOpen && (
        <div className="fixed inset-0 z-[70] flex items-end">
          <div className="absolute inset-0 animate-[fade-up_0.2s_ease] bg-navy/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative flex max-h-[82dvh] w-full animate-fade-up flex-col overflow-hidden rounded-t-3xl border-t border-line/12 bg-surface shadow-glass">
            <div className="mx-auto mt-2.5 h-1 w-10 flex-shrink-0 rounded-full bg-line/20" />
            <button
              onClick={() => setSheetOpen(false)}
              aria-label="Close panel"
              className="focus-ring absolute right-3 top-3 z-10 rounded-lg p-1.5 text-ink-mute transition hover:bg-line/10 hover:text-ink"
            >
              <Icons.X size={18} />
            </button>
            <div className="min-h-0 flex-1 overflow-hidden">
              <RightPanel
                selectedId={selectedId}
                onSelect={select}
                onOpenNode={(id) => { setSheetOpen(false); navigate(`/node/${id}`); }}
                onOpenMentors={() => { setSheetOpen(false); navigate('/mentors'); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Conflict prompt (place anyway / next free slot / replace) */}
      <ConflictDialog />
    </div>
  );
}

export function Timetable() {
  return (
    <TimetableProvider>
      <TimetableInner />
    </TimetableProvider>
  );
}
