import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  accent?: 'cyan' | 'emerald' | 'amber' | 'red';
  icon?: ReactNode;
  className?: string;
};

const accents = {
  cyan: 'from-cyan-500/15 to-blue-500/10 text-cyan-200 ring-cyan-500/20',
  emerald: 'from-emerald-500/15 to-green-500/10 text-emerald-200 ring-emerald-500/20',
  amber: 'from-amber-500/15 to-yellow-500/10 text-amber-200 ring-amber-500/20',
  red: 'from-red-500/15 to-rose-500/10 text-red-200 ring-red-500/20',
};

export function MetricCard({ label, value, accent = 'cyan', icon, className = '' }: MetricCardProps) {
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -2,
        borderColor: 'rgba(34,211,238,0.38)',
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
      }}
      className={[
        'glass-panel h-full rounded-2xl bg-gradient-to-br p-4 ring-1 ring-inset',
        isLightTheme ? 'border border-slate-200 bg-white/95 shadow-[0_14px_32px_rgba(15,23,42,0.05)]' : accents[accent],
        className,
      ].join(' ')}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={isLightTheme ? 'text-sm font-medium text-slate-600' : 'text-sm font-medium text-slate-300'}>{label}</span>
        <div className={isLightTheme ? 'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700' : 'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-200'}>
          {icon}
        </div>
      </div>
      <div className={isLightTheme ? 'text-2xl font-bold tracking-[-0.04em] text-slate-900' : 'text-2xl font-bold tracking-[-0.04em] text-white'}>{value}</div>
    </motion.div>
  );
}
