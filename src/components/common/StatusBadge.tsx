import { AlertTriangle, CheckCircle2, CircleAlert } from 'lucide-react';

type StatusBadgeProps = {
  status: string;
};

const palette: Record<string, string> = {
  Compliant: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  'Compliant with Minor Issues': 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  'Needs Review': 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  'Non-Compliant': 'bg-red-500/10 text-red-300 border border-red-500/20',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const icon =
    status === 'Non-Compliant'
      ? CircleAlert
      : status === 'Compliant'
        ? CheckCircle2
        : AlertTriangle;

  const Icon = icon;

  return (
    <span className={['inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold', palette[status] ?? 'bg-slate-700/60 text-slate-200'].join(' ')}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}
