import { useEffect, useMemo, useRef, useState } from 'react';
import { useTimetable } from '@/lib/TimetableContext';
import {
  HOURS, DAYS, SLOT_HEIGHT, FOCUS_HOUR, formatHour, CATEGORY_COLORS, CATEGORY_ICON,
  cellDate, TODAY_DAY_INDEX, sameDay, MILESTONE_META,
} from '@/lib/timetable.utils';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import type { TimetableEvent } from '@/lib/timetable.types';

type Layout = { col: number; cols: number };

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

function EventBlock({ event, layout, onSelect, selected, done }: {
  event: TimetableEvent;
  layout: Layout;
  onSelect: (e: TimetableEvent) => void;
  selected: boolean;
  done: boolean;
}) {
  const colors = CATEGORY_COLORS[event.category];
  const Icon = done ? Icons.CheckCircle2 : getIcon(CATEGORY_ICON[event.category]);
  const top = (event.startHour - HOURS[0]) * SLOT_HEIGHT;
  const height = Math.max(event.durationHours * SLOT_HEIGHT - 4, 22);
  const widthPct = 100 / layout.cols;

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onSelect(event); }}
      title={`${event.title}${event.subtitle ? ` — ${event.subtitle}` : ''}`}
      className={cn(
        'focus-ring group absolute flex flex-col gap-0.5 overflow-hidden rounded-lg px-2 py-1 text-left',
        'transition hover:z-10 hover:shadow-soft',
        selected && 'z-10 ring-2 ring-brand ring-offset-1 ring-offset-surface',
        done && 'opacity-60',
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
  const { events, isComplete, milestones } = useTimetable();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={scrollRef} className="flex flex-1 flex-col overflow-auto bg-surface">
      {/* Day header row */}
      <div
        className="sticky top-0 z-20 grid flex-shrink-0 border-b border-line/10 bg-surface-2"
        style={{ gridTemplateColumns: '56px repeat(5, 1fr)' }}
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
      <div className="grid flex-1" style={{ gridTemplateColumns: '56px repeat(5, 1fr)' }}>
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
              onDoubleClick={(e) => {
                const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
                const hour = Math.min(HOURS[HOURS.length - 1], HOURS[0] + Math.floor(y / SLOT_HEIGHT));
                onCreate(dayIdx, hour);
              }}
              title="Double-click to add an event"
              className={cn(
                'group/col relative border-l border-line/10',
                isToday && 'bg-brand/[0.04]',
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
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
