'use client';

import { useState } from 'react';
import { editTimeEntryAction } from '@/modules/time-tracking/application/actions';

interface EditEntryModalProps {
  entry: {
    id: string;
    companyName: string;
    entry: string;
    lunchStart?: string;
    lunchEnd?: string;
    exit?: string;
    isOvertime100: boolean;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEntryModal({ entry, onClose, onSuccess }: EditEntryModalProps) {
  const [formData, setFormData] = useState({
    entry: entry.entry.split('.')[0].slice(0, 16), // Format for datetime-local: YYYY-MM-DDTHH:mm
    lunchStart: entry.lunchStart ? entry.lunchStart.split('.')[0].slice(0, 16) : '',
    lunchEnd: entry.lunchEnd ? entry.lunchEnd.split('.')[0].slice(0, 16) : '',
    exit: entry.exit ? entry.exit.split('.')[0].slice(0, 16) : '',
    isOvertime100: entry.isOvertime100,
    observation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await editTimeEntryAction(entry.id, {
      entry: new Date(formData.entry),
      lunchStart: formData.lunchStart ? new Date(formData.lunchStart) : null,
      lunchEnd: formData.lunchEnd ? new Date(formData.lunchEnd) : null,
      exit: formData.exit ? new Date(formData.exit) : null,
      isOvertime100: formData.isOvertime100,
      observation: formData.observation || null
    });

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Ocorreu um erro ao salvar');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-lg animate-in zoom-in-95 duration-200 rounded-[2.5rem] bg-[var(--surface)] p-8 shadow-2xl border border-[var(--border)]">
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Ajuste Manual</h2>
          <p className="text-sm text-[var(--text-muted)]">Corrija os horários para a empresa <span className="font-bold text-[var(--color-primary)]">{entry.companyName}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Entrada</label>
              <input 
                type="datetime-local" 
                value={formData.entry}
                onChange={e => setFormData({...formData, entry: e.target.value})}
                required
                className="w-full rounded-2xl bg-[var(--background)] p-4 text-sm font-bold border border-[var(--border)] focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Saída</label>
              <input 
                type="datetime-local" 
                value={formData.exit}
                onChange={e => setFormData({...formData, exit: e.target.value})}
                className="w-full rounded-2xl bg-[var(--background)] p-4 text-sm font-bold border border-[var(--border)] focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Almoço (Início)</label>
              <input 
                type="datetime-local" 
                value={formData.lunchStart}
                onChange={e => setFormData({...formData, lunchStart: e.target.value})}
                className="w-full rounded-2xl bg-[var(--background)] p-4 text-sm font-bold border border-[var(--border)] focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Almoço (Fim)</label>
              <input 
                type="datetime-local" 
                value={formData.lunchEnd}
                onChange={e => setFormData({...formData, lunchEnd: e.target.value})}
                className="w-full rounded-2xl bg-[var(--background)] p-4 text-sm font-bold border border-[var(--border)] focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-[var(--background)] p-4 border border-[var(--border)]">
            <input 
              type="checkbox" 
              id="ot100"
              checked={formData.isOvertime100}
              onChange={e => setFormData({...formData, isOvertime100: e.target.checked})}
              className="h-5 w-5 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <label htmlFor="ot100" className="text-xs font-bold text-[var(--text-primary)]">Marcação com 100% de Extra (Feriado/Domingo)</label>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Observação (Obrigatório para Auditoria)</label>
            <textarea 
              value={formData.observation}
              onChange={e => setFormData({...formData, observation: e.target.value})}
              required
              placeholder="Explique o motivo do ajuste..."
              className="w-full rounded-2xl bg-[var(--background)] p-4 text-sm font-bold border border-[var(--border)] focus:border-[var(--color-primary)] outline-none transition-all min-h-[100px]"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-100 p-4 text-xs font-bold text-red-600 dark:bg-red-950/30">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 rounded-2xl bg-[var(--surface)] p-4 text-sm font-black text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--background)] transition-all"
            >
              CANCELAR
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] rounded-2xl bg-[var(--color-primary)] p-4 text-sm font-black text-white shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'SALVANDO...' : 'SALVAR AJUSTE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
