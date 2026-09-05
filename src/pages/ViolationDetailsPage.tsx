import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { getScanResult } from '../services/api';
import type { ScanResult } from '../services/mockData';

export function ViolationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    getScanResult(Number(id ?? 1)).then(setResult);
  }, [id]);

  if (!result) return <div className="mx-auto max-w-7xl px-4 py-12 text-slate-300">Loading violation details...</div>;

  const primaryIssue = result.issues[0] ?? {
    title: 'No blocking issues detected',
    severity: 'Low' as const,
    explanation: 'This product has no major violations in the current demo ruleset.',
    ruleReference: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    evidence: 'Current report indicates the declaration set is sufficiently populated.',
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)} className="mb-6 pl-0">
        Back to Compliance Report
      </Button>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative h-[420px] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(135deg,#0f172a,#020617)] p-5">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(148,163,184,0.06)_50%,transparent_100%)]" />
            <div className="absolute left-8 top-8 h-24 w-24 rounded-2xl border-2 border-red-400/70 bg-red-500/10 shadow-[0_0_35px_rgba(248,113,113,0.12)]" />
            <div className="absolute bottom-12 right-16 h-20 w-32 rounded-xl border-2 border-amber-400/70 bg-amber-500/10 shadow-[0_0_35px_rgba(251,191,36,0.12)]" />
            <div className="absolute left-12 top-28 h-40 w-52 rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-2xl">
              <div className="mb-3 text-lg font-bold text-white">{result.productName}</div>
              <div className="space-y-2 text-xs text-slate-300">
                <div>{result.productMeta.netQuantity}</div>
                <div>{result.productMeta.mrp}</div>
                <div>Consumer care: {result.productMeta.consumerCare}</div>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Violation details</div>
              <h2 className="mt-2 text-2xl font-bold text-white">{primaryIssue.title}</h2>
            </div>
            <StatusBadge status={result.status} />
          </div>

          <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Severity</div>
              <div className="mt-2 font-semibold text-red-300">{primaryIssue.severity}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</div>
              <div className="mt-2 font-semibold text-amber-300">{result.status}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-white"><AlertTriangle className="h-4 w-4 text-amber-300" /> Explanation</div>
              <p className="leading-7 text-slate-300">{primaryIssue.explanation}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-2 text-white">Rule Reference</div>
              <p className="text-slate-300">{primaryIssue.ruleReference}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-2 text-white">Evidence</div>
              <p className="text-slate-300">{primaryIssue.evidence}</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-200"><CheckCircle2 className="h-4 w-4" /> Recommended Action</div>
              <p className="leading-7 text-emerald-100">Re-check the declared address and ensure the required packaging/label text is fully visible, legible, and consistent with the packaging frame before final approval.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 text-xl font-semibold text-white">All detected issues</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.issues.map((issue) => (
            <Card key={issue.title} className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold text-white">{issue.title}</div>
                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200">{issue.severity}</span>
              </div>
              <p className="text-sm leading-6 text-slate-300">{issue.explanation}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
