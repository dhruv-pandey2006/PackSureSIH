import { AlertTriangle, BadgeAlert } from 'lucide-react';

type ViolationCardProps = {
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  explanation: string;
  ruleReference: string;
  evidence: string;
};

const severityStyles = {
  High: 'border-red-500/30 bg-red-500/10 text-red-200',
  Medium: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  Low: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
};

export function ViolationCard({ severity, title, explanation, ruleReference, evidence }: ViolationCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BadgeAlert className="h-4 w-4 text-slate-200" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        <span className={['inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]', severityStyles[severity]].join(' ')}>
          {severity}
        </span>
      </div>
      <p className="mb-3 text-sm leading-6 text-slate-300">{explanation}</p>
      <div className="space-y-2 text-xs text-slate-400">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-300" />
          <span><span className="text-slate-200">Rule reference:</span> {ruleReference}</span>
        </div>
        <div className="flex items-start gap-2">
          <BadgeAlert className="mt-0.5 h-3.5 w-3.5 text-cyan-300" />
          <span><span className="text-slate-200">Evidence:</span> {evidence}</span>
        </div>
      </div>
    </div>
  );
}
