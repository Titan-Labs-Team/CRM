import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Selecione...',
  error,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      {label && (
        <span className="text-xs font-medium text-text-secondary">{label}</span>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all duration-150',
            'bg-bg-surface',
            open
              ? 'border-accent-green ring-1 ring-accent-green'
              : 'border-bg-border hover:border-text-muted',
            error && 'border-status-lost ring-1 ring-status-lost',
          )}
        >
          <span className={selected ? 'text-text-primary' : 'text-text-muted'}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            size={15}
            className={cn(
              'text-text-secondary transition-transform duration-200 shrink-0',
              open && 'rotate-180',
            )}
          />
        </button>

        {open && (
          <ul className="absolute z-50 mt-1.5 w-full bg-bg-surface border border-bg-border rounded-xl overflow-y-auto shadow-xl max-h-48 scrollbar-surface">
            <li
              onClick={() => { onChange(''); setOpen(false); }}
              className="px-4 py-2.5 text-sm text-text-muted cursor-pointer hover:bg-bg-border transition-colors"
            >
              {placeholder}
            </li>

            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <li
                  key={option.value}
                  onClick={() => { onChange(option.value); setOpen(false); }}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-accent-green/10 text-accent-green font-medium'
                      : 'text-text-primary hover:bg-bg-border',
                  )}
                >
                  {option.label}
                  {isSelected && <Check size={14} className="shrink-0" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="text-xs text-status-lost">{error}</p>}
    </div>
  );
}
