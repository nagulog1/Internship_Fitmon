import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function ProtectedRoute({ roles }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized || isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg px-4">
        <div className="flex flex-col items-center gap-5 text-center" role="status" aria-live="polite">
          <div className="flex h-10 items-end gap-1" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-full w-1.5 origin-bottom animate-wave rounded-full bg-lime" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
          <div>
            <p className="font-medium">Preparing your workspace</p>
            <p className="mt-1 text-sm text-muted">Signing you in and loading your profile…</p>
          </div>
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
