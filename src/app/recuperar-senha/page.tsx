'use client';

import { useActionState, useState } from 'react';
import { resetPasswordAction, type AuthActionResult } from '@/modules/auth/application/actions';
import Link from 'next/link';

const initialState: AuthActionResult = { success: false };

export default function RecuperarSenhaPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (_prevState: AuthActionResult, formData: FormData) => {
      const result = await resetPasswordAction(formData);
      if (result.success) setShowSuccess(true);
      return result;
    },
    initialState,
  );

  if (showSuccess) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Email enviado!</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
          </p>
          <Link href="/login" className="inline-block rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)]" id="back-to-login">
            Voltar ao Login
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Recuperar senha</h1>
          <p className="text-center text-sm text-[var(--text-muted)]">
            Digite seu email para receber o link de redefinição
          </p>
        </div>

        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400" role="alert" id="reset-error">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="reset-email" className="block text-sm font-medium">Email</label>
            <input id="reset-email" name="email" type="email" required autoComplete="email" placeholder="seu@email.com" disabled={isPending}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50" />
          </div>

          <button type="submit" disabled={isPending} id="reset-submit"
            className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Enviando...
              </span>
            ) : 'Enviar link'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)]">
          Lembrou a senha?{' '}
          <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline" id="back-login-link">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
