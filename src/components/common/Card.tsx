import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function Card({ children, className = '', interactive = false }: CardProps) {
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';

  return (
    <div
      className={[
        'glass-panel rounded-2xl p-5',
        isLightTheme
          ? 'border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.06)]'
          : 'border border-slate-700/80 bg-slate-950/60 shadow-[0_18px_38px_rgba(2,6,23,0.18)]',
        interactive ? 'transition-[transform,border-color,box-shadow] duration-[var(--transition-normal)] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] hover:border-cyan-500/40 hover:shadow-[0_18px_38px_rgba(14,165,233,0.10)]' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
