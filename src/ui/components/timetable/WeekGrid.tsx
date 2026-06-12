import { useEffect, useMemo, useRef, useState } from 'react';
import { useTimetable } from '@/lib/TimetableContext';
import {
  HOURS, DAYS, SLOT_HEIGHT, FOCUS_HOUR, formatHour, formatRange, CATEGORY_COLORS, CATEGORY_ICON,
  cellDate, TODAY_DAY_INDEX, sameDay, MILESTONE_META,
} from '@/lib/timetable.utils';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import type { TimetableEvent } from '@/lib/timetable.types';

type Layout = { col: number; cols: number };
type Slot = { day: number; startHour: number };

const TIME_COL = 56; // px width of the left time-label column

/** Absolute-position style for a block at a given day/hour spanning the grid. */
function slotStyle(day: number, startHour: number, durationHours: number) {
  return {
    left: `calc(${TIME_COL}px + ${day} * (100% - ${TIME_COL}px) / 5)`,
    width: `calc((100% - ${TIME_COL}px) / 5)`,
    top: (startHour - HOURS[0]) * SLOT_HEIGHT + 2,
    height: Math.max(durationHours * SLOT_HEIGHT - 4, 22),
  };
}

/** Interval-partition overlapping events in a day into side-by-side columns. */
function packDay(evs: TimetableEvent[]): Map<string, Layout> {
  const res = new Map<string, Layout>();
  const sorted = [...evs].sort((a, b) => a.startHour - b.startHour || a.id.localeCompare(b.id));
  let cluster: TimetableEvent[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const colEnds: number[] = [];
    const colOf = new Map<string, number>();
    cluster.forEach(ev => {
      let c = colEnds.findIndex(end => end <= ev.startHour);
      if (c === -1) { c = colEnds.length; colEnds.push(0); }
      colEnds[c] = ev.startHour + ev.durationHours;
      colOf.set(ev.id, c);
    });
    cluster.forEach(ev => res.set(ev.id, { col: colOf.get(ev.id)!, cols: colEnds.length }));
    cluster = [];
    clusterEnd = -1;
  };

  sorted.forEach(ev => {
    if (cluster.length && ev.startHour >= clusterEnd) flush();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.startHour + ev.durationHours);
  });
  flush();
  return res;
}

