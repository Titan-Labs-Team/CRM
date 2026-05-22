import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, label, error, id, placeholder, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full appearance-none bg-bg-surface border border-bg-border rounded-xl px-4 py-2.5 pr-9',
              'text-sm text-text-primary cursor-pointer',
              'focus:outline-none focus:ring-1 focus:ring-accent-green focus:border-accent-green',
              'transition-colors duration-150',
              !props.value && 'text-text-muted',
              error && 'border-status-lost focus:ring-status-lost focus:border-status-lost',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
        </div>
        {error && <p className="text-xs text-status-lost">{error}</p>}
      </div>
    );
  },
);
SelectField.displayName = 'SelectField';
