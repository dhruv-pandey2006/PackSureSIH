import { Mail, LockKeyhole, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type UserRole } from '../../auth/mockAuth';
import { Button } from '../common/Button';
import { RoleSelector } from './RoleSelector';

type SignupFormProps = {
  onSubmit: (name: string, email: string, password: string, role: UserRole, company: string) => Promise<void> | void;
  error?: string;
  loading?: boolean;
  defaultRole?: UserRole;
};

export function SignupForm({ onSubmit, error, loading = false, defaultRole = 'manufacturer' }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(name, email, password, role, company);
      }}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Full name</label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-slate-200 focus-within:border-cyan-500/40">
          <UserRound className="h-4 w-4 text-slate-400" />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Aarav Sharma"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Work email</label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-slate-200 focus-within:border-cyan-500/40">
          <Mail className="h-4 w-4 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Company</label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-slate-200 focus-within:border-cyan-500/40">
          <UserRound className="h-4 w-4 text-slate-400" />
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Apex Foods Pvt. Ltd."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Role</label>
        <RoleSelector selectedRole={role} onChange={setRole} compact />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Password</label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-slate-200 focus-within:border-cyan-500/40">
          <LockKeyhole className="h-4 w-4 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Creating account...' : 'Create account'}
      </Button>

      <div className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-cyan-300 transition-colors duration-[var(--transition-fast)] ease-out hover:text-cyan-200">
          Sign in
        </Link>
      </div>
    </form>
  );
}