function EventBlock({ event, layout, onSelect, selected, done, draggable, dragging, placing, onPlace, onDragBegin, onDragMove, onDragEnd }: {
  event: TimetableEvent;
  layout: Layout;
  onSelect: (e: TimetableEvent) => void;
  selected: boolean;
  done: boolean;
  draggable: boolean;
  dragging: boolean;
  placing: boolean;
  onPlace: (e: TimetableEvent) => void;
  onDragBegin: (e: TimetableEvent, clientX: number, clientY: number) => void;
  onDragMove: (clientX: number, clientY: number) => void;
  onDragEnd: (commit: boolean) => void;
}) {
  const colors = CATEGORY_COLORS[event.category];
  const Icon = done ? Icons.CheckCircle2 : getIcon(CATEGORY_ICON[event.category]);
  const top = (event.startHour - HOURS[0]) * SLOT_HEIGHT;
  const height = Math.max(event.durationHours * SLOT_HEIGHT - 4, 22);
  const widthPct = 100 / layout.cols;

  // Pointer-drag bookkeeping: distinguish a click (select) from a drag (move).
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  function onPointerDown(e: React.PointerEvent) {
    if (!draggable || e.button !== 0) return;
    e.stopPropagation();
    press.current = { x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!press.current) return;
    if (!press.current.moved) {
      if (Math.abs(e.clientX - press.current.x) + Math.abs(e.clientY - press.current.y) < 4) return;
      press.current.moved = true;
      onDragBegin(event, e.clientX, e.clientY);
    }
    onDragMove(e.clientX, e.clientY);
  }
  function onPointerUp() {
    if (press.current?.moved) {
      suppressClick.current = true;
      onDragEnd(true);
    }
    press.current = null;
  }

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(e) => {
        e.stopPropagation();
        if (placing) { onPlace(event); return; }
        if (suppressClick.current) { suppressClick.current = false; return; }
        onSelect(event);
      }}
      title={placing ? 'Place the block here' : `${event.title}${event.subtitle ? ` — ${event.subtitle}` : ''}`}
      className={cn(
        'focus-ring group absolute flex flex-col gap-0.5 overflow-hidden rounded-lg px-2 py-1 text-left touch-none',
        'transition-shadow hover:z-10 hover:shadow-soft',
        placing && 'cursor-copy',
        draggable && 'cursor-grab active:cursor-grabbing',
        selected && 'z-10 ring-2 ring-brand ring-offset-1 ring-offset-surface',
        done && 'opacity-60',
        dragging && 'opacity-30',
      )}
      style={{
        top: top + 2,
        height,
        left: `calc(${layout.col * widthPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        background: colors.bg,
        color: colors.text,
        borderLeft: `3px solid ${colors.accent}`,
        zIndex: selected ? 12 : 1,
      }}
    >
      <span className="flex items-center gap-1 overflow-hidden">
        <Icon size={11} strokeWidth={2.4} className="shrink-0 opacity-80" />
        <span className={cn('truncate text-[11px] font-semibold leading-tight', done && 'line-through')}>{event.title}</span>
      </span>
      {height > 34 && event.subtitle && layout.cols < 3 && (
        <span className="truncate text-[9px] leading-tight opacity-70">{event.subtitle}</span>
      )}
    </button>
  );
}

export function WeekGrid({ selectedId, onSelect, onCreate, viewWeek }: {
  selectedId: string | null;
  onSelect: (e: TimetableEvent) => void;
  onCreate: (day: number, startHour: number) => void;
  viewWeek: number;
}) {
  const { events, isComplete, milestones, requestMove, pendingPlacement, placeSuggestionAt, cancelPlacement } = useTimetable();
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Tick the "now" indicator every minute (only matters on the current week).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // 24h grid, but open focused on the daytime window (7am near the top).
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = FOCUS_HOUR * SLOT_HEIGHT;
  }, []);

  // ---- Drag-to-move -------------------------------------------------------
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragSlot, setDragSlot] = useState<Slot | null>(null);
  const dragInfo = useRef<{ grabOffset: number; duration: number } | null>(null);

  /** Convert a pointer position into a grid {day, startHour} for a block. */
  function pointerToSlot(clientX: number, clientY: number, grabOffset: number, duration: number): Slot {
    const rect = gridRef.current!.getBoundingClientRect();
    const colW = (rect.width - TIME_COL) / 5;
    const day = Math.max(0, Math.min(4, Math.floor((clientX - rect.left - TIME_COL) / colW)));
    const pointerHour = (clientY - rect.top) / SLOT_HEIGHT;
    const maxStart = HOURS[HOURS.length - 1] + 1 - duration;
    const startHour = Math.max(HOURS[0], Math.min(maxStart, Math.round(pointerHour - grabOffset) + HOURS[0]));
    return { day, startHour };
  }

  function onDragBegin(ev: TimetableEvent, _x: number, clientY: number) {
    const rect = gridRef.current!.getBoundingClientRect();
    const pointerHour = (clientY - rect.top) / SLOT_HEIGHT;
    dragInfo.current = { grabOffset: pointerHour - (ev.startHour - HOURS[0]), duration: ev.durationHours };
    setDragId(ev.id);
    setDragSlot({ day: ev.day, startHour: ev.startHour });
  }
  function onDragMove(clientX: number, clientY: number) {
    if (!dragInfo.current || !gridRef.current) return;
    setDragSlot(pointerToSlot(clientX, clientY, dragInfo.current.grabOffset, dragInfo.current.duration));
  }
  function onDragEnd(commit: boolean) {
    if (commit && dragId && dragSlot) {
      const ev = events.find(e => e.id === dragId);
      if (ev && (ev.day !== dragSlot.day || ev.startHour !== dragSlot.startHour)) {
        requestMove(dragId, dragSlot.day, dragSlot.startHour, viewWeek);
      }
    }
    setDragId(null);
    setDragSlot(null);
    dragInfo.current = null;
  }

  // ---- Manual placement (Coach "pick a slot") ----------------------------
  function placeAtHour(dayIdx: number, startHour: number) {
    if (!pendingPlacement) return;
    const maxStart = HOURS[HOURS.length - 1] + 1 - pendingPlacement.durationHours;
    const hour = Math.max(HOURS[0], Math.min(maxStart, startHour));
    placeSuggestionAt(dayIdx, hour, viewWeek);
  }
  function placeAtClientY(dayIdx: number, clientY: number) {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    placeAtHour(dayIdx, HOURS[0] + Math.floor((clientY - rect.top) / SLOT_HEIGHT));
  }

  const eventsByDay = useMemo(() => {
    const map: Record<number, TimetableEvent[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    // Recurring blocks appear every week; one-off blocks only on their own week.
    events.forEach(ev => {
      if (ev.recurring || (ev.week ?? 0) === viewWeek) map[ev.day]?.push(ev);
    });
    return map;
  }, [events, viewWeek]);

  const layouts = useMemo(() => {
    const map: Record<number, Map<string, Layout>> = { 0: new Map(), 1: new Map(), 2: new Map(), 3: new Map(), 4: new Map() };
    for (let d = 0; d < 5; d++) map[d] = packDay(eventsByDay[d]);
    return map;
  }, [eventsByDay]);

  const gridHeight = HOURS.length * SLOT_HEIGHT;
  const isCurrentWeek = viewWeek === 0;
  const nowFraction = now.getHours() + now.getMinutes() / 60;
  const nowVisible = isCurrentWeek && nowFraction >= HOURS[0] && nowFraction <= HOURS[HOURS.length - 1] + 1;
  const nowTop = (nowFraction - HOURS[0]) * SLOT_HEIGHT;

  const dragEvent = dragId ? events.find(e => e.id === dragId) ?? null : null;
  const placing = Boolean(pendingPlacement);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Manual-placement banner */}
      {pendingPlacement && (
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-brand/30 bg-brand/10 px-3 py-2 text-[12px] text-brand sm:px-5">
          <Icons.MousePointerClick size={15} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            Click a slot to place <span className="font-semibold">{pendingPlacement.title}</span> — the recommended slot is highlighted.
          </span>
          <button
            onClick={cancelPlacement}
            className="focus-ring shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand transition hover:bg-brand/15"
          >
            Cancel
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex flex-1 flex-col overflow-auto bg-surface">
        {/* Day header row */}
        <div
          className="sticky top-0 z-20 grid flex-shrink-0 border-b border-line/10 bg-surface-2"
          style={{ gridTemplateColumns: `${TIME_COL}px repeat(5, 1fr)` }}
        >
          <div />
          {DAYS.map((day, i) => {
            const isToday = isCurrentWeek && i === TODAY_DAY_INDEX;
            const date = cellDate(viewWeek, i);
            const dayMilestones = milestones.filter(m => sameDay(new Date(`${m.date}T00:00:00`), date));
            return (
              <div key={day} className="px-1 py-2 text-center">
                <div className={cn('text-[11px] font-medium uppercase tracking-wide', isToday ? 'text-brand' : 'text-ink-mute')}>
                  {day}
                </div>
                <div
                  className={cn(
                    'mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[15px] font-semibold',
                    isToday ? 'bg-brand text-white' : 'text-ink',
                  )}
                >
                  {date.getDate()}
                </div>
                <div className="mt-1 flex h-1.5 items-center justify-center gap-0.5">
                  {dayMilestones.slice(0, 3).map(m => (
                    <span
                      key={m.id}
                      title={m.title}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: MILESTONE_META[m.type].accent }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div ref={gridRef} className="relative grid flex-1" style={{ gridTemplateColumns: `${TIME_COL}px repeat(5, 1fr)` }}>
          {/* Time labels */}
          <div className="flex flex-col">
            {HOURS.map(h => (
              <div
                key={h}
                className="flex flex-shrink-0 items-start justify-end pr-2 pt-1 text-[10px] text-ink-mute"
                style={{ height: SLOT_HEIGHT }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((_, dayIdx) => {
            const isToday = isCurrentWeek && dayIdx === TODAY_DAY_INDEX;
            return (
              <div
                key={dayIdx}
                onClick={placing ? (e) => placeAtClientY(dayIdx, e.clientY) : undefined}
                onDoubleClick={placing ? undefined : (e) => {
                  const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                  const hour = Math.min(HOURS[HOURS.length - 1], HOURS[0] + Math.floor(y / SLOT_HEIGHT));
                  onCreate(dayIdx, hour);
                }}
                title={placing ? 'Click to place the block here' : 'Double-click to add an event'}
                className={cn(
                  'group/col relative border-l border-line/10',
                  isToday && 'bg-brand/[0.04]',
                  placing && 'cursor-copy',
                )}
                style={{ height: gridHeight }}
              >
                {/* Hour lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-b border-line/[0.07]"
                    style={{ top: (h - HOURS[0]) * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                  />
                ))}

                {/* Now indicator */}
                {isToday && nowVisible && (
                  <div className="pointer-events-none absolute inset-x-0 z-[5]" style={{ top: nowTop }}>
                    <div className="relative h-px bg-wine">
                      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-wine" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {eventsByDay[dayIdx]?.map(event => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    layout={layouts[dayIdx].get(event.id) ?? { col: 0, cols: 1 }}
                    onSelect={onSelect}
                    selected={event.id === selectedId}
                    done={isComplete(event.id)}
                    draggable={!event.locked && !placing}
                    dragging={event.id === dragId}
                    placing={placing}
                    onPlace={(e) => placeAtHour(e.day, e.startHour)}
                    onDragBegin={onDragBegin}
                    onDragMove={onDragMove}
                    onDragEnd={onDragEnd}
                  />
                ))}
              </div>
            );
          })}

          {/* Recommended-slot highlight during manual placement */}
          {pendingPlacement && (
            <div
              className="pointer-events-none absolute z-30 flex flex-col justify-center rounded-lg border-2 border-dashed border-brand bg-brand/10 px-2 text-center"
              style={slotStyle(pendingPlacement.day, pendingPlacement.startHour, pendingPlacement.durationHours)}
            >
              <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-brand">Recommended</span>
            </div>
          )}

          {/* Drag preview */}
          {dragEvent && dragSlot && (
            <div
              className="pointer-events-none absolute z-40 flex flex-col gap-0.5 overflow-hidden rounded-lg px-2 py-1 shadow-soft ring-2 ring-brand"
              style={{
                ...slotStyle(dragSlot.day, dragSlot.startHour, dragEvent.durationHours),
                background: CATEGORY_COLORS[dragEvent.category].bg,
                color: CATEGORY_COLORS[dragEvent.category].text,
                borderLeft: `3px solid ${CATEGORY_COLORS[dragEvent.category].accent}`,
              }}
            >
              <span className="truncate text-[11px] font-semibold leading-tight">{dragEvent.title}</span>
              <span className="text-[9px] leading-tight opacity-80">{formatRange(dragSlot.startHour, dragEvent.durationHours)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
