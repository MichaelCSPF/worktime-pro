'use client';

import { useActionState } from 'react';
import { loginAction, type AuthActionResult } from '@/modules/auth/application/actions';
import Link from 'next/link';

const initialState: AuthActionResult = { success: false };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: AuthActionResult, formData: FormData) => {
      return await loginAction(formData);
    },
    initialState,
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[var(--color-primary)] opacity-[0.03] blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-500 opacity-[0.03] blur-3xl animate-pulse" />

      <div className="w-full max-w-[440px] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Header Elite */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[var(--color-primary)] to-indigo-600 shadow-2xl shadow-indigo-500/30 ring-8 ring-indigo-500/5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter text-[var(--text-primary)]">WorkTime PRO</h1>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-[0.2em]">Sua jornada, sob seu controle absoluto.</p>
              <p className="text-xs font-medium text-[var(--text-muted)] max-w-[280px] mx-auto leading-relaxed">
                Transforme cada minuto trabalhado em clareza financeira e liberdade de tempo.
              </p>
            </div>
          </div>
        </div>

        {/* Card de Login Glassmorphism */}
        <div className="rounded-[3rem] bg-[var(--surface)] p-10 border border-[var(--border)] shadow-2xl shadow-black/[0.03] backdrop-blur-sm relative">
          {state.error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 animate-in shake duration-500">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">E-mail Corporativo</label>
              <input
                name="email"
                type="email"
                required
                placeholder="exemplo@worktime.pro"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-6 py-4 font-bold text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Senha Segura</label>
                <Link href="/recuperar-senha" className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest hover:underline">Esqueceu?</Link>
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-6 py-4 font-bold text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/5"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full h-14 overflow-hidden rounded-2xl bg-[var(--color-primary)] font-black text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {isPending ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center">
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Novo por aqui?{' '}
              <Link href="/cadastro" className="font-black text-[var(--color-primary)] hover:underline">
                CRIAR CONTA AGORA
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Minimalista */}
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-30">
          WorkTime PRO — Enterprise Edition
        </p>
      </div>
    </main>
  );
}
