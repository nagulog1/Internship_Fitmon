import { signOut } from 'firebase/auth';
import { createElement } from 'react';
import {
  Clock,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  ScanLine,
  UserRound,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import useAuthStore from '../store/useAuthStore';
import useSessionStore from '../stores/useSessionStore';
import { Logo } from './ui';
import { cx } from '../utils/format';

const TRAINEE_LINKS = [
  { label: 'Home', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Session', to: '/session', icon: ScanLine },
  { label: 'Workouts', to: '/workout', icon: Dumbbell },
  { label: 'History', to: '/history', icon: Clock },
  { label: 'Profile', to: '/profile', icon: UserRound },
];

const MENTOR_LINKS = [{ label: 'Coach Studio', to: '/mentor', icon: MessagesSquare }];

function initialsOf(name) {
  if (!name) return 'FM';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const links = user?.role === 'mentor' ? MENTOR_LINKS : TRAINEE_LINKS;
  const home = user?.role === 'mentor' ? '/mentor' : '/dashboard';

  async function handleLogout() {
    if (auth) await signOut(auth);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/60 px-4 py-5 backdrop-blur-xl lg:flex">
        <Logo to={home} className="px-2" />

        <nav className="mt-10 flex flex-col gap-1" aria-label="Main">
          <p className="eyebrow mb-2 px-3">Menu</p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cx(
                  'group flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors',
                  isActive ? 'bg-white/[0.07] font-medium text-fg' : 'text-fg-2 hover:bg-white/[0.04] hover:text-fg'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {createElement(link.icon, { className: cx('size-[18px]', isActive ? 'text-lime' : 'text-muted group-hover:text-fg-2'), 'aria-hidden': true })}
                  {link.label}
                  {link.to === '/session' && sessionActive ? (
                    <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-lime">
                      <span className="size-1.5 animate-pulse-dot rounded-full bg-lime" />
                      Live
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime/15 text-xs font-semibold text-lime">
              {initialsOf(user?.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name || 'Athlete'}</p>
              <p className="truncate text-xs text-muted capitalize">{user?.role || 'trainee'}</p>
            </div>
            <button type="button" onClick={handleLogout} className="btn-icon size-8" aria-label="Log out" title="Log out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:hidden">
        <Logo to={home} />
        <div className="flex items-center gap-1">
          {sessionActive ? (
            <span className="badge badge-good mr-1">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-lime" />
              Live
            </span>
          ) : null}
          <button type="button" onClick={handleLogout} className="btn-icon" aria-label="Log out">
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      {links.length > 1 ? (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="mx-auto grid max-w-md grid-cols-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx('flex h-16 flex-col items-center justify-center gap-1 text-[11px] transition-colors', isActive ? 'text-lime' : 'text-muted hover:text-fg-2')
                }
              >
                {createElement(link.icon, { className: 'size-5', 'aria-hidden': true })}
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
