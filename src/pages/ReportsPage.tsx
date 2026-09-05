import { ArrowRight, FileText, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';

const reports = [
  { id: 'REP-1042', title: 'Apex Protein Crunch', status: 'Compliant', date: '03 Sep 2026' },
  { id: 'REP-1039', title: 'Harbor Rice 5kg', status: 'Non-Compliant', date: '31 Aug 2026' },
  { id: 'REP-1031', title: 'GreenLeaf Tea', status: 'Needs Review', date: '27 Aug 2026' },
];

export function ReportsPage() {
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

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
                  {report.status === 'Non-Compliant' ? <ShieldAlert className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{report.title}</div>
                  <div className="text-sm text-slate-400">{report.id} • {report.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={report.status} />
                <Button variant="secondary">Open</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
