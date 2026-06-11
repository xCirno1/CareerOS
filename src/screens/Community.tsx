import { useState, useRef } from 'react';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { Button, Card, Badge } from '@/ui/components';
import { NODES, getNodeIcon, type CareerNode } from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Reply {
  id: string;
  author: string;
  initials: string;
  colorClass: string;
  text: string;
  time: string;
}

interface Post {
  id: string;
  author: string;
  initials: string;
  colorClass: string;
  role: string;
  time: string;
  body: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
}

// ---------------------------------------------------------------------------
// Channel config — one per CareerNode
// ---------------------------------------------------------------------------

const ACCENT_COLOR: Record<string, { badge: string; icon: string; active: string }> = {
  teal:  { badge: 'bg-emerald-50 text-emerald-700', icon: 'text-emerald-600', active: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  wine:  { badge: 'bg-rose-50 text-rose-700',       icon: 'text-rose-600',    active: 'bg-rose-50 border-rose-200 text-rose-800'           },
  amber: { badge: 'bg-amber-50 text-amber-700',     icon: 'text-amber-600',   active: 'bg-amber-50 border-amber-200 text-amber-800'         },
  navy:  { badge: 'bg-sky-50 text-sky-700',         icon: 'text-sky-600',     active: 'bg-sky-50 border-sky-200 text-sky-800'               },
};

const AVATAR_POOL = [
  'bg-brand/10 text-brand',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-rose-100 text-rose-800',
];

function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_POOL[h % AVATAR_POOL.length];
}

// Seed posts per channel
const SEED_POSTS: Record<string, Post[]> = {
  'frontend-dev': [
    {
      id: 'fd-1', author: 'Mia Chen', initials: 'MC', colorClass: 'bg-brand/10 text-brand',
      role: 'Frontend Engineer', time: '2h ago',
      body: 'Anyone else finding that TypeScript generics in React are getting easier to read with 5.x? The inferred props on forwardRef finally make sense.',
      likes: 18, liked: false, replies: [
        { id: 'r1', author: 'Dev P.', initials: 'DP', colorClass: 'bg-amber-100 text-amber-800', text: 'Yes — the variance improvements alone saved me three hours last week.', time: '1h ago' },
      ],
    },
    {
      id: 'fd-2', author: 'Lin Zhou', initials: 'LZ', colorClass: 'bg-violet-100 text-violet-800',
      role: 'Senior FE', time: 'Yesterday',
      body: 'Hot take: CSS container queries made media queries obsolete for component-level design. Fight me.',
      likes: 34, liked: false, replies: [],
    },
  ],
  'fullstack-dev': [
    {
      id: 'fs-1', author: 'Alex R.', initials: 'AR', colorClass: 'bg-sky-100 text-sky-800',
      role: 'Full-Stack Engineer', time: '4h ago',
      body: 'Switched our API layer from REST to tRPC six months ago. Zero regrets. Type safety end-to-end is not optional anymore.',
      likes: 27, liked: false, replies: [],
    },
  ],
  'design-eng': [
    {
      id: 'de-1', author: 'Sara M.', initials: 'SM', colorClass: 'bg-rose-100 text-rose-800',
      role: 'Design Engineer', time: '1d ago',
      body: 'The design engineer role is still badly defined at most companies. Half expect a senior designer, half expect a frontend dev who can open Figma. Anyone else navigating this?',
      likes: 41, liked: false, replies: [
        { id: 'r2', author: 'Tom B.', initials: 'TB', colorClass: 'bg-amber-100 text-amber-800', text: 'My rule: if the job mentions "design system ownership" it is real. If it just says "collaborate with design" it is not.', time: '20h ago' },
      ],
    },
  ],
  'eng-manager': [
    {
      id: 'em-1', author: 'Chris L.', initials: 'CL', colorClass: 'bg-emerald-100 text-emerald-800',
      role: 'Engineering Manager', time: '3h ago',
      body: 'Biggest shift going IC to EM: you stop measuring your week by what you shipped and start measuring it by whether your team is unblocked. Took me six months to feel good about that.',
      likes: 52, liked: false, replies: [],
    },
  ],
  'product-lead': [
    {
      id: 'pl-1', author: 'Priya N.', initials: 'PN', colorClass: 'bg-emerald-100 text-emerald-800',
      role: 'Product Lead', time: '5h ago',
      body: 'Discovery is not a phase. It is something you never stop doing. Teams that treat it as a sprint zero activity ship features nobody asked for.',
      likes: 38, liked: false, replies: [],
    },
  ],
  'data-analyst': [
    {
      id: 'da-1', author: 'James K.', initials: 'JK', colorClass: 'bg-sky-100 text-sky-800',
      role: 'Product Analyst', time: '6h ago',
      body: 'dbt + BigQuery changed how our whole analytics team works. Models are code, tests are automatic, and the lineage graph finally makes sense to non-technical stakeholders.',
      likes: 22, liked: false, replies: [],
    },
  ],
  'ai-eng': [
    {
      id: 'ai-1', author: 'Robin W.', initials: 'RW', colorClass: 'bg-violet-100 text-violet-800',
      role: 'AI Application Engineer', time: '1h ago',
      body: 'RAG is not a silver bullet. We spent two months tuning retrieval before realising our chunking strategy was the bottleneck, not the model. Always eval the retrieval step separately.',
      likes: 45, liked: false, replies: [],
    },
  ],
  'devrel': [
    {
      id: 'dr-1', author: 'Maya S.', initials: 'MS', colorClass: 'bg-rose-100 text-rose-800',
      role: 'Developer Advocate', time: '2d ago',
      body: 'The best DevRel metric nobody talks about: how many engineers outside your company shipped something because of content you made. That is the real signal.',
      likes: 29, liked: false, replies: [],
    },
  ],
  'mba': [
    {
      id: 'mba-1', author: 'Omar F.', initials: 'OF', colorClass: 'bg-sky-100 text-sky-800',
      role: 'MBA Candidate', time: '3d ago',
      body: 'Six months in: the network is real, the case method is genuinely useful, and the opportunity cost is genuinely brutal. Think hard about the timing.',
      likes: 17, liked: false, replies: [],
    },
  ],
  'startup-founder': [
    {
      id: 'sf-1', author: 'Leila T.', initials: 'LT', colorClass: 'bg-amber-100 text-amber-800',
      role: 'Founder', time: '1d ago',
      body: 'Seed fundraising truth: investors are not buying your product. They are buying your conviction that you are the right person to solve this specific problem. The deck is just the excuse to have the conversation.',
      likes: 63, liked: false, replies: [],
    },
  ],
};

