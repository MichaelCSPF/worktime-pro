'use client';

import { useState, useEffect, useTransition } from 'react';
import { clockInAction, clockOutAction } from '@/modules/time-tracking/application/actions';

interface ClockInterfaceProps {
  initialStatus: {
    id: string;
    userCompanyId: string;
    entry: string;
    lunchStart?: string;
    lunchEnd?: string;
    exit?: string;
    isOvertime100: boolean;
    source: string;
  } | null;
  companies: Array<{ id: string; name: string }>;
}

export function ClockInterface({ initialStatus, companies }: ClockInterfaceProps) {
  const status = initialStatus;

  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || '');
  const [isPending, startTransition] = useTransition();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isOvertime100, setIsOvertime100] = useState(initialStatus?.isOvertime100 || false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualTime, setManualTime] = useState('');

  // Timer para o relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

  const getGPS = (): Promise<{ lat: number; lng: number; acc: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy
        }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleClockIn = () => {
    if (!selectedCompanyId) {
      setError('Selecione uma empresa');
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const coords = await getGPS().catch(() => undefined);
        const result = await clockInAction(
          selectedCompanyId, 
          coords, 
          isOvertime100, 
          getTimezone()
        );
        if (!result.success) setError(result.error || 'Erro ao registrar entrada');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    });
  };

  const handleClockOut = () => {
    startTransition(async () => {
      try {
        setError(null);
        const coords = !isManualMode ? await getGPS().catch(() => undefined) : undefined;
        
        // Se manual, precisamos de uma Date válida
        let exitTime: Date | undefined = undefined;
        if (isManualMode && manualTime) {
          const [h, m] = manualTime.split(':');
          exitTime = new Date();
          exitTime.setHours(parseInt(h), parseInt(m), 0, 0);
        }

        const result = await clockOutAction(coords, isOvertime100);
        if (!result.success) setError(result.error || 'Erro ao registrar saída');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const calculateDuration = (startStr: string) => {
    const start = new Date(startStr);
    const diff = currentTime.getTime() - start.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Relógio Digital */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Horário Atual</p>
        <p className="text-6xl font-black tracking-tighter tabular-nums">{formatTime(currentTime)}</p>
        <p className="text-sm text-[var(--text-secondary)]">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {error && (
        <div className="w-full rounded-2xl bg-red-50 p-4 text-center text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50 animate-in fade-in zoom-in duration-300">
          {error}
        </div>
      )}

      {/* Interface Central */}
      <div className="w-full rounded-[2.5rem] bg-[var(--surface)] p-8 shadow-2xl shadow-black/5 border border-[var(--border)]">
        
        {/* Toggle 100% Extra */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-[var(--background)] p-4 border border-[var(--border)]">
          <div className="space-y-0.5">
            <p className="text-sm font-bold">Hora Extra 100%</p>
            <p className="text-[10px] text-[var(--text-muted)]">Feriados ou domingos</p>
          </div>
          <button 
            onClick={() => setIsOvertime100(!isOvertime100)}
            className={`h-6 w-12 rounded-full transition-colors relative ${isOvertime100 ? 'bg-[var(--color-primary)]' : 'bg-[var(--border)]'}`}
          >
            <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${isOvertime100 ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {!status ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Selecionar Empresa</label>
              <select 
                value={selectedCompanyId} 
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                disabled={isPending}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Escolha a empresa...</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleClockIn} 
              disabled={isPending || companies.length === 0}
              className="group relative w-full overflow-hidden rounded-3xl bg-[var(--color-primary)] py-8 text-white shadow-2xl shadow-[var(--color-primary)]/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </div>
                <span className="text-xl font-black uppercase tracking-wider">Registrar Entrada</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase mb-1">
                <span className={status.source === 'manual' ? 'text-orange-500' : 'text-green-600'}>
                  {status.source === 'manual' ? 'Edição Manual' : 'ORIGEM: Geolocalização'}
                </span>
              </div>
              <p className="text-4xl font-black tracking-tight tabular-nums text-[var(--color-primary)]">
                {calculateDuration(status.entry)}
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[var(--background)] p-4 text-center border border-[var(--border)]">
                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Entrada</p>
                <p className="font-bold">{new Date(status.entry).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button 
                onClick={() => setIsManualMode(!isManualMode)}
                className={`rounded-2xl p-4 text-center border transition-all ${isManualMode ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-[var(--background)] border-[var(--border)]'}`}
              >
                <p className="text-[10px] font-bold uppercase">{isManualMode ? 'Modo Manual' : 'Ajuste Manual'}</p>
                <p className="text-xs font-bold">{isManualMode ? 'Clique p/ Automático' : 'Esqueceu de bater?'}</p>
              </button>
            </div>

            {isManualMode && (
              <div className="w-full space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Horário de Saída</label>
                <input 
                  type="time" 
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            )}

            <button 
              onClick={handleClockOut} 
              disabled={isPending || (isManualMode && !manualTime)}
              className={`group relative w-full overflow-hidden rounded-3xl py-8 text-white shadow-2xl transition-all disabled:opacity-50 ${isManualMode ? 'bg-orange-500 shadow-orange-500/40' : 'bg-red-500 shadow-red-500/40'}`}
            >
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                </div>
                <span className="text-xl font-black uppercase tracking-wider">
                  {isManualMode ? 'Confirmar Edição' : 'Registrar Saída'}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        Sua geolocalização está sendo capturada para auditoria.
      </div>
    </div>
  );
}
