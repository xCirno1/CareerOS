import { Icons } from '@/lib/icons';
import { Card, Reveal, Button } from '@/ui/components';
import { useState } from 'react';
import { cn } from '@/lib/cn';

interface ContactChannel {
  name: string;
  scope: string;
  email: string;
  isHighPriority?: boolean;
}

const CHANNELS: ContactChannel[] = [
  {
    name: 'Candidates',
    scope: 'Account assistance, Living Portfolio verification, or privacy requests.',
    email: 'support@talentbank.io',
  },
  {
    name: 'Employers',
    scope: 'Product demos, API integrations, and talent matches.',
    email: 'partners@talentbank.io',
  },
  {
    name: 'Universities',
    scope: 'Career services dashboard setup and outcome tracking.',
    email: 'edu@talentbank.io',
  },
  {
    name: 'Security & Operations',
    scope: 'Vulnerability disclosures and data privacy audits.',
    email: 'security@talentbank.io',
    isHighPriority: true,
  },
];

export function Contact() {
  const [dept, setDept] = useState('Candidates');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Direct lines. <span className="highlight-green">No automated runaround.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft sm:text-xl leading-relaxed">
            We do not hide behind automated chatbots. Select your user type to route your message directly to the team responsible.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Channels and Form */}
      <section className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Left: Department Routing Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((ch) => (
            <Reveal key={ch.name}>
              <Card
                className={cn(
                  'p-5 border flex flex-col h-full justify-between',
                  ch.isHighPriority
                    ? 'border-wine bg-wine/[0.01]'
                    : 'border-line/10 bg-surface'
                )}
              >
                <div>
                  <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                    <span>ROUTING_CHANNEL</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-line/40" />
                    <span className={cn(ch.isHighPriority && 'text-wine')}>{ch.name}</span>
                  </div>
                  <p className="mt-3 text-xs text-ink-soft leading-relaxed">
                    {ch.scope}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-line/10 font-mono text-xs font-semibold text-brand">
                  {ch.email}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Right: Form */}
        <div>
          <Card className="p-6 border-line/10 shadow-soft">
            <h3 className="font-display text-lg font-bold text-ink">Send a Message</h3>
            
            {sent ? (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-semibold flex items-center gap-2">
                <Icons.CheckCircle2 size={16} />
                Message transmitted.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
                    Select Department
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl border border-line/20 bg-surface text-sm text-ink outline-none focus:border-brand"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch.name} value={ch.name}>
                        {ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full h-11 px-3.5 rounded-2xl border border-line/20 bg-surface text-sm text-ink outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
                    Message Content
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your query details..."
                    rows={4}
                    className="w-full p-3.5 rounded-2xl border border-line/20 bg-surface text-sm text-ink outline-none focus:border-brand resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="focus-ring w-full h-11 rounded-full bg-navy px-6 font-mono text-xs font-semibold text-white transition hover:bg-navy-600 dark:bg-brand dark:text-navy"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
