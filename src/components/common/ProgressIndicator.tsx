type ProgressIndicatorProps = {
  items: Array<{ label: string; done: boolean; active?: boolean }>; 
};

export function ProgressIndicator({ items }: ProgressIndicatorProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-sm">
          <div
            className={[
              'flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold',
              item.done ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200' : item.active ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-slate-700 bg-slate-800 text-slate-400',
            ].join(' ')}
          >
            {item.done ? '✓' : item.active ? '→' : '○'}
          </div>
          <span className={item.done || item.active ? 'text-slate-100' : 'text-slate-400'}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
