import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'input-base',
            error && 'border-status-lost focus:ring-status-lost focus:border-status-lost',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-status-lost">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
