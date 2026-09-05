import { LoaderCircle } from 'lucide-react';

type LoadingStateProps = {
  title?: string;
  subtitle?: string;
};

export function LoadingState({ title = 'Loading...', subtitle = 'Please wait a moment.' }: LoadingStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
      <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-cyan-300" />
      <div className="text-xl font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm text-slate-400">{subtitle}</div>
    </div>
  );
}
