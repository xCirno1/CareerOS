import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '@/lib/icons';
import { Button, Card, TextField, Logo } from '@/ui/components';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Simple mock authentication success -> redirect to map dashboard
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="focus-ring rounded-lg">
          <Logo />
        </Link>
        <Link to="/onboarding" className="text-sm font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-5 py-12">
        <Card className="w-full max-w-md p-6 sm:p-8 shadow-soft border-line/10">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Sign in to Career OS
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              Access your personal career coordinates and pathways.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-wine/10 border border-wine/20 text-wine text-xs font-semibold flex items-center gap-2">
              <Icons.X size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Work email"
              icon={Icons.Search}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink-mute">Password</label>
                <a href="#forgot" className="text-[11px] font-semibold text-brand hover:underline">
                  Forgot password?
                </a>
              </div>
              <TextField
                icon={Icons.ShieldCheck}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" block size="lg" icon={Icons.Rocket}>
                Sign In
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <footer className="py-6 border-t border-line/10 text-center text-xs text-ink-mute font-mono">
        © {new Date().getFullYear()} CareerOS. All rights reserved.
      </footer>
    </div>
  );
}
