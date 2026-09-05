import { ArrowRight, CheckCircle2, FileSearch, ShieldAlert, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLE_NAV_ITEMS, ROLE_LABELS, getDisplayName } from '../auth/mockAuth';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';

const recentActivity = [
  { label: 'Apex Protein Crunch', status: 'Compliant', time: '2 hours ago' },
  { label: 'Harbor Rice 5kg', status: 'Non-Compliant', time: 'Yesterday' },
  { label: 'GreenLeaf Tea', status: 'Needs Review', time: '2 days ago' },
  { label: 'Nexa Dairy Milk', status: 'Compliant', time: '3 days ago' },
];

export function DashboardPage() {
  const { session } = useAuth();
  const role = session.role ?? 'manufacturer';
  const displayName = getDisplayName(session.user);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300">Dashboard</div>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">Welcome back, {displayName}.</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
          {ROLE_LABELS[role]}
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard className="min-h-[148px]" label="Products scanned" value="248" accent="cyan" icon={<FileSearch className="h-4 w-4" />} />
        <MetricCard className="min-h-[148px]" label="Compliant" value="186" accent="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
        <MetricCard className="min-h-[148px]" label="Violations" value="21" accent="red" icon={<ShieldAlert className="h-4 w-4" />} />
        <MetricCard className="min-h-[148px]" label="Reports" value="36" accent="amber" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="h-full p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Compliance overview</div>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white">Operational summary</h2>
            </div>
            <Link to="/scan">
              <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />}>Scan a Product</Button>
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-4 text-sm text-slate-300">
                <span>Compliance pass rate</span>
                <span className="font-semibold text-white">86%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Flagged</div>
                <div className="mt-3 text-2xl font-bold text-white">21</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Reviewed</div>
                <div className="mt-3 text-2xl font-bold text-white">14</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Approvals</div>
                <div className="mt-3 text-2xl font-bold text-white">186</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="h-full p-5">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Role access</div>
          <div className="space-y-2.5">
            {ROLE_NAV_ITEMS[role].map((item) => (
              <div key={item} className="rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Recent activity</div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/70 px-3 py-3">
                <div>
                  <div className="font-medium text-white">{activity.label}</div>
                  <div className="text-xs text-slate-400">{activity.time}</div>
                </div>
                <StatusBadge status={activity.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">Quick actions</div>
          <div className="space-y-3">
            <Link to="/scan">
              <Button variant="primary" fullWidth icon={<ArrowRight className="h-4 w-4" />}>Scan a Product</Button>
            </Link>
            <Link to="/reports">
              <Button variant="secondary" fullWidth>Open Reports</Button>
            </Link>
            <Link to="/profile">
              <Button variant="secondary" fullWidth>View Profile</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
