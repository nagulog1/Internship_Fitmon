import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function ProtectedRoute({ roles }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized || isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-5">
        <div className="w-72" role="status" aria-live="polite">
          <p className="headline text-5xl">Warming up</p>
          <div className="relative mt-6 h-1 overflow-hidden rounded-full bg-ink/10">
            <span className="absolute inset-y-0 left-0 w-2/5 animate-slide rounded-full bg-ink" />
          </div>
          <p className="mt-4 text-sm text-ink-2">Signing you in and loading your profile.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'mentor' ? '/mentor' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
