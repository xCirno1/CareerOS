import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons, getIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/appStore';
import { useSubscription } from '@/lib/subscription';
import { Button, Card, Badge, Tooltip, useToast } from '@/ui/components';
import { Paywall } from '@/components/Paywall';
import { NODES, getNode, getNodeIcon, type CareerNode } from '@/lib/mockData';

type MatchStatus = 'none' | 'pending' | 'matched' | 'dismissed';
type FilterId = 'all' | 'recommended' | 'matched';
type VisibleMentor = { mentor: Mentor; score: number };

interface Mentor {
  id: string;
  name: string;
  initials: string;
  colorClass: string;
  currentRole: string;
  company: string;
  nodeIds: string[];
  yearsExp: number;
  availability: string;
  bio: string;
  topics: string[];
  rating: number;
  sessionCount: number;
  responseTime: string;
  acceptedAt?: string;
  nextSession?: string;
  matchNote: string;
  firstSessionPlan: string[];
  proofPoints: string[];
}

const TOPIC_HELP: Record<string, string> = {
  'Career ladders': 'Helps decode promotion expectations, level scope, and what evidence a role actually rewards.',
  'IC growth': 'Useful when you want seniority and scope without switching into people management.',
  'Code quality': 'Reviews engineering craft signals: architecture, maintainability, reviews, and production habits.',
  'System design': 'Prepares you to show technical depth through tradeoffs, diagrams, and scalable decisions.',
  'IC to EM': 'For engineers testing whether management is a real fit or just the default next step.',
  '1:1s': 'How to structure recurring conversations that build trust, context, and accountability.',
  Hiring: 'Interview design, calibration, candidate signal, and building a repeatable hiring loop.',
  'Difficult conversations': 'Practice for feedback, conflict, expectation-setting, and repair.',
  'Analyst to PM': 'Maps analytics evidence into product judgment, discovery, and decision ownership.',
  Discovery: 'Customer interviews, problem framing, assumption tests, and opportunity sizing.',
  Prioritisation: 'Methods for sequencing work when everything looks urgent.',
  'Stakeholder alignment': 'How to bring design, engineering, data, and leadership around one decision.',
  'Design systems': 'Component libraries, token systems, governance, and cross-functional adoption.',
  'Figma to code': 'Translates visual design into production-quality UI and collaboration rituals.',
  'Portfolio building': 'Turns projects into credible evidence a mentor or hiring team can inspect.',
  Craft: 'Polish, motion, accessibility, typography, and high-trust product feel.',
  'LLMs in production': 'How model-backed products behave once users, latency, cost, and failures appear.',
  RAG: 'Retrieval, chunking, grounding, vector search, and keeping answers trustworthy.',
  Evals: 'Measuring model quality with regression checks and product-level acceptance criteria.',
  'AI career pivot': 'A practical route from existing engineering/product skills into AI product work.',
  'SQL for PMs': 'The core querying skillset for product decisions, funnels, and cohort analysis.',
  'A/B testing': 'Experiment design, guardrails, power, and honest interpretation.',
  'Dashboard design': 'Turns recurring questions into reliable self-serve views.',
  'Data storytelling': 'Frames numbers so stakeholders can make a decision.',
  'Writing for devs': 'Technical communication, tutorials, docs, and opinionated product writing.',
  'Public speaking': 'Talk structure, demos, conference confidence, and clear technical narrative.',
  'Community building': 'Sustaining useful spaces around a product, tool, or technology.',
  'Content strategy': 'Choosing topics, formats, and channels that compound into credibility.',
  '0 to 1': 'Validating, building, and shipping a first product before there is structure.',
  Fundraising: 'Narrative, investor conversations, metrics, and how to avoid fantasy planning.',
  'Founder psychology': 'Decision-making, stamina, loneliness, and operating through uncertainty.',
  'Early hiring': 'First hires, role definition, compensation tradeoffs, and trust.',
  'MBA ROI': 'When graduate study is leverage versus an expensive detour.',
  'Career pivots': 'How to sequence a move without losing the story of your existing experience.',
  'Executive presence': 'Communication, judgment, and credibility in senior rooms.',
  'Strategic thinking': 'Where to play, how to win, and what tradeoffs define the route.',
};

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
    matchNote: 'Strong mentor for sharpening senior IC evidence before a broader technical or product move.',
    firstSessionPlan: ['Audit your current project evidence', 'Pick one senior-level proof point', 'Turn it into a 30-day growth plan'],
    proofPoints: ['Staff-level promotion packet review', 'Design-system adoption playbook', 'Architecture interview calibration'],
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
    matchNote: 'Best for testing whether leadership is a destination or just a tempting detour.',
    firstSessionPlan: ['Map your leadership surface today', 'Identify missing management evidence', 'Design one low-risk leadership experiment'],
    proofPoints: ['First-time manager transition plan', 'Interview loop design', 'Feedback script practice'],
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
    acceptedAt: 'Accepted 2h ago',
    nextSession: 'Friday, 2:30 PM',
    matchNote: 'Matched because your target route needs product judgment backed by evidence and stakeholder fluency.',
    firstSessionPlan: ['Review your current route to Product Lead', 'Find the strongest product-adjacent story', 'Draft a discovery project you can ship this month'],
    proofPoints: ['Product interview loop reviewer', 'Analytics-to-product transition', 'Stakeholder narrative coaching'],
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
    acceptedAt: 'Accepted yesterday',
    nextSession: 'Saturday, 10:00 AM',
    matchNote: 'Matched because your frontend evidence can become a stronger product/design bridge.',
    firstSessionPlan: ['Review your portfolio surface', 'Find the clearest design-engineering proof gap', 'Define one case study outline'],
    proofPoints: ['Figma-to-code critique', 'Portfolio teardown', 'Design-system case study plan'],
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
    bio: 'Transitioned from full-stack to AI engineering 2 years ago. I help engineers understand what the role actually requires beyond prompt engineering: evals, RAG pipelines, production LLM systems.',
    topics: ['LLMs in production', 'RAG', 'Evals', 'AI career pivot'],
    rating: 4.7,
    sessionCount: 21,
    responseTime: 'Within 24h',
    matchNote: 'Useful if your next move leans toward AI application work or product teams building with models.',
    firstSessionPlan: ['Inspect your existing engineering strengths', 'Pick one AI systems proof point', 'Scope a small eval-backed project'],
    proofPoints: ['RAG project review', 'Eval checklist', 'AI role transition map'],
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
    matchNote: 'Good fit when the route needs analytical evidence before a product title change.',
    firstSessionPlan: ['Identify your analytics gap', 'Choose a product metric story', 'Create a SQL/dashboard practice plan'],
    proofPoints: ['Experiment readout review', 'Dashboard critique', 'Product analytics transition'],
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
    matchNote: 'Strong for testing whether public technical communication is an energizing route.',
    firstSessionPlan: ['Review your writing/speaking evidence', 'Pick a small public artifact', 'Define a sustainable content cadence'],
    proofPoints: ['Technical article outline', 'Demo script review', 'Community strategy critique'],
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
    bio: 'Raised a seed round, built a team of 12, acquired by a Series B last year. I talk honestly about what founding is actually like: fundraising, hiring mistakes, and the parts nobody posts about.',
    topics: ['0 to 1', 'Fundraising', 'Founder psychology', 'Early hiring'],
    rating: 4.9,
    sessionCount: 14,
    responseTime: 'Within 48h',
    matchNote: 'Best once your target route starts pointing beyond product leadership into 0-to-1 ownership.',
    firstSessionPlan: ['Pressure-test the founder route', 'Clarify risk and opportunity cost', 'Define one validation sprint'],
    proofPoints: ['Fundraising narrative review', '0-to-1 decision tree', 'Founder readiness audit'],
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
    matchNote: 'Good for high-level strategy, executive communication, or deciding whether a credential route is worth it.',
    firstSessionPlan: ['Compare credential vs non-credential paths', 'Estimate opportunity cost', 'Translate your experience into senior product language'],
    proofPoints: ['MBA decision model', 'Executive narrative review', 'Leadership route planning'],
  },
];

