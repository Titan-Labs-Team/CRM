import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { FunnelStage } from '@/services/reports.service';

interface FunnelChartProps {
  data: FunnelStage[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (!data.length) {
    return (
      <div className="h-44 flex items-center justify-center text-text-muted text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={176}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: 6,
            fontSize: 12,
          }}
          labelStyle={{ color: '#ffffff' }}
          formatter={(v: number) => [v, 'Negócios']}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="deal_count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.stage_id} fill={entry.color || '#72d296'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
