'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHistoryAction } from '@/modules/time-tracking/application/actions';
import { EditEntryModal } from './EditEntryModal';

interface HistoryEntry {
  id: string;
  companyName: string;
  entry: string;
  lunchStart?: string;
  lunchEnd?: string;
  exit?: string;
  isOvertime100: boolean;
  source: 'app' | 'manual' | 'offline_sync';
  timezone: string;
  totalEarnings: number;
  regularHours: number;
  overtimeHours: number;
  nightHours: number;
}

export function HistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);
  const currentYear = new Date().getFullYear();

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await getHistoryAction(month, year);
    setEntries(data as HistoryEntry[]);
    setIsLoading(false);
  }, [month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const calculateDuration = (entry: HistoryEntry) => {
    if (!entry.exit) return 'Em aberto';
    const total = entry.regularHours + entry.overtimeHours;
    const h = Math.floor(total);
    const m = Math.round((total - h) * 60);
    return `${h}h ${m}m`;
  };

  const totals = entries.reduce((acc, curr) => ({
    earnings: acc.earnings + curr.totalEarnings,
    hours: acc.hours + curr.regularHours + curr.overtimeHours
  }), { earnings: 0, hours: 0 });

  return (
    <div className="w-full space-y-6">
      {/* Resumo Mensal */}
      {!isLoading && entries.length > 0 && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="rounded-[2rem] bg-[var(--color-primary)] p-6 text-white shadow-xl shadow-[var(--color-primary)]/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Ganhos no Mês</p>
            <p className="text-2xl font-black tabular-nums">{formatCurrency(totals.earnings)}</p>
          </div>
          <div className="rounded-[2rem] bg-[var(--surface)] p-6 border border-[var(--border)] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Horas Totais</p>
            <p className="text-2xl font-black tabular-nums">{Math.floor(totals.hours)}h {Math.round((totals.hours % 1) * 60)}m</p>
          </div>
        </div>
      )}

      {/* Filtros e Exportação */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <select 
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="rounded-xl bg-[var(--surface)] px-3 py-2 text-sm font-bold text-[var(--text-primary)] border border-[var(--border)] outline-none focus:border-[var(--color-primary)] transition-all"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <div className="h-6 w-px bg-[var(--border)] mx-1" />

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
            <button 
              key={m}
              onClick={() => setMonth(m)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all ${month === m ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25' : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}
            </button>
          ))}
        </div>
        
        {!isLoading && entries.length > 0 && (
          <div className="flex items-center gap-2">
            <a 
              href={`/api/relatorios/export?month=${month}&year=${year}&format=pdf`}
              download
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors dark:bg-red-950/30"
              title="Exportar PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h3a2 2 0 0 1 0 4h-3V15z"/><path d="M17 15v4h-2v-4h2z"/></svg>
            </a>
            <a 
              href={`/api/relatorios/export?month=${month}&year=${year}&format=csv`}
              download
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors dark:bg-green-950/30"
              title="Exportar CSV"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
            </a>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
          <p className="text-sm text-[var(--text-muted)] animate-pulse">Carregando jornadas...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--surface)] text-[var(--text-muted)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-[var(--text-primary)]">Nenhum registro</p>
            <p className="text-sm text-[var(--text-muted)]">Você não trabalhou neste mês.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map(entry => (
            <div key={entry.id} className="group relative overflow-hidden rounded-[2.5rem] bg-[var(--surface)] p-8 shadow-sm border border-[var(--border)] hover:shadow-xl hover:shadow-[var(--color-primary)]/5 transition-all duration-500">
              <button 
                onClick={() => setEditingEntry(entry)}
                className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-primary)] transition-all border border-[var(--border)]"
                title="Editar registro"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>

              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">{formatDate(entry.entry)}</span>
                    {entry.isOvertime100 && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[8px] font-black uppercase text-orange-600 dark:bg-orange-950/50">100% EXTRA</span>
                    )}
                    {entry.source === 'manual' && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[8px] font-black uppercase text-blue-600 dark:bg-blue-950/50">MANUAL</span>
                    )}
                  </div>
                  <h3 className="font-bold text-[var(--text-primary)] leading-tight">{entry.companyName}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black tracking-tighter tabular-nums">{calculateDuration(entry)}</p>
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Duração Total</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-xl bg-[var(--background)] p-3 text-center">
                  <p className="text-[8px] font-bold uppercase text-[var(--text-muted)]">Entrada</p>
                  <p className="text-xs font-black">{formatTime(entry.entry)}</p>
                </div>
                <div className="rounded-xl bg-[var(--background)] p-3 text-center">
                  <p className="text-[8px] font-bold uppercase text-[var(--text-muted)]">Almoço</p>
                  <p className="text-xs font-black">
                    {entry.lunchStart ? `${formatTime(entry.lunchStart)} - ${formatTime(entry.lunchEnd)}` : '--:--'}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--background)] p-3 text-center">
                  <p className="text-[8px] font-bold uppercase text-[var(--text-muted)]">Saída</p>
                  <p className="text-xs font-black">{formatTime(entry.exit)}</p>
                </div>
                <div className="rounded-xl bg-[var(--background)] p-3 text-center border-l-2 border-[var(--color-primary)]/20">
                  <p className="text-[8px] font-bold uppercase text-[var(--text-muted)]">Ganhos</p>
                  <p className="text-xs font-black text-[var(--color-primary)]">
                    {formatCurrency(entry.totalEarnings)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingEntry && (
        <EditEntryModal 
          entry={editingEntry} 
          onClose={() => setEditingEntry(null)} 
          onSuccess={() => {
            setEditingEntry(null);
            load();
          }} 
        />
      )}
    </div>
  );
}
