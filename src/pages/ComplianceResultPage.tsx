import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/react';
import { ArrowRight, Check, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ComplianceScore } from '../components/common/ComplianceScore';
import { StatusBadge } from '../components/common/StatusBadge';
import { ViolationCard } from '../components/common/ViolationCard';
import { getScanResult } from '../services/api';
import type { ScanResult } from '../services/mockData';

export function ComplianceResultPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState<ScanResult | null>(null);

  const { getToken } = useClerkAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    const resultId = Number(id ?? 1);
    getScanResult(resultId, getTokenRef.current).then(setResult);
  }, [id]);

  if (!result) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-slate-300">Loading results...</div>;
  }

  const totalChecks = result.complianceChecks?.length ?? 0;
  const passedChecks = result.complianceChecks?.filter((check) => check.status === 'PASS').length ?? 0;
  const reviewChecks = result.complianceChecks?.filter((check) => check.status !== 'PASS') ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Compliance Report</div>
          <h1 className="text-4xl font-bold text-white">{result.productName}</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered OCR + compliance analysis
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center gap-5">
            <ComplianceScore score={result.score} size={200} />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{result.score} / 100</div>
              <div className="mt-2"><StatusBadge status={result.status} /></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-lg font-semibold text-white">Summary</div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified
            </div>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-white">{result.score} / 100</span>
            <StatusBadge status={result.status} />
          </div>

          {totalChecks > 0 ? (
            <p className="text-sm leading-7 text-slate-300">
              {passedChecks} of {totalChecks} checks passed automatically.{' '}
              {reviewChecks.length > 0
                ? `${reviewChecks.length} declaration${reviewChecks.length === 1 ? '' : 's'} require${reviewChecks.length === 1 ? 's' : ''} manual review.`
                : 'All checks passed automatically.'}
            </p>
          ) : (
            <p className="text-sm leading-7 text-slate-300">{result.summary}</p>
          )}

          {reviewChecks.length > 0 ? (
            <div className="mt-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Requires Manual Review</div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {reviewChecks.map((check) => (
                  <div key={check.field} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{check.field}</div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                        <span className="text-[10px]">!</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300">{check.message}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Verified Declarations</div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {result.declarations.length > 0 ? result.declarations.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                    <div className={['flex h-6 w-6 items-center justify-center rounded-full', item.passed ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'].join(' ')}>
                      {item.passed ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px]">!</span>}
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">{item.note}</div>
                </div>
              )) : <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">No declaration details were extracted for this result.</div>}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 text-xl font-semibold text-white">Extracted Information</div>
            <div className="space-y-3 text-sm text-slate-300">
              {result.detectedInfo.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-right font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5 text-xl font-semibold text-white">Compliance Breakdown</div>
            <div className="space-y-4">
              {result.complianceBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={[
                        'h-full rounded-full',
                        item.status === 'success' ? 'bg-emerald-400' : item.status === 'warning' ? 'bg-amber-400' : 'bg-red-400',
                      ].join(' ')}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 text-xl font-semibold text-white">Evidence</div>
            <div className="space-y-4">
              {result.imageUrl ? (
                <img src={result.imageUrl} alt={result.productName} className="h-52 w-full rounded-2xl object-cover border border-slate-700" />
              ) : (
                <div className="flex h-52 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 text-sm text-slate-400">
                  No image attached to this report.
                </div>
              )}
              <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">File</div><div className="mt-2 text-white">{result.imageName ?? 'Demo product'}</div></div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Scan quality</div><div className="mt-2 text-white">{result.scanQuality ?? 92}%</div></div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Confidence</div><div className="mt-2 text-white">{result.extractionConfidence ?? 92}%</div></div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-5 text-xl font-semibold text-white">Detected Issues</div>
            <div className="space-y-4">
              {result.issues.length > 0 ? result.issues.map((issue) => (
                <ViolationCard
                  key={issue.title}
                  severity={issue.severity}
                  title={issue.title}
                  explanation={issue.explanation}
                  ruleReference={issue.ruleReference}
                  evidence={issue.evidence}
                />
              )) : <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">No violations detected. The product appears compliant with the tested rule-set.</div>}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-xl font-semibold text-white">All Compliance Checks</div>
              {result.complianceChecks ? (
                <div className="text-xs text-slate-400">{result.complianceChecks.length} checks</div>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {result.complianceChecks && result.complianceChecks.length > 0 ? result.complianceChecks.map((check) => (
                <div key={check.field} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{check.field}</div>
                    <div
                      className={[
                        'flex h-6 w-6 items-center justify-center rounded-full',
                        check.status === 'PASS'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : check.status === 'WARNING'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-red-500/15 text-red-300',
                      ].join(' ')}
                    >
                      {check.status === 'PASS' ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px]">!</span>}
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">{check.message}</div>
                </div>
              )) : <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">Detailed compliance checks are not available for this result.</div>}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => navigate(`/violations/${result.id}`)} icon={<ArrowRight className="h-4 w-4" />}>View Detailed Violations</Button>
        <Button variant="secondary" onClick={() => navigate('/scan')}>Scan Another Product</Button>
        <Button variant="secondary" onClick={() => navigate('/history')}>Back to History</Button>
        <Button variant="ghost" icon={<Download className="h-4 w-4" />} onClick={() => window.print()}>Print Report</Button>
      </div>
    </div>
  );
}
