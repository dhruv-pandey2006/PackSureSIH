import { ROLE_OPTIONS, type UserRole } from '../../auth/mockAuth';

type RoleSelectorProps = {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
  compact?: boolean;
};

export function RoleSelector({ selectedRole, onChange, compact = false }: RoleSelectorProps) {
  return (
    <div className={compact ? 'grid gap-2' : 'grid gap-3 sm:grid-cols-3'}>
      {ROLE_OPTIONS.map((option) => {
        const isSelected = option.value === selectedRole;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-2xl border p-3 text-left transition-[border-color,background-color,transform] duration-[var(--transition-normal)] ease-out',
              isSelected
                ? 'border-cyan-500/40 bg-cyan-500/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.15)]'
                : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:-translate-y-0.5 hover:border-cyan-500/40',
            ].join(' ')}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            <div className="mt-1 text-xs leading-5 text-slate-400">{option.description}</div>
          </button>
        );
      })}
    </div>
  );
}
