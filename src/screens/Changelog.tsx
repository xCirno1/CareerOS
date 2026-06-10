import { Icons } from '@/lib/icons';
import { Card, Reveal, Badge } from '@/ui/components';

interface LogEntry {
  version: string;
  date: string;
  items: {
    type: 'NEW' | 'MOD' | 'FIX';
    module: string;
    description: string;
  }[];
}

const LOGS: LogEntry[] = [
  {
    version: 'v1.2.4',
    date: '2026-06-02',
    items: [
      {
        type: 'NEW',
        module: 'Fair Pay Engine',
        description: 'Enhanced the Fair Pay Engine salary aggregation models for Jakarta-based tech roles.',
      },
      {
        type: 'MOD',
        module: 'Talent Matching',
        description: 'Optimized search matching response times for large database queries (reduced by 150ms).',
      },
      {
        type: 'FIX',
        module: 'System',
        description: 'Fixed rendering bug on mobile browsers for vertical trajectory paths.',
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: '2026-05-15',
    items: [
      {
        type: 'NEW',
        module: 'Chapter Designer',
        description: 'Launched the Life Chapter Designer module, allowing candidates to map career breaks.',
      },
      {
        type: 'NEW',
        module: 'Readiness Profile',
        description: 'Added student export formats (JSON/PDF) for the Adaptive Readiness Profile.',
      },
      {
        type: 'MOD',
        module: 'Security',
        description: 'Completed our quarterly independent SOC2 security compliance review.',
      },
    ],
  },
];

const BADGE_TONE = {
  NEW: 'brand' as const,
  MOD: 'amber' as const,
  FIX: 'wine' as const,
};

export function Changelog() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 font-mono">
      {/* Hero Section */}
      <section className="text-center py-8">
         <Reveal>
          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-ink sm:text-5xl font-sans">
             Changelog & System updates
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm text-ink-soft font-mono">
            A transparent record of deployments, fixes, and updates to the Career OS core modules.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Feed */}
      <section className="mt-16 relative pl-6 border-l border-line/10 space-y-12">
        {LOGS.map((log) => (
          <Reveal key={log.version}>
            <div className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-brand ring-4 ring-canvas" />
              
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="font-display text-xl font-bold text-ink font-sans">{log.version}</h2>
                <span className="text-xs text-ink-mute font-mono">{log.date}</span>
              </div>

              <div className="mt-6 space-y-4">
                {log.items.map((item, idx) => (
                  <Card key={idx} className="p-4 border-line/10 flex items-start gap-4">
                    <Badge tone={BADGE_TONE[item.type]}>{item.type}</Badge>
                    <div>
                      <div className="text-[10px] font-bold text-brand uppercase tracking-wider">
                        Module: {item.module}
                      </div>
                      <p className="mt-1.5 text-xs text-ink-soft font-sans leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* CTA newsletter */}
      <section className="mt-16 text-center border-t border-line/10 pt-12">
        <button className="focus-ring h-10 rounded-full border border-line/25 px-5 text-xs font-semibold text-ink transition hover:border-line/50">
          Subscribe to release updates
        </button>
      </section>
    </div>
  );
}
