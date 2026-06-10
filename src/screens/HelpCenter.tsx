import { Icons } from '@/lib/icons';
import { Card, Reveal, Badge } from '@/ui/components';
import { useState } from 'react';

interface Guide {
  title: string;
  category: string;
  excerpt: string;
}

const GUIDES: Guide[] = [
  {
    title: 'How to build your Living Portfolio',
    category: 'candidates',
    excerpt: 'Step-by-step guidance on setting up projects, verifying roles asynchronously, and managing visibility settings.',
  },
  {
    title: 'Understanding the privacy rules of the Career Path Navigator',
    category: 'candidates',
    excerpt: 'Detailed explanation of how anonymized shapes hide your coordinates from current employers.',
  },
  {
    title: 'How to set pay alerts in the Fair Pay Engine',
    category: 'candidates',
    excerpt: 'Learn to track regional compensation distributions and receive flags on performance review periods.',
  },
  {
    title: 'Setting up Talent Matching filters',
    category: 'employers',
    excerpt: 'A guide on designing searches based on candidate trajectories, regional shapes, and skill overlaps.',
  },
  {
    title: 'Understanding the parameters of the Talent Retention Signal',
    category: 'employers',
    excerpt: 'Learn how the system picks up anonymous activity fluctuations to signal retention risks early.',
  },
  {
    title: 'Configuring the Lifelong Outcome Loop',
    category: 'universities',
    excerpt: 'Guide for faculty admins to import class cohorts and track outcomes across decades.',
  },
];

export function HelpCenter() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'candidates' | 'employers' | 'universities'>('all');

  const filteredGuides = GUIDES.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || g.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Knowledge Base. <span className="highlight-green">Find your answer.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
            Practical explanations of system features, settings, and workflows. No corporate filler.
          </p>

          <div className="mt-8 max-w-lg mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute">
              <Icons.Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides, modules, variables..."
              className="w-full h-12 pl-11 pr-4 rounded-full border border-line/20 bg-surface text-sm text-ink outline-none focus:border-brand shadow-soft"
            />
          </div>
        </Reveal>
      </section>

      {/* Main Body - Categories and List */}
      <section className="mt-12 space-y-8">
        <Reveal>
          <div className="flex flex-wrap justify-center gap-2 border-b border-line/10 pb-6">
            {[
              { id: 'all', label: 'All Modules' },
              { id: 'candidates', label: 'Candidate Suite' },
              { id: 'employers', label: 'Employer Suite' },
              { id: 'universities', label: 'University Suite' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`h-9 px-4 rounded-full text-xs font-semibold transition ${
                  filter === tab.id
                    ? 'bg-brand text-navy'
                    : 'bg-surface-2 text-ink-soft hover:bg-line/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredGuides.map((g) => (
              <Card key={g.title} className="p-5 border-line/10 flex flex-col justify-between hover:border-line/25 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone="brand">{g.category.toUpperCase()}</Badge>
                    <span className="font-mono text-[9px] text-brand">VERIFIED_METHOD</span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-ink leading-snug">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-xs text-ink-soft leading-relaxed">
                    {g.excerpt}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-line/10 flex items-center justify-between text-[11px] font-semibold text-brand hover:underline cursor-pointer">
                  <span>Read full guide</span>
                  <Icons.ChevronRight size={13} />
                </div>
              </Card>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Direct support warning */}
      <section className="mt-20 border-t border-line/10 pt-12 text-center max-w-xl mx-auto">
        <h3 className="text-lg font-bold text-ink">Can't find the answers you need?</h3>
        <p className="mt-2 text-sm text-ink-soft mb-6">
          Our team answers support requests directly.
        </p>
        <div className="font-mono text-sm text-brand font-semibold">
          support@talentbank.io
        </div>
      </section>
    </div>
  );
}
