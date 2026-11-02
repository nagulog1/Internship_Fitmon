import { signOut } from 'firebase/auth';
import { createElement } from 'react';
import { Clock, Dumbbell, House, LogOut, MessagesSquare, ScanLine, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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

function initialsOf(name) {
  if (!name) return 'FM';
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const sessionActive = useSessionStore((state) => state.sessionActive);
  const isMentor = user?.role === 'mentor';
  const links = isMentor ? MENTOR_LINKS : TRAINEE_LINKS;
  const home = isMentor ? '/mentor' : '/dashboard';

  async function handleLogout() {
    if (auth) await signOut(auth);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1320px] items-center gap-6 px-5 sm:px-8">
          <Logo to={home} />

          <nav className="mx-auto hidden items-center gap-1 rounded-full bg-surface p-1 md:flex" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx('flex h-9 items-center gap-2 rounded-full px-4 text-[13px] transition-colors', isActive ? 'bg-ink text-white' : 'text-ink-2 hover:text-ink')
                }
              >
                {link.label}
                {link.to === '/session' && sessionActive ? <span className="size-1.5 animate-pulse-soft rounded-full bg-volt" aria-label="live" /> : null}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            {!isMentor && pathname !== '/session' ? (
              <Link to="/session" className="btn btn-sm btn-volt-flat hidden sm:inline-flex">
                {sessionActive ? 'Back to session' : 'Start session'}
              </Link>
            ) : null}
            <span className="hidden size-10 place-items-center rounded-full bg-surface text-xs font-medium lg:grid" title={user?.name}>
              {initialsOf(user?.name)}
            </span>
            <button type="button" onClick={handleLogout} className="grid size-10 place-items-center rounded-full bg-surface text-ink-2 hover:text-ink" aria-label="Log out" title="Log out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] px-5 pt-6 pb-28 sm:px-8 md:pb-20 lg:pt-12">
        <Outlet />
      </main>

      {links.length > 1 ? (
        <nav aria-label="Main" className="fixed inset-x-3 bottom-3 z-30 rounded-full bg-ink p-1.5 shadow-xl md:hidden" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="grid grid-cols-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cx('flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] transition-colors', isActive ? 'bg-volt text-ink' : 'text-white/65')
                }
              >
                {createElement(link.icon, { className: 'size-[18px]', strokeWidth: 1.75, 'aria-hidden': true })}
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
