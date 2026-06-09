import { Icons } from '@/lib/icons';
import { Card, Reveal, Badge } from '@/ui/components';

interface Service {
  name: string;
  uptime: string;
  latency: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
}

const SERVICES: Service[] = [
  {
    name: 'Core API Gateway',
    uptime: '99.98%',
    latency: '45ms',
    status: 'OPERATIONAL',
  },
  {
    name: 'C.01 - Map Navigation Engine',
    uptime: '99.95%',
    latency: '120ms',
    status: 'OPERATIONAL',
  },
  {
    name: 'E.01 - Matching & Routing Gateway',
    uptime: '100%',
    latency: '80ms',
    status: 'OPERATIONAL',
  },
  {
    name: 'SYS - Database Clusters (Asia East)',
    uptime: '99.99%',
    latency: '12ms',
    status: 'OPERATIONAL',
  },
];

export function Status() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 font-mono text-xs font-semibold text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
          <h1 className="mt-6 font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Live infrastructure status
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink-soft font-mono">
            Uptime and latency metrics from our distributed regional nodes across Asia.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Metrics */}
      <section className="mt-12 space-y-6">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {SERVICES.map((srv) => (
              <Card key={srv.name} className="p-5 border-line/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-brand uppercase">
                      {srv.name}
                    </span>
                    <Badge tone="brand">{srv.status}</Badge>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wider text-ink-mute">
                        Uptime (90d)
                      </div>
                      <div className="mt-1 font-display text-xl font-extrabold text-ink">
                        {srv.uptime}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wider text-ink-mute">
                        Latency
                      </div>
                      <div className="mt-1 font-display text-xl font-extrabold text-brand">
                        {srv.latency}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Simulated uptime bars */}
                <div className="mt-6 flex gap-[2px]">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-6 flex-grow rounded-[1px] bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer transition-colors"
                      title={`Day ${30 - i}: 100%`}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Reveal>

        {/* Incident History */}
        <Reveal>
          <div className="rounded-3xl border border-line/10 bg-surface p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Icons.Activity size={18} className="text-brand" /> Incident logs
            </h3>
            
            <div className="divide-y divide-line/10">
              <div className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-ink">No current issues</div>
                  <div className="text-xs text-ink-mute mt-0.5">June 09, 2026</div>
                </div>
                <span className="font-mono text-xs text-emerald-500 font-semibold">RESOLVED</span>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-ink">Database Sync Latency</div>
                  <div className="text-xs text-ink-mute mt-0.5">May 12, 2026</div>
                </div>
                <span className="font-mono text-xs text-emerald-500 font-semibold">RESOLVED (14m duration)</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA alerts */}
      <section className="mt-16 text-center border-t border-line/10 pt-12">
        <button className="focus-ring h-10 rounded-full border border-line/25 px-5 text-xs font-semibold text-ink transition hover:border-line/50 font-mono">
          Register for status alerts via SMS
        </button>
      </section>
    </div>
  );
}
