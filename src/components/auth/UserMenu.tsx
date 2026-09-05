import { LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '@clerk/react';
import { Link } from 'react-router-dom';
import { getDisplayName, type AuthUser } from '../../auth/mockAuth';

type UserMenuProps = {
  user: AuthUser;
  onLogout: () => void;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'U';
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { user: clerkUser } = useUser();
  const userDisplayName = getDisplayName(user);
  const initials = getInitials(clerkUser?.fullName || userDisplayName || user.name || 'PackSure User');
  const avatarUrl = clerkUser?.imageUrl || undefined;
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open user menu"
        className={[
          'group relative flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_12px_24px_rgba(2,6,23,0.2)] transition-all duration-[var(--transition-normal)] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04] hover:border-cyan-300/60 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_16px_28px_rgba(34,211,238,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          isLightTheme
            ? 'border-cyan-200 bg-white text-slate-800'
            : 'border-cyan-400/30 bg-slate-900/70 text-white',
        ].join(' ')}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={userDisplayName} className="h-full w-full rounded-full object-cover" />
        ) : (
          <div className={isLightTheme ? 'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-500/10 text-sm font-bold tracking-[0.08em] text-cyan-700 ring-1 ring-cyan-500/20' : 'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-sm font-bold tracking-[0.08em] text-cyan-200 ring-1 ring-cyan-500/20'}>
            {initials}
          </div>
        )}
      </button>

      {open ? (
        <div className={[
          'absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border p-2 shadow-[0_18px_42px_rgba(2,6,23,0.7)] backdrop-blur-sm',
          isLightTheme ? 'border-slate-200 bg-white/95 shadow-[0_18px_42px_rgba(15,23,42,0.10)]' : 'border-slate-700 bg-slate-950/95',
        ].join(' ')}>
          <div className={isLightTheme ? 'border-b border-slate-200 px-3 py-2' : 'border-b border-slate-800 px-3 py-2'}>
            <div className={isLightTheme ? 'text-sm font-medium text-slate-900' : 'text-sm font-medium text-white'}>{userDisplayName}</div>
            <div className={isLightTheme ? 'text-xs text-slate-500' : 'text-xs text-slate-400'}>{user.email}</div>
          </div>
          <div className="mt-2 space-y-1">
            <Link to="/profile" className={isLightTheme ? 'flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors duration-[var(--transition-fast)] ease-out hover:bg-slate-100' : 'flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition-colors duration-[var(--transition-fast)] ease-out hover:bg-slate-900/80'}>
              <User className="h-4 w-4" /> Profile / Account
            </Link>
            <Link to="/profile" className={isLightTheme ? 'flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors duration-[var(--transition-fast)] ease-out hover:bg-slate-100' : 'flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 transition-colors duration-[var(--transition-fast)] ease-out hover:bg-slate-900/80'}>
              <User className="h-4 w-4" /> Edit Profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className={isLightTheme ? 'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition-colors duration-[var(--transition-fast)] ease-out hover:bg-red-50' : 'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-200 transition-colors duration-[var(--transition-fast)] ease-out hover:bg-red-500/10'}
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
