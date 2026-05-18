import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center p-6">
        <div className="p-4 rounded-full bg-status-lost/10">
          <AlertTriangle size={28} className="text-status-lost" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-1">Algo deu errado</h3>
          <p className="text-sm text-text-muted max-w-sm">
            {this.state.error?.message ?? 'Ocorreu um erro inesperado nesta página.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            this.setState({ hasError: false, error: undefined });
            window.location.reload();
          }}
        >
          <RefreshCw size={13} className="mr-1.5" />
          Recarregar
        </Button>
      </div>
    );
  }
}
