import { useAuthStore } from '@/store/authStore';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Welcome back, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Here's what's happening in your workspace today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Deals', value: '—', delta: null },
          { label: 'Won (MTD)', value: '—', delta: null },
          { label: 'Conversion Rate', value: '—', delta: null },
          { label: 'Avg. Cycle (days)', value: '—', delta: null },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 space-y-1">
            <p className="text-xs text-text-secondary">{label}</p>
            <p className="text-2xl font-semibold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-sm font-medium text-text-secondary mb-4">Revenue over time</p>
          <div className="h-40 flex items-center justify-center text-text-muted text-sm">
            Chart coming in M4
          </div>
        </div>
        <div className="card p-4">
          <p className="text-sm font-medium text-text-secondary mb-4">Pipeline funnel</p>
          <div className="h-40 flex items-center justify-center text-text-muted text-sm">
            Chart coming in M4
          </div>
        </div>
      </div>
    </div>
  );
}
