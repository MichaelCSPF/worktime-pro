'use client';

import { useState } from 'react';
import { changePasswordAction } from '@/modules/auth/application/actions';

export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('password', password);
    formData.append('confirmPassword', confirm);

    const result = await changePasswordAction(formData);

    if (result.success) {
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPassword('');
      setConfirm('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao alterar senha.' });
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nova Senha */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Nova Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 font-bold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] transition-all"
          />
        </div>

        {/* Confirmar Senha */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Confirmar Nova Senha</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 font-bold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] transition-all"
          />
        </div>
      </div>

      {message && (
        <div className={`rounded-2xl p-4 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] py-4 font-black text-[var(--text-primary)] hover:bg-[var(--border)] transition-all disabled:opacity-50"
      >
        {isLoading ? 'Atualizando...' : 'Atualizar Senha'}
      </button>
    </form>
  );
}
