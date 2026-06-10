import { Icons } from '@/lib/icons';
import { Card, Reveal, Badge } from '@/ui/components';

export function Security() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Security & Data protection
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
            We run a security-first infrastructure to protect your personal history. Below is a breakdown of our encryption standards, data isolation rules, and regular compliance checks.
          </p>
        </Reveal>
      </section>

      {/* Main Body */}
      <section className="mt-16 space-y-12">
        <Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-5 border-line/10 bg-slate-950 text-slate-100 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] text-brand">SEC_PILLAR_01</span>
                <Badge tone="brand">ENCRYPTED</Badge>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-4 font-sans">Encryption Standards</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
                All data in transit is encrypted using TLS 1.3. Rest data is secured using AES-256 encryption. Candidate identification coordinates are isolated.
              </p>
            </Card>

            <Card className="p-5 border-line/10 bg-slate-950 text-slate-100 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] text-brand">SEC_PILLAR_02</span>
                <Badge tone="brand">COMPLIANT</Badge>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-4 font-sans">SOC2 Type II Audits</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
                We undergo annual independent SOC2 Type II compliance reviews. Our infrastructure is continuously monitored for vulnerabilities.
              </p>
            </Card>

            <Card className="p-5 border-line/10 bg-slate-950 text-slate-100 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] text-brand">SEC_PILLAR_03</span>
                <Badge tone="brand">ISOLATED</Badge>
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-4 font-sans">Data Isolation</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">
                Candidate profiles are separated from corporate matching databases. Employers never have direct database access; all searches are processed through anonymized routing APIs.
              </p>
            </Card>
          </div>
        </Reveal>

        {/* Security status */}
        <Reveal>
          <div className="rounded-3xl border border-line/10 bg-surface p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Icons.ShieldCheck size={18} className="text-brand" /> Continuous security monitoring
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              We employ automatic, real-time vulnerability scanning and threat detection across our infrastructure layers to guarantee platform security.
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl bg-surface-2/40 p-4 border border-line/5 text-center">
                <div className="text-[10px] font-bold text-ink-mute uppercase font-mono tracking-wider">Last External Audit</div>
                <div className="mt-1 text-sm font-extrabold text-brand">Q2 2026</div>
              </div>
              <div className="rounded-2xl bg-surface-2/40 p-4 border border-line/5 text-center">
                <div className="text-[10px] font-bold text-ink-mute uppercase font-mono tracking-wider">Critical Vulns</div>
                <div className="mt-1 text-sm font-extrabold text-emerald-500">0</div>
              </div>
              <div className="rounded-2xl bg-surface-2/40 p-4 border border-line/5 text-center">
                <div className="text-[10px] font-bold text-ink-mute uppercase font-mono tracking-wider">Security Patch Cycle</div>
                <div className="mt-1 text-sm font-extrabold text-brand">Daily</div>
              </div>
              <div className="rounded-2xl bg-surface-2/40 p-4 border border-line/5 text-center">
                <div className="text-[10px] font-bold text-ink-mute uppercase font-mono tracking-wider">Platform Status</div>
                <div className="mt-1 text-sm font-extrabold text-emerald-500">Secure</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
