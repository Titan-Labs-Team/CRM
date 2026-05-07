interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <div className="card p-5 space-y-1">
      <p className="text-xs text-text-secondary uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}
