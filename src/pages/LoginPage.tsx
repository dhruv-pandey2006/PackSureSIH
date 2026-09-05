import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { SignIn, useUser } from '@clerk/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded, user } = useUser();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const profileComplete = Boolean((user?.unsafeMetadata as Record<string, unknown> | undefined)?.profileComplete);
    navigate(profileComplete ? from : '/complete-profile', { replace: true });
  }, [from, isLoaded, isSignedIn, user, navigate]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className={isLightTheme ? 'w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_35px_90px_rgba(15,23,42,0.08)]' : 'w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950/60 shadow-[0_35px_90px_rgba(2,6,23,0.55)]'}>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className={isLightTheme ? 'relative hidden overflow-hidden border-r border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_35%,#ffffff_100%)] p-8 lg:flex lg:flex-col lg:justify-between' : 'relative hidden overflow-hidden border-r border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(135deg,#020817_0%,#0f172a_52%,#0b1120_100%)] p-8 lg:flex lg:flex-col lg:justify-between'}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_26%)]" />
            <div className="relative">
              <Link to="/" className={isLightTheme ? 'inline-flex items-center gap-3 text-slate-900 transition-opacity duration-[var(--transition-fast)] ease-out hover:opacity-90' : 'inline-flex items-center gap-3 text-white transition-opacity duration-[var(--transition-fast)] ease-out hover:opacity-90'}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-slate-950 shadow-[0_12px_25px_rgba(59,130,246,0.28)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-bold tracking-[0.18em]">PACKSURE</div>
                  <div className={isLightTheme ? 'text-[10px] uppercase tracking-[0.28em] text-slate-500' : 'text-[10px] uppercase tracking-[0.28em] text-slate-400'}>Trust Every Label</div>
                </div>
              </Link>
            </div>

            <div className="relative space-y-5">
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Access control</div>
              <h1 className={isLightTheme ? 'text-4xl font-bold text-slate-900' : 'text-4xl font-bold text-white'}>Secure compliance review for your team.</h1>
              <p className={isLightTheme ? 'max-w-md text-base leading-7 text-slate-600' : 'max-w-md text-base leading-7 text-slate-300'}>Review packaging declarations, compliance issues, and labeling decisions in a secure workflow designed for manufacturers, importers, and inspectors.</p>
            </div>

            <div className={isLightTheme ? 'relative grid gap-3 text-sm text-slate-600' : 'relative grid gap-3 text-sm text-slate-300'}>
              <div className={isLightTheme ? 'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm' : 'rounded-2xl border border-slate-800 bg-slate-950/60 p-3'}>Role-based access</div>
              <div className={isLightTheme ? 'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm' : 'rounded-2xl border border-slate-800 bg-slate-950/60 p-3'}>Audit-ready dashboard</div>
              <div className={isLightTheme ? 'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm' : 'rounded-2xl border border-slate-800 bg-slate-950/60 p-3'}>Protected compliance workflows</div>
            </div>
          </div>

          <div className={isLightTheme ? 'bg-white p-6 sm:p-8 lg:p-10' : 'p-6 sm:p-8 lg:p-10'}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Welcome back</div>
                <h2 className={isLightTheme ? 'mt-2 text-3xl font-bold text-slate-900' : 'mt-2 text-3xl font-bold text-white'}>Sign in to PackSure</h2>
              </div>
              <Link to="/" className={isLightTheme ? 'inline-flex items-center gap-2 text-sm text-slate-600 transition-colors duration-[var(--transition-fast)] ease-out hover:text-slate-900' : 'inline-flex items-center gap-2 text-sm text-slate-300 transition-colors duration-[var(--transition-fast)] ease-out hover:text-white'}>
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </div>

            <div className={isLightTheme ? 'overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2 shadow-[0_16px_36px_rgba(15,23,42,0.05)]' : 'overflow-hidden rounded-[20px] border border-slate-800 bg-slate-950/70 p-2'}>
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                forceRedirectUrl={from}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
