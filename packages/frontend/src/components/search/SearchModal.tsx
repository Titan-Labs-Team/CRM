import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Briefcase, Zap, Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import type { SearchResult } from '@/services/search.service';

const TYPE_ICON: Record<string, LucideIcon> = {
  contact: Users,
  deal: Briefcase,
  activity: Zap,
};

const TYPE_LABEL: Record<string, string> = {
  contact: 'Contatos',
  deal: 'Negócios',
  activity: 'Atividades',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: Props) {
  const { query, setQuery, results, isFetching } = useSearch();
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, setQuery]);

  useEffect(() => {
    setActiveIdx(0);
  }, [results]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  const flat = results;

  const goTo = useCallback(
    (result: SearchResult) => {
      navigate(result.url);
      onClose();
    },
    [navigate, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flat[activeIdx]) {
      goTo(flat[activeIdx]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-bg-surface border border-bg-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-bg-border">
          {isFetching ? (
            <Loader2 size={16} className="text-text-muted animate-spin flex-shrink-0" />
          ) : (
            <Search size={16} className="text-text-muted flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar contatos, negócios, atividades..."
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted text-sm outline-none"
          />
          <kbd className="text-[10px] text-text-muted border border-bg-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {query.length >= 2 && results.length === 0 && !isFetching && (
            <p className="px-4 py-8 text-sm text-text-muted text-center">Nenhum resultado encontrado.</p>
          )}

          {query.length < 2 && (
            <p className="px-4 py-8 text-sm text-text-muted text-center">
              Digite ao menos 2 caracteres para buscar.
            </p>
          )}

          {Object.entries(grouped).map(([type, items]) => {
            const Icon = TYPE_ICON[type] ?? Search;
            return (
              <div key={type} className="mb-1">
                <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  {TYPE_LABEL[type] ?? type}
                </p>
                {items.map((item) => {
                  const globalIdx = flat.findIndex((r) => r.id === item.id && r.type === item.type);
                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        globalIdx === activeIdx
                          ? 'bg-accent-green/10 text-accent-green'
                          : 'text-text-secondary hover:bg-bg-border hover:text-text-primary',
                      )}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      onClick={() => goTo(item)}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">{item.title}</span>
                        {item.subtitle && (
                          <span className="text-[11px] text-text-muted truncate">{item.subtitle}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="border-t border-bg-border px-4 py-2 flex items-center gap-4 text-[10px] text-text-muted">
          <span><kbd className="border border-bg-border rounded px-1">↑↓</kbd> navegar</span>
          <span><kbd className="border border-bg-border rounded px-1">↵</kbd> abrir</span>
          <span><kbd className="border border-bg-border rounded px-1">ESC</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
