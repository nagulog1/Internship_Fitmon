import { signOut } from 'firebase/auth';
import { createElement } from 'react';
import { Clock, Dumbbell, House, MessagesSquare, ScanLine, UserRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import useAuthStore from '../store/useAuthStore';
import useSessionStore from '../stores/useSessionStore';
import { cx } from '../utils/format';
import { Logo } from './ui';

const TRAINEE_LINKS = [
  { label: 'Home', to: '/dashboard', icon: House },
  { label: 'Session', to: '/session', icon: ScanLine },
  { label: 'Workouts', to: '/workout', icon: Dumbbell },
  { label: 'History', to: '/history', icon: Clock },
  { label: 'Profile', to: '/profile', icon: UserRound },
];

const MENTOR_LINKS = [{ label: 'Coach studio', to: '/mentor', icon: MessagesSquare }];

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
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-ink bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Logo to={home} />

          <nav className="hidden h-full items-stretch gap-6 md:flex" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    '-mb-px flex items-center gap-2 border-b-[3px] text-[13px] font-semibold tracking-[0.04em] uppercase transition-colors',
                    isActive ? 'border-signal text-ink' : 'border-transparent text-muted hover:text-ink'
                  )
                }
              >
                {link.label}
                {link.to === '/session' && sessionActive ? <span className="size-1.5 animate-blink bg-signal" aria-label="live" /> : null}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {sessionActive ? (
              <span className="tag border-signal bg-signal text-ink">
                <span className="size-1.5 animate-blink bg-ink" /> Recording
              </span>
            ) : null}
            <span className="hidden text-sm text-ink-2 lg:inline">{user?.name}</span>
            <button type="button" onClick={handleLogout} className="btn-text">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pt-8 pb-28 sm:px-6 md:pb-20 lg:px-8 lg:pt-12">
        <Outlet />
      </main>

      {links.length > 1 ? (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="grid grid-cols-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx(
                    'flex h-16 flex-col items-center justify-center gap-1 border-t-[3px] text-[10px] font-semibold tracking-[0.06em] uppercase',
                    isActive ? 'border-signal text-ink' : 'border-transparent text-muted'
                  )
                }
              >
                {createElement(link.icon, { className: 'size-5', strokeWidth: 1.75, 'aria-hidden': true })}
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
