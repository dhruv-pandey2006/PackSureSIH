import { useEffect, useState } from 'react';
import { ArrowRight, FileText, ShieldAlert } from 'lucide-react';
import { useAuth as useClerkAuth } from '@clerk/react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { getReportHistory } from '../services/api';
import type { ScanHistoryItem } from '../services/mockData';

export function ReportsPage() {
  const navigate = useNavigate();
  const { getToken } = useClerkAuth();
  const [reports, setReports] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setErrorMessage(null);

    getReportHistory(getToken)
      .then((items) => {
        if (active) setReports(items);
      })
      .catch((error: unknown) => {
        if (active) {
          setReports([]);
          setErrorMessage(error instanceof Error ? error.message : 'Reports could not be loaded.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getToken]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Reports</div>
          <h1 className="mt-2 text-4xl font-bold text-white">Compliance reports</h1>
        </div>
        <Link to="/scan">
          <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>Scan a Product</Button>
        </Link>
      </div>

      {loading ? <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-400">Loading reports...</div> : null}

      {!loading && errorMessage ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">{errorMessage}</div>
      ) : null}

      {!loading && !errorMessage && reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
          <div className="text-lg font-semibold text-white">No reports yet</div>
          <div className="mt-2 text-sm text-slate-400">Scan a product to generate your first compliance report.</div>
        </div>
      ) : null}

      {!loading && !errorMessage && reports.length > 0 ? <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
                  {report.status === 'Non-Compliant' ? <ShieldAlert className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{report.product}</div>
                  <div className="text-sm text-slate-400">Scan #{report.id} • {report.date} • Score {report.score}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={report.status} />
                <Button variant="secondary" onClick={() => navigate(`/report/${report.id}`)}>Open</Button>
              </div>
            </div>
          </Card>
        ))}
      </div> : null}
    </div>
  );
}
