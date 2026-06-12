import { useState, useRef } from 'react';
import { useTimetable } from '@/lib/TimetableContext';

type Tab = 'calendars' | 'events' | 'ai';

const COMPANY_COLORS: Record<string, { bg: string; text: string }> = {
  'ca-coral':  { bg: '#FAECE7', text: '#993C1D' },
  'ca-teal':   { bg: '#E1F5EE', text: '#0F6E56' },
  'ca-blue':   { bg: '#E6F1FB', text: '#185FA5' },
  'ca-amber':  { bg: '#FAEEDA', text: '#854F0B' },
  'ca-pink':   { bg: '#FBEAF0', text: '#993556' },
  'ca-purple': { bg: '#EEEDFE', text: '#3C3489' },
};

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      aria-label={label}
      style={{
        width: 32,
        height: 18,
        borderRadius: 9,
        background: on ? '#185FA5' : 'var(--color-border-secondary)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: '#fff',
        top: 3,
        left: on ? 16 : 3,
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

function CalendarsTab() {
  const { calendars, connectCalendar } = useTimetable();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file.name);
  }

  const providerIcon: Record<string, string> = {
    google: 'ti-brand-google',
    ical: 'ti-calendar',
    upload: 'ti-file-text',
  };

  const providerBg: Record<string, string> = {
    google: '#E6F1FB',
    ical: '#EEEDFE',
    upload: '#E1F5EE',
  };

  const providerText: Record<string, string> = {
    google: '#185FA5',
    ical: '#534AB7',
    upload: '#0F6E56',
  };

  return (
    <div style={{ padding: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
        Upload schedule
      </p>

      <input ref={fileRef} type="file" accept=".ics,.pdf,.csv" style={{ display: 'none' }} onChange={handleFile} />
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1px dashed ${dragging ? '#185FA5' : 'var(--color-border-secondary)'}`,
          borderRadius: 'var(--border-radius-md)',
          padding: '14px 10px',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 12,
          marginBottom: 14,
          cursor: 'pointer',
          background: dragging ? 'var(--color-background-info)' : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        <i className="ti ti-file-upload" aria-hidden="true" style={{ fontSize: 22, display: 'block', marginBottom: 4, color: 'var(--color-text-tertiary)' }} />
        {uploadedFile ? (
          <span style={{ color: '#0F6E56', fontWeight: 500 }}>
            <i className="ti ti-check" /> {uploadedFile}
          </span>
        ) : (
          <>Drop .ics or PDF timetable<br /><span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>from your student portal</span></>
        )}
      </div>

      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
        Connected calendars
      </p>

      {calendars.map(cal => (
        <div key={cal.id} style={{
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-md)',
          padding: '9px 10px',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6,
            background: providerBg[cal.provider], color: providerText[cal.provider],
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className={`ti ${providerIcon[cal.provider]}`} aria-hidden="true" style={{ fontSize: 16 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cal.name}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{cal.email ?? (cal.connected ? 'Synced' : 'Not connected')}</div>
          </div>
          {cal.connected ? (
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#EAF3DE', color: '#3B6D11' }}>Synced</span>
          ) : (
            <button onClick={() => connectCalendar(cal.id)} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: '#E6F1FB', color: '#185FA5', border: 'none', cursor: 'pointer',
            }}>Connect</button>
          )}
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
          Legend
        </p>
        {[
          { color: '#185FA5', label: 'University classes' },
          { color: '#0F6E56', label: 'Company events' },
          { color: '#534AB7', label: 'Personal' },
          { color: '#BA7517', label: 'Gym / meal prep' },
          { color: '#D4537E', label: 'Social' },
          { color: '#7F77DD', label: 'Deep work' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginBottom: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsTab() {
  const { companies, toggleCompany } = useTimetable();

  return (
    <div style={{ padding: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
        Event channels
      </p>
      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
        Subscribe to companies — their events auto-appear on your timetable.
      </p>
      <div>
        {companies.map(company => {
          const colors = COMPANY_COLORS[company.colorClass] ?? { bg: '#F1EFE8', text: '#444441' };
          return (
            <div key={company.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
              borderBottom: '0.5px solid var(--color-border-tertiary)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: colors.bg, color: colors.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 500, flexShrink: 0,
              }}>
                {company.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {company.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{company.tag}</div>
              </div>
              <Toggle on={company.subscribed} onChange={() => toggleCompany(company.id)} label={`Subscribe to ${company.name}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AITab() {
  const { goals, toggleGoal, aiSuggestions, aiLoading, aiSummary, runAIOptimization, applySuggestion, dismissSuggestion } = useTimetable();

  const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    gym:    { bg: '#FAEEDA', text: '#633806' },
    meal:   { bg: '#FAEEDA', text: '#854F0B' },
    social: { bg: '#FBEAF0', text: '#993556' },
    grind:  { bg: '#EEEDFE', text: '#3C3489' },
    break:  { bg: '#F1EFE8', text: '#5F5E5A' },
  };

  return (
    <div style={{ padding: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
        Lifestyle goals
      </p>
      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
        Tell the AI what to optimise for.
      </p>

      {goals.map(goal => (
        <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: goal.enabled ? '#E6F1FB' : 'var(--color-background-secondary)',
            color: goal.enabled ? '#185FA5' : 'var(--color-text-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className={`ti ${goal.icon}`} aria-hidden="true" style={{ fontSize: 15 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{goal.label}</div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{goal.detail}</div>
          </div>
          <Toggle on={goal.enabled} onChange={() => toggleGoal(goal.id)} label={`Enable ${goal.label} goal`} />
        </div>
      ))}

      <button
        onClick={runAIOptimization}
        disabled={aiLoading}
        style={{
          width: '100%', marginTop: 12, padding: '9px 0',
          background: aiLoading ? 'var(--color-background-secondary)' : '#185FA5',
          color: aiLoading ? 'var(--color-text-secondary)' : '#E6F1FB',
          border: 'none', borderRadius: 'var(--border-radius-md)',
          fontSize: 13, fontWeight: 500, cursor: aiLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        {aiLoading
          ? <><i className="ti ti-loader-2" style={{ fontSize: 15, animation: 'spin 1s linear infinite' }} aria-hidden="true" /> Optimising…</>
          : <><i className="ti ti-sparkles" aria-hidden="true" style={{ fontSize: 15 }} /> Optimise my week</>
        }
      </button>

      {aiSummary && (
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: 'var(--color-background-secondary)',
          borderRadius: 'var(--border-radius-md)',
          fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5,
        }}>
          {aiSummary}
        </div>
      )}

      {aiSuggestions.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            Suggestions
          </p>
          {aiSuggestions.map(s => {
            const colors = TYPE_COLORS[s.type] ?? { bg: '#F1EFE8', text: '#5F5E5A' };
            return (
              <div key={s.id} style={{
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                padding: '9px 10px',
                marginBottom: 8,
                opacity: s.applied ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <span style={{
                    padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                    background: colors.bg, color: colors.text,
                  }}>
                    <i className={`ti ${s.icon}`} aria-hidden="true" /> {s.title}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.45 }}>{s.reason}</p>
                {!s.applied ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => applySuggestion(s.id)} style={{
                      flex: 1, padding: '5px 0', fontSize: 11, fontWeight: 500,
                      background: '#185FA5', color: '#E6F1FB',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                    }}>Add to calendar</button>
                    <button onClick={() => dismissSuggestion(s.id)} style={{
                      padding: '5px 8px', fontSize: 11,
                      background: 'transparent', color: 'var(--color-text-secondary)',
                      border: '0.5px solid var(--color-border-tertiary)', borderRadius: 6, cursor: 'pointer',
                    }}>Dismiss</button>
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: '#3B6D11' }}><i className="ti ti-check" /> Added to calendar</span>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function RightPanel() {
  const [tab, setTab] = useState<Tab>('calendars');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'calendars', label: 'Calendars', icon: 'ti-calendar' },
    { id: 'events', label: 'Events', icon: 'ti-building' },
    { id: 'ai', label: 'AI', icon: 'ti-sparkles' },
  ];

  return (
    <div style={{
      width: 252,
      borderLeft: '0.5px solid var(--color-border-tertiary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--color-background-primary)',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--color-border-tertiary)', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 4px',
            background: 'transparent', border: 'none',
            borderBottom: `2px solid ${tab === t.id ? '#185FA5' : 'transparent'}`,
            fontSize: 12, fontWeight: tab === t.id ? 500 : 400,
            color: tab === t.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <i className={`ti ${t.icon}`} aria-hidden="true" style={{ fontSize: 13 }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'calendars' && <CalendarsTab />}
        {tab === 'events' && <EventsTab />}
        {tab === 'ai' && <AITab />}
      </div>
    </div>
  );
}