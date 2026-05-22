import { cn } from '@/lib/utils';

interface ChipSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export function ChipSelect({ options, value, onChange, label, error }: ChipSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-xs font-medium text-text-secondary">{label}</span>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(selected ? '' : option.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                selected
                  ? 'bg-accent-green border-accent-green text-bg-darker'
                  : 'bg-bg-surface border-bg-border text-text-secondary hover:border-accent-green hover:text-accent-green',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </div>
  );
}
