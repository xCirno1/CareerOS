import { Icons } from '@/lib/icons';
import { Card, Reveal, TextField, Button } from '@/ui/components';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  tag: string;
  date: string;
  accent?: 'teal' | 'amber' | 'wine';
}

const ARTICLES: Article[] = [
  {
    id: 'ART-08',
    title: 'Why Your Resume is a Poor Data Structure',
    excerpt: 'Resumes are static documents written from memory under stress. They hide the continuous trajectory of skills and decisions. We break down why graph-based profiles offer better matches for both sides.',
    readTime: '08_MIN',
    tag: 'CAREER_PATHS',
    date: 'June 02, 2026',
    accent: 'teal',
  },
  {
    id: 'ART-07',
    title: 'The Cost of the Silent 15%: Analyzing Pay Discrepancies in Southeast Asian Tech',
    excerpt: 'Using aggregated data from the Fair Pay Engine, we show how salary opacity costs mid-level developers an average of $8,000 USD in lifetime earnings per pivot.',
    readTime: '12_MIN',
    tag: 'COMPENSATION',
    date: 'May 18, 2026',
    accent: 'amber',
  },
  {
    id: 'ART-06',
    title: 'Designing Graph Networks for Career Trajectories',
    excerpt: 'An engineering deep-dive into how we model career transitions using node distance and weight variables, ensuring that matching is logical and explainable.',
    readTime: '15_MIN',
    tag: 'ENGINEERING',
    date: 'April 29, 2026',
    accent: 'wine',
  },
];

export function Blog() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      {/* Hero Section */}
      <section className="text-center py-8">
        <Reveal>
          <h1 className="font-display text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Pragmatic analysis on the <span className="highlight-green">realities of work.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft sm:text-xl leading-relaxed">
            Data-backed studies, engineering logs, and realistic advice on navigating the job market without the marketing filter.
          </p>
        </Reveal>
      </section>

      {/* Main Body - Featured & Grid */}
      <section className="mt-16 space-y-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((art) => (
            <Reveal key={art.id}>
              <Card className="flex h-full flex-col p-6 border-line/10 hover:border-line/25 transition-all duration-300">
                <div className="flex-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-ink-mute">
                    <span>{art.date}</span>
                    <span>[READ_TIME: {art.readTime}]</span>
                  </div>
                  
                  <h3 className="mt-4 font-display text-lg font-bold text-ink leading-snug hover:text-brand transition-colors">
                    {art.title}
                  </h3>
                  
                  <p className="mt-3 text-sm text-ink-soft line-clamp-4 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-line/10 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-brand">
                    {art.tag}
                  </span>
                  <Icons.ArrowUpRight size={14} className="text-ink-mute" />
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA Newsletter subscription */}
      <section className="mt-20">
        <Reveal>
          <div className="rounded-[2rem] border border-line/10 bg-surface-2/30 p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h3 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Receive our monthly data reports directly
            </h3>
            <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto">
              Real compensation benchmarks and trajectory updates. No spam.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter email address"
                className="flex-grow h-11 px-4 rounded-full border border-line/20 bg-surface text-sm outline-none focus:border-brand"
              />
              <button className="focus-ring h-11 rounded-full bg-navy px-6 font-mono text-xs font-semibold text-white transition hover:bg-navy-600 dark:bg-brand dark:text-navy">
                Subscribe
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
