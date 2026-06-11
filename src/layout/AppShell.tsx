import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icons } from '@/lib/icons';
import { getNode } from '@/lib/mockData';
import { AppStoreProvider, useAppStore } from '@/lib/appStore';
import { ProfileProvider, useProfile } from '@/lib/profile';
import { NAV } from './nav';
import { Logo, ThemeToggle, Avatar, Tooltip, ToastProvider, Toggle, useToast } from '@/ui/components';
import { CommandPalette } from '@/components/CommandPalette';

function NavRow({
  to,
  label,
  icon: Icon,
  collapsed,
}: {
  to: string;
  label: string;
  icon: typeof Icons.Network;
  collapsed: boolean;
}) {
  const row = (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'focus-ring group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-navy text-white shadow-soft dark:bg-brand/15 dark:text-brand'
            : 'text-ink-soft hover:bg-line/5 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={19} strokeWidth={2.1} />
          {!collapsed && <span>{label}</span>}
          {isActive && !collapsed && (
            <Icons.ChevronRight size={15} className="ml-auto opacity-60" />
          )}
        </>
      )}
    </NavLink>
  );
  return collapsed ? (
    <Tooltip content={label} side="right">
      {row}
    </Tooltip>
  ) : (
    row
  );
}

/** Bookmark button + dropdown of saved roles. */
function SavedMenu() {
  const { saved, toggleSaved } = useAppStore();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring relative grid h-10 w-10 place-items-center rounded-2xl border border-line/12 bg-surface text-ink-soft transition hover:text-ink"
        aria-label="Saved roles"
      >
        <Icons.Bookmark size={18} />
        {saved.length > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-canvas">
            {saved.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 animate-fade-up overflow-hidden rounded-2xl border border-line/12 bg-surface shadow-glass">
            <div className="flex items-center justify-between border-b border-line/10 px-4 py-3">
              <span className="text-sm font-bold text-ink">Saved roles</span>
              <span className="text-xs font-semibold text-ink-mute">{saved.length}</span>
            </div>
            {saved.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-mute">
                Nothing saved yet. Tap “Save role” on any role.
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto p-1.5">
                {saved.map((id) => {
                  const n = getNode(id);
                  if (!n) return null;
                  return (
                    <div key={id} className="group flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-line/5">
                      <Link
                        to={`/node/${id}`}
                        onClick={() => setOpen(false)}
                        className="min-w-0 flex-1"
                      >
                        <p className="truncate text-sm font-semibold text-ink">{n.title}</p>
                        <p className="truncate text-xs capitalize text-ink-mute">{n.kind}</p>
                      </Link>
                      <button
                        onClick={() => toggleSaved(id)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-ink-mute opacity-0 transition hover:bg-line/10 hover:text-wine group-hover:opacity-100"
                        aria-label={`Remove ${n.title}`}
                      >
                        <Icons.X size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ProfileMenu() {
  const { profile, update, reset } = useProfile();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const role = profile.headline.split('·')[0].trim();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (target instanceof Node && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open]);

  const signOut = () => {
    setOpen(false);
    toast('Signed out', { icon: Icons.LogOut, tone: 'default' });
    navigate('/');
  };

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring rounded-full transition hover:opacity-90"
        aria-label="Profile and account menu"
        aria-expanded={open}
      >
        <Avatar name={profile.name} size={40} />
      </button>
      {open && (
        <>
          <div className="absolute right-0 z-50 mt-2 w-80 animate-fade-up overflow-hidden rounded-2xl border border-line/12 bg-surface shadow-glass">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-b border-line/10 px-4 py-3 transition hover:bg-line/5"
            >
              <Avatar name={profile.name} size={42} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">{profile.name}</span>
                <span className="block truncate text-xs text-ink-mute">{role}</span>
              </span>
              <Icons.ChevronRight size={15} className="shrink-0 text-ink-mute" />
            </Link>

            <div className="divide-y divide-line/10 px-2 py-1.5">
              <div className="flex items-center justify-between gap-3 px-2 py-2.5">
                <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                  <Icons.Moon size={16} className="text-ink-mute" />
                  Appearance
                </span>
                <ThemeToggle />
              </div>

              <div className="flex items-center justify-between gap-3 px-2 py-2.5">
                <span className="min-w-0">
                  <span className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                    <Icons.Target size={16} className="text-ink-mute" />
                    Open to work
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-mute">Show the badge on your profile.</span>
                </span>
                <Toggle
                  checked={profile.openToWork}
                  onChange={(v) => {
                    update({ openToWork: v });
                    toast(v ? 'Marked open to work' : 'Open-to-work turned off', {
                      icon: Icons.Target,
                      tone: v ? 'success' : 'default',
                    });
                  }}
                />
              </div>

              <button
                onClick={() => {
                  reset();
                  setOpen(false);
                  toast('Profile reset to defaults', { icon: Icons.User, tone: 'default' });
                }}
                className="focus-ring flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left text-sm font-semibold text-ink-soft transition hover:bg-line/5 hover:text-ink"
              >
                <Icons.User size={16} className="text-ink-mute" />
                Reset profile to defaults
              </button>

              <button
                onClick={signOut}
                className="focus-ring flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left text-sm font-semibold text-wine transition hover:bg-wine/5"
              >
                <Icons.LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();
  const { profile } = useProfile();
  const role = profile.headline.split('·')[0].trim();

  // ⌘K / Ctrl-K opens the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-canvas">
      {/* ---- Desktop sidebar ---- */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line/10 bg-surface/80 backdrop-blur-xl transition-[width] duration-300 lg:flex',
          collapsed ? 'w-[76px]' : 'w-[244px]',
        )}
      >
        <div className={cn('flex h-16 items-center px-4', collapsed && 'justify-center px-0')}>
          <Link to="/" className="focus-ring rounded-xl">
            <Logo showWord={!collapsed} />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {!collapsed && <p className="eyebrow px-3 pb-2 pt-3">Navigate</p>}
          {NAV.map((item) => (
            <NavRow key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="space-y-2 border-t border-line/10 p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'focus-ring flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-ink-mute transition hover:bg-line/5 hover:text-ink',
              collapsed && 'justify-center px-0',
            )}
          >
            <Icons.ChevronLeft
              size={18}
              className={cn('transition-transform', collapsed && 'rotate-180')}
            />
            {!collapsed && 'Collapse'}
          </button>
          {collapsed ? (
            <Tooltip content="Your profile" side="right">
              <Link
                to="/profile"
                className="focus-ring flex justify-center rounded-2xl py-1 transition hover:bg-line/5"
                aria-label="Your profile"
              >
                <Avatar name={profile.name} size={36} />
              </Link>
            </Tooltip>
          ) : (
            <Link
              to="/profile"
              className="focus-ring flex items-center gap-3 rounded-2xl bg-surface-2 p-2.5 transition hover:bg-line/8"
            >
              <Avatar name={profile.name} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{profile.name}</p>
                <p className="truncate text-xs text-ink-mute">{role}</p>
              </div>
              <Icons.ChevronRight size={15} className="shrink-0 text-ink-mute" />
            </Link>
          )}
        </div>
      </aside>

      {/* ---- Main column ---- */}
      <div className={cn('transition-[padding] duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-[244px]')}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line/10 bg-canvas/80 px-4 backdrop-blur-xl sm:px-6">
          <Link to="/" className="focus-ring rounded-xl lg:hidden">
            <Logo size="sm" />
          </Link>
          <div className="ml-auto hidden flex-1 items-center md:flex md:max-w-md">
            <button
              onClick={() => setPaletteOpen(true)}
              className="focus-ring flex h-10 w-full items-center gap-2.5 rounded-2xl border border-line/12 bg-surface px-3.5 text-ink-mute transition hover:border-brand/40"
            >
              <Icons.Search size={17} />
              <span className="text-sm">Search roles, skills, employers…</span>
              <kbd className="ml-auto hidden rounded-md border border-line/15 px-1.5 text-[10px] font-semibold sm:block">
                ⌘K
              </kbd>
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-3">
            <button
              onClick={() => setPaletteOpen(true)}
              className="focus-ring grid h-10 w-10 place-items-center rounded-2xl border border-line/12 bg-surface text-ink-soft transition hover:text-ink md:hidden"
              aria-label="Search"
            >
              <Icons.Search size={18} />
            </button>
            <SavedMenu />
            <button className="focus-ring relative grid h-10 w-10 place-items-center rounded-2xl border border-line/12 bg-surface text-ink-soft transition hover:text-ink">
              <Icons.Bell size={18} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-wine ring-2 ring-canvas" />
            </button>
            <ProfileMenu />
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] pb-24 lg:pb-0">
          {/* keyed wrapper → re-mounts and replays the entrance on every route change */}
          <div key={location.pathname} className="animate-fade-up">
            {children}
          </div>
        </main>
      </div>

      {/* ---- Mobile bottom tab bar ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/10 bg-surface/90 backdrop-blur-xl lg:hidden">
        <div
          className="mx-auto grid max-w-md"
          style={{ gridTemplateColumns: `repeat(${NAV.length + 2}, minmax(0, 1fr))` }}
        >
          <Link
            to="/"
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition',
              location.pathname === '/' ? 'text-brand' : 'text-ink-mute',
            )}
          >
            <Icons.Compass size={20} />
            Home
          </Link>
          {NAV.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition',
                  active ? 'text-brand' : 'text-ink-mute',
                )}
              >
                <Icon size={20} />
                {item.label.split(' ')[0]}
              </Link>
            );
          })}
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-ink-mute"
          >
            <Icons.Search size={20} />
            Search
          </button>
        </div>
      </nav>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppStoreProvider>
      <ProfileProvider>
        <ToastProvider>
          <Shell>{children}</Shell>
        </ToastProvider>
      </ProfileProvider>
    </AppStoreProvider>
  );
}
