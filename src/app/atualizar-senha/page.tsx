'use client';

import { useActionState, useState, useEffect } from 'react';
import { changePasswordAction, type AuthActionResult } from '@/modules/auth/application/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const initialState: AuthActionResult = { success: false };

export default function AtualizarSenhaPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prevState: AuthActionResult, formData: FormData) => {
      const result = await changePasswordAction(formData);
      if (result.success) {
        setShowSuccess(true);
        // Redireciona após 3 segundos para dar tempo de ler a mensagem
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
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
          <h1 className="text-2xl font-bold">Senha atualizada!</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Sua senha foi alterada com sucesso. Você será redirecionado para o painel em instantes.
          </p>
          <div className="flex justify-center">
             <div className="h-1 w-24 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] animate-progress-fast"></div>
             </div>
          </div>
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
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-2.5-2.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Nova senha</h1>
          <p className="text-center text-sm text-[var(--text-muted)]">
            Crie uma nova senha segura para sua conta
          </p>
        </div>

        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400" role="alert" id="update-error">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Nova Senha</label>
            <input id="password" name="password" type="password" required placeholder="••••••••" disabled={isPending}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirmar Nova Senha</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required placeholder="••••••••" disabled={isPending}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50" />
          </div>

          <button type="submit" disabled={isPending} id="update-submit"
            className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 transition-all hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Atualizando...
              </span>
            ) : 'Redefinir senha'}
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
