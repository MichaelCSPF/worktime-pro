'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { HourDistribution } from '@/modules/payroll/application/AnalyticsDTO';

interface HoursDistributionChartProps {
  data: HourDistribution[];
}

export function HoursDistributionChart({ data }: HoursDistributionChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={8}
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--surface-elevated)', 
              borderRadius: '16px', 
              border: '1px solid var(--border)',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontWeight: 'bold'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs font-bold text-[var(--text-muted)]">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
