import { ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAuth } from '../auth/AuthContext';

export function SettingsPage() {
  const { session, setRole } = useAuth();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Settings</div>
        <h1 className="mt-2 text-4xl font-bold text-white">Account preferences</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Security</div>
              <div className="text-sm text-slate-400">Manage your access profile.</div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">Two-factor authentication status: Not enabled.</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">Session expiry: 30 days.</div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">Workspace: {session.user?.company ?? 'PackSure Demo Workspace'}</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Role</div>
          <div className="space-y-3">
            {['manufacturer', 'importer', 'compliance_officer'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRole(role as 'manufacturer' | 'importer' | 'compliance_officer')}
                className={[
                  'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition-[border-color,background-color,transform] duration-[var(--transition-normal)] ease-out',
                  session.role === role
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-white'
                    : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:-translate-y-0.5 hover:border-cyan-500/40',
                ].join(' ')}
              >
                <span>{role.replace('_', ' ')}</span>
                <span>{session.role === role ? 'Active' : 'Use'}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary">Save changes</Button>
        <Button variant="secondary">Reset preferences</Button>
      </div>
    </div>
  );
}