const ACCENT: Record<string, string> = {
  teal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  wine: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  navy: 'bg-sky-50 text-sky-700 border-sky-200',
};

function nodeChipClass(node: CareerNode): string {
  return ACCENT[node.accent] ?? 'bg-surface-2 text-ink-soft border-line/12';
}

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

function scoreMentor(
  mentor: Mentor,
  currentId: string,
  targetId: string,
  userSkills: string[],
  priorities: string[],
): number {
  const topicText = mentor.topics.join(' ').toLowerCase();
  const skillText = userSkills.join(' ').toLowerCase();
  const priorityText = priorities.join(' ').toLowerCase();
  let score = 0;
  if (mentor.nodeIds.includes(targetId)) score += 50;
  if (mentor.nodeIds.includes(currentId)) score += 28;
  if (mentor.nodeIds.some((id) => id !== currentId && id !== targetId)) score += 8;
  if (skillText && mentor.topics.some((topic) => skillText.includes(topic.toLowerCase().split(' ')[0]))) {
    score += 10;
  }
  if (priorityText && topicText.includes(priorityText.split(' ')[0])) score += 8;
  score += mentor.rating * 4;
  score += Math.min(mentor.sessionCount / 8, 8);
  return Math.round(score);
}

function matchReasons(mentor: Mentor, currentId: string, targetId: string) {
  const reasons: string[] = [];
  const current = getNode(currentId);
  const target = getNode(targetId);
  if (mentor.nodeIds.includes(targetId) && target) reasons.push(`Covers your target: ${target.title}`);
  if (mentor.nodeIds.includes(currentId) && current) reasons.push(`Understands your starting point: ${current.title}`);
  if (mentor.rating >= 4.8) reasons.push('High mentor rating');
  if (mentor.sessionCount >= 30) reasons.push('Proven session history');
  return reasons.length ? reasons : ['Adjacent experience to your route'];
}

function statusCopy(status: MatchStatus, mentor: Mentor) {
  if (status === 'matched') return mentor.acceptedAt ?? 'Accepted';
  if (status === 'pending') return 'Waiting for acceptance';
  return 'Available';
}

function firstName(name: string) {
  return name.split(' ')[0];
}

function sessionSlots(mentor: Mentor) {
  const originalMentor = MENTORS.find((item) => item.id === mentor.id) ?? mentor;

  return Array.from(new Set([
    originalMentor.nextSession ?? originalMentor.availability,
    mentor.nextSession ?? mentor.availability,
    'Monday, 9:30 AM',
    'Wednesday, 4:00 PM',
  ]));
}

function MentorCard({
  mentor,
  score,
  status,
  relevantNodes,
  currentId,
  targetId,
  onRequest,
  onDismiss,
  onAccept,
  onMessage,
  onBook,
}: {
  mentor: Mentor;
  score: number;
  status: MatchStatus;
  relevantNodes: CareerNode[];
  currentId: string;
  targetId: string;
  onRequest: (id: string) => void;
  onDismiss: (id: string) => void;
  onAccept: (id: string) => void;
  onMessage: (mentor: Mentor) => void;
  onBook: (mentor: Mentor) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const reasons = matchReasons(mentor, currentId, targetId);

  return (
    <Card
      className={cn(
        'p-5 transition-all',
        status === 'matched' && 'border-brand/30 bg-brand/[0.025]',
        status === 'pending' && 'border-amber/30 bg-amber/[0.08]',
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <span
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold',
            mentor.colorClass,
          )}
        >
          {mentor.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-ink">{mentor.name}</p>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                status === 'matched'
                  ? 'bg-brand/10 text-brand'
                  : status === 'pending'
                    ? 'bg-amber/[0.12] text-accent'
                    : 'bg-line/8 text-ink-mute',
              )}
            >
              {status === 'matched' ? <Icons.CheckCircle2 size={10} /> : <Icons.Clock size={10} />}
              {statusCopy(status, mentor)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-mute">
            {mentor.currentRole} · {mentor.company}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Stars rating={mentor.rating} />
            <span className="text-xs text-ink-mute">{mentor.sessionCount} sessions</span>
            <span className="text-xs text-ink-mute">{mentor.responseTime}</span>
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <div className="text-sm font-extrabold text-brand">{score}%</div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">fit</div>
        </div>
      </div>

      {relevantNodes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {relevantNodes.map((node) => {
            const Icon = getIcon(getNodeIcon(node));
            return (
              <Tooltip
                key={node.id}
                multiline
                content={`${mentor.name} can help with ${node.title} because their path includes this node.`}
              >
                <span
                  tabIndex={0}
                  className={cn(
                    'inline-flex cursor-help items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                    nodeChipClass(node),
                  )}
                >
                  <Icon size={10} strokeWidth={2.2} />
                  {node.title}
                </span>
              </Tooltip>
            );
          })}
        </div>
      )}

      <p className={cn('text-sm leading-relaxed text-ink-soft', !expanded && 'line-clamp-2')}>
        {mentor.bio}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="focus-ring mt-1 rounded text-xs font-semibold text-brand hover:underline"
      >
        {expanded ? 'Show less' : 'Read more'}
      </button>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {mentor.topics.map((topic) => (
          <Tooltip key={topic} multiline content={TOPIC_HELP[topic] ?? 'A mentoring focus area for this route.'}>
            <span
              tabIndex={0}
              className="inline-flex cursor-help items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-ink-soft transition hover:bg-line/10 hover:text-ink"
            >
              {topic}
              <Icons.Info size={10} className="opacity-50" />
            </span>
          </Tooltip>
        ))}
      </div>

      {expanded && (
        <div className="mt-4 grid gap-3 border-t border-line/10 pt-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-surface-2 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-mute">
              <Icons.Sparkles size={12} /> Why this match
            </p>
            <ul className="mt-2 space-y-1.5">
              {reasons.map((reason) => (
                <li key={reason} className="flex gap-2 text-xs leading-5 text-ink-soft">
                  <Icons.Check size={13} className="mt-0.5 shrink-0 text-brand" />
                  {reason}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-5 text-ink-soft">{mentor.matchNote}</p>
          </div>

          <div className="rounded-2xl bg-surface-2 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-mute">
              <Icons.Workflow size={12} /> First session
            </p>
            <ol className="mt-2 space-y-1.5">
              {mentor.firstSessionPlan.map((item, i) => (
                <li key={item} className="flex gap-2 text-xs leading-5 text-ink-soft">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {status === 'matched' && (
        <div className="mt-4 rounded-2xl border border-brand/20 bg-brand/[0.045] p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-ink">Mentor accepted</p>
              <p className="mt-1 text-xs leading-5 text-ink-soft">
                CareerOS would now unlock a shared route brief, suggested first-session agenda, and
                a lightweight action plan after each session.
              </p>
            </div>
            {mentor.nextSession && (
              <Badge tone="brand" icon={Icons.Calendar}>
                {mentor.nextSession}
              </Badge>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mentor.proofPoints.map((proof) => (
              <span key={proof} className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                {proof}
              </span>
            ))}
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div className="mt-4 rounded-2xl border border-amber/30 bg-amber/[0.08] p-3">
          <p className="text-sm font-bold text-ink">Request sent</p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            In production, {mentor.name.split(' ')[0]} would receive your route brief, current
            node, target node, and the specific help you need before accepting.
          </p>
          <button
            type="button"
            onClick={() => onAccept(mentor.id)}
            className="focus-ring mt-2 rounded-lg text-xs font-bold text-brand hover:underline"
          >
            Simulate mentor acceptance
          </button>
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-mute">
        <Icons.Calendar size={12} />
        {mentor.availability}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/10 pt-4">
        {status === 'none' && (
          <>
            <Button size="sm" icon={Icons.GraduationCap} onClick={() => onRequest(mentor.id)}>
              Request match
            </Button>
            <button
              type="button"
              onClick={() => onDismiss(mentor.id)}
              className="focus-ring rounded-xl border border-line/12 px-3 py-1.5 text-xs font-semibold text-ink-mute transition hover:bg-line/5 hover:text-ink"
            >
              Not for me
            </button>
          </>
        )}
        {status === 'pending' && (
          <button
            type="button"
            onClick={() => onDismiss(mentor.id)}
            className="focus-ring rounded-xl border border-line/12 px-3 py-1.5 text-xs font-semibold text-ink-mute transition hover:bg-line/5"
          >
            Cancel request
          </button>
        )}
          {status === 'matched' && (
          <>
            <Button size="sm" icon={Icons.Mail} onClick={() => onMessage(mentor)}>
              Message {firstName(mentor.name)}
            </Button>
            <Button size="sm" variant="secondary" icon={Icons.Calendar} onClick={() => onBook(mentor)}>
              Book session
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All mentors' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'matched', label: 'My matches' },
];

export function MentorMatch() {
  const { isPro } = useSubscription();

  if (!isPro) {
    return (
      <Paywall
        requiredPlan="pro"
        eyebrow="Mentor Match"
        title="Define your mentor"
        description="Matching with a real mentor, messaging them, and booking sessions is part of the paid mentor flow tailored to your route."
        perks={[
          'Match with mentors mapped to your target route',
          'Message mentors and share your route brief',
          'Book and track sessions with an agenda',
          'Recommended mentors ranked by fit',
        ]}
      />
    );
  }

  return <MentorMatchContent />;
}

function MentorMatchContent() {
  const { careerProfile, target } = useAppStore();
  const toast = useToast();
  const currentNode = getNode(careerProfile.currentNodeId) ?? NODES[0];
  const targetNode = getNode(target || careerProfile.targetNodeId) ?? NODES[4];
  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [messageMentor, setMessageMentor] = useState<Mentor | null>(null);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookedSessions, setBookedSessions] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, MatchStatus>>({
    m3: 'matched',
    m4: 'matched',
  });

  const mentors = useMemo(
    () =>
      MENTORS.map((mentor) =>
        bookedSessions[mentor.id] ? { ...mentor, nextSession: bookedSessions[mentor.id] } : mentor,
      ),
    [bookedSessions],
  );

  const allTopics = useMemo(
    () => Array.from(new Set(mentors.flatMap((mentor) => mentor.topics))).sort(),
    [mentors],
  );

  const scored = useMemo(
    () =>
      [...mentors]
        .map((mentor) => ({
          mentor,
          score: scoreMentor(
            mentor,
            currentNode.id,
            targetNode.id,
            careerProfile.skills,
            careerProfile.priorities,
          ),
        }))
        .sort((a, b) => b.score - a.score),
    [careerProfile.priorities, careerProfile.skills, currentNode.id, mentors, targetNode.id],
  );

  const recommended = scored.filter((item) => item.score >= 70).map((item) => item.mentor.id);
  const normalizedQuery = query.trim().toLowerCase();

  const visible = scored
    .filter(({ mentor }) => {
      const status = statuses[mentor.id] ?? 'none';
      if (status === 'dismissed') return false;
      if (filter === 'recommended' && !recommended.includes(mentor.id)) return false;
      if (filter === 'matched' && status !== 'matched' && status !== 'pending') return false;
      if (topic !== 'all' && !mentor.topics.includes(topic)) return false;
      if (!normalizedQuery) return true;
      const nodeTitles = mentor.nodeIds
        .map((id) => getNode(id)?.title ?? '')
        .join(' ');
      const haystack = [
        mentor.name,
        mentor.currentRole,
        mentor.company,
        mentor.bio,
        mentor.topics.join(' '),
        nodeTitles,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .map(({ mentor, score }) => ({ mentor, score }));

  const request = (id: string) => {
    setStatuses((prev) => ({ ...prev, [id]: 'pending' }));
    setFilter('matched');
  };

  const dismiss = (id: string) => {
    setStatuses((prev) => ({ ...prev, [id]: prev[id] === 'pending' ? 'none' : 'dismissed' }));
  };

  const accept = (id: string) => {
    setStatuses((prev) => ({ ...prev, [id]: 'matched' }));
    setFilter('matched');
  };

  const activeCount = Object.values(statuses).filter((s) => s === 'matched' || s === 'pending').length;
  const visibleColumns: [VisibleMentor[], VisibleMentor[]] = [[], []];
  visible.forEach((item, index) => {
    visibleColumns[index % 2].push(item);
  });

  const renderMentorCard = ({ mentor, score }: VisibleMentor) => {
    const relevantNodes = mentor.nodeIds
      .map((id) => getNode(id))
      .filter((n): n is CareerNode => Boolean(n));

    return (
      <MentorCard
        key={mentor.id}
        mentor={mentor}
        score={score}
        status={statuses[mentor.id] ?? 'none'}
        relevantNodes={relevantNodes}
        currentId={currentNode.id}
        targetId={targetNode.id}
        onRequest={request}
        onDismiss={dismiss}
        onAccept={accept}
        onMessage={setMessageMentor}
        onBook={setBookingMentor}
      />
    );
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-5">
        <Badge tone="brand" icon={Icons.GraduationCap}>
          Mentor Match
        </Badge>
        <h1 className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Find your mentor
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">
          Matched to your path from <span className="font-semibold text-ink">{currentNode.title}</span>{' '}
          to <span className="font-semibold text-ink">{targetNode.title}</span>. Search by mentor,
          company, topic, role, or career node.
        </p>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {[currentNode, targetNode].map((node, i) => {
            const Icon = getIcon(getNodeIcon(node));
            return (
              <span key={node.id} className="flex items-center gap-1.5">
                <Tooltip multiline content={`${i === 0 ? 'Your inferred starting point' : 'Your selected target'} from the CareerOS profile.`}>
                  <span
                    tabIndex={0}
                    className={cn(
                      'inline-flex cursor-help items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold',
                      nodeChipClass(node),
                    )}
                  >
                    <Icon size={12} strokeWidth={2.2} />
                    {node.title}
                  </span>
                </Tooltip>
                {i === 0 && <Icons.ArrowRight size={14} className="text-ink-mute" />}
              </span>
            );
          })}
          {activeCount > 0 && (
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
              {activeCount} active {activeCount === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(16rem,1fr)_auto]">
          <label className="focus-within:ring-brand/25 flex h-10 items-center gap-2 rounded-2xl border border-line/12 bg-surface px-3 text-sm text-ink-soft transition focus-within:border-brand/40 focus-within:ring-2">
            <Icons.Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mentors, topics, companies..."
              className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-mute"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="grid h-6 w-6 place-items-center rounded-lg text-ink-mute hover:bg-line/8 hover:text-ink"
                aria-label="Clear search"
              >
                <Icons.X size={14} />
              </button>
            )}
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="focus-ring h-10 rounded-2xl border border-line/12 bg-surface px-3 text-sm font-semibold text-ink-soft"
            aria-label="Filter by mentor topic"
          >
            <option value="all">All topics</option>
            {allTopics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
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

      {filter === 'matched' && activeCount > 0 && (
        <Card className="mb-5 border-brand/20 bg-brand/[0.025] p-4">
          <h2 className="text-sm font-bold text-ink">How accepted mentor matches work</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-soft">
            {['Share route brief', 'Agree first session', 'Track next actions'].map((step, i, arr) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className="rounded-full bg-surface px-3 py-1.5 text-ink">{step}</span>
                {i < arr.length - 1 && <Icons.ArrowRight size={14} className="text-brand" />}
              </span>
            ))}
          </div>
        </Card>
      )}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-ink-mute">
            <Icons.GraduationCap size={22} />
          </span>
          <p className="text-sm font-bold text-ink">
            {filter === 'matched' ? 'No active matches yet' : 'No mentors found'}
          </p>
          <p className="max-w-xs text-xs text-ink-mute">
            {filter === 'matched'
              ? 'Request a match from All mentors, then simulate acceptance to preview the full flow.'
              : 'Try another keyword, topic, or filter.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setTopic('all');
              setQuery('');
            }}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Reset mentor search
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:hidden">{visible.map(renderMentorCard)}</div>
          <div className="hidden items-start gap-4 lg:grid lg:grid-cols-2">
            {visibleColumns.map((column, index) => (
              <div key={index} className="grid gap-4">
                {column.map(renderMentorCard)}
              </div>
            ))}
          </div>
        </>
      )}

      {messageMentor && (
        <MessageModal
          mentor={messageMentor}
          currentNode={currentNode}
          targetNode={targetNode}
          onClose={() => setMessageMentor(null)}
          onSend={(body) => {
            toast(`Message sent to ${firstName(messageMentor.name)}`, { icon: Icons.Mail, tone: 'success' });
            setMessageMentor(null);
            void body;
          }}
        />
      )}

      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          onClose={() => setBookingMentor(null)}
          onBook={(slot) => {
            setBookedSessions((prev) => ({ ...prev, [bookingMentor.id]: slot }));
            toast(`Session booked with ${firstName(bookingMentor.name)} for ${slot}`, {
              icon: Icons.Calendar,
              tone: 'success',
            });
            setBookingMentor(null);
          }}
        />
      )}
    </div>
  );
}

function ModalShell({
  title,
  icon: Icon,
  children,
  onClose,
}: {
  title: string;
  icon: typeof Icons.Mail;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-navy/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-[1.75rem] border border-line/10 bg-surface shadow-glass sm:max-w-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/10 bg-surface/90 px-5 py-4 backdrop-blur">
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink">
            <Icon size={18} className="text-brand" /> {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-ink-mute transition hover:text-ink"
          >
            <Icons.X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function MessageModal({
  mentor,
  currentNode,
  targetNode,
  onClose,
  onSend,
}: {
  mentor: Mentor;
  currentNode: CareerNode;
  targetNode: CareerNode;
  onClose: () => void;
  onSend: (body: string) => void;
}) {
  const [body, setBody] = useState(
    `Hi ${firstName(mentor.name)}, I'd love your advice on moving from ${currentNode.title} toward ${targetNode.title}. Could we use the first session to review my route and the strongest proof point I should build next?`,
  );

  return (
    <ModalShell title={`Message ${firstName(mentor.name)}`} icon={Icons.Mail} onClose={onClose}>
      <div className="space-y-4 p-5">
        <div className="rounded-2xl bg-surface-2 p-3 text-xs leading-5 text-ink-soft">
          <span className="font-bold text-ink">Route brief:</span> {currentNode.title} to {targetNode.title}.
          CareerOS includes your target, key gaps, and suggested first-session agenda with this message.
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Message</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="focus-ring w-full resize-y rounded-2xl border border-line/15 bg-surface px-3.5 py-2.5 text-sm leading-6 text-ink outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <div className="flex justify-end gap-2 border-t border-line/10 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={Icons.Mail} onClick={() => onSend(body)} disabled={!body.trim()}>
            Send message
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function BookingModal({
  mentor,
  onClose,
  onBook,
}: {
  mentor: Mentor;
  onClose: () => void;
  onBook: (slot: string) => void;
}) {
  const slots = sessionSlots(mentor);
  const [selected, setSelected] = useState(slots[0]);

  return (
    <ModalShell title={`Book with ${firstName(mentor.name)}`} icon={Icons.Calendar} onClose={onClose}>
      <div className="space-y-4 p-5">
        <div className="rounded-2xl bg-surface-2 p-3">
          <p className="text-sm font-bold text-ink">First session agenda</p>
          <ol className="mt-2 space-y-1.5">
            {mentor.firstSessionPlan.map((item, i) => (
              <li key={item} className="flex gap-2 text-xs leading-5 text-ink-soft">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-soft">Available slots</p>
          <div className="space-y-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelected(slot)}
                className={cn(
                  'focus-ring flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-sm font-semibold transition',
                  selected === slot
                    ? 'border-brand bg-brand/8 text-brand'
                    : 'border-line/12 bg-surface text-ink-soft hover:border-line/25',
                )}
              >
                <span
                  className={cn(
                    'grid h-5 w-5 place-items-center rounded-full border',
                    selected === slot ? 'border-brand bg-brand text-white' : 'border-line/25',
                  )}
                >
                  {selected === slot && <Icons.Check size={12} />}
                </span>
                {slot}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line/10 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={Icons.Calendar} onClick={() => onBook(selected)}>
            Confirm session
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
