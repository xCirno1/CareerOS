import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { Card, Badge } from '@/ui/components';
import {
  NODES,
  NODE_KIND_META,
  getNodeIcon,
  type CareerNode,
  type NodeKind,
} from '@/lib/mockData';
import { useProfile } from '@/lib/profile';
import { useAppStore } from '@/lib/appStore';
import { ThreadAvatar } from '@/components/ThreadAvatar';
import {
  ACCENT_COLOR,
  channelMemberCount,
  formatMembers,
  getChannelPosts,
  getPlanChannelIds,
} from '@/lib/community';

// ---------------------------------------------------------------------------
// Kind filter chips
// ---------------------------------------------------------------------------

const FILTERS: { id: 'all' | NodeKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'job', label: 'Job roles' },
  { id: 'career', label: 'Career tracks' },
  { id: 'industry', label: 'Study routes' },
];

// ---------------------------------------------------------------------------
// ChannelCard
// ---------------------------------------------------------------------------

function ChannelCard({
  node,
  members,
  inPlan,
  inSaved,
  onToggleJoin,
}: {
  node: CareerNode;
  members: number;
  inPlan: boolean;
  inSaved: boolean;
  onToggleJoin: (id: string) => void;
}) {
  const colors = ACCENT_COLOR[node.accent];
  const Icon = getIcon(getNodeIcon(node));
  const posts = getChannelPosts(node.id);
  const latest = posts[0];
  const joined = inPlan || inSaved;
  // Plan channels that come from the user's route are locked-in; only saved
  // channels can be toggled off here.
  const locked = inPlan && !inSaved;

  return (
    <Card className="flex flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
            colors.badge,
          )}
        >
          <Icon size={18} strokeWidth={2.1} />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            to={`/community?channel=${node.id}`}
            className="focus-ring rounded text-sm font-bold text-ink leading-tight hover:underline"
          >
            #{node.title}
          </Link>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
            {NODE_KIND_META[node.kind].label}
          </p>
        </div>
        {joined && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            <Icons.Check size={12} strokeWidth={2.6} />
            Joined
          </span>
        )}
      </div>

      <p className="mb-3 line-clamp-2 text-xs text-ink-soft leading-relaxed">{node.summary}</p>

      <div className="mb-3 flex items-center gap-4 text-xs font-semibold text-ink-mute">
        <span className="inline-flex items-center gap-1.5">
          <Icons.Users size={13} />
          {formatMembers(members)} members
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icons.Mail size={13} />
          {posts.length} {posts.length === 1 ? 'thread' : 'threads'}
        </span>
      </div>

      {/* Latest thread sneak peek */}
      <div className="mb-4 flex-1 rounded-xl border border-line/10 bg-surface-2 p-3">
        {latest ? (
          <div className="flex gap-2.5">
            <ThreadAvatar initials={latest.initials} colorClass={latest.colorClass} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-ink">
                {latest.author}
                <span className="ml-1.5 font-normal text-ink-mute">{latest.time}</span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft leading-relaxed">
                {latest.body}
              </p>
            </div>
          </div>
        ) : (
          <p className="py-1 text-center text-xs text-ink-mute">No threads yet — start one.</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/community?channel=${node.id}`}
          className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line/10 bg-surface-2 px-3 py-2 text-xs font-bold text-ink transition hover:bg-line/5"
        >
          View channel
        </Link>
        <button
          onClick={() => !locked && onToggleJoin(node.id)}
          disabled={locked}
          className={cn(
            'focus-ring rounded-xl border px-3 py-1.5 text-xs font-bold transition disabled:cursor-default',
            joined
              ? 'border-line/15 text-ink-mute hover:text-ink disabled:opacity-60 disabled:hover:text-ink-mute'
              : 'border-brand/30 text-brand hover:bg-brand/10',
          )}
        >
          {joined ? 'Joined' : 'Join'}
        </button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function CommunityBrowse() {
  const { profile } = useProfile();
  const { target, saved, toggleSaved } = useAppStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | NodeKind>('all');

  const planIds = useMemo(
    () => getPlanChannelIds({ currentNodeId: profile.currentNodeId, target, saved }),
    [profile.currentNodeId, target, saved],
  );

  // Stable member counts; sort the biggest communities first (Reddit-style).
  const ranked = useMemo(
    () =>
      NODES.map((n) => ({ node: n, members: channelMemberCount(n) })).sort(
        (a, b) => b.members - a.members,
      ),
    [],
  );

  const trimmed = query.trim().toLowerCase();
  const results = ranked.filter(({ node }) => {
    if (filter !== 'all' && node.kind !== filter) return false;
    if (!trimmed) return true;
    return (
      node.title.toLowerCase().includes(trimmed) ||
      node.summary.toLowerCase().includes(trimmed)
    );
  });

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/community')}
          className="focus-ring mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-mute transition hover:text-ink"
        >
          <Icons.ArrowLeft size={14} />
          Back to your channels
        </button>
        <Badge tone="brand" icon={Icons.Compass}>
          Discover
        </Badge>
        <h1 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Browse all channels
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Every career, role and study route has a channel. Join the ones you care about.
        </p>
      </div>

      {/* Search + filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icons.Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full rounded-xl border border-line/12 bg-surface-2 py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-ink-mute outline-none transition focus:border-brand/40 focus:ring-1 focus:ring-brand/20"
          />
          {trimmed && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="focus-ring absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-lg text-ink-mute hover:text-ink"
            >
              <Icons.X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                filter === f.id
                  ? 'border-brand/30 bg-brand/10 text-brand'
                  : 'border-line/12 text-ink-mute hover:text-ink',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-ink-mute">
            <Icons.Search size={22} />
          </span>
          <p className="text-sm font-bold text-ink">No channels found</p>
          <p className="text-xs text-ink-mute">Try a different search or filter.</p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs font-semibold text-ink-mute">
            {results.length} {results.length === 1 ? 'channel' : 'channels'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map(({ node, members }) => (
              <ChannelCard
                key={node.id}
                node={node}
                members={members}
                inPlan={planIds.has(node.id)}
                inSaved={saved.includes(node.id)}
                onToggleJoin={toggleSaved}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
