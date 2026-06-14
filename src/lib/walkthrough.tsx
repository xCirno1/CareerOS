import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Icons, type LucideIcon } from '@/lib/icons';

/**
 * Guided product tour ("walkthrough"). A single overlay card walks the user
 * through the app one screen at a time — the tour drives navigation itself
 * (Map → Pathways → Insights → …). Richer screens get multiple steps.
 *
 * State lives here; the <Walkthrough/> overlay (rendered inside the router)
 * reads it, handles route navigation, and renders the card. The Sandbox panel
 * can replay it at any time. First-visit auto-start is tracked in localStorage.
 */

export interface WalkStep {
  /** App route this step is anchored to — the overlay navigates here. */
  route: string;
  icon: LucideIcon;
  /** Small label above the title, e.g. the screen name. */
  eyebrow: string;
  title: string;
  body: string;
  /** Optional quick-hit points shown as a checklist under the body. */
  bullets?: string[];
}

export const WALK_STEPS: WalkStep[] = [
  {
    route: '/map',
    icon: Icons.Compass,
    eyebrow: 'Welcome',
    title: 'Welcome to CareerOS',
    body: 'A 2-minute tour of how to map your career, plan a move, and find people who can help. You can skip anytime and replay it later from the Sandbox.',
    bullets: ['Use Next / Back to move', 'Skip to jump straight in'],
  },
  {
    route: '/map',
    icon: Icons.Network,
    eyebrow: 'Traileers™ Map',
    title: 'Your careers as a living map',
    body: 'Every role, career and industry is a node, connected by edges that show realistic transitions between them. Your current role and your target are highlighted.',
    bullets: ['Pan by dragging', 'Zoom with scroll or the controls'],
  },
  {
    route: '/map',
    icon: Icons.MousePointerClick,
    eyebrow: 'Traileers™ Map',
    title: 'Explore, filter and save',
    body: 'Click any node to open its details — salary, demand, growth and how well it matches you. Filter by node type to cut the noise, and bookmark roles to revisit.',
    bullets: ['Press ⌘K to search anywhere', 'Save roles with the bookmark'],
  },
  {
    route: '/routing',
    icon: Icons.Route,
    eyebrow: 'Pathways',
    title: 'Plan the move between roles',
    body: 'Pathways turns the map into a plan: the recommended route from where you are now to your target role, hop by hop.',
    bullets: ['Set any node as your target', 'See the full route on the map'],
  },
  {
    route: '/routing',
    icon: Icons.GitFork,
    eyebrow: 'Pathways',
    title: 'Compare routes and effort',
    body: 'Each path shows its intermediate steps, how feasible the jump is, and roughly how many months it takes — so you can weigh the safe route against the fast one.',
    bullets: ['Feasibility per hop', 'Estimated months to target'],
  },
  {
    route: '/insights',
    icon: Icons.LineChart,
    eyebrow: 'Insights',
    title: 'Read the market',
    body: 'Insights aggregates the signals behind the map — demand, salary bands and growth trends — so your next move is backed by data, not vibes.',
    bullets: ['Spot rising and cooling roles', 'Compare salary and demand'],
  },
  {
    route: '/timetable',
    icon: Icons.Calendar,
    eyebrow: 'Timetable',
    title: 'Plan your week',
    body: 'The Timetable is your week at a glance — study blocks, deep work and the steps from your pathway, laid out so nothing collides.',
    bullets: ['Drag-and-drop week grid', 'Conflicts are flagged for you'],
  },
  {
    route: '/timetable',
    icon: Icons.CalendarPlus,
    eyebrow: 'Timetable',
    title: 'Sessions land here automatically',
    body: 'When you book a mentor, that session shows up on this grid — Mentors and Timetable stay in sync, so your calendar always reflects your plan.',
    bullets: ['Booked mentor sessions sync in', 'Reschedule around conflicts'],
  },
  {
    route: '/community',
    icon: Icons.Users,
    eyebrow: 'Community',
    title: 'Find your people',
    body: 'Community connects you with others making similar moves — compare notes, follow along, and learn from people a few steps ahead of you.',
    bullets: ['Browse peers by path', 'See who shares your target'],
  },
  {
    route: '/mentors',
    icon: Icons.GraduationCap,
    eyebrow: 'Mentors',
    title: 'Mentor Match',
    body: 'We match you with mentors who have actually made the transition you are aiming for — ranked by how well they fit your target and skills.',
    bullets: ['Mentors mapped to your target', 'Chat before you commit'],
  },
  {
    route: '/mentors',
    icon: Icons.Sparkles,
    eyebrow: 'Mentors',
    title: 'Book a session',
    body: 'Pick a slot to book a mentor — it drops straight onto your Timetable. Booking is a Pro feature; use the Sandbox to switch plans and try it.',
    bullets: ['Pro & Ultra unlock booking', 'Flip your plan in the Sandbox'],
  },
  {
    route: '/map',
    icon: Icons.PartyPopper,
    eyebrow: 'All set',
    title: "You're ready to explore",
    body: 'That’s the tour. This is a prototype on mock data — open the Sandbox (bottom-right) to switch plans, modes or auth, and to replay this walkthrough anytime.',
    bullets: ['Replay from the Sandbox', 'Everything here is mock data'],
  },
];

interface WalkthroughStore {
  /** Whether the tour overlay is currently showing. */
  active: boolean;
  /** Current step index into WALK_STEPS. */
  index: number;
  steps: WalkStep[];
  /** Has the user seen (finished or skipped) the tour before? */
  seen: boolean;
  start: () => void;
  next: () => void;
  back: () => void;
  /** Dismiss without finishing — marks as seen so it won't auto-show again. */
  skip: () => void;
  /** Reach the end — marks as seen and closes. */
  finish: () => void;
}

const Ctx = createContext<WalkthroughStore | null>(null);
const SEEN_KEY = 'careeros-walkthrough-seen';

function loadSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState<boolean>(loadSeen);

  const markSeen = useCallback(() => {
    setSeen(true);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  const close = useCallback(() => {
    setActive(false);
    markSeen();
  }, [markSeen]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= WALK_STEPS.length - 1) {
        close();
        return i;
      }
      return i + 1;
    });
  }, [close]);

  const back = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  return (
    <Ctx.Provider
      value={{
        active,
        index,
        steps: WALK_STEPS,
        seen,
        start,
        next,
        back,
        skip: close,
        finish: close,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWalkthrough(): WalkthroughStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWalkthrough must be used within WalkthroughProvider');
  return ctx;
}
