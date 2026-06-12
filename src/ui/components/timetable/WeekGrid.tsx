import { useMemo } from 'react';
import { useTimetable } from '@/lib/TimetableContext';
import { HOURS, DAYS, SLOT_HEIGHT, formatHour, CATEGORY_COLORS } from '@/lib/timetable.utils';
import type { TimetableEvent } from '@/lib/timetable.types';

const TODAY_COL = 3; // Thursday

function EventBlock({ event }: { event: TimetableEvent }) {
  const colors = CATEGORY_COLORS[event.category];
  const top = (event.startHour - HOURS[0]) * SLOT_HEIGHT;
  const height = Math.max(event.durationHours * SLOT_HEIGHT - 4, 20);

  return (
    <div
      style={{
        position: 'absolute',
        top: top + 2,
        left: 3,
        right: 3,
        height,
        background: colors.bg,
        color: colors.text,
        borderLeft: `2.5px solid ${colors.accent}`,
        borderRadius: 6,
        padding: '4px 6px',
        fontSize: 11,
        fontWeight: 500,
        overflow: 'hidden',
        cursor: 'pointer',
        lineHeight: 1.35,
        zIndex: 1,
      }}
      title={`${event.title}${event.subtitle ? ` — ${event.subtitle}` : ''}`}
    >
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {event.title}
      </div>
      {height > 32 && event.subtitle && (
        <div style={{ fontSize: 9, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {event.subtitle}
        </div>
      )}
    </div>
  );
}

export function WeekGrid() {
  const { events } = useTimetable();

  const eventsByDay = useMemo(() => {
    const map: Record<number, TimetableEvent[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    events.forEach(ev => { map[ev.day]?.push(ev); });
    return map;
  }, [events]);

  const gridHeight = HOURS.length * SLOT_HEIGHT;

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Day header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `52px repeat(5, 1fr)`,
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-secondary)',
        flexShrink: 0,
      }}>
        <div />
        {DAYS.map((day, i) => (
          <div key={day} style={{
            padding: '8px 4px',
            textAlign: 'center',
            fontSize: 11,
            color: i === TODAY_COL ? '#185FA5' : 'var(--color-text-secondary)',
          }}>
            <div>{day}</div>
            <div style={{
              fontSize: 16,
              fontWeight: 500,
              color: i === TODAY_COL ? '#185FA5' : 'var(--color-text-primary)',
              marginTop: 2,
            }}>
              {9 + i}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `52px repeat(5, 1fr)`,
        flex: 1,
        overflow: 'auto',
      }}>
        {/* Time labels */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {HOURS.map(h => (
            <div key={h} style={{
              height: SLOT_HEIGHT,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              paddingRight: 8,
              paddingTop: 2,
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              flexShrink: 0,
            }}>
              {formatHour(h)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS.map((_, dayIdx) => (
          <div key={dayIdx} style={{
            borderLeft: '0.5px solid var(--color-border-tertiary)',
            position: 'relative',
            height: gridHeight,
          }}>
            {/* Hour lines */}
            {HOURS.map(h => (
              <div key={h} style={{
                position: 'absolute',
                top: (h - HOURS[0]) * SLOT_HEIGHT,
                left: 0,
                right: 0,
                height: SLOT_HEIGHT,
                borderBottom: '0.5px solid var(--color-border-tertiary)',
                opacity: 0.6,
              }} />
            ))}

            {/* Today highlight */}
            {dayIdx === TODAY_COL && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(24, 95, 165, 0.03)',
                pointerEvents: 'none',
              }} />
            )}

            {/* Events */}
            {eventsByDay[dayIdx]?.map(event => (
              <EventBlock key={event.id} event={event} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}