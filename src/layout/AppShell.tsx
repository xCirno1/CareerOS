import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Icons } from '@/lib/icons';
import { NAV } from './nav';
import { Logo, ThemeToggle, Avatar, Tooltip } from '@/ui/components';

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

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

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
          {!collapsed && (
            <p className="eyebrow px-3 pb-2 pt-3">Navigate</p>
          )}
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
          {!collapsed && (
            <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-2.5">
              <Avatar name="Avery Quinn" size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">Avery Quinn</p>
                <p className="truncate text-xs text-ink-mute">Frontend Engineer</p>
              </div>
            </div>
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
            <label className="flex h-10 w-full items-center gap-2.5 rounded-2xl border border-line/12 bg-surface px-3.5 text-ink-mute focus-within:border-brand/40">
              <Icons.Search size={17} />
              <input
                placeholder="Search nodes, skills, employers…"
                className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-mute"
              />
              <kbd className="hidden rounded-md border border-line/15 px-1.5 text-[10px] font-semibold text-ink-mute sm:block">
                ⌘K
              </kbd>
            </label>
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-3">
            <button className="focus-ring relative grid h-10 w-10 place-items-center rounded-2xl border border-line/12 bg-surface text-ink-soft transition hover:text-ink">
              <Icons.Bell size={18} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-wine ring-2 ring-canvas" />
            </button>
            <ThemeToggle />
            <Avatar name="Avery Quinn" size={40} className="hidden sm:grid" />
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] pb-24 lg:pb-0">{children}</main>
      </div>

      {/* ---- Mobile bottom tab bar ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/10 bg-surface/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
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
        </div>
      </nav>
    </div>
  );
}
