/**
 * Mock domain model for CareerOS / Traileers™.
 * Nodes are positioned on a 1000x680 virtual canvas; the SVG map maps these
 * into screen space with pan/zoom.
 */

export type NodeKind = 'job' | 'career' | 'industry';
export type Demand = 'surging' | 'high' | 'steady' | 'cooling';

export const NODE_KIND_META: Record<
  NodeKind,
  {
    label: string;
    shortLabel: string;
    icon: string;
    mapShape: 'circle' | 'hex' | 'square';
    badgeTone: 'brand' | 'amber' | 'wine' | 'neutral' | 'emerald' | 'navy';
    detailTitle: string;
    detailCopy: string;
    signals: string[];
  }
> = {
  job: {
    label: 'Job role',
    shortLabel: 'Job',
    icon: 'Briefcase',
    mapShape: 'circle',
    badgeTone: 'brand',
    detailTitle: 'Execution role',
    detailCopy:
      'A near-term position with hiring volume, salary range and skill-fit signals you can act on directly.',
    signals: ['Skill proximity', 'Open roles', 'Next-hop moves'],
  },
  career: {
    label: 'Career track',
    shortLabel: 'Career',
    icon: 'Flag',
    mapShape: 'hex',
    badgeTone: 'amber',
    detailTitle: 'Long-horizon track',
    detailCopy:
      'A broader destination or leadership arc where scope, trajectory and transition timing matter more than a single posting.',
    signals: ['Scope growth', 'Trajectory fit', 'Leadership surface'],
  },
  industry: {
    label: 'Route / study',
    shortLabel: 'Route',
    icon: 'GraduationCap',
    mapShape: 'square',
    badgeTone: 'navy',
    detailTitle: 'Credential route',
    detailCopy:
      'A structured pathway that can unlock transitions through formal learning, network access or industry credibility.',
    signals: ['Time investment', 'Credential value', 'Network access'],
  },
};

export interface CareerNode {
  id: string;
  title: string;
  kind: NodeKind;
  /** virtual canvas coords */
  x: number;
  y: number;
  /** ring accent */
  accent: 'teal' | 'wine' | 'amber' | 'navy';
  salary: { min: number; max: number; currency: string };
  demand: Demand;
  /** market growth %, signed */
  growth: number;
  openRoles: number;
  /** 0..100 — how well the user currently fits this node */
  match: number;
  summary: string;
  topSkills: string[];
  /** demand sparkline (last 6 quarters, normalized 0..1 handled in UI) */
  trend: number[];
}

export interface CareerEdge {
  from: string;
  to: string;
  /** feasibility 0..100 of making this single hop */
  feasibility: number;
  /** typical time in months */
  months: number;
  kind: 'lateral' | 'promotion' | 'pivot' | 'study';
}

export interface NextAction {
  id: string;
  timeframe: string;
  title: string;
  description: string;
  effort: string;
  /** the "how": a short paragraph on why + how to approach the task */
  detail: string;
  /** concrete checkable subtasks generated for this task */
  subtasks: string[];
}

const NEXT_ACTION_PLAYBOOK: Record<NodeKind, Omit<NextAction, 'id'>[]> = {
  job: [
    {
      timeframe: 'Today',
      title: 'Pick one missing proof point',
      description:
        'Choose the most visible skill gap and define one portfolio-sized artifact that proves it.',
      effort: '25 min',
      detail:
        'Hiring managers skim for evidence, not adjectives. Instead of trying to fix everything, turn your single biggest gap into one artifact they can click on. Small and specific beats broad and vague.',
      subtasks: [
        'List the 3 skills this role asks for most',
        'Mark the one you can least prove today',
        'Define a portfolio-sized artifact that proves it',
        'Block 25 minutes on your calendar to start it',
      ],
    },
    {
      timeframe: 'This week',
      title: 'Compare three real postings',
      description:
        'Extract repeated requirements and rewrite your profile around the skills employers actually name.',
      effort: '45 min',
      detail:
        'Three live job posts are a free requirements document. The words that repeat across all three are the ones screeners actually filter on — mirror that language back in your profile.',
      subtasks: [
        'Open 3 live postings for this exact role',
        'Highlight every requirement that repeats',
        'Split them into must-have vs nice-to-have',
        'Rewrite your headline around the must-haves',
      ],
    },
    {
      timeframe: 'This month',
      title: 'Ship a targeted work sample',
      description:
        'Create one role-specific case study, demo or analysis that can be linked in an application.',
      effort: '4-6 hr',
      detail:
        'One concrete sample outperforms a page of bullet points. Build the smallest thing that still proves the skill, then make it openable in 30 seconds from a single link.',
      subtasks: [
        'Scope a small case study, demo or analysis',
        'Build the smallest version that still proves skill',
        'Write a 3-line summary of the outcome',
        'Add a shareable link to your profile',
      ],
    },
  ],
  career: [
    {
      timeframe: 'Today',
      title: 'Choose a stepping-stone role',
      description:
        'Select the closest feeder role so the destination becomes a sequence instead of a vague leap.',
      effort: '20 min',
      detail:
        'Big destinations feel unreachable because they are usually two or three hops away, not one. Pick the closest realistic feeder role and the leap turns into a sequence you can actually plan.',
      subtasks: [
        'List feeder roles one hop from your target',
        'Score each on feasibility and personal fit',
        'Pick the closest realistic next step',
        'Note the 2 skills it builds toward the target',
      ],
    },
    {
      timeframe: 'This week',
      title: 'Map the influence gap',
      description:
        'Identify where you need more ownership: strategy, people, stakeholders, revenue or delivery.',
      effort: '45 min',
      detail:
        'Leadership tracks reward scope, not seniority. Find the single dimension where you have the least ownership today, then go looking for one project that forces you to grow it.',
      subtasks: [
        'List where you already hold real ownership',
        'Mark the gap: strategy, people, stakeholders or revenue',
        'Find one project that closes that gap',
        'Name a person who could sponsor it',
      ],
    },
    {
      timeframe: 'This month',
      title: 'Lead one visible initiative',
      description:
        'Create evidence of scope by owning a decision, metric or cross-functional outcome end to end.',
      effort: '6-8 hr',
      detail:
        'Promotion committees look for proof you already operate at the next level. Owning one outcome end to end — and writing up the result — is that proof in its most portable form.',
      subtasks: [
        'Pick a decision, metric or outcome to own',
        'Define what success looks like in numbers',
        'Run it end to end for one full cycle',
        'Write up the result as evidence of scope',
      ],
    },
  ],
  industry: [
    {
      timeframe: 'Today',
      title: 'Calculate the commitment',
      description:
        'Estimate time, cost and opportunity cost before treating this route as the default path.',
      effort: '30 min',
      detail:
        'Credential routes are expensive in time and money, so treat the decision like an investment. Put real numbers on it and set a threshold before you let momentum make the choice for you.',
      subtasks: [
        'Estimate the total time in months',
        'Estimate direct cost + opportunity cost',
        'Compare it against a no-credential path',
        'Decide a clear go / no-go threshold',
      ],
    },
    {
      timeframe: 'This week',
      title: 'Validate with two people',
      description:
        'Talk to someone who completed the route and someone who hired from it to test real signal value.',
      effort: '2 calls',
      detail:
        'The brochure never tells you what a credential actually signals. Two short conversations — one graduate, one hiring manager — reveal whether it changes outcomes or just looks good on paper.',
      subtasks: [
        'Find someone who completed this route',
        'Find someone who hires from it',
        'Ask both what signal it really sends',
        'Write down whether it changes hiring',
      ],
    },
    {
      timeframe: 'This month',
      title: 'Run a low-cost trial',
      description:
        'Take a short module, workshop or project before committing to the full credential path.',
      effort: '3-5 hr',
      detail:
        'You can sample most routes before you commit to them. A short module tests both the subject and your own appetite for it, so the full program becomes a confident yes rather than a sunk cost.',
      subtasks: [
        'Find a short module or intro workshop',
        'Commit 3-5 hours to actually finishing it',
        'Judge the fit before the full program',
        'Decide whether to commit fully',
      ],
    },
  ],
};

export const CURRENT_NODE_ID = 'frontend-dev';
export const TARGET_NODE_ID = 'product-lead';

export const NODES: CareerNode[] = [
  {
    id: 'frontend-dev',
    title: 'Frontend Engineer',
    kind: 'job',
    x: 180,
    y: 360,
    accent: 'teal',
    salary: { min: 95, max: 140, currency: '$' },
    demand: 'high',
    growth: 12,
    openRoles: 4820,
    match: 100,
    summary:
      'Builds the user-facing layer of web products. Your current starting point, inferred from your background.',
    topSkills: ['React', 'TypeScript', 'UI Systems', 'Accessibility'],
    trend: [0.5, 0.55, 0.6, 0.58, 0.66, 0.72],
  },
  {
    id: 'fullstack-dev',
    title: 'Full-Stack Engineer',
    kind: 'job',
    x: 420,
    y: 230,
    accent: 'teal',
    salary: { min: 110, max: 165, currency: '$' },
    demand: 'high',
    growth: 15,
    openRoles: 6210,
    match: 78,
    summary:
      'Owns features end-to-end across client and server. A natural lateral extension of frontend work.',
    topSkills: ['Node.js', 'React', 'Databases', 'APIs', 'Cloud'],
    trend: [0.45, 0.5, 0.58, 0.62, 0.7, 0.78],
  },
  {
    id: 'design-eng',
    title: 'Design Engineer',
    kind: 'job',
    x: 400,
    y: 480,
    accent: 'wine',
    salary: { min: 105, max: 155, currency: '$' },
    demand: 'surging',
    growth: 28,
    openRoles: 1340,
    match: 71,
    summary:
      'Bridges design systems and code. High leverage if you love craft and visual polish.',
    topSkills: ['Design Systems', 'Figma', 'Motion', 'CSS', 'Prototyping'],
    trend: [0.3, 0.38, 0.5, 0.6, 0.74, 0.9],
  },
  {
    id: 'eng-manager',
    title: 'Engineering Manager',
    kind: 'career',
    x: 660,
    y: 180,
    accent: 'navy',
    salary: { min: 150, max: 220, currency: '$' },
    demand: 'steady',
    growth: 6,
    openRoles: 2100,
    match: 54,
    summary:
      'Leads and grows engineering teams. A people-oriented promotion track.',
    topSkills: ['Leadership', 'Mentoring', 'Roadmapping', 'Hiring'],
    trend: [0.6, 0.6, 0.58, 0.59, 0.6, 0.62],
  },
  {
    id: 'product-lead',
    title: 'Product Lead',
    kind: 'career',
    x: 720,
    y: 360,
    accent: 'amber',
    salary: { min: 145, max: 210, currency: '$' },
    demand: 'high',
    growth: 18,
    openRoles: 3050,
    match: 62,
    summary:
      'Owns product strategy and outcomes. Your target destination — strong narrative fit with your shipping history.',
    topSkills: ['Product Strategy', 'Discovery', 'Analytics', 'Stakeholders'],
    trend: [0.5, 0.54, 0.6, 0.66, 0.72, 0.8],
  },
  {
    id: 'data-analyst',
    title: 'Product Analyst',
    kind: 'job',
    x: 470,
    y: 600,
    accent: 'teal',
    salary: { min: 85, max: 130, currency: '$' },
    demand: 'steady',
    growth: 9,
    openRoles: 2780,
    match: 58,
    summary:
      'Turns product data into decisions. A common feeder into product roles.',
    topSkills: ['SQL', 'Experimentation', 'Dashboards', 'Storytelling'],
    trend: [0.5, 0.52, 0.55, 0.54, 0.57, 0.6],
  },
  {
    id: 'devrel',
    title: 'Developer Advocate',
    kind: 'job',
    x: 230,
    y: 150,
    accent: 'wine',
    salary: { min: 100, max: 150, currency: '$' },
    demand: 'cooling',
    growth: -4,
    openRoles: 540,
    match: 64,
    summary:
      'Champions products to developer communities. Communication-heavy pivot.',
    topSkills: ['Writing', 'Speaking', 'Community', 'Demos'],
    trend: [0.7, 0.66, 0.6, 0.55, 0.5, 0.46],
  },
  {
    id: 'ai-eng',
    title: 'AI Application Engineer',
    kind: 'job',
    x: 660,
    y: 540,
    accent: 'amber',
    salary: { min: 130, max: 200, currency: '$' },
    demand: 'surging',
    growth: 41,
    openRoles: 3900,
    match: 49,
    summary:
      'Builds products on top of LLMs and agents. The fastest-growing adjacent role.',
    topSkills: ['LLMs', 'RAG', 'Eval', 'TypeScript', 'Prompting'],
    trend: [0.2, 0.3, 0.45, 0.62, 0.82, 1.0],
  },
  {
    id: 'mba',
    title: 'MBA / Product Mgmt Cert',
    kind: 'industry',
    x: 900,
    y: 260,
    accent: 'navy',
    salary: { min: 0, max: 0, currency: '$' },
    demand: 'steady',
    growth: 3,
    openRoles: 0,
    match: 40,
    summary:
      'Formal study route that accelerates a move into leadership or product.',
    topSkills: ['Strategy', 'Finance', 'Operations', 'Network'],
    trend: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  },
  {
    id: 'startup-founder',
    title: 'Startup Founder',
    kind: 'career',
    x: 900,
    y: 470,
    accent: 'wine',
    salary: { min: 0, max: 0, currency: '$' },
    demand: 'high',
    growth: 0,
    openRoles: 0,
    match: 38,
    summary:
      'Builds a company from zero. High variance; a long-horizon destination.',
    topSkills: ['0→1', 'Fundraising', 'Sales', 'Resilience'],
    trend: [0.5, 0.55, 0.5, 0.6, 0.55, 0.62],
  },
];

export const EDGES: CareerEdge[] = [
  { from: 'frontend-dev', to: 'fullstack-dev', feasibility: 88, months: 8, kind: 'lateral' },
  { from: 'frontend-dev', to: 'design-eng', feasibility: 82, months: 6, kind: 'lateral' },
  { from: 'frontend-dev', to: 'devrel', feasibility: 70, months: 5, kind: 'pivot' },
  { from: 'frontend-dev', to: 'data-analyst', feasibility: 55, months: 9, kind: 'pivot' },
  { from: 'fullstack-dev', to: 'eng-manager', feasibility: 64, months: 18, kind: 'promotion' },
  { from: 'fullstack-dev', to: 'ai-eng', feasibility: 60, months: 12, kind: 'pivot' },
  { from: 'fullstack-dev', to: 'product-lead', feasibility: 58, months: 16, kind: 'pivot' },
  { from: 'design-eng', to: 'product-lead', feasibility: 61, months: 14, kind: 'pivot' },
  { from: 'data-analyst', to: 'product-lead', feasibility: 72, months: 12, kind: 'promotion' },
  { from: 'eng-manager', to: 'product-lead', feasibility: 66, months: 10, kind: 'lateral' },
  { from: 'eng-manager', to: 'mba', feasibility: 50, months: 24, kind: 'study' },
  { from: 'product-lead', to: 'mba', feasibility: 55, months: 24, kind: 'study' },
  { from: 'product-lead', to: 'startup-founder', feasibility: 44, months: 20, kind: 'pivot' },
  { from: 'ai-eng', to: 'startup-founder', feasibility: 40, months: 22, kind: 'pivot' },
  { from: 'ai-eng', to: 'product-lead', feasibility: 52, months: 14, kind: 'pivot' },
];

export interface RouteStep {
  nodeId: string;
  edge?: CareerEdge;
  note: string;
}

export interface Route {
  id: string;
  label: string;
  tagline: string;
  /** ordered node ids including start + end */
  path: string[];
  feasibility: number;
  months: number;
  salaryDelta: number; // % uplift at destination
  recommended?: boolean;
  tradeoffs: { label: string; value: string; tone: 'good' | 'warn' | 'neutral' }[];
}

export const ROUTES: Route[] = [
  {
    id: 'route-analyst',
    label: 'The Evidence Route',
    tagline: 'Prove product instincts with data before the title change.',
    path: ['frontend-dev', 'data-analyst', 'product-lead'],
    feasibility: 74,
    months: 21,
    salaryDelta: 34,
    recommended: true,
    tradeoffs: [
      { label: 'Feasibility', value: '74%', tone: 'good' },
      { label: 'Time to target', value: '~21 mo', tone: 'neutral' },
      { label: 'Salary uplift', value: '+34%', tone: 'good' },
      { label: 'Learning curve', value: 'Moderate', tone: 'warn' },
    ],
  },
  {
    id: 'route-fullstack',
    label: 'The Breadth Route',
    tagline: 'Widen technical surface area, then lead the product around it.',
    path: ['frontend-dev', 'fullstack-dev', 'product-lead'],
    feasibility: 63,
    months: 24,
    salaryDelta: 31,
    tradeoffs: [
      { label: 'Feasibility', value: '63%', tone: 'neutral' },
      { label: 'Time to target', value: '~24 mo', tone: 'warn' },
      { label: 'Salary uplift', value: '+31%', tone: 'good' },
      { label: 'Learning curve', value: 'High', tone: 'warn' },
    ],
  },
  {
    id: 'route-design',
    label: 'The Craft Route',
    tagline: 'Lean into product sense through design-engineering.',
    path: ['frontend-dev', 'design-eng', 'product-lead'],
    feasibility: 67,
    months: 20,
    salaryDelta: 28,
    tradeoffs: [
      { label: 'Feasibility', value: '67%', tone: 'good' },
      { label: 'Time to target', value: '~20 mo', tone: 'good' },
      { label: 'Salary uplift', value: '+28%', tone: 'neutral' },
      { label: 'Learning curve', value: 'Low', tone: 'good' },
    ],
  },
];

function midSalary(node: CareerNode): number {
  if (!node.salary.max) return 0;
  return (node.salary.min + node.salary.max) / 2;
}

/** Enumerate every simple forward path from `fromId` to `toId` (bounded depth). */
function enumeratePaths(fromId: string, toId: string, maxHops = 3): string[][] {
  const paths: string[][] = [];
  const walk = (current: string, visited: string[], hops: number) => {
    if (current === toId) {
      paths.push(visited);
      return;
    }
    if (hops >= maxHops) return;
    for (const e of EDGES.filter((x) => x.from === current)) {
      if (visited.includes(e.to)) continue;
      walk(e.to, [...visited, e.to], hops + 1);
    }
  };
  walk(fromId, [fromId], 0);
  return paths;
}

/**
 * Routes between two nodes. Curated routes win for the default prototype
 * story; otherwise we synthesise routes from the graph so any reachable target
 * produces a real, ranked plan.
 */
export function getRoutesBetween(fromId: string, toId: string): Route[] {
  const curated = ROUTES.filter(
    (r) => r.path[0] === fromId && r.path[r.path.length - 1] === toId,
  );
  if (curated.length) return curated;

  const from = getNode(fromId);
  const target = getNode(toId);
  if (!from || !target || toId === fromId) return [];

  const fromMid = midSalary(from);
  const targetMid = midSalary(target);
  const salaryDelta =
    fromMid && targetMid ? Math.round(((targetMid - fromMid) / fromMid) * 100) : 0;

  const built = enumeratePaths(fromId, toId).map((path): Route => {
    let feasProduct = 1;
    let months = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const e = EDGES.find((x) => x.from === path[i] && x.to === path[i + 1])!;
      feasProduct *= e.feasibility / 100;
      months += e.months;
    }
    const feasibility = Math.round(feasProduct * 100);
    const hops = path.length - 1;
    const curve = hops <= 1 ? 'Low' : hops === 2 ? 'Moderate' : 'High';
    const middle = path
      .slice(1, -1)
      .map((id) => getNode(id)?.title)
      .filter((t): t is string => Boolean(t));

    return {
      id: `gen-${path.join('-')}`,
      label: middle.length ? `Via ${middle.join(' & ')}` : 'Direct move',
      tagline: middle.length
        ? `Route through ${middle.join(', then ')} before landing the target.`
        : 'A single decisive hop straight to the target.',
      path,
      feasibility,
      months,
      salaryDelta,
      tradeoffs: [
        {
          label: 'Feasibility',
          value: `${feasibility}%`,
          tone: feasibility >= 60 ? 'good' : feasibility >= 45 ? 'neutral' : 'warn',
        },
        {
          label: 'Time to target',
          value: `~${months} mo`,
          tone: months <= 14 ? 'good' : months <= 24 ? 'neutral' : 'warn',
        },
        {
          label: 'Salary uplift',
          value: salaryDelta > 0 ? `+${salaryDelta}%` : '—',
          tone: salaryDelta > 0 ? 'good' : 'neutral',
        },
        {
          label: 'Learning curve',
          value: curve,
          tone: curve === 'Low' ? 'good' : curve === 'Moderate' ? 'neutral' : 'warn',
        },
      ],
    };
  });

  built.sort((a, b) => b.feasibility - a.feasibility);
  const top = built.slice(0, 3);
  if (top[0]) top[0] = { ...top[0], recommended: true };
  return top;
}

/** Backwards-compatible default-target helper used by older surfaces. */
export function getRoutesTo(toId: string): Route[] {
  return getRoutesBetween(CURRENT_NODE_ID, toId);
}

export interface Employer {
  id: string;
  name: string;
  role: string;
  nodeId: string;
  location: string;
  remote: boolean;
  verified: boolean;
  posted: string;
  /** preferred prior nodes */
  prefersPath: string[];
}

export const EMPLOYERS: Employer[] = [
  {
    id: 'e1',
    name: 'Northwind',
    role: 'Senior Product Manager, Growth',
    nodeId: 'product-lead',
    location: 'Remote · US',
    remote: true,
    verified: true,
    posted: '2d ago',
    prefersPath: ['data-analyst', 'product-lead'],
  },
  {
    id: 'e2',
    name: 'Lumen Labs',
    role: 'Product Lead, Platform',
    nodeId: 'product-lead',
    location: 'New York, NY',
    remote: false,
    verified: true,
    posted: '5d ago',
    prefersPath: ['eng-manager', 'product-lead'],
  },
  {
    id: 'e3',
    name: 'Drift',
    role: 'AI Product Engineer',
    nodeId: 'ai-eng',
    location: 'Remote · Global',
    remote: true,
    verified: true,
    posted: '1d ago',
    prefersPath: ['fullstack-dev', 'ai-eng'],
  },
];

export interface PatternRow {
  id: string;
  label: string;
  share: number; // % of people who took this trajectory
  outcome: string;
  kind: 'common' | 'lateral' | 'study' | 'gap';
}

export const PATTERNS: PatternRow[] = [
  { id: 'p1', label: 'Frontend → Full-Stack → Product', share: 31, outcome: 'Most common to target', kind: 'common' },
  { id: 'p2', label: 'Frontend → Product Analyst → Product', share: 22, outcome: 'Highest success rate', kind: 'common' },
  { id: 'p3', label: 'Frontend → Design Eng → Product', share: 14, outcome: 'Fastest median time', kind: 'lateral' },
  { id: 'p4', label: 'Career gap → re-entry via cert', share: 9, outcome: '14 mo avg gap recovered', kind: 'gap' },
  { id: 'p5', label: 'Frontend → MBA → Product', share: 7, outcome: 'Higher ceiling, slower', kind: 'study' },
];

// ---- Assessment options -------------------------------------------------

export const ASSESSMENT = {
  background: [
    { id: 'cs', label: 'Computer Science degree', icon: 'GraduationCap' },
    { id: 'bootcamp', label: 'Coding bootcamp', icon: 'Rocket' },
    { id: 'self', label: 'Self-taught / independent study', icon: 'BookOpen' },
    { id: 'design', label: 'Design or UX', icon: 'PenTool' },
    { id: 'business', label: 'Business or operations', icon: 'Briefcase' },
    { id: 'stem', label: 'STEM or analytics', icon: 'Brain' },
    { id: 'customer', label: 'Customer-facing work', icon: 'Users' },
    { id: 'other', label: 'Other field or path', icon: 'Shapes' },
  ],
  skills: [
    'Software engineering',
    'Data analysis',
    'Product strategy',
    'Design / UX',
    'Leadership',
    'Communication',
    'Project management',
    'Customer research',
    'AI / automation',
    'Sales',
    'Operations',
    'Cybersecurity',
  ],
  priorities: [
    { id: 'comp', label: 'Compensation', icon: 'Banknote' },
    { id: 'growth', label: 'Fast growth', icon: 'TrendingUp' },
    { id: 'balance', label: 'Work–life balance', icon: 'Scale' },
    { id: 'impact', label: 'Impact', icon: 'Target' },
    { id: 'remote', label: 'Remote-first', icon: 'Globe' },
    { id: 'stability', label: 'Stability', icon: 'ShieldCheck' },
  ],
} as const;

export function getNode(id: string): CareerNode | undefined {
  return NODES.find((n) => n.id === id);
}

export function getNodeKindMeta(kind: NodeKind) {
  return NODE_KIND_META[kind];
}

export function getNextActions(node: CareerNode): NextAction[] {
  return NEXT_ACTION_PLAYBOOK[node.kind].map((action, index) => ({
    ...action,
    id: `${node.id}-action-${index}`,
    description: action.description.replace('skill gap', `${node.topSkills[0]} gap`),
  }));
}

/**
 * Occupation icon (lucide name) per role, resolved with `getIcon`. Falls back to
 * a kind-appropriate icon so every node shows something meaningful — never a
 * generic dot.
 */
const NODE_ICON: Record<string, string> = {
  'frontend-dev': 'Laptop',
  'fullstack-dev': 'Code2',
  'design-eng': 'PenTool',
  'eng-manager': 'Users',
  'product-lead': 'Package',
  'data-analyst': 'LineChart',
  devrel: 'Megaphone',
  'ai-eng': 'Brain',
  mba: 'GraduationCap',
  'startup-founder': 'Rocket',
};

export function getNodeIcon(node: CareerNode): string {
  if (NODE_ICON[node.id]) return NODE_ICON[node.id];
  if (node.kind === 'industry') return 'Building2';
  if (node.kind === 'career') return 'TrendingUp';
  return 'Briefcase';
}

/**
 * What each skill actually demands — the "how deep" rather than just the name.
 * Used for the skill tooltips on the node detail page.
 */
