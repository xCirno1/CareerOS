import { useState, useRef } from 'react';
import { useTimetable } from '@/lib/TimetableContext';
import { Icons, getIcon } from '@/lib/icons';
import { Toggle, TextField } from '@/ui/components';
import {
  CATEGORY_COLORS,
  CATEGORY_ICON,
  CATEGORY_LABEL,
  ALL_CATEGORIES,
  DAY_LABELS,
  HOURS,
  formatHour,
  formatRange,
  MILESTONE_META,
  MILESTONE_TYPES,
  daysUntil,
  formatCountdown,
  toISODate,
  cellDate,
  TODAY_DAY_INDEX,
} from '@/lib/timetable.utils';
import { cn } from '@/lib/cn';
import { NODES, getNode, getNodeIcon } from '@/lib/mockData';
import type { EventCategory, MilestoneType, TimetableEvent } from '@/lib/timetable.types';
import type { LucideIcon } from '@/lib/icons';

// Roles / career tracks the user can tie a study or prep block to.
const CAREER_ROLE_NODES = NODES
  .filter(n => n.kind === 'job' || n.kind === 'career')
  .sort((a, b) => a.title.localeCompare(b.title));

type Tab = 'coach' | 'plan' | 'events' | 'calendars';

const COMPANY_COLORS: Record<string, { bg: string; text: string }> = {
  'ca-coral':  { bg: '#FAECE7', text: '#993C1D' },
  'ca-teal':   { bg: '#E1F5EE', text: '#0F6E56' },
  'ca-blue':   { bg: '#E6F1FB', text: '#185FA5' },
  'ca-amber':  { bg: '#FAEEDA', text: '#854F0B' },
  'ca-pink':   { bg: '#FBEAF0', text: '#993556' },
  'ca-purple': { bg: '#EEEDFE', text: '#3C3489' },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-mute">
      {children}
    </p>
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

  const providerIcon: Record<string, LucideIcon> = {
    google: Icons.Mail,
    ical: Icons.Calendar,
    upload: Icons.FileUp,
  };

  const legend: { category: EventCategory; label: string }[] = [
    { category: 'uni', label: 'University classes' },
    { category: 'company', label: 'Company events' },
    { category: 'personal', label: 'Personal' },
    { category: 'gym', label: 'Gym / meal prep' },
    { category: 'social', label: 'Social' },
    { category: 'grind', label: 'Deep work' },
  ];

  return (
    <div className="p-4">
      <SectionLabel>Upload schedule</SectionLabel>

      <input ref={fileRef} type="file" accept=".ics,.pdf,.csv" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          'mb-5 flex w-full flex-col items-center gap-1.5 rounded-2xl border border-dashed px-3 py-4 text-center text-xs transition',
          dragging ? 'border-brand bg-brand/5 text-brand' : 'border-line/20 text-ink-mute hover:border-line/30 hover:bg-line/[0.03]',
        )}
      >
        {uploadedFile ? (
          <span className="flex items-center gap-1.5 font-semibold text-brand">
            <Icons.Check size={15} /> {uploadedFile}
          </span>
        ) : (
          <>
            <Icons.Upload size={22} className="text-ink-mute" />
            <span className="text-ink-soft">Drop .ics or PDF timetable</span>
            <span className="text-[10px] text-ink-mute">from your student portal</span>
          </>
        )}
      </button>

      <SectionLabel>Connected calendars</SectionLabel>
      <div className="space-y-2">
        {calendars.map(cal => {
          const Icon = providerIcon[cal.provider] ?? Icons.Calendar;
          return (
            <div key={cal.id} className="flex items-center gap-2.5 rounded-2xl border border-line/10 bg-surface px-3 py-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${cal.color}1A`, color: cal.color }}
              >
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-ink">{cal.name}</div>
                <div className="text-[10px] text-ink-mute">{cal.email ?? (cal.connected ? 'Synced' : 'Not connected')}</div>
              </div>
              {cal.connected ? (
                <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                  <Icons.Check size={11} /> Synced
                </span>
              ) : (
                <button
                  onClick={() => connectCalendar(cal.id)}
                  className="focus-ring rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold text-ink-soft transition hover:bg-line/10"
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <SectionLabel>Legend</SectionLabel>
        <div className="space-y-1.5">
          {legend.map(item => (
            <div key={item.category} className="flex items-center gap-2 text-[11px] text-ink-soft">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: CATEGORY_COLORS[item.category].accent }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelAvatar({ initials, colorClass }: { initials: string; colorClass: string }) {
  const colors = COMPANY_COLORS[colorClass] ?? { bg: '#F1EFE8', text: '#444441' };
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold"
      style={{ background: colors.bg, color: colors.text }}
    >
      {initials}
    </div>
  );
}

function EventsTab() {
  const { companies, toggleCompany, addToLibrary, removeFromLibrary } = useTimetable();
  const library = companies.filter(c => c.inLibrary);
  const discover = companies.filter(c => !c.inLibrary);

  return (
    <div className="p-4">
      <SectionLabel>My library</SectionLabel>
      <p className="mb-3 text-[11px] leading-relaxed text-ink-soft">
        Saved event channels. Toggle one on to drop its events onto your timetable.
      </p>

      {library.length === 0 ? (
        <p className="mb-2 rounded-2xl bg-surface-2 p-3 text-center text-[11px] text-ink-mute">
          Nothing saved yet — add channels from Discover below.
        </p>
      ) : (
        <div className="mb-5 space-y-1">
          {library.map(c => (
            <div key={c.id} className="group flex items-center gap-2.5 rounded-xl px-1 py-2">
              <ChannelAvatar initials={c.initials} colorClass={c.colorClass} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-ink">{c.name}</div>
                <div className="text-[10px] text-ink-mute">{c.tag}</div>
              </div>
              <button
                onClick={() => removeFromLibrary(c.id)}
                aria-label={`Remove ${c.name} from library`}
                className="focus-ring rounded-md p-1 text-ink-mute opacity-0 transition hover:bg-line/10 hover:text-wine group-hover:opacity-100"
              >
                <Icons.Trash2 size={14} />
              </button>
              <Toggle checked={c.enabled} onChange={() => toggleCompany(c.id)} label={`Show ${c.name} events`} />
            </div>
          ))}
        </div>
      )}

      <SectionLabel>Discover</SectionLabel>
      <div className="space-y-1">
        {discover.length === 0 ? (
          <p className="text-[11px] text-ink-mute">You've added every channel.</p>
        ) : discover.map(c => (
          <div key={c.id} className="flex items-center gap-2.5 rounded-xl px-1 py-2">
            <ChannelAvatar initials={c.initials} colorClass={c.colorClass} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-ink">{c.name}</div>
              <div className="text-[10px] text-ink-mute">{c.tag}</div>
            </div>
            <button
              onClick={() => addToLibrary(c.id)}
              className="focus-ring flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft transition hover:bg-line/10"
            >
              <Icons.Plus size={13} /> Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoachTab({ onOpenMentors }: { onOpenMentors: () => void }) {
  const {
    targetNode, focusSkills, toggleFocusSkill,
    aiSuggestions, aiLoading, aiSummary, runAIOptimization, applySuggestion, dismissSuggestion,
  } = useTimetable();

  return (
    <div className="p-4">
      <SectionLabel>Skills to build for {targetNode.title}</SectionLabel>
      <p className="mb-3 text-[11px] leading-relaxed text-ink-soft">
        Pick the skills to focus on — the planner slots prep time into your free windows.
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {focusSkills.map(skill => (
          <button
            key={skill.id}
            onClick={() => toggleFocusSkill(skill.id)}
            className={cn(
              'focus-ring rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
              skill.enabled
                ? 'border-brand/40 bg-brand/10 text-brand'
                : 'border-line/15 text-ink-mute hover:border-line/30',
            )}
          >
            {skill.enabled && <Icons.Check size={11} className="mr-1 inline" />}
            {skill.label}
          </button>
        ))}
      </div>

      <button
        onClick={runAIOptimization}
        disabled={aiLoading}
        className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-2xl bg-navy py-2.5 text-[13px] font-semibold text-white shadow-soft transition hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand dark:text-navy"
      >
        {aiLoading ? (
          <><Icons.Loader2 size={15} className="animate-spin" /> Planning…</>
        ) : (
          <><Icons.Sparkles size={15} /> Plan my week toward {targetNode.title.split(' ')[0]}</>
        )}
      </button>

      {aiSummary && (
        <div className="mt-4 rounded-2xl bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
          {aiSummary}
        </div>
      )}

      {aiSuggestions.length > 0 && (
        <div className="mt-4">
          <SectionLabel>Prep blocks</SectionLabel>
          <div className="space-y-2">
            {aiSuggestions.map(s => {
              const colors = CATEGORY_COLORS[s.type] ?? CATEGORY_COLORS.grind;
              const Icon = getIcon(CATEGORY_ICON[s.type] ?? 'Sparkles');
              return (
                <div
                  key={s.id}
                  className={cn('rounded-2xl border border-line/10 bg-surface p-3', s.applied && 'opacity-60')}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      <Icon size={11} strokeWidth={2.4} /> {s.title}
                    </span>
                  </div>
                  <p className="mb-2.5 text-[11px] leading-relaxed text-ink-soft">{s.reason}</p>
                  {!s.applied ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => applySuggestion(s.id)}
                        className="focus-ring flex-1 rounded-lg bg-navy py-1.5 text-[11px] font-semibold text-white transition hover:bg-navy-600 dark:bg-brand dark:text-navy"
                      >
                        Add to week
                      </button>
                      <button
                        onClick={() => dismissSuggestion(s.id)}
                        className="focus-ring rounded-lg border border-line/15 px-2.5 py-1.5 text-[11px] font-medium text-ink-soft transition hover:bg-line/5"
                      >
                        Dismiss
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-brand">
                      <Icons.Check size={12} /> Added to your week
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onOpenMentors}
        className="focus-ring mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-line/12 bg-surface py-2.5 text-[13px] font-semibold text-ink-soft transition hover:border-brand/40"
      >
        <Icons.Users size={15} /> Book a mentor for these skills
      </button>
    </div>
  );
}

function PlanTab({ onOpenNode }: { onOpenNode: (id: string) => void }) {
  const { milestones, addMilestone, removeMilestone } = useTimetable();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MilestoneType>('deadline');
  const [date, setDate] = useState(toISODate(cellDate(0, TODAY_DAY_INDEX)));

  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));

  function submit() {
    if (!title.trim()) return;
    addMilestone({ title: title.trim(), type, date });
    setTitle('');
    setAdding(false);
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Upcoming milestones</SectionLabel>
        <button
          onClick={() => setAdding(v => !v)}
          className="focus-ring -mt-2 rounded-lg p-1 text-ink-mute transition hover:bg-line/10 hover:text-ink"
          aria-label="Add milestone"
        >
          {adding ? <Icons.X size={16} /> : <Icons.Plus size={16} />}
        </button>
      </div>

      {adding && (
        <div className="mb-4 space-y-2 rounded-2xl border border-line/12 bg-surface p-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Stripe application due"
            className="focus-ring h-9 w-full rounded-xl border border-line/15 bg-surface px-3 text-sm text-ink outline-none focus:border-brand/50"
          />
          <div className="flex gap-2">
            <select className={fieldSelect} value={type} onChange={e => setType(e.target.value as MilestoneType)}>
              {MILESTONE_TYPES.map(t => <option key={t} value={t}>{MILESTONE_META[t].label}</option>)}
            </select>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="focus-ring h-10 w-full rounded-xl border border-line/15 bg-surface px-3 text-sm text-ink outline-none focus:border-brand/50"
            />
          </div>
          <button
            onClick={submit}
            className="focus-ring w-full rounded-xl bg-navy py-2 text-[13px] font-semibold text-white transition hover:bg-navy-600 dark:bg-brand dark:text-navy"
          >
            Add milestone
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="px-1 py-8 text-center text-xs text-ink-mute">No milestones yet. Add an application or interview date.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(m => {
            const meta = MILESTONE_META[m.type];
            const MIcon = getIcon(meta.icon);
            const days = daysUntil(m.date);
            const node = m.nodeId ? getNode(m.nodeId) : undefined;
            return (
              <div key={m.id} className="group rounded-2xl border border-line/10 bg-surface p-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${meta.accent}1A`, color: meta.accent }}
                  >
                    <MIcon size={16} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-ink">{m.title}</div>
                    <div className="text-[10px] text-ink-mute">{meta.label}</div>
                  </div>
                  <button
                    onClick={() => removeMilestone(m.id)}
                    aria-label="Remove milestone"
                    className="focus-ring rounded-md p-1 text-ink-mute opacity-0 transition hover:bg-line/10 hover:text-wine group-hover:opacity-100"
                  >
                    <Icons.X size={14} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      days < 0 ? 'bg-line/10 text-ink-mute' : days <= 3 ? 'bg-wine/12 text-wine' : 'bg-brand/10 text-brand',
                    )}
                  >
                    {formatCountdown(m.date)}
                  </span>
                  {node && (
                    <button
                      onClick={() => onOpenNode(node.id)}
                      className="focus-ring flex items-center gap-1 text-[11px] font-medium text-ink-soft transition hover:text-brand"
                    >
                      {node.title} <Icons.ArrowUpRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const fieldSelect =
  'focus-ring h-10 w-full rounded-xl border border-line/15 bg-surface px-3 text-sm text-ink outline-none transition focus:border-brand/50';

function DetailRow({ icon: RowIcon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-ink-soft">
      <RowIcon size={15} className="shrink-0 text-ink-mute" />
      {children}
    </div>
  );
}

function EditorHeader({ event, onClose, title }: { event: TimetableEvent; onClose: () => void; title: string }) {
  const colors = CATEGORY_COLORS[event.category];
  const Icon = getIcon(CATEGORY_ICON[event.category]);
  return (
    <div className="flex flex-shrink-0 items-center gap-2 border-b border-line/10 px-3 py-2.5">
      <button
        onClick={onClose}
        aria-label="Back to panels"
        className="focus-ring rounded-lg p-1.5 text-ink-mute transition hover:bg-line/10 hover:text-ink"
      >
        <Icons.ChevronLeft size={18} />
      </button>
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: colors.bg, color: colors.text }}>
        <Icon size={15} strokeWidth={2.2} />
      </div>
      <span className="flex-1 truncate text-sm font-semibold text-ink">{title}</span>
    </div>
  );
}

function LinkedNodeButton({ nodeId, onOpenNode }: { nodeId: string; onOpenNode: (id: string) => void }) {
  const node = getNode(nodeId);
  if (!node) return null;
  const NodeIcon = getIcon(getNodeIcon(node));
  return (
    <button
      onClick={() => onOpenNode(node.id)}
      className="focus-ring flex w-full items-center gap-2.5 rounded-2xl border border-line/12 bg-surface p-3 text-left transition hover:border-brand/40"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <NodeIcon size={17} strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-mute">Linked role</span>
        <span className="block truncate text-sm font-semibold text-ink">{node.title}</span>
      </span>
      <Icons.ArrowUpRight size={16} className="shrink-0 text-ink-mute" />
    </button>
  );
}

function LockedDetail({ event, onClose, onOpenNode, onOpenMentors }: {
  event: TimetableEvent;
  onClose: () => void;
  onOpenNode: (id: string) => void;
  onOpenMentors: () => void;
}) {
  const { removeEvent, isComplete, toggleComplete } = useTimetable();
  const isMentor = event.source === 'mentor';
  const done = isComplete(event.id);

  return (
    <div className="flex h-full flex-col">
      <EditorHeader event={event} onClose={onClose} title={isMentor ? 'Mentor session' : 'Event details'} />
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <h3 className="text-base font-semibold text-ink">{event.title}</h3>
          {event.subtitle && <p className="text-sm text-ink-soft">{event.subtitle}</p>}
        </div>
        <div className="space-y-2.5">
          <DetailRow icon={Icons.Calendar}>{DAY_LABELS[event.day]}</DetailRow>
          <DetailRow icon={Icons.Clock}>{formatRange(event.startHour, event.durationHours)}</DetailRow>
          <DetailRow icon={Icons.Layers}>{CATEGORY_LABEL[event.category]}</DetailRow>
        </div>

        {isMentor && (
          <button
            onClick={() => toggleComplete(event.id)}
            className={cn(
              'focus-ring flex w-full items-center gap-2.5 rounded-2xl border p-3 text-left transition',
              done ? 'border-brand/40 bg-brand/8 text-brand' : 'border-line/15 text-ink-soft hover:border-line/30',
            )}
          >
            {done ? <Icons.CheckCircle2 size={18} /> : <Icons.Circle size={18} className="text-ink-mute" />}
            <span className="text-sm font-semibold">{done ? 'Attended' : 'Mark as attended'}</span>
          </button>
        )}

        {event.nodeId && <LinkedNodeButton nodeId={event.nodeId} onOpenNode={onOpenNode} />}

        {isMentor && (
          <button
            onClick={onOpenMentors}
            className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-2xl bg-surface-2 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-line/10"
          >
            <Icons.Users size={15} /> Open Mentors
          </button>
        )}
        {!isMentor && (
          <p className="rounded-2xl bg-surface-2 p-3 text-xs leading-relaxed text-ink-mute">
            This event comes from a company channel you subscribed to. Manage it from the <span className="font-semibold text-ink-soft">Events</span> tab.
          </p>
        )}
      </div>

      {isMentor && (
        <div className="flex-shrink-0 border-t border-line/10 p-3">
          <button
            onClick={() => { removeEvent(event.id); onClose(); }}
            className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-xl border border-wine/30 py-2.5 text-sm font-semibold text-wine transition hover:bg-wine/10"
          >
            <Icons.Trash2 size={15} /> Cancel session
          </button>
        </div>
      )}
    </div>
  );
}

function EventEditor({ event, onClose, onOpenNode }: {
  event: TimetableEvent;
  onClose: () => void;
  onOpenNode: (id: string) => void;
}) {
  const { updateEvent, removeEvent, isComplete, toggleComplete } = useTimetable();
  const maxDuration = HOURS[HOURS.length - 1] + 1 - event.startHour;
  const done = isComplete(event.id);

  return (
    <div className="flex h-full flex-col">
      <EditorHeader event={event} onClose={onClose} title="Edit event" />

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <button
          onClick={() => toggleComplete(event.id)}
          className={cn(
            'focus-ring flex w-full items-center gap-2.5 rounded-2xl border p-3 text-left transition',
            done ? 'border-brand/40 bg-brand/8 text-brand' : 'border-line/15 text-ink-soft hover:border-line/30',
          )}
        >
          {done ? <Icons.CheckCircle2 size={18} /> : <Icons.Circle size={18} className="text-ink-mute" />}
          <span className="text-sm font-semibold">{done ? 'Completed' : 'Mark as done'}</span>
        </button>

        <TextField
          label="Title"
          value={event.title}
          onChange={e => updateEvent(event.id, { title: e.target.value })}
          placeholder="Event title"
        />
        <TextField
          label="Details"
          value={event.subtitle ?? ''}
          onChange={e => updateEvent(event.id, { subtitle: e.target.value })}
          placeholder="Location, notes…"
        />

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Colour</span>
          <div className="grid grid-cols-4 gap-2">
            {ALL_CATEGORIES.map(cat => {
              const c = CATEGORY_COLORS[cat];
              const active = cat === event.category;
              return (
                <button
                  key={cat}
                  onClick={() => updateEvent(event.id, { category: cat })}
                  title={CATEGORY_LABEL[cat]}
                  aria-label={CATEGORY_LABEL[cat]}
                  className={cn(
                    'focus-ring flex h-9 items-center justify-center rounded-xl border transition',
                    active ? 'border-ink/40 ring-2 ring-brand ring-offset-1 ring-offset-surface' : 'border-line/10 hover:border-line/30',
                  )}
                  style={{ background: c.bg, color: c.text }}
                >
                  {active && <Icons.Check size={15} strokeWidth={2.6} />}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-ink-mute">{CATEGORY_LABEL[event.category]}</p>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Day</span>
          <select
            className={fieldSelect}
            value={event.day}
            onChange={e => updateEvent(event.id, { day: Number(e.target.value) })}
          >
            {DAY_LABELS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Starts</span>
            <select
              className={fieldSelect}
              value={event.startHour}
              onChange={e => {
                const startHour = Number(e.target.value);
                const room = HOURS[HOURS.length - 1] + 1 - startHour;
                updateEvent(event.id, { startHour, durationHours: Math.min(event.durationHours, room) });
              }}
            >
              {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Length</span>
            <select
              className={fieldSelect}
              value={event.durationHours}
              onChange={e => updateEvent(event.id, { durationHours: Number(e.target.value) })}
            >
              {Array.from({ length: maxDuration }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d} hr{d > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Weekly recurrence */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line/12 bg-surface px-3 py-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
              <Icons.Repeat size={15} /> Repeat weekly
            </div>
            <p className="mt-0.5 text-xs text-ink-mute">Show on every week at this time.</p>
          </div>
          <Toggle checked={!!event.recurring} onChange={v => updateEvent(event.id, { recurring: v })} label="Repeat weekly" />
        </div>

        {/* Link this block to a career role on the Traileers map */}
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Linked career role</span>
          <select
            className={fieldSelect}
            value={event.nodeId ?? ''}
            onChange={e => updateEvent(event.id, { nodeId: e.target.value || undefined })}
          >
            <option value="">None</option>
            {CAREER_ROLE_NODES.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
          </select>
          <p className="mt-1.5 text-xs text-ink-mute">Tie study or prep time to a target role to track progress.</p>
        </div>

        {event.nodeId && <LinkedNodeButton nodeId={event.nodeId} onOpenNode={onOpenNode} />}
      </div>

      {/* Delete */}
      <div className="flex-shrink-0 border-t border-line/10 p-3">
        <button
          onClick={() => { removeEvent(event.id); onClose(); }}
          className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-xl border border-wine/30 py-2.5 text-sm font-semibold text-wine transition hover:bg-wine/10"
        >
          <Icons.Trash2 size={15} /> Remove event
        </button>
      </div>
    </div>
  );
}

export function RightPanel({ selectedId, onSelect, onOpenNode, onOpenMentors }: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpenNode: (id: string) => void;
  onOpenMentors: () => void;
}) {
  const { events } = useTimetable();
  const [tab, setTab] = useState<Tab>('coach');

  const selectedEvent = selectedId ? events.find(e => e.id === selectedId) ?? null : null;

  if (selectedEvent) {
    return selectedEvent.locked
      ? <LockedDetail event={selectedEvent} onClose={() => onSelect(null)} onOpenNode={onOpenNode} onOpenMentors={onOpenMentors} />
      : <EventEditor event={selectedEvent} onClose={() => onSelect(null)} onOpenNode={onOpenNode} />;
  }

  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: 'coach', label: 'Coach', icon: Icons.Sparkles },
    { id: 'plan', label: 'Plan', icon: Icons.Flag },
    { id: 'events', label: 'Events', icon: Icons.Building2 },
    { id: 'calendars', label: 'Sync', icon: Icons.Calendar },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex flex-shrink-0 border-b border-line/10">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'focus-ring flex flex-1 flex-col items-center justify-center gap-1 border-b-2 py-2 text-[11px] font-medium transition',
                active ? 'border-brand text-ink' : 'border-transparent text-ink-mute hover:text-ink-soft',
              )}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'coach' && <CoachTab onOpenMentors={onOpenMentors} />}
        {tab === 'plan' && <PlanTab onOpenNode={onOpenNode} />}
        {tab === 'events' && <EventsTab />}
        {tab === 'calendars' && <CalendarsTab />}
      </div>
    </div>
  );
}
