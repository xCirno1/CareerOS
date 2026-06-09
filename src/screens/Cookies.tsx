import { Icons } from '@/lib/icons';
import { Card, Reveal } from '@/ui/components';

interface CookieItem {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
}

const ITEMS: CookieItem[] = [
  {
    name: '__tb_session',
    provider: 'Talentbank',
    purpose: 'Keeps you logged into your dashboard.',
    expiry: 'Session end',
  },
  {
    name: '__tb_theme',
    provider: 'Talentbank',
    purpose: 'Remembers your dark/light mode preference.',
    expiry: '1 Year',
  },
  {
    name: '__tb_map_state',
    provider: 'Talentbank',
    purpose: 'Saves your last map zoom coordinates.',
    expiry: '30 Days',
  },
];

export function Cookies() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Cookies Policy. <span className="highlight-green">Only what we need.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
            We do not track you across the web. We use the minimum number of cookies required to authenticate your session and save your preferences.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Table */}
      <section className="mt-12 space-y-8">
        <Reveal>
          <div className="overflow-x-auto rounded-3xl border border-line/10 bg-surface">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line/10 bg-surface-2/50 font-mono text-[11px] uppercase tracking-wider text-ink-mute">
                  <th className="px-6 py-4">Cookie Name</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/10">
                {ITEMS.map((item) => (
                  <tr key={item.name} className="hover:bg-line/5 font-mono text-xs text-ink-soft">
                    <td className="px-6 py-4 font-semibold text-brand">{item.name}</td>
                    <td className="px-6 py-4 text-ink">{item.provider}</td>
                    <td className="px-6 py-4 text-ink-soft font-sans">{item.purpose}</td>
                    <td className="px-6 py-4">{item.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Pledge */}
        <Reveal>
          <div className="border-l-4 border-emerald-500 pl-4 my-8 font-medium text-ink bg-emerald-500/5 p-4 rounded-r-2xl text-sm leading-relaxed">
            <span className="font-semibold block mb-1">NO TRACKING GUARANTEE:</span>
            Zero third-party tracking cookies. We do not load Facebook pixels, Google Analytics, or retargeting scripts on our platform.
          </div>
        </Reveal>
      </section>

      {/* CTA cookies management */}
      <section className="mt-16 text-center border-t border-line/10 pt-12">
        <button className="focus-ring h-10 rounded-full border border-line/25 px-5 text-xs font-semibold text-ink transition hover:border-line/50 font-sans">
          Manage Preferences
        </button>
      </section>
    </div>
  );
}
