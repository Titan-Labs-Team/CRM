import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold text-bg-border">404</p>
        <h1 className="text-xl font-semibold text-text-primary">Page not found</h1>
        <p className="text-text-secondary">This page doesn't exist or was moved.</p>
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
