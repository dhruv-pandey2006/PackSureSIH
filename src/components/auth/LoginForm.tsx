import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void> | void;
  error?: string;
  loading?: boolean;
};

export function LoginForm({ onSubmit, error, loading = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(email, password);
      }}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</label>
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
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Password</label>
          <Link to="/login?mode=forgot" className="text-xs text-cyan-300 transition-colors duration-[var(--transition-fast)] ease-out hover:text-cyan-200">
            Forgot password?
          </Link>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-3 text-slate-200 focus-within:border-cyan-500/40">
          <LockKeyhole className="h-4 w-4 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 transition-colors duration-[var(--transition-fast)] ease-out hover:text-slate-200">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-cyan-300 transition-colors duration-[var(--transition-fast)] ease-out hover:text-cyan-200">
          Create one
        </Link>
      </div>
    </form>
  );
}
