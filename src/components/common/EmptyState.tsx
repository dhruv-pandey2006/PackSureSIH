import { Inbox } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
        <Inbox className="h-6 w-6" />
      </div>
      <div className="text-xl font-semibold text-white">{title}</div>
      <div className="mt-2 max-w-md text-sm text-slate-400">{description}</div>
    </div>
  );
}
