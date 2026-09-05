import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  icon,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';

  const styles: Record<ButtonVariant, string> = {
    primary:
      isLightTheme
        ? 'border border-cyan-300/35 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_6px_16px_rgba(14,165,233,0.12)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(14,165,233,0.18)]'
        : 'border border-cyan-300/35 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-[0_6px_16px_rgba(14,165,233,0.12)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(14,165,233,0.18)]',
    secondary: isLightTheme
      ? 'border border-slate-200 bg-white text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:border-cyan-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_10px_24px_rgba(14,165,233,0.12)]'
      : 'border border-slate-700/80 bg-slate-900/70 text-slate-100 hover:border-cyan-400/50 hover:bg-slate-800/80 hover:text-white hover:shadow-[0_0_0_1px_rgba(34,211,238,0.14)]',
    ghost: isLightTheme
      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
    danger: 'bg-red-500/90 text-white shadow-[0_6px_16px_rgba(239,68,68,0.12)] hover:bg-red-400',
  };

  return (
    <button
      {...props}
      className={[
        'group relative inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color,border-color,color,opacity] duration-[var(--transition-normal)] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:hover:-translate-y-0.5',
        styles[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {icon ? <span className="inline-flex transition-transform duration-[var(--transition-fast)] ease-out group-hover:translate-x-1">{icon}</span> : null}
      {children}
    </button>
  );
}
