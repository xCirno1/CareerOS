import { Icons } from '@/lib/icons';
import { Card, Reveal, Badge } from '@/ui/components';

interface Opening {
  id: string;
  title: string;
  dept: string;
  loc: string;
  comp: string;
}

const OPENINGS: Opening[] = [
  {
    id: 'ENG-08',
    title: 'Senior Backend Engineer (Node/Postgres)',
    dept: 'Engineering',
    loc: 'Remote (SEA)',
    comp: '$4,500 - $6,500 USD/mo',
  },
  {
    id: 'PD-03',
    title: 'Product Designer (UX/Systems)',
    dept: 'Product',
    loc: 'Remote (SEA)',
    comp: '$3,500 - $5,000 USD/mo',
  },
  {
    id: 'DS-02',
    title: 'Data Scientist (Graph Networks/NLP)',
    dept: 'Data Science',
    loc: 'Remote (SEA)',
    comp: '$4,000 - $6,000 USD/mo',
  },
];

export function Careers() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
         <Reveal>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Help us build the career <span className="highlight-green">operating system.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft sm:text-xl leading-relaxed">
            We are a remote-first, highly focused engineering and product team spread across Singapore, Manila, Jakarta, and Kuala Lumpur.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Work Configurations */}
      <section className="mt-16 space-y-12">
        <Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-5 border-line/10">
              <span className="font-mono text-xs font-semibold text-brand block mb-2">CFG_AUTONOMY</span>
              <h3 className="text-lg font-bold text-ink flex items-center gap-1.5">
                <Icons.Clock size={16} className="text-brand" /> Asynchronous Flow
              </h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                We measure output, not hours. We run a highly documented, asynchronous workflow. You manage your own time. We do not do performative stand-ups.
              </p>
            </Card>

            <Card className="p-5 border-line/10">
              <span className="font-mono text-xs font-semibold text-brand block mb-2">CFG_COMPENSATION</span>
              <h3 className="text-lg font-bold text-ink flex items-center gap-1.5">
                <Icons.Banknote size={16} className="text-brand" /> Fair Pay Guarantee
              </h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                Every role is benchmarked using our own C.04 Fair Pay Engine at the 80th percentile of your regional market. No negotiation games; we make our best offer first.
              </p>
            </Card>

            <Card className="p-5 border-line/10">
              <span className="font-mono text-xs font-semibold text-brand block mb-2">CFG_STACK</span>
              <h3 className="text-lg font-bold text-ink flex items-center gap-1.5">
                <Icons.Layers size={16} className="text-brand" /> Modern & Simple
              </h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                React, TypeScript, Node.js, and Postgres, deployed across distributed regional nodes. We value clean codebases, minimal dependencies, and rapid iterations.
              </p>
            </Card>
          </div>
        </Reveal>

        {/* Active Openings Monospace Table */}
        <Reveal>
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Icons.Briefcase size={18} className="text-brand" />
              Active Headcount
            </h2>

            <div className="overflow-x-auto rounded-3xl border border-line/10 bg-surface">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line/10 bg-surface-2/50 font-mono text-[11px] uppercase tracking-wider text-ink-mute">
                    <th className="px-6 py-4">Role ID</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Compensation</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/10">
                  {OPENINGS.map((op) => (
                    <tr key={op.id} className="hover:bg-line/5">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-brand">{op.id}</td>
                      <td className="px-6 py-4 font-bold text-ink">{op.title}</td>
                      <td className="px-6 py-4 text-ink-soft">{op.dept}</td>
                      <td className="px-6 py-4 text-ink-soft">{op.loc}</td>
                      <td className="px-6 py-4 font-mono text-xs text-ink-soft">{op.comp}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge tone="brand">ACTIVE</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-l-4 border-wine pl-4 bg-wine/5 p-4 rounded-r-2xl text-xs text-wine-dark font-medium">
              <span className="font-semibold block mb-1">RECRUITMENT POLICY:</span>
              We do not work with external recruiting agencies. All applications must be submitted directly through our system.
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA Application form */}
      <section className="mt-16 text-center border-t border-line/10 pt-12">
        <h3 className="text-lg font-bold text-ink">Ready to start?</h3>
        <p className="mt-2 text-sm text-ink-soft mb-6">
          Submit your project history or public repos to our engineers.
        </p>
        <button className="focus-ring h-11 rounded-full bg-navy px-6 font-mono text-xs font-semibold text-white transition hover:bg-navy-600 dark:bg-brand dark:text-navy">
          Initialize Application Process
        </button>
      </section>
    </div>
  );
}
