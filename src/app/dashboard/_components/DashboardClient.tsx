'use client';

import { AnalyticsDTO } from '@/modules/payroll/application/AnalyticsDTO';


import { EarningsChart } from './EarningsChart';
import { HoursDistributionChart } from './HoursDistributionChart';
import { TrendingUp, Clock, DollarSign, Calendar } from 'lucide-react';

interface DashboardClientProps {
  initialData: AnalyticsDTO;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ganhos */}
        <div className="rounded-[2.5rem] bg-[var(--color-primary)] p-8 text-white shadow-xl shadow-[var(--color-primary)]/20 relative overflow-hidden group">
          <DollarSign className="absolute -right-4 -top-4 h-24 w-24 opacity-10 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total no Mês</p>
          <p className="text-3xl font-black tabular-nums">{formatCurrency(initialData.totalEarnings)}</p>
        </div>

        {/* Projeção */}
        <div className="rounded-[2.5rem] bg-[var(--surface)] p-8 border border-[var(--border)] shadow-sm relative overflow-hidden group">
          <TrendingUp className="absolute -right-4 -top-4 h-24 w-24 opacity-5 text-green-500 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Projeção Final</p>
          <p className="text-3xl font-black tabular-nums text-green-600 dark:text-green-400">{formatCurrency(initialData.projectedEarnings)}</p>
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[10px] font-bold text-green-500 bg-green-100 dark:bg-green-950/30 px-2 py-0.5 rounded-full">Baseado na média atual</span>
          </div>
        </div>

        {/* Total Horas */}
        <div className="rounded-[2.5rem] bg-[var(--surface)] p-8 border border-[var(--border)] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Horas Líquidas</p>
          <p className="text-3xl font-black tabular-nums text-[var(--text-primary)]">
            {Math.floor(initialData.totalHours)}h {Math.round((initialData.totalHours % 1) * 60)}m
          </p>
        </div>

        {/* Média Entrada */}
        <div className="rounded-[2.5rem] bg-[var(--surface)] p-8 border border-[var(--border)] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Entrada Média</p>
          <p className="text-3xl font-black tabular-nums text-[var(--text-primary)]">{initialData.averageEntryTime}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evolução Semanal */}
        <div className="rounded-[2.5rem] bg-[var(--surface)] p-8 border border-[var(--border)] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[var(--text-primary)]">Evolução Semanal</h3>
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-950/30">
              <Calendar size={18} />
            </div>
          </div>
          <EarningsChart data={initialData.weeklyEarnings} />
        </div>

        {/* Composição de Horas */}
        <div className="rounded-[2.5rem] bg-[var(--surface)] p-8 border border-[var(--border)] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[var(--text-primary)]">Composição de Horas</h3>
            <div className="h-8 w-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center dark:bg-orange-950/30">
              <Clock size={18} />
            </div>
          </div>
          <HoursDistributionChart data={initialData.hourDistribution} />
        </div>
      </div>
    </div>
  );
}
