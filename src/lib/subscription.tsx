import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Icons, type LucideIcon } from '@/lib/icons';

/**
 * Prototype account + subscription state ("wizard of oz" entitlements).
 *
 * Two independent axes:
 *  - `plan`: the candidate subscription tier (free / pro / ultra) which gates
 *    premium surfaces like Mentor Match.
 *  - `mode`: whether the person is here to *receive* mentoring (candidate) or
 *    *provide* it (mentor) — the "looking for mentoring" / "become a mentor"
 *    switch. A mentor earns instead of paying.
 *
 * Plus a simple `authed` flag so the Sandbox tools can simulate signed-out.
 * Everything persists to localStorage so flips survive reloads. There is no
 * backend — the Sandbox overrides are the only way to change these for now.
 */

export type Plan = 'free' | 'pro' | 'ultra';
export type AccountMode = 'candidate' | 'mentor';

export interface PlanMeta {
  id: Plan;
  label: string;
  /** Short marketing line for menus / paywalls. */
  blurb: string;
  icon: LucideIcon;
  /** Tailwind classes for the small plan badge. */
  badgeClass: string;
}

export const PLAN_RANK: Record<Plan, number> = { free: 0, pro: 1, ultra: 2 };
export const PLAN_ORDER: Plan[] = ['free', 'pro', 'ultra'];

export const PLAN_META: Record<Plan, PlanMeta> = {
  free: {
    id: 'free',
    label: 'Free',
    blurb: 'Map your trajectory and stay findable.',
    icon: Icons.Compass,
    badgeClass: 'bg-line/10 text-ink-soft',
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    blurb: 'Unlock Mentor Match and route coaching.',
    icon: Icons.Sparkles,
    badgeClass: 'bg-brand/12 text-brand',
  },
  ultra: {
    id: 'ultra',
    label: 'Ultra',
    blurb: 'Everything, with priority mentors and concierge routing.',
    icon: Icons.Rocket,
    badgeClass:
      'bg-amber/15 text-[#8a6530] dark:text-amber ring-1 ring-amber/30',
  },
};

/** Does `plan` meet or exceed `min`? */
export function planMeets(plan: Plan, min: Plan): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[min];
}

interface SubscriptionStore {
  plan: Plan;
  setPlan: (plan: Plan) => void;
  mode: AccountMode;
  setMode: (mode: AccountMode) => void;
  authed: boolean;
  setAuthed: (authed: boolean) => void;
  /** plan is pro or above. */
  isPro: boolean;
  /** plan meets a minimum tier. */
  hasPlan: (min: Plan) => boolean;
  reset: () => void;
}

interface PersistedState {
  plan: Plan;
  mode: AccountMode;
  authed: boolean;
}

const KEY = 'careeros-subscription';
const DEFAULTS: PersistedState = { plan: 'free', mode: 'candidate', authed: true };

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      plan: PLAN_ORDER.includes(parsed?.plan) ? parsed.plan : DEFAULTS.plan,
      mode: parsed?.mode === 'mentor' ? 'mentor' : 'candidate',
      authed: typeof parsed?.authed === 'boolean' ? parsed.authed : DEFAULTS.authed,
    };
  } catch {
    return DEFAULTS;
  }
}

const Ctx = createContext<SubscriptionStore | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const setPlan = useCallback((plan: Plan) => setState((s) => ({ ...s, plan })), []);
  const setMode = useCallback((mode: AccountMode) => setState((s) => ({ ...s, mode })), []);
  const setAuthed = useCallback((authed: boolean) => setState((s) => ({ ...s, authed })), []);
  const reset = useCallback(() => setState(DEFAULTS), []);

  const value = useMemo<SubscriptionStore>(
    () => ({
      ...state,
      setPlan,
      setMode,
      setAuthed,
      isPro: planMeets(state.plan, 'pro'),
      hasPlan: (min: Plan) => planMeets(state.plan, min),
      reset,
    }),
    [state, setPlan, setMode, setAuthed, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSubscription(): SubscriptionStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
