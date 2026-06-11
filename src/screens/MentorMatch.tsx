import { useState } from 'react';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { Button, Card, Badge } from '@/ui/components';
import { NODES, CURRENT_NODE_ID, TARGET_NODE_ID, getNode, getNodeIcon, type CareerNode } from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MatchStatus = 'none' | 'pending' | 'matched';

interface Mentor {
  id: string;
  name: string;
  initials: string;
  colorClass: string;
  currentRole: string;
  company: string;
  nodeIds: string[];           // which career nodes this mentor covers
  yearsExp: number;
  availability: string;
  bio: string;
  topics: string[];
  rating: number;
  sessionCount: number;
  responseTime: string;
}

// ---------------------------------------------------------------------------
// Mentor data — each mentor is anchored to one or more NODES
// ---------------------------------------------------------------------------

const MENTORS: Mentor[] = [
  {
    id: 'm1',
    name: 'Priya Nair',
    initials: 'PN',
    colorClass: 'bg-emerald-100 text-emerald-800',
    currentRole: 'Staff Frontend Engineer',
    company: 'Vercel',
    nodeIds: ['frontend-dev', 'fullstack-dev'],
    yearsExp: 8,
    availability: 'Tues & Thurs evenings',
    bio: 'Spent 5 years at startups before joining Vercel. I love helping engineers who are strong individual contributors figure out how to grow without going into management.',
    topics: ['Career ladders', 'IC growth', 'Code quality', 'System design'],
    rating: 4.9,
    sessionCount: 47,
    responseTime: 'Within 24h',
  },
  {
    id: 'm2',
    name: 'Alex Rivera',
    initials: 'AR',
    colorClass: 'bg-sky-100 text-sky-800',
    currentRole: 'Engineering Manager',
    company: 'Stripe',
    nodeIds: ['eng-manager', 'fullstack-dev'],
    yearsExp: 11,
    availability: 'Weekday mornings',
    bio: 'Made the IC to EM jump twice at different companies. The second time was much smoother. Happy to share what I learned and help you avoid the mistakes I made.',
    topics: ['IC to EM', '1:1s', 'Hiring', 'Difficult conversations'],
    rating: 4.8,
    sessionCount: 62,
    responseTime: 'Within 12h',
  },
  {
    id: 'm3',
    name: 'Jordan Kim',
    initials: 'JK',
    colorClass: 'bg-violet-100 text-violet-800',
    currentRole: 'Product Lead',
    company: 'Linear',
    nodeIds: ['product-lead', 'data-analyst'],
    yearsExp: 9,
    availability: 'Fri afternoons',
    bio: 'Came up through data analytics before moving into product. I help people who want to make that same transition and understand what the role actually demands day to day.',
    topics: ['Analyst to PM', 'Discovery', 'Prioritisation', 'Stakeholder alignment'],
    rating: 4.9,
    sessionCount: 38,
    responseTime: 'Within 48h',
  },
  {
    id: 'm4',
    name: 'Mia Chen',
    initials: 'MC',
    colorClass: 'bg-brand/10 text-brand',
    currentRole: 'Design Engineer',
    company: 'Figma',
    nodeIds: ['design-eng', 'frontend-dev'],
    yearsExp: 6,
    availability: 'Flexible weekends',
    bio: 'I bridge design and engineering and have done it at three different companies. If you are trying to break into design engineering or build a design system from scratch, I can help.',
    topics: ['Design systems', 'Figma to code', 'Portfolio building', 'Craft'],
    rating: 5.0,
    sessionCount: 29,
    responseTime: 'Within 24h',
  },
  {
    id: 'm5',
    name: 'Dev Patel',
    initials: 'DP',
    colorClass: 'bg-amber-100 text-amber-800',
    currentRole: 'AI Application Engineer',
    company: 'Anthropic',
    nodeIds: ['ai-eng', 'fullstack-dev'],
    yearsExp: 7,
    availability: 'Mon & Wed evenings',
    bio: 'Transitioned from full-stack to AI engineering 2 years ago. I help engineers understand what the role actually requires beyond prompt engineering -- evals, RAG pipelines, production LLM systems.',
    topics: ['LLMs in production', 'RAG', 'Evals', 'AI career pivot'],
    rating: 4.7,
    sessionCount: 21,
    responseTime: 'Within 24h',
  },
  {
    id: 'm6',
    name: 'Sara Mensah',
    initials: 'SM',
    colorClass: 'bg-rose-100 text-rose-800',
    currentRole: 'Senior Product Analyst',
    company: 'Shopify',
    nodeIds: ['data-analyst', 'product-lead'],
    yearsExp: 5,
    availability: 'Tues mornings',
    bio: 'I went from marketing analytics to product analytics and it was a bigger leap than I expected. Now I help people make it cleaner than I did. SQL, experimentation, and telling stories with data.',
    topics: ['SQL for PMs', 'A/B testing', 'Dashboard design', 'Data storytelling'],
    rating: 4.8,
    sessionCount: 33,
    responseTime: 'Within 24h',
  },
  {
    id: 'm7',
    name: 'Tom Burke',
    initials: 'TB',
    colorClass: 'bg-sky-100 text-sky-800',
    currentRole: 'Developer Advocate',
    company: 'Cloudflare',
    nodeIds: ['devrel', 'frontend-dev'],
    yearsExp: 6,
    availability: 'Async only (no calls)',
    bio: 'DevRel is a weird job and most job descriptions misrepresent it. I help engineers figure out if it is actually the right fit and how to build the communication skills that make it sustainable.',
    topics: ['Writing for devs', 'Public speaking', 'Community building', 'Content strategy'],
    rating: 4.6,
    sessionCount: 18,
    responseTime: 'Within 48h',
  },
  {
    id: 'm8',
    name: 'Leila Torres',
    initials: 'LT',
    colorClass: 'bg-amber-100 text-amber-800',
    currentRole: 'Founder & CEO',
    company: 'Archetype (YC S22)',
    nodeIds: ['startup-founder', 'product-lead'],
    yearsExp: 10,
    availability: 'Wed evenings',
    bio: 'Raised a seed round, built a team of 12, acquired by a Series B last year. I talk honestly about what founding is actually like -- the fundraising, the hiring mistakes, and the parts nobody posts about.',
    topics: ['0 to 1', 'Fundraising', 'Founder psychology', 'Early hiring'],
    rating: 4.9,
    sessionCount: 14,
    responseTime: 'Within 48h',
  },
  {
    id: 'm9',
    name: 'Omar Faruk',
    initials: 'OF',
    colorClass: 'bg-sky-100 text-sky-800',
    currentRole: 'VP of Product',
    company: 'Notion',
    nodeIds: ['mba', 'product-lead', 'eng-manager'],
    yearsExp: 14,
    availability: 'Monthly slots only',
    bio: 'Did an MBA mid-career after 7 years in engineering. I can help you decide if it is worth it, how to get in, and how to translate it back into a product or leadership role.',
    topics: ['MBA ROI', 'Career pivots', 'Executive presence', 'Strategic thinking'],
    rating: 5.0,
    sessionCount: 9,
    responseTime: 'Within 72h',
  },
];

