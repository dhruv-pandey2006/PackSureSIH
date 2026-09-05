import { motion } from 'framer-motion';
import { ArrowRight, Monitor, Moon, ShieldCheck, SunMedium } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../common/Button';
import { UserMenu } from '../auth/UserMenu';

type ThemeMode = 'light' | 'dark' | 'system';

const publicNavItems = [
  { label: 'Home', to: '/' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Dashboard', to: '/dashboard' },
];

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const saved = window.localStorage.getItem('packsure-theme');
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

function resolveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { session, logout } = useAuth();
  const navItems = useMemo(
    () =>
      session.isAuthenticated
        ? [
            { label: 'Home', to: '/' },
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Scan Product', to: '/scan-product' },

            { label: 'History', to: '/history' },
            { label: 'Reports', to: '/reports' },
          ]
        : publicNavItems,
    [session.isAuthenticated],
  );

  useEffect(() => {
    let rafId = 0;

    const handleScroll = () => {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10);
        rafId = 0;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      const resolved = resolveTheme(theme);
      const root = document.documentElement;
      root.dataset.theme = resolved;
      root.style.colorScheme = resolved;
      window.localStorage.setItem('packsure-theme', theme);
    };

    syncTheme();

    if (theme !== 'system') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => syncTheme();
    media.addEventListener('change', handleSystemChange);
    return () => media.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const isLightTheme = useMemo(() => resolveTheme(theme) === 'light', [theme]);
  const themeButtonClasses = isLightTheme
    ? 'border-slate-200/80 bg-white/80 text-slate-700 hover:border-sky-300 hover:bg-white'
    : 'border-slate-700/80 bg-slate-900/70 text-slate-200 hover:border-cyan-400/40 hover:bg-slate-900';
  const themeMenuClasses = isLightTheme
    ? 'border-slate-200 bg-white/95 text-slate-700 shadow-[0_18px_42px_rgba(15,23,42,0.12)]'
    : 'border-slate-700 bg-slate-950/95 text-slate-200 shadow-[0_18px_42px_rgba(2,6,23,0.7)]';
  const navLinkClasses = (isActive: boolean) => [
    'relative text-sm font-medium transition-colors duration-[var(--transition-normal)] ease-[cubic-bezier(0.22,1,0.36,1)]',
    isActive
      ? isLightTheme ? 'text-slate-900' : 'text-white'
      : isLightTheme ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200',
    isActive ? 'after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:bg-cyan-400' : 'after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-cyan-400 after:transition-transform after:duration-200 after:content-[""]',
    isActive ? 'after:scale-x-100' : 'hover:after:scale-x-100',
  ].join(' ');

  const themeIcon = theme === 'dark' ? <Moon className="h-4 w-4" /> : theme === 'light' ? <SunMedium className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  const themeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.56, ease: 'easeOut' }}
      className={[
        'fixed inset-x-0 top-0 z-[9999] border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-[var(--transition-normal)] ease-[cubic-bezier(0.22,1,0.36,1)]',
        scrolled
          ? isLightTheme
            ? 'border-slate-200/80 bg-white/75 shadow-[0_12px_28px_rgba(15,23,42,0.10)] backdrop-blur-[14px]'
            : 'border-slate-700/80 bg-slate-950/65 shadow-[0_12px_28px_rgba(2,6,23,0.24)] backdrop-blur-[14px]'
          : isLightTheme
            ? 'border-slate-200/80 bg-white/60 backdrop-blur-[14px]'
            : 'border-slate-800/80 bg-slate-950/45 backdrop-blur-[14px]',
      ].join(' ')}
    >
      <div className="relative mx-auto h-[76px] w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <div className="flex flex-1 items-center justify-start">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-slate-950 shadow-[0_12px_25px_rgba(59,130,246,0.28)]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className={isLightTheme ? 'text-[11px] font-bold tracking-[0.2em] text-slate-900 sm:text-sm' : 'text-[11px] font-bold tracking-[0.2em] text-white sm:text-sm'}>PACKSURE</div>
                <div className={isLightTheme ? 'text-[8px] uppercase tracking-[0.22em] text-slate-500 sm:text-[9px]' : 'text-[8px] uppercase tracking-[0.22em] text-slate-400 sm:text-[9px]'}>Trust Every Label</div>
              </div>
            </Link>
          </div>

          <nav className={[
            'pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-2 shadow-[inset_0_1px_0_rgba(148,163,184,0.04),0_10px_24px_rgba(2,6,23,0.18)] backdrop-blur-sm md:flex',
            isLightTheme ? 'border-slate-200/80 bg-white/70' : 'border-slate-700/70 bg-slate-900/35',
          ].join(' ')}>
            <div className="flex items-center gap-8 lg:gap-10">
              {navItems.map((item) => (
                <NavLink
                  key={`${item.label}-${item.to}`}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => navLinkClasses(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="relative">
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() => setThemeMenuOpen((value) => !value)}
                className={[
                  'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color,box-shadow] duration-[var(--transition-normal)] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                  themeButtonClasses,
                ].join(' ')}
              >
                {themeIcon}
              </button>

              {themeMenuOpen ? (
                <div className={[
                  'absolute right-0 z-20 mt-2 min-w-[160px] overflow-hidden rounded-2xl border p-2 backdrop-blur-sm',
                  themeMenuClasses,
                ].join(' ')}>
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setTheme(option.value);
                        setThemeMenuOpen(false);
                      }}
                      className={[
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors duration-[var(--transition-fast)] ease-out',
                        theme === option.value ? (isLightTheme ? 'bg-slate-100 text-slate-900' : 'bg-slate-800 text-white') : (isLightTheme ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-900/80'),
                      ].join(' ')}
                    >
                      <span>{option.label}</span>
                      {theme === option.value ? <span className="text-xs">•</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {session.isAuthenticated && session.user ? (
              <UserMenu user={session.user} onLogout={logout} />
            ) : (
              <Link to="/sign-up" className="hidden md:inline-flex">
                <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
