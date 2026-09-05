import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';

type ForgotPasswordFormProps = {
  onSubmit: (email: string) => Promise<void> | void;
  message?: string;
  error?: string;
};

export function ForgotPasswordForm({ onSubmit, message, error }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(email);
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

      {message ? <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-200">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      <Button type="submit" variant="primary" fullWidth>
        Send reset link
      </Button>

      <div className="text-center text-sm text-slate-400">
        <Link to="/login" className="font-medium text-cyan-300 transition-colors duration-[var(--transition-fast)] ease-out hover:text-cyan-200">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