// ---------------------------------------------------------------------------
// Derived: score a mentor against the user's current + target node
// ---------------------------------------------------------------------------

function scoreMentor(mentor: Mentor, currentId: string, targetId: string): number {
  let score = 0;
  if (mentor.nodeIds.includes(targetId)) score += 50;
  if (mentor.nodeIds.includes(currentId)) score += 30;
  score += mentor.rating * 4;
  return score;
}

// ---------------------------------------------------------------------------
// Accent colors per node accent
// ---------------------------------------------------------------------------

const ACCENT: Record<string, string> = {
  teal:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  wine:  'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  navy:  'bg-sky-50 text-sky-700 border-sky-200',
};

function nodeChipClass(node: CareerNode): string {
  return ACCENT[node.accent] ?? 'bg-surface-2 text-ink-soft border-line/12';
}

// ---------------------------------------------------------------------------
// Stars
// ---------------------------------------------------------------------------

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icons.Star
          key={i}
          size={11}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-line/30'}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-ink-soft">{rating.toFixed(1)}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// MentorCard
// ---------------------------------------------------------------------------

function MentorCard({
  mentor,
  status,
  relevantNodes,
  onRequest,
  onDismiss,
}: {
  mentor: Mentor;
  status: MatchStatus;
  relevantNodes: CareerNode[];
  onRequest: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={cn(
        'p-5 transition-all',
        status === 'matched' && 'border-brand/30 bg-brand/[0.02]',
        status === 'pending' && 'border-amber-300/40 bg-amber-50/30',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold',
            mentor.colorClass,
          )}
        >
          {mentor.initials}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-ink">{mentor.name}</p>
            {status === 'matched' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                <Icons.CheckCircle2 size={10} /> Matched
              </span>
            )}
            {status === 'pending' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <Icons.Clock size={10} /> Pending
              </span>
            )}
          </div>
          <p className="text-xs text-ink-mute mt-0.5">{mentor.currentRole} · {mentor.company}</p>
          <div className="mt-1 flex items-center gap-3 flex-wrap">
            <Stars rating={mentor.rating} />
            <span className="text-xs text-ink-mute">{mentor.sessionCount} sessions</span>
            <span className="text-xs text-ink-mute">{mentor.responseTime}</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-ink-mute">{mentor.yearsExp} yrs exp</span>
        </div>
      </div>

      {/* Relevant channels */}
      {relevantNodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {relevantNodes.map((node) => {
            const Icon = getIcon(getNodeIcon(node));
            return (
              <span
                key={node.id}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                  nodeChipClass(node),
                )}
              >
                <Icon size={10} strokeWidth={2.2} />
                {node.title}
              </span>
            );
          })}
        </div>
      )}

      {/* Bio */}
      <p className={cn('text-sm text-ink-soft leading-relaxed', !expanded && 'line-clamp-2')}>
        {mentor.bio}
      </p>
      {mentor.bio.length > 120 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-brand hover:underline focus-ring"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Topics */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {mentor.topics.map((t) => (
          <span
            key={t}
            className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Availability */}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-mute">
        <Icons.Calendar size={12} />
        {mentor.availability}
      </p>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-line/10 pt-4">
        {status === 'none' && (
          <>
            <Button
              size="sm"
              icon={Icons.Users}
              onClick={() => onRequest(mentor.id)}
              className="flex-1 sm:flex-none"
            >
              Request match
            </Button>
            <button
              onClick={() => onDismiss(mentor.id)}
              className="focus-ring rounded-xl border border-line/12 px-3 py-1.5 text-xs font-semibold text-ink-mute transition hover:bg-line/5 hover:text-ink"
            >
              Not for me
            </button>
          </>
        )}
        {status === 'pending' && (
          <>
            <span className="flex-1 text-xs text-ink-mute">Request sent — waiting for {mentor.name.split(' ')[0]} to accept.</span>
            <button
              onClick={() => onDismiss(mentor.id)}
              className="focus-ring rounded-xl border border-line/12 px-3 py-1.5 text-xs font-semibold text-ink-mute transition hover:bg-line/5"
            >
              Cancel
            </button>
          </>
        )}
        {status === 'matched' && (
          <>
            <Button size="sm" icon={Icons.Mail} className="flex-1 sm:flex-none">
              Message {mentor.name.split(' ')[0]}
            </Button>
            <Button size="sm" variant="secondary" icon={Icons.Calendar}>
              Book a session
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

type FilterId = 'all' | 'recommended' | 'matched';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',         label: 'All mentors'   },
  { id: 'recommended', label: 'Recommended'   },
  { id: 'matched',     label: 'My matches'    },
];

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function MentorMatch() {
  const currentNode = getNode(CURRENT_NODE_ID)!;
  const targetNode  = getNode(TARGET_NODE_ID)!;

  const [filter, setFilter]     = useState<FilterId>('all');
  const [statuses, setStatuses] = useState<Record<string, MatchStatus>>({});

  const scored = [...MENTORS]
    .map((m) => ({ mentor: m, score: scoreMentor(m, CURRENT_NODE_ID, TARGET_NODE_ID) }))
    .sort((a, b) => b.score - a.score);

  const recommended = scored.filter((s) => s.score >= 70).map((s) => s.mentor.id);

  const visible = scored
    .filter(({ mentor }) => {
      const status = statuses[mentor.id] ?? 'none';
      if (filter === 'recommended') return recommended.includes(mentor.id);
      if (filter === 'matched')     return status === 'matched' || status === 'pending';
      return status !== 'none' || true;
    })
    .filter(({ mentor }) => (statuses[mentor.id] ?? 'none') !== 'dismissed' as any)
    .map(({ mentor }) => mentor);

  const request = (id: string) =>
    setStatuses((prev) => ({ ...prev, [id]: 'pending' }));

  const dismiss = (id: string) =>
    setStatuses((prev) => ({ ...prev, [id]: 'none' }));

  const matchedCount  = Object.values(statuses).filter((s) => s === 'matched' || s === 'pending').length;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      {/* Page header */}
      <div className="mb-5">
        <Badge tone="brand" icon={Icons.Users}>
          Mentor Match
        </Badge>
        <h1 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Find your mentor
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Matched to your path from{' '}
          <span className="font-semibold text-ink">{currentNode.title}</span>
          {' '}to{' '}
          <span className="font-semibold text-ink">{targetNode.title}</span>.
        </p>
      </div>

      {/* Path context chips */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[currentNode, targetNode].map((node, i) => {
          const Icon = getIcon(getNodeIcon(node));
          return (
            <span key={node.id} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold',
                  nodeChipClass(node),
                )}
              >
                <Icon size={12} strokeWidth={2.2} />
                {node.title}
              </span>
              {i === 0 && <Icons.ArrowRight size={14} className="text-ink-mute" />}
            </span>
          );
        })}
        {matchedCount > 0 && (
          <span className="ml-auto text-xs font-semibold text-brand">
            {matchedCount} active {matchedCount === 1 ? 'match' : 'matches'}
          </span>
        )}
      </div>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'focus-ring rounded-full border px-3.5 py-1.5 text-xs font-bold transition',
              filter === f.id
                ? 'border-brand/30 bg-brand/10 text-brand'
                : 'border-line/12 bg-surface text-ink-mute hover:border-line/25',
            )}
          >
            {f.label}
            {f.id === 'recommended' && (
              <span className="ml-1.5 rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                {recommended.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mentor list */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-ink-mute">
            <Icons.Users size={22} />
          </span>
          <p className="text-sm font-bold text-ink">
            {filter === 'matched' ? 'No active matches yet' : 'No mentors found'}
          </p>
          <p className="text-xs text-ink-mute">
            {filter === 'matched'
              ? 'Request a match from the All mentors tab to get started.'
              : 'Try a different filter.'}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              View all mentors
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((mentor) => {
            const relevantNodes = mentor.nodeIds
              .map((id) => getNode(id))
              .filter((n): n is CareerNode => Boolean(n));
            return (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                status={statuses[mentor.id] ?? 'none'}
                relevantNodes={relevantNodes}
                onRequest={request}
                onDismiss={dismiss}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}