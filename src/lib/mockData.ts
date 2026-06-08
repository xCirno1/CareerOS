/**
 * Mock domain model for CareerOS / Traileers™.
 * Nodes are positioned on a 1000x680 virtual canvas; the SVG map maps these
 * into screen space with pan/zoom.
 */

export type NodeKind = 'job' | 'career' | 'industry';
export type Demand = 'surging' | 'high' | 'steady' | 'cooling';

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
      'Builds the user-facing layer of web products. Your current node, inferred from your background.',
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
      'Owns product strategy and outcomes. Your target node — strong narrative fit with your shipping history.',
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
      'Builds products on top of LLMs and agents. The fastest-growing adjacent node.',
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
    { id: 'cs', label: 'Computer Science', icon: 'GraduationCap' },
    { id: 'bootcamp', label: 'Bootcamp', icon: 'Rocket' },
    { id: 'self', label: 'Self-taught', icon: 'BookOpen' },
    { id: 'design', label: 'Design', icon: 'PenTool' },
    { id: 'business', label: 'Business', icon: 'Briefcase' },
    { id: 'other', label: 'Other field', icon: 'Shapes' },
  ],
  skills: [
    'React', 'TypeScript', 'Node.js', 'SQL', 'Design Systems',
    'Product Sense', 'Data Analysis', 'Leadership', 'Writing', 'LLMs',
    'Cloud', 'Experimentation',
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

export function edgesOf(id: string): CareerEdge[] {
  return EDGES.filter((e) => e.from === id || e.to === id);
}

export const DEMAND_META: Record<Demand, { label: string; tone: string }> = {
  surging: { label: 'Surging', tone: 'text-emerald-500' },
  high: { label: 'High', tone: 'text-brand' },
  steady: { label: 'Steady', tone: 'text-ink-soft' },
  cooling: { label: 'Cooling', tone: 'text-wine' },
};
