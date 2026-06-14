import { useMemo, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { Button, Card, Badge } from '@/ui/components';
import { NODES, getNodeIcon, type CareerNode } from '@/lib/mockData';
import { useProfile } from '@/lib/profile';
import { useAppStore } from '@/lib/appStore';
import { ThreadAvatar } from '@/components/ThreadAvatar';
import {
  ACCENT_COLOR,
  getChannelPosts,
  getPlanChannelIds,
  makeId,
  type Post,
} from '@/lib/community';

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------

function PostCard({
  post,
  onLike,
  onReply,
}: {
  post: Post;
  onLike: (id: string) => void;
  onReply: (id: string, text: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onReply(post.id, trimmed);
    setDraft('');
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3 mb-3">
        <ThreadAvatar initials={post.initials} colorClass={post.colorClass} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink leading-tight">
            {post.author}
            <span className="ml-2 text-xs font-normal text-ink-mute">{post.time}</span>
          </p>
          <p className="text-xs text-ink-mute mt-0.5">{post.role}</p>
        </div>
      </div>

      <p className="text-sm text-ink-soft leading-relaxed mb-3">{post.body}</p>

      <div className="flex items-center gap-4 mb-3">
        <button
          onClick={() => onLike(post.id)}
          className={cn(
            'focus-ring inline-flex items-center gap-1.5 text-xs font-semibold transition',
            post.liked ? 'text-rose-500' : 'text-ink-mute hover:text-ink',
          )}
        >
          <Icons.Heart size={14} className={post.liked ? 'fill-rose-500' : ''} />
          {post.likes}
        </button>
        <button
          onClick={() => inputRef.current?.focus()}
          className="focus-ring inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mute hover:text-ink transition"
        >
          <Icons.Mail size={14} />
          {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}
        </button>
        <button className="focus-ring inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mute hover:text-ink transition ml-auto">
          <Icons.Share2 size={14} />
          Share
        </button>
      </div>

      {post.replies.length > 0 && (
        <div className="space-y-3 border-t border-line/10 pt-3 mb-3">
          {post.replies.map((r) => (
            <div key={r.id} className="flex gap-2.5">
              <ThreadAvatar initials={r.initials} colorClass={r.colorClass} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink">
                  {r.author}
                  <span className="ml-1.5 font-normal text-ink-mute">{r.time}</span>
                </p>
                <p className="mt-0.5 text-sm text-ink-soft leading-relaxed">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-line/10 pt-3">
        <ThreadAvatar initials="YO" colorClass="bg-brand/10 text-brand" size="sm" />
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Write a reply..."
          className="flex-1 min-w-0 bg-surface-2 text-sm text-ink placeholder:text-ink-mute rounded-xl border border-line/12 px-3 py-2 outline-none transition focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          className="focus-ring grid h-8 w-8 place-items-center rounded-xl text-brand transition hover:bg-brand/10 disabled:opacity-30"
          aria-label="Send reply"
        >
          <Icons.ArrowRight size={15} />
        </button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// ComposeBox
// ---------------------------------------------------------------------------

function ComposeBox({ onPost }: { onPost: (text: string) => void }) {
  const [text, setText] = useState('');

  const handlePost = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onPost(trimmed);
    setText('');
  };

  return (
    <Card className="p-4 sm:p-5 mb-4">
      <div className="flex gap-3 items-start">
        <ThreadAvatar initials="YO" colorClass="bg-brand/10 text-brand" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Share something with this channel..."
          className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-mute outline-none leading-relaxed"
        />
      </div>
      <div className="mt-3 flex justify-end border-t border-line/10 pt-3">
        <Button size="sm" icon={Icons.ArrowRight} disabled={!text.trim()} onClick={handlePost}>
          Post
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// ChannelSidebar — the user's plan channels + a link to the browse page
// ---------------------------------------------------------------------------

const KIND_GROUPS: { label: string; kind: CareerNode['kind'] }[] = [
  { label: 'Job roles', kind: 'job' },
  { label: 'Career tracks', kind: 'career' },
  { label: 'Study routes', kind: 'industry' },
];

/** Group nodes by kind, dropping any group that ended up empty. */
function groupByKind(nodes: CareerNode[]) {
  return KIND_GROUPS.map((g) => ({
    ...g,
    items: nodes.filter((n) => n.kind === g.kind),
  })).filter((g) => g.items.length > 0);
}

function ChannelButton({
  node,
  active,
  onSelect,
}: {
  node: CareerNode;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const colors = ACCENT_COLOR[node.accent];
  const Icon = getIcon(getNodeIcon(node));
  return (
    <button
      onClick={() => onSelect(node.id)}
      className={cn(
        'focus-ring flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-sm font-semibold transition',
        active ? colors.active : 'border-transparent text-ink-soft hover:bg-line/5 hover:text-ink',
      )}
    >
      <Icon size={15} strokeWidth={2.1} className={active ? colors.icon : 'text-ink-mute'} />
      <span className="truncate">{node.title}</span>
    </button>
  );
}

function ChannelSidebar({
  planNodes,
  activeId,
  onSelect,
  query,
  onQuery,
}: {
  planNodes: CareerNode[];
  activeId: string;
  onSelect: (id: string) => void;
  query: string;
  onQuery: (query: string) => void;
}) {
  const trimmed = query.trim().toLowerCase();
  const filteredNodes = trimmed
    ? planNodes.filter(
        (node) =>
          node.title.toLowerCase().includes(trimmed) ||
          node.summary.toLowerCase().includes(trimmed),
      )
    : planNodes;
  const groups = groupByKind(filteredNodes);

  return (
    <nav className="w-full space-y-4 lg:w-56 lg:shrink-0">
      <div className="relative">
        <Icons.Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search channels..."
          className="w-full rounded-xl border border-line/12 bg-surface-2 py-2 pl-8 pr-8 text-sm text-ink placeholder:text-ink-mute outline-none transition focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
        />
        {trimmed && (
          <button
            type="button"
            onClick={() => onQuery('')}
            aria-label="Clear channel search"
            className="focus-ring absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-lg text-ink-mute hover:text-ink"
          >
            <Icons.X size={13} />
          </button>
        )}
      </div>

      <Link
        to="/community/browse"
        className="focus-ring flex w-full items-center gap-2.5 rounded-xl border border-line/12 bg-surface-2 px-2.5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-line/5 hover:text-ink"
      >
        <Icons.Compass size={15} strokeWidth={2.1} className="text-ink-mute" />
        Browse all channels
        <Icons.ArrowRight size={14} className="ml-auto text-ink-mute" />
      </Link>

      <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
        From Your plan
      </p>

      {planNodes.length === 0 ? (
        <p className="px-2 text-xs text-ink-mute">
          No channels in your plan yet — browse all to join one.
        </p>
      ) : groups.length === 0 ? (
        <p className="px-2 text-xs text-ink-mute">
          No channels match "{query.trim()}".
        </p>
      ) : (
        groups.map((g) => (
          <div key={g.kind}>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
              {g.label}
            </p>
            <div className="space-y-0.5">
              {g.items.map((node) => (
                <ChannelButton
                  key={node.id}
                  node={node}
                  active={node.id === activeId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

function EmptyState({ node }: { node: CareerNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-ink-mute">
        <Icons.Mail size={22} />
      </span>
      <p className="text-sm font-bold text-ink">No posts in #{node.title} yet</p>
      <p className="text-xs text-ink-mute">Be the first to start the conversation.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function Community() {
  const { profile } = useProfile();
  const { target, saved } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const channelParam = searchParams.get('channel');
  const channelQuery = searchParams.get('q') ?? '';

  // The user's "career plan" channels: current role, every step of the
  // recommended route toward the target, the target itself, and saved roles.
  // Everything else is reachable via the Browse all page.
  const planNodes = useMemo(() => {
    const ids = getPlanChannelIds({ currentNodeId: profile.currentNodeId, target, saved });
    return NODES.filter((n) => ids.has(n.id));
  }, [profile.currentNodeId, target, saved]);

  const activeId = channelParam && NODES.some((n) => n.id === channelParam)
    ? channelParam
    : planNodes[0]?.id ?? NODES[0].id;
  const [channelPosts, setChannelPosts] = useState<Record<string, Post[]>>({});
  const [mobileChannelsOpen, setMobileChannelsOpen] = useState(false);

  const activeNode = NODES.find((n) => n.id === activeId)!;
  const posts = channelPosts[activeId] ?? getChannelPosts(activeId);
  const colors = ACCENT_COLOR[activeNode.accent];
  const ChannelIcon = getIcon(getNodeIcon(activeNode));

  const handleSelectChannel = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('channel', id);
    setSearchParams(next);
  };

  const handleChannelQuery = (query: string) => {
    const next = new URLSearchParams(searchParams);
    if (query) next.set('q', query);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  };

  const handlePost = (text: string) => {
    const newPost: Post = {
      id: makeId(),
      author: 'You',
      initials: 'YO',
      colorClass: 'bg-brand/10 text-brand',
      role: 'Your current role',
      time: 'Just now',
      body: text,
      likes: 0,
      liked: false,
      replies: [],
    };
    setChannelPosts((prev) => ({
      ...prev,
      [activeId]: [newPost, ...(prev[activeId] ?? getChannelPosts(activeId))],
    }));
  };

  const handleLike = (postId: string) => {
    setChannelPosts((prev) => ({
      ...prev,
      [activeId]: (prev[activeId] ?? getChannelPosts(activeId)).map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
          : p,
      ),
    }));
  };

  const handleReply = (postId: string, text: string) => {
    setChannelPosts((prev) => ({
      ...prev,
      [activeId]: (prev[activeId] ?? getChannelPosts(activeId)).map((p) =>
        p.id === postId
          ? {
            ...p,
            replies: [
              ...p.replies,
              {
                id: makeId(),
                author: 'You',
                initials: 'YO',
                colorClass: 'bg-brand/10 text-brand',
                text,
                time: 'Just now',
              },
            ],
          }
          : p,
      ),
    }));
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Page header */}
      <div className="mb-6">
        <Badge tone="brand" icon={Icons.Users}>
          Community
        </Badge>
        <h1 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Career channels
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Channels from your career plan are pinned here — browse all to find others.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar — desktop only; mobile uses the bottom sheet below */}
        <div className="hidden lg:block lg:shrink-0">
          <ChannelSidebar
            planNodes={planNodes}
            activeId={activeId}
            onSelect={handleSelectChannel}
            query={channelQuery}
            onQuery={handleChannelQuery}
          />
        </div>

        {/* Feed */}
        <div className="flex-1 min-w-0">
          {/* Channel header */}
          <div className="mb-4 flex items-center gap-3">
            <span
              className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                colors.badge,
              )}
            >
              <ChannelIcon size={18} strokeWidth={2.1} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-ink leading-tight">
                #{activeNode.title}
              </h2>
              <p className="truncate text-xs text-ink-mute">{activeNode.summary}</p>
            </div>
            <button
              onClick={() => setMobileChannelsOpen(true)}
              className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line/12 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink lg:hidden"
            >
              <Icons.Menu size={14} />
              Channels
            </button>
          </div>

          <ComposeBox onPost={handlePost} />

          {posts.length === 0 ? (
            <EmptyState node={activeNode} />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile channel switcher — bottom sheet */}
      {mobileChannelsOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setMobileChannelsOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] animate-fade-up overflow-y-auto rounded-t-3xl border-t border-line/10 bg-surface p-4 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-ink">Channels</p>
              <button
                onClick={() => setMobileChannelsOpen(false)}
                aria-label="Close channels"
                className="focus-ring grid h-8 w-8 place-items-center rounded-xl text-ink-mute transition hover:bg-line/5 hover:text-ink"
              >
                <Icons.X size={16} />
              </button>
            </div>
            <ChannelSidebar
              planNodes={planNodes}
              activeId={activeId}
              query={channelQuery}
              onQuery={handleChannelQuery}
              onSelect={(id) => {
                handleSelectChannel(id);
                setMobileChannelsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
