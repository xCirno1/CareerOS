import { TimetableProvider } from '@/lib/TimetableContext';
import { WeekGrid } from '../ui/components/timetable/WeekGrid';
import { RightPanel } from '../ui/components/timetable/RightPanel';

const WEEK_LABEL = 'Week of Jun 9';

function TimetableInner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      background: 'var(--color-background-primary)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 20px',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        background: 'var(--color-background-primary)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 15, fontWeight: 500, flex: 1 }}>
          Timetable — {WEEK_LABEL}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle}>
            <i className="ti ti-chevron-left" aria-label="Previous week" />
          </button>
          <button style={btnStyle}>Today</button>
          <button style={btnStyle}>
            <i className="ti ti-chevron-right" aria-label="Next week" />
          </button>
          <button style={{ ...btnStyle, background: '#185FA5', borderColor: '#185FA5', color: '#E6F1FB' }}>
            <i className="ti ti-plus" aria-hidden="true" /> Add event
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <WeekGrid />
        <RightPanel />
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 13px',
  border: '0.5px solid var(--color-border-secondary)',
  borderRadius: 'var(--border-radius-md)',
  fontSize: 13,
  cursor: 'pointer',
  background: 'var(--color-background-primary)',
  color: 'var(--color-text-primary)',
};

export function Timetable() {
  return (
    <TimetableProvider>
      <TimetableInner />
    </TimetableProvider>
  );
}