import { useEffect, useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { AlertTriangle, ArrowLeft, FileText, ScanLine, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, googleProvider, hasFirebaseConfig } from '../firebase/config';
import useAuthStore from '../store/useAuthStore';
import { Alert, IconChip, Logo } from '../components/ui';

const highlights = [
  { icon: ScanLine, title: 'Live form tracking', copy: 'Computer vision scores every rep in real time.' },
  { icon: ShieldCheck, title: 'Injury risk scoring', copy: 'Pressure + posture fused into one safety score.' },
  { icon: FileText, title: 'AI session reports', copy: 'Coaching insights and a PDF after each workout.' },
];

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
    <div className="grid min-h-screen bg-bg lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" aria-hidden />
        <div className="absolute -top-40 -left-40 size-[520px] rounded-full bg-lime/10 blur-[120px]" aria-hidden />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance">
            Every rep, measured. <span className="text-muted">Every risk, visible.</span>
          </h2>
          <ul className="mt-10 flex flex-col gap-5">
            {highlights.map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <IconChip icon={item.icon} tone="lime" />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-fg-2">{item.copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted">© {new Date().getFullYear()} FitMon</p>
      </aside>

      {/* Sign-in */}
      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link to="/" className="btn btn-ghost btn-sm ml-auto">
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm animate-fade-up">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome to FitMon</h1>
            <p className="mt-2 text-fg-2">Sign in or create your account to start tracking.</p>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="btn btn-lg mt-8 w-full border border-line-strong bg-white text-[#111] hover:bg-white/90"
            >
              {isSubmitting ? (
                <span className="size-4 animate-spin rounded-full border-2 border-[#111]/20 border-t-[#111]" aria-hidden />
              ) : (
                <GoogleMark />
              )}
              {isSubmitting ? 'Connecting…' : 'Continue with Google'}
            </button>

            {error ? (
              <div className="mt-4">
                <Alert icon={AlertTriangle}>{error}</Alert>
              </div>
            ) : null}

            <p className="mt-8 text-center text-xs leading-relaxed text-muted">
              By continuing you agree to use FitMon for training guidance only. It is not a medical device.
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
