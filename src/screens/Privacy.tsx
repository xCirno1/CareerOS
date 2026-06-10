import { Icons } from '@/lib/icons';
import { Card, Reveal } from '@/ui/components';

export function Privacy() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Privacy Policy. <span className="highlight-green">You own your data.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
            We believe legal policies should be readable by humans. Below is our privacy commitment written in plain, direct language alongside the standard legal code.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Split layout */}
      <section className="mt-16 space-y-12">
        {/* Row 1 */}
        <Reveal>
          <div className="grid gap-8 md:grid-cols-2 border-t border-line/10 pt-8">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-brand uppercase">01_PROFILE_ANONYMIZATION</span>
              <h3 className="text-lg font-bold text-ink">Anonymized by Default</h3>
              <div className="border-l-4 border-emerald-500 pl-4 bg-emerald-500/5 p-4 rounded-r-2xl text-sm text-ink-soft leading-relaxed">
                Your profile is private by default. Your name, current employer, and contact info are hidden. Employers can only see your professional shape and skills. They cannot contact you unless you explicitly approve their request.
              </div>
            </div>
            <div className="text-xs text-ink-mute font-mono leading-relaxed bg-surface-2/30 p-5 rounded-2xl h-fit">
              Pursuant to personal data protection acts across our operating regions, candidate identities are securely hashed and masked. User profiles are restricted from search queries until direct routing approval is signaled by the candidate.
            </div>
          </div>
        </Reveal>

        {/* Row 2 */}
        <Reveal>
          <div className="grid gap-8 md:grid-cols-2 border-t border-line/10 pt-8">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-brand uppercase">02_DATA_OWNERSHIP</span>
              <h3 className="text-lg font-bold text-ink">You own your history</h3>
              <div className="border-l-4 border-emerald-500 pl-4 bg-emerald-500/5 p-4 rounded-r-2xl text-sm text-ink-soft leading-relaxed">
                Your data belongs to you. You can export your profile details, application logs, and assessments at any time. If you choose to delete your account, your data is completely purged from our servers within 30 days.
              </div>
            </div>
            <div className="text-xs text-ink-mute font-mono leading-relaxed bg-surface-2/30 p-5 rounded-2xl h-fit">
              Users reserve the right to data portability and deletion under global privacy framework standards. Upon termination of service, all data objects belonging to the user are systematically purged from active memory blocks.
            </div>
          </div>
        </Reveal>

        {/* Row 3 */}
        <Reveal>
          <div className="grid gap-8 md:grid-cols-2 border-t border-line/10 pt-8">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-brand uppercase">03_DATA_SALES_BAN</span>
              <h3 className="text-lg font-bold text-ink">No data-selling</h3>
              <div className="border-l-4 border-emerald-500 pl-4 bg-emerald-500/5 p-4 rounded-r-2xl text-sm text-ink-soft leading-relaxed">
                We do not sell your data. We make money by charging employers for hiring tools and matching features, never by selling candidate databases.
              </div>
            </div>
            <div className="text-xs text-ink-mute font-mono leading-relaxed bg-surface-2/30 p-5 rounded-2xl h-fit">
              The company covenants that it shall not sell, lease, or rent candidate personal identification data to third-party data aggregators. Commercial models rely entirely on software access fees.
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
