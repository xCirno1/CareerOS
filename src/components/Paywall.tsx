import { Link } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { Button, Card } from '@/ui/components';
import { PLAN_META, type Plan } from '@/lib/subscription';
import { PlanBadge } from '@/components/PlanBadge';

/**
 * Upgrade gate shown in place of a premium surface when the current plan is
 * below `requiredPlan`. Purely presentational — the caller decides when to
 * render it (see MentorMatch). The real "purchase" happens on /pricing, but in
 * the prototype the Sandbox tools can also flip the plan instantly.
 */
export function Paywall({
  requiredPlan,
  eyebrow,
  title,
  description,
  perks,
}: {
  requiredPlan: Plan;
  eyebrow: string;
  title: string;
  description: string;
  perks: string[];
}) {
  const meta = PLAN_META[requiredPlan];
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <div className="flex items-center gap-2 border-b border-brand/30 pb-2 text-brand">
        <Icons.Route size={22} strokeWidth={2.2} />
        <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.18em]">
          Premium access
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink-mute">
          {eyebrow}
        </span>
        <PlanBadge plan={requiredPlan} />
      </div>

      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{description}</p>

      <Card className="mt-8 w-full max-w-md border-line/10 p-6 text-left">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-mute">
          What this unlocks
        </p>
        <ul className="mt-3 space-y-2.5">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <Icons.Check size={15} className="mt-0.5 shrink-0 text-brand" />
              {perk}
            </li>
          ))}
        </ul>
        <Link to="/pricing" className="mt-6 block">
          <Button block icon={Icons.ArrowUpRight}>
            View plans
          </Button>
        </Link>
        <p className="mt-3 text-center text-xs text-ink-mute">
          Tip: open the Sandbox panel (bottom-right) to switch access instantly.
        </p>
      </Card>
    </div>
  );
}
