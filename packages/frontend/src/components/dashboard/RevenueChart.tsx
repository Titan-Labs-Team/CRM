import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RevenuePoint } from '@/services/reports.service';

interface RevenueChartProps {
  data: RevenuePoint[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
  }).format(value);
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data.length) {
    return (
      <div className="h-44 flex items-center justify-center text-text-muted text-sm">
        Nenhum dado de receita ainda
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.period), 'MMM/yy', { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={176}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#72d296" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#72d296" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
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
          formatter={(v: number) => [formatCurrency(v), 'Receita']}
          cursor={{ stroke: '#72d296', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Area
          type="monotone"
          dataKey="totalValue"
          stroke="#72d296"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#72d296' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
