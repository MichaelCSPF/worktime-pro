'use client';

import { useState, useActionState } from 'react';
import { createCompanyAction, type CompanyActionResult } from '@/modules/company/application/actions';

const initialState: CompanyActionResult = { success: false };

export function CreateCompanyModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const [state, formAction, isPending] = useActionState(
    async (_prevState: CompanyActionResult, formData: FormData) => {
      const result = await createCompanyAction(formData);
      if (result.success) setIsOpen(false);
      return result;
    },
    initialState,
  );

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/25 hover:scale-105 active:scale-95 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="my-8 w-full max-w-lg rounded-[2.5rem] bg-[var(--background)] p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Nova Empresa</h2>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-[var(--surface)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {state.error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="comp-name" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Nome da Empresa</label>
              <input id="comp-name" name="name" type="text" required placeholder="Ex: Padaria do Zé" disabled={isPending}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="comp-address" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Endereço (Opcional)</label>
              <input id="comp-address" name="address" type="text" placeholder="Rua das Flores, 123" disabled={isPending}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="comp-rate" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Valor/Hora (R$)</label>
                <input id="comp-rate" name="hourlyRate" type="number" step="0.01" required placeholder="0.00" disabled={isPending}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="comp-jornada" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Jornada (min)</label>
                <input id="comp-jornada" name="dailyWorkMinutes" type="number" required placeholder="480 (8h)" disabled={isPending}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="comp-almoco" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Almoço (min)</label>
              <input id="comp-almoco" name="lunchMinutes" type="number" required placeholder="60 (1h)" disabled={isPending}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all" />
            </div>
          </div>

          <button type="submit" disabled={isPending}
            className="mt-4 w-full rounded-2xl bg-[var(--color-primary)] py-4 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary)]/25 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] transition-all disabled:opacity-50">
            {isPending ? 'Salvando...' : 'Criar Empresa'}
          </button>
        </form>
      </div>
    </div>
  );
}
