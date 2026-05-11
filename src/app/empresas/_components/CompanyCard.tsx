'use client';

import { deleteCompanyAction } from '@/modules/company/application/actions';
import { useTransition } from 'react';

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    address: string | null;
    active: boolean;
    config: {
      hourlyRate: number;
      dailyWorkMinutes: number;
      lunchMinutes: number;
    };
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Deseja realmente excluir a empresa ${company.name}?`)) {
      startTransition(async () => {
        await deleteCompanyAction(company.id);
      });
    }
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:shadow-lg ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-lg">{company.name}</h3>
          {company.address && (
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {company.address}
            </p>
          )}
        </div>
        <button onClick={handleDelete} disabled={isPending} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Salário/Hora</p>
          <p className="text-sm font-semibold">R$ {company.config.hourlyRate.toFixed(2)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Jornada</p>
          <p className="text-sm font-semibold">{formatTime(company.config.dailyWorkMinutes)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Almoço</p>
          <p className="text-sm font-semibold">{formatTime(company.config.lunchMinutes)}</p>
        </div>
      </div>

      {/* Decorative gradient side */}
      <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-[var(--color-primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
