'use client';

import { useActionState, useState } from 'react';
import { registerAction, type AuthActionResult } from '@/modules/auth/application/actions';
import Link from 'next/link';

const initialState: AuthActionResult = { success: false };

export default function CadastroPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prevState: AuthActionResult, formData: FormData) => {
      const result = await registerAction(formData);
      if (result.success) setShowSuccess(true);
      return result;
    },
    initialState,
  );

  if (showSuccess) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Conta criada!</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Verifique seu email para confirmar a conta. Depois, faça login.
          </p>
          <Link href="/login" className="inline-block rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)]" id="go-to-login">
            Ir para Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] shadow-lg shadow-[var(--color-primary)]/25">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
          <p className="text-sm text-[var(--text-muted)]">Comece a controlar sua jornada</p>
        </div>

        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400" role="alert" id="register-error">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="register-nome" className="block text-sm font-medium">Nome completo</label>
            <input id="register-nome" name="nome" type="text" required autoComplete="name" placeholder="Seu nome" disabled={isPending}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-email" className="block text-sm font-medium">Email</label>
            <input id="register-email" name="email" type="email" required autoComplete="email" placeholder="seu@email.com" disabled={isPending}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="block text-sm font-medium">Senha</label>
            <input id="register-password" name="password" type="password" required autoComplete="new-password" placeholder="Mínimo 6 caracteres" disabled={isPending}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-confirm" className="block text-sm font-medium">Confirmar senha</label>
            <input id="register-confirm" name="confirmPassword" type="password" required autoComplete="new-password" placeholder="Repita a senha" disabled={isPending}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50" />
          </div>

          <button type="submit" disabled={isPending} id="register-submit"
            className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Criando conta...
              </span>
            ) : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)]">
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline" id="login-link">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
