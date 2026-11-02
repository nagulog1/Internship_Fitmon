import { useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider, hasFirebaseConfig } from '../firebase/config';
import useAuthStore from '../store/useAuthStore';
import { CurlDiagram, Logo, Notice } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const storeError = useAuthStore((state) => state.error);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!user) return;
    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
  }, [location.state, navigate, user]);

  async function handleGoogleSignIn() {
    if (!hasFirebaseConfig || !auth || !googleProvider) {
      setLocalError('Sign-in is not available right now. Please try again later.');
      return;
    }
    try {
      setLocalError('');
      setIsSubmitting(true);
      await signInWithPopup(auth, googleProvider);
    } catch {
      setLocalError('Sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const error = localError || storeError;

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-paper lg:flex">
        <Logo inverted />
        <div>
          <CurlDiagram inverted className="mb-10 w-full max-w-[340px]" />
          <p className="display text-[64px] xl:text-[80px]">
            Every rep
            <br />
            on the <span className="text-signal">record.</span>
          </p>
        </div>
        <p className="text-xs text-paper/60">© {new Date().getFullYear()} FitMon</p>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link to="/" className="btn-text ml-auto">
            <ArrowLeft className="size-3.5" /> Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center py-12">
          <div className="w-full max-w-sm animate-rise">
            <p className="label">Sign in</p>
            <h1 className="display mt-3 text-[52px]">Let's train.</h1>
            <p className="mt-3 text-[15px] text-ink-2">
              One account for sessions, reports and history. New here? Signing in creates it.
            </p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="btn btn-lg mt-8 w-full border border-ink bg-sheet text-ink normal-case tracking-normal hover:bg-ink hover:text-paper"
            >
              <GoogleMark />
              <span className="text-[15px] font-semibold">{isSubmitting ? 'Connecting…' : 'Continue with Google'}</span>
            </button>

            {error ? (
              <div className="mt-4">
                <Notice title="Couldn't sign you in">{error}</Notice>
              </div>
            ) : null}

            <p className="mt-10 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
              FitMon gives training guidance. It isn't a medical device. If something hurts, stop and see a professional.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}