const SKILL_INFO: Record<string, string> = {
  React:
    'Build component-driven UIs with hooks and state. Deep enough to manage data flow, performance and reusable patterns — not just glue tutorials together.',
  TypeScript:
    'Type everyday app code with confidence: interfaces, generics and inference where they help. Compiler-theory depth is not expected.',
  'UI Systems':
    'Design and maintain reusable component libraries with consistent tokens, spacing, and interaction states.',
  Accessibility:
    'Ship WCAG-compliant interfaces: semantic HTML, full keyboard nav, ARIA where needed, and real screen-reader testing.',
  'Node.js':
    'Write server-side JavaScript — HTTP/REST, async I/O, the package ecosystem and basic runtime/process concerns.',
  Databases:
    'Model data and write efficient queries across SQL (and one NoSQL). Understand indexes, joins and transactions.',
  APIs: 'Design and consume REST/GraphQL endpoints with auth, versioning and sensible error contracts.',
  Cloud:
    'Deploy and run apps on a major cloud: compute, storage, networking basics and a working CI/CD pipeline.',
  'Design Systems':
    'Own the bridge between Figma libraries and coded components, keeping both in lockstep as the source of truth.',
  Figma:
    'Production-level fluency: components, auto-layout, variants and interactive prototypes — well past view-only.',
  Motion: 'Craft purposeful UI animation with real control over easing, timing and choreography (CSS/JS or GSAP).',
  CSS: 'Master modern layout (flexbox/grid), responsive design, custom properties and selectors — deep enough to build a design system without leaning on a framework.',
  Prototyping: 'Turn ideas into clickable flows fast, to validate direction before engineering invests.',
  Leadership:
    'Set direction, give hard feedback and grow people. You own outcomes through a team, not solo output.',
  Mentoring: 'Coach engineers 1:1 — unblock them, review their work and level them up deliberately.',
  Roadmapping:
    'Sequence work against goals and real capacity, and communicate the trade-offs to stakeholders.',
  Hiring: 'Run structured interviews, calibrate signal across a panel, and close strong candidates.',
  'Product Strategy':
    'Decide what to build and why — positioning, the bets you are making, and the outcomes you will measure.',
  Discovery:
    'Validate problems before solutions: user interviews, opportunity sizing and cheap assumption tests.',
  Analytics:
    'Define the right metrics, read funnels and judge experiments to drive decisions — not vanity charts.',
  Stakeholders: 'Align execs, engineering and go-to-market around one plan; manage expectations and conflict.',
  SQL: 'Comfortably join, aggregate and window over real datasets — and tune a slow query when it matters.',
  Experimentation: 'Design A/B tests with proper power, guardrail metrics and an honest readout.',
  Dashboards: 'Build self-serve views in a BI tool that answer recurring questions without a follow-up.',
  Storytelling: 'Turn data into a narrative that moves a decision: structure, framing and clear visuals.',
  LLMs: 'Apply large language models in products — context windows, tool use, function calling and their limits.',
  RAG: 'Build retrieval-augmented pipelines: chunking, embeddings, vector search and grounded answers.',
  Eval: 'Measure model and app quality with offline + online evals and a regression suite you trust.',
  Prompting: 'Engineer reliable prompts and system messages, and know when to reach for tools or fine-tuning instead.',
  Writing: 'Explain technical ideas clearly across docs, posts and tutorials.',
  Speaking: 'Present and demo to live audiences with confidence and clarity.',
  Community: 'Grow and genuinely support a developer community across multiple channels.',
  Demos: 'Build compelling live or recorded product demos that land the value fast.',
  Strategy: 'Frame long-range choices: where to play, how to win, and what to say no to.',
  Finance: 'Read financial statements, model unit economics and reason about capital.',
  Operations: 'Design the processes and systems that let a function scale reliably.',
  Network: 'Build and leverage relationships for access, hiring and deals.',
  '0→1': 'Take a product from nothing to first traction with extreme scrappiness.',
  Fundraising: 'Tell the story, build the model and actually run a raise with investors.',
  Sales: 'Find, qualify and close customers — you own the full pipeline early on.',
  Resilience: 'Sustain energy and judgment through prolonged uncertainty and setbacks.',
};

export function getSkillInfo(skill: string): string {
  return (
    SKILL_INFO[skill] ??
    'A core competency for this role — expect hands-on, working proficiency rather than passing familiarity.'
  );
}

export function edgesOf(id: string): CareerEdge[] {
  return EDGES.filter((e) => e.from === id || e.to === id);
}

export const EDGE_KIND_META: Record<
  CareerEdge['kind'],
  { label: string; icon: string; tone: string; accent: 'teal' | 'amber' | 'navy' | 'wine' }
> = {
  lateral: { label: 'Lateral move', icon: 'ChevronsRight', tone: 'text-brand', accent: 'teal' },
  promotion: { label: 'Promotion', icon: 'TrendingUp', tone: 'text-emerald-500', accent: 'amber' },
  pivot: { label: 'Pivot', icon: 'GitFork', tone: 'text-wine', accent: 'wine' },
  study: { label: 'Study route', icon: 'GraduationCap', tone: 'text-ink-soft', accent: 'navy' },
};

export interface NextHop {
  edge: CareerEdge;
  node: CareerNode;
}

/** Outbound moves you can make *from* this node, best feasibility first. */
export function getNextHops(id: string): NextHop[] {
  return EDGES.filter((e) => e.from === id)
    .map((e) => ({ edge: e, node: getNode(e.to) }))
    .filter((h): h is NextHop => Boolean(h.node))
    .sort((a, b) => b.edge.feasibility - a.edge.feasibility);
}

export const DEMAND_META: Record<Demand, { label: string; tone: string }> = {
  surging: { label: 'Surging', tone: 'text-emerald-500' },
  high: { label: 'High', tone: 'text-brand' },
  steady: { label: 'Steady', tone: 'text-ink-soft' },
  cooling: { label: 'Cooling', tone: 'text-wine' },
};
