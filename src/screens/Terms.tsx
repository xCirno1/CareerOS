import { Icons } from '@/lib/icons';
import { Card, Reveal } from '@/ui/components';

export function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Terms of Service. <span className="highlight-green">Rules of engagement.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
            These terms govern your use of the Career OS platform. We keep things straightforward: act honestly, do not scrape the maps, and respect user privacy.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Terms list */}
      <section className="mt-16 space-y-8">
        <Reveal>
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs font-semibold text-brand">01_USER_AGREEMENT</span>
              <h3 className="text-lg font-bold text-ink mt-1">Profile Accuracy</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Candidates must provide accurate work histories. Creating false profiles, misrepresenting skills, or submitting unverified project records is grounds for account termination.
              </p>
            </div>

            <div className="border-t border-line/10 pt-6">
              <span className="font-mono text-xs font-semibold text-brand">02_EMPLOYER_CONDUCT</span>
              <h3 className="text-lg font-bold text-ink mt-1">Anti-Spam Protocol</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Employers must not bypass our routing system to spam candidates. Any attempt to use candidate details for marketing or unrelated roles will result in immediate account suspension.
              </p>
            </div>

            <div className="border-t border-line/10 pt-6">
              <span className="font-mono text-xs font-semibold text-brand">03_DATA_SCRAPING</span>
              <h3 className="text-lg font-bold text-ink mt-1">Intellectual Property & Scraping</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                The career path maps and database models are protected. Automated scraping, extraction, or crawling of our node networks is strictly prohibited.
              </p>
              
              <div className="border-l-4 border-wine pl-4 bg-wine/5 p-4 rounded-r-2xl text-xs text-wine-dark font-medium mt-4">
                <span className="font-semibold block mb-1">BOT MONITORING WARNING:</span>
                We actively monitor for bot networks. Scraping our platform will result in immediate IP bans and potential legal action.
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer details */}
      <section className="mt-16 text-center border-t border-line/10 pt-12 text-xs text-ink-mute font-mono">
        EFFECTIVE_DATE: 2026-06-01 | VERSION: 2.1
      </section>
    </div>
  );
}
