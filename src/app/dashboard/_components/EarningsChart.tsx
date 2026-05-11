'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WeeklyEarning } from '@/modules/payroll/application/AnalyticsDTO';

interface EarningsChartProps {
  data: WeeklyEarning[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis 
            dataKey="week" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 'bold' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 'bold' }} 
          />
          <Tooltip 
            cursor={{ fill: 'var(--surface-secondary)', radius: 12 }}
            contentStyle={{ 
              backgroundColor: 'var(--surface-elevated)', 
              borderRadius: '16px', 
              border: '1px solid var(--border)',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontWeight: 'bold'
            }}
          />
          <Bar 
            dataKey="earnings" 
            radius={[10, 10, 10, 10]} 
            barSize={40}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === data.length - 1 ? 'var(--color-primary)' : 'var(--color-primary-muted, #93c5fd)'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
