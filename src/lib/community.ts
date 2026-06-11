import { getRoutesTo, type CareerNode, type Demand } from '@/lib/mockData';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Reply {
  id: string;
  author: string;
  initials: string;
  colorClass: string;
  text: string;
  time: string;
}

export interface Post {
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
// Accent + avatar palettes (shared between the feed and the browse grid)
// ---------------------------------------------------------------------------

export const ACCENT_COLOR: Record<string, { badge: string; icon: string; active: string }> = {
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

/** Stable string hash → unsigned int. */
function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function avatarColor(seed: string): string {
  return AVATAR_POOL[hashSeed(seed) % AVATAR_POOL.length];
}

// ---------------------------------------------------------------------------
// Seed posts per channel
// ---------------------------------------------------------------------------

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

export function getChannelPosts(nodeId: string): Post[] {
  return SEED_POSTS[nodeId] ?? [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * The channels in the user's career plan: current role, every step of the
 * recommended route toward the target, the target itself, and saved roles.
 */
export function getPlanChannelIds(opts: {
  currentNodeId: string;
  target: string;
  saved: string[];
}): Set<string> {
  const { currentNodeId, target, saved } = opts;
  const routes = getRoutesTo(target);
  const recommended = routes.find((r) => r.recommended) ?? routes[0];
  return new Set<string>([currentNodeId, ...(recommended?.path ?? []), target, ...saved]);
}

const DEMAND_WEIGHT: Record<Demand, number> = {
  surging: 3.4,
  high: 2.2,
  steady: 1.4,
  cooling: 0.85,
};

/**
 * A stable, plausible member count for a channel. Derived from the node id and
 * its market demand so busier fields read as larger communities.
 */
export function channelMemberCount(node: CareerNode): number {
  const base = 280 + (hashSeed(node.id) % 9000);
  return Math.round(base * DEMAND_WEIGHT[node.demand]);
}

/** Compact member-count label, e.g. 1240 → "1.2k". */
export function formatMembers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
