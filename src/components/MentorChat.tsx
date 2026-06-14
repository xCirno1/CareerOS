import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { cn } from '@/lib/cn';
import {
  type ChatMessage,
  chatId,
  cannedReply,
  relativeTime,
  clockTime,
  dayLabel,
} from '@/lib/mentorChat';

/** Minimal mentor shape the chat needs — MentorMatch's Mentor satisfies this. */
export interface ChatMentor {
  id: string;
  name: string;
  initials: string;
  colorClass: string;
  currentRole: string;
  company: string;
  responseTime: string;
  topics: string[];
}

type MessagesMap = Record<string, ChatMessage[]>;

/* ------------------------------------------------------------------ */
/*  Floating-window geometry (draggable + resizable, persisted)        */
/* ------------------------------------------------------------------ */

type Rect = { x: number; y: number; w: number; h: number };

const WINDOW_KEY = 'careeros-mentor-chat-window';
const MIN_W = 360;
const MIN_H = 420;
/** Below this window width the list/thread collapse to a single pane. */
const TWO_PANE_W = 720;

function defaultRect(): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(880, vw - 32);
  const h = Math.min(620, vh - 32);
  return { x: Math.max(16, vw - w - 24), y: Math.max(16, vh - h - 24), w, h };
}

function clampRect(r: Rect): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(Math.max(MIN_W, r.w), vw);
  const h = Math.min(Math.max(MIN_H, r.h), vh);
  const x = Math.min(Math.max(0, r.x), Math.max(0, vw - w));
  const y = Math.min(Math.max(0, r.y), Math.max(0, vh - h));
  return { x, y, w, h };
}

function loadRect(): Rect {
  try {
    const raw = localStorage.getItem(WINDOW_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Rect>;
      if (
        typeof p.x === 'number' &&
        typeof p.y === 'number' &&
        typeof p.w === 'number' &&
        typeof p.h === 'number'
      ) {
        return clampRect(p as Rect);
      }
    }
  } catch {
    /* ignore malformed storage */
  }
  return defaultRect();
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function firstName(name: string) {
  return name.split(' ')[0];
}

function lastMessage(list: ChatMessage[] | undefined): ChatMessage | undefined {
  return list && list.length ? list[list.length - 1] : undefined;
}

/** Group consecutive messages and inject a day separator when the date changes. */
function withDaySeparators(list: ChatMessage[]) {
  const out: Array<{ kind: 'day'; label: string; key: string } | { kind: 'msg'; msg: ChatMessage }> = [];
  let lastDay = '';
  for (const msg of list) {
    const label = dayLabel(msg.ts);
    if (label !== lastDay) {
      out.push({ kind: 'day', label, key: `day-${msg.id}` });
      lastDay = label;
    }
    out.push({ kind: 'msg', msg });
  }
  return out;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-mute/70"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function Avatar({ mentor, size = 'md' }: { mentor: ChatMentor; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-2xl font-bold',
        size === 'sm' && 'h-9 w-9 text-xs',
        size === 'md' && 'h-10 w-10 text-sm',
        size === 'lg' && 'h-11 w-11 text-sm',
        mentor.colorClass,
      )}
    >
      {mentor.initials}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Window                                                            */
/* ------------------------------------------------------------------ */

export function MentorChat({
  mentors,
  messages,
  setMessages,
  initialMentorId,
  onClose,
}: {
  mentors: ChatMentor[];
  messages: MessagesMap;
  setMessages: React.Dispatch<React.SetStateAction<MessagesMap>>;
  initialMentorId?: string | null;
  onClose: () => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fallbackId = initialMentorId ?? mentors[0]?.id ?? null;
  const chatParam = searchParams.get('chat');
  const activeId = chatParam && mentors.some((mentor) => mentor.id === chatParam)
    ? chatParam
    : fallbackId;
  const query = searchParams.get('chatQ') ?? '';
  const [draft, setDraft] = useState('');
  const [typingFor, setTypingFor] = useState<string | null>(null);
  const [unread, setUnread] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    for (const m of mentors) {
      const last = lastMessage(messages[m.id]);
      if (last && last.from === 'mentor' && m.id !== fallbackId) seed[m.id] = true;
    }
    return seed;
  });
  // In single-pane (narrow window) mode, which pane is showing.
  const [showThread, setShowThread] = useState(Boolean(initialMentorId));

  const [rect, setRect] = useState<Rect>(loadRect);
  const [interacting, setInteracting] = useState<'drag' | 'resize' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ px: number; py: number; ow: number; oh: number; axis: 'e' | 's' | 'se' } | null>(null);

  const activeMentor = mentors.find((m) => m.id === activeId) ?? null;
  const activeMessages = (activeId && messages[activeId]) || [];

  const compact = rect.w < TWO_PANE_W;
  const listVisible = !compact || !showThread;
  const threadVisible = !compact || showThread;

  // Close on Escape. (No body-scroll lock — the window is non-blocking.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  // Persist geometry; keep it inside the viewport when the browser resizes.
  useEffect(() => {
    localStorage.setItem(WINDOW_KEY, JSON.stringify(rect));
  }, [rect]);

  useEffect(() => {
    const onResize = () => setRect((r) => clampRect(r));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-scroll the active thread to the latest message / typing indicator.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, activeMessages.length, typingFor, threadVisible]);

  const conversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mentors
      .filter((m) => {
        if (!q) return true;
        const last = lastMessage(messages[m.id])?.text ?? '';
        return [m.name, m.currentRole, m.company, last].join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => (lastMessage(messages[b.id])?.ts ?? 0) - (lastMessage(messages[a.id])?.ts ?? 0));
  }, [mentors, messages, query]);

  const openConversation = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('chat', id);
    setSearchParams(next);
    setShowThread(true);
    setUnread((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const send = () => {
    const text = draft.trim();
    if (!text || !activeMentor) return;
    const mentorId = activeMentor.id;
    const topic = activeMentor.topics[0];

    setMessages((prev) => {
      const list = prev[mentorId] ?? [];
      return { ...prev, [mentorId]: [...list, { id: chatId(), from: 'me', text, ts: Date.now() }] };
    });
    setDraft('');

    // Simulated mentor reply after a short "typing" pause.
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setTypingFor(mentorId);
    replyTimer.current = setTimeout(() => {
      setMessages((prev) => {
        const list = prev[mentorId] ?? [];
        const turn = list.filter((m) => m.from === 'mentor').length;
        return {
          ...prev,
          [mentorId]: [...list, { id: chatId(), from: 'mentor', text: cannedReply(topic, turn), ts: Date.now() }],
        };
      });
      setTypingFor(null);
      // Flag unread if the user has navigated away from this conversation.
      if (activeId !== mentorId) setUnread((u) => ({ ...u, [mentorId]: true }));
    }, 1400 + Math.random() * 800);
  };

  const setQuery = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('chatQ', value);
    else next.delete('chatQ');
    setSearchParams(next, { replace: true });
  };

  const onComposerKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  /* ---- drag ---- */
  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    e.preventDefault();
    dragRef.current = { px: e.clientX, py: e.clientY, ox: rect.x, oy: rect.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    setInteracting('drag');
  };
  const onDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setRect((r) => clampRect({ ...r, x: d.ox + (e.clientX - d.px), y: d.oy + (e.clientY - d.py) }));
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setInteracting(null);
  };

  /* ---- resize ---- */
  const startResize = (axis: 'e' | 's' | 'se') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { px: e.clientX, py: e.clientY, ow: rect.w, oh: rect.h, axis };
    e.currentTarget.setPointerCapture(e.pointerId);
    setInteracting('resize');
  };
  const onResizeMove = (e: React.PointerEvent) => {
    const d = resizeRef.current;
    if (!d) return;
    const w = d.axis === 's' ? d.ow : d.ow + (e.clientX - d.px);
    const h = d.axis === 'e' ? d.oh : d.oh + (e.clientY - d.py);
    setRect((r) => clampRect({ ...r, w, h }));
  };
  const endResize = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    resizeRef.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setInteracting(null);
  };

  const resetWindow = () => setRect(clampRect(defaultRect()));

  return createPortal(
    <div
      className={cn(
        'fixed z-[95] flex flex-col overflow-hidden rounded-[1.25rem] border border-line/15 bg-surface shadow-glass',
        interacting && 'select-none',
      )}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      role="dialog"
      aria-label="Mentor messages"
    >
      {/* Title bar — drag handle */}
      <div
        onPointerDown={startDrag}
        onPointerMove={onDragMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={resetWindow}
        className="flex shrink-0 cursor-move touch-none select-none items-center justify-between gap-2 border-b border-line/10 bg-surface-2/60 px-3 py-2"
      >
        <span className="flex items-center gap-2 text-sm font-extrabold text-ink">
          <Icons.MessageSquare size={16} className="text-brand" /> Messages
        </span>
        <div className="flex items-center gap-1.5">
          <span className="hidden text-[10px] font-semibold text-ink-mute md:inline">
            drag to move · double-click to reset
          </span>
          <button
            type="button"
            data-no-drag
            onClick={onClose}
            aria-label="Close messages"
            className="focus-ring grid h-7 w-7 place-items-center rounded-full bg-surface text-ink-mute transition hover:text-ink"
          >
            <Icons.X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Conversation list */}
        <aside
          className={cn(
            'h-full min-h-0 flex-col border-line/10 bg-surface-2/40',
            listVisible ? 'flex' : 'hidden',
            compact ? 'w-full' : 'w-[290px] border-r',
          )}
        >
          <div className="px-3 py-2.5">
            <label className="flex h-9 items-center gap-2 rounded-xl border border-line/12 bg-surface px-3 text-sm text-ink-soft transition focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/25">
              <Icons.Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-mute"
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {conversations.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-ink-mute">No conversations found.</p>
            ) : (
              conversations.map((m) => {
                const last = lastMessage(messages[m.id]);
                const isActive = m.id === activeId;
                const isUnread = Boolean(unread[m.id]);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openConversation(m.id)}
                    className={cn(
                      'focus-ring mb-0.5 flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition',
                      isActive ? 'bg-brand/10' : 'hover:bg-line/5',
                    )}
                  >
                    <Avatar mentor={m} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('truncate text-sm font-bold text-ink', isActive && 'text-brand')}>{m.name}</p>
                        {last && (
                          <span className="shrink-0 text-[10px] font-semibold text-ink-mute">{relativeTime(last.ts)}</span>
                        )}
                      </div>
                      <p className={cn('truncate text-xs', isUnread ? 'font-semibold text-ink-soft' : 'text-ink-mute')}>
                        {last ? `${last.from === 'me' ? 'You: ' : ''}${last.text}` : 'Start the conversation'}
                      </p>
                    </div>
                    {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Active thread */}
        <section
          className={cn('h-full min-h-0 flex-1 flex-col', threadVisible ? 'flex' : 'hidden')}
        >
          {activeMentor ? (
            <>
              <header className="flex items-center gap-3 border-b border-line/10 px-4 py-3">
                {compact && (
                  <button
                    type="button"
                    onClick={() => setShowThread(false)}
                    aria-label="Back to conversations"
                    className="focus-ring -ml-1 grid h-8 w-8 place-items-center rounded-full text-ink-mute transition hover:bg-line/8 hover:text-ink"
                  >
                    <Icons.ArrowLeft size={18} />
                  </button>
                )}
                <Avatar mentor={activeMentor} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{activeMentor.name}</p>
                  <p className="truncate text-xs text-ink-mute">
                    {typingFor === activeMentor.id ? (
                      <span className="text-brand">typing…</span>
                    ) : (
                      `${activeMentor.currentRole} · ${activeMentor.company}`
                    )}
                  </p>
                </div>
              </header>

              <div ref={scrollRef} className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-4">
                <div className="mb-4 flex flex-col items-center gap-2 text-center">
                  <Avatar mentor={activeMentor} size="lg" />
                  <div>
                    <p className="text-sm font-bold text-ink">{activeMentor.name}</p>
                    <p className="text-xs text-ink-mute">
                      {activeMentor.currentRole} · {activeMentor.company} · Replies {activeMentor.responseTime.toLowerCase()}
                    </p>
                  </div>
                </div>

                {withDaySeparators(activeMessages).map((item) =>
                  item.kind === 'day' ? (
                    <div key={item.key} className="flex justify-center py-2">
                      <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    <div
                      key={item.msg.id}
                      className={cn('flex flex-col', item.msg.from === 'me' ? 'items-end' : 'items-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                          item.msg.from === 'me'
                            ? 'rounded-br-md bg-brand text-white'
                            : 'rounded-bl-md bg-surface-2 text-ink',
                        )}
                      >
                        {item.msg.text}
                      </div>
                      <span className="mt-0.5 px-1 text-[10px] text-ink-mute">{clockTime(item.msg.ts)}</span>
                    </div>
                  ),
                )}

                {typingFor === activeMentor.id && (
                  <div className="flex items-start">
                    <div className="rounded-2xl rounded-bl-md bg-surface-2 px-2 py-1.5">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-line/10 p-3">
                <div className="flex items-end gap-2 rounded-2xl border border-line/12 bg-surface px-2.5 py-1.5 transition focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/20">
                  <button
                    type="button"
                    aria-label="Add attachment"
                    className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-mute transition hover:bg-line/8 hover:text-ink"
                  >
                    <Icons.Paperclip size={16} />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onComposerKey}
                    rows={1}
                    placeholder={`Message ${firstName(activeMentor.name)}…`}
                    className="max-h-28 min-h-[2rem] flex-1 resize-none bg-transparent py-1.5 text-sm leading-6 text-ink outline-none placeholder:text-ink-mute"
                  />
                  <button
                    type="button"
                    onClick={send}
                    disabled={!draft.trim()}
                    aria-label="Send message"
                    className="focus-ring grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Icons.Send size={15} />
                  </button>
                </div>
                <p className="mt-1.5 px-1 text-[10px] text-ink-mute">
                  <kbd className="font-sans font-semibold">Enter</kbd> to send · <kbd className="font-sans font-semibold">Shift+Enter</kbd> for a new line · demo replies are simulated
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-ink-mute">
                <Icons.Inbox size={22} />
              </span>
              <p className="text-sm font-bold text-ink">No conversation selected</p>
              <p className="max-w-xs text-xs text-ink-mute">
                Match with a mentor to start a conversation, then pick it from the list to chat.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Resize handles */}
      <div
        onPointerDown={startResize('e')}
        onPointerMove={onResizeMove}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        className="absolute bottom-3 right-0 top-10 w-1.5 cursor-ew-resize touch-none"
        aria-hidden
      />
      <div
        onPointerDown={startResize('s')}
        onPointerMove={onResizeMove}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        className="absolute bottom-0 left-3 right-3 h-1.5 cursor-ns-resize touch-none"
        aria-hidden
      />
      <div
        onPointerDown={startResize('se')}
        onPointerMove={onResizeMove}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        className="absolute bottom-0 right-0 grid h-5 w-5 cursor-nwse-resize touch-none place-items-end p-1"
        aria-label="Resize"
      >
        <span className="pointer-events-none block h-2.5 w-2.5 rounded-br-md border-b-2 border-r-2 border-ink-mute/40" />
      </div>
    </div>,
    document.body,
  );
}