function getChannelPosts(nodeId: string): Post[] {
  return SEED_POSTS[nodeId] ?? [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

// ---------------------------------------------------------------------------
// ThreadAvatar
// ---------------------------------------------------------------------------

function ThreadAvatar({
  initials,
  colorClass,
  size = 'md',
}: {
  initials: string;
  colorClass?: string;
  size?: 'sm' | 'md';
}) {
  const resolved = colorClass ?? avatarColor(initials);
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-bold',
        size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-xs',
        resolved,
      )}
    >
      {initials}
    </span>
  );
}

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
// ChannelSidebar
// ---------------------------------------------------------------------------

function ChannelSidebar({
  nodes,
  activeId,
  onSelect,
}: {
  nodes: CareerNode[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const groups: { label: string; kind: CareerNode['kind']; items: CareerNode[] }[] = [
    { label: 'Job roles', kind: 'job', items: nodes.filter((n) => n.kind === 'job') },
    { label: 'Career tracks', kind: 'career', items: nodes.filter((n) => n.kind === 'career') },
    { label: 'Study routes', kind: 'industry', items: nodes.filter((n) => n.kind === 'industry') },
  ];

  return (
    <nav className="w-full space-y-4 lg:w-56 lg:shrink-0">
      {groups.map((g) => (
        <div key={g.kind}>
          <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
            {g.label}
          </p>
          <div className="space-y-0.5">
            {g.items.map((node) => {
              const active = node.id === activeId;
              const colors = ACCENT_COLOR[node.accent];
              const Icon = getIcon(getNodeIcon(node));
              return (
                <button
                  key={node.id}
                  onClick={() => onSelect(node.id)}
                  className={cn(
                    'focus-ring flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-sm font-semibold transition',
                    active
                      ? colors.active
                      : 'border-transparent text-ink-soft hover:bg-line/5 hover:text-ink',
                  )}
                >
                  <Icon
                    size={15}
                    strokeWidth={2.1}
                    className={active ? colors.icon : 'text-ink-mute'}
                  />
                  <span className="truncate">{node.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
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
  const [activeId, setActiveId] = useState<string>(NODES[0].id);
  const [channelPosts, setChannelPosts] = useState<Record<string, Post[]>>(() =>
    Object.fromEntries(NODES.map((n) => [n.id, getChannelPosts(n.id)])),
  );

  const activeNode = NODES.find((n) => n.id === activeId)!;
  const posts = channelPosts[activeId] ?? [];
  const colors = ACCENT_COLOR[activeNode.accent];
  const ChannelIcon = getIcon(getNodeIcon(activeNode));

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
      [activeId]: [newPost, ...(prev[activeId] ?? [])],
    }));
  };

  const handleLike = (postId: string) => {
    setChannelPosts((prev) => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
          : p,
      ),
    }));
  };

  const handleReply = (postId: string, text: string) => {
    setChannelPosts((prev) => ({
      ...prev,
      [activeId]: (prev[activeId] ?? []).map((p) =>
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
          Join the conversation for any role or track on your radar.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <ChannelSidebar nodes={NODES} activeId={activeId} onSelect={setActiveId} />

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
            <div>
              <h2 className="text-base font-bold text-ink leading-tight">
                #{activeNode.title}
              </h2>
              <p className="text-xs text-ink-mute">{activeNode.summary}</p>
            </div>
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
    </div>
  );
}