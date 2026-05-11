'use client';

import { useState } from 'react';
import { updateProfileAction } from '@/modules/auth/application/actions';

interface ProfileFormProps {
  initialData: {
    nome: string;
    telefone?: string;
    cpf?: string;
    enderecoPessoal?: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [nome, setNome] = useState(initialData.nome);
  const [telefone, setTelefone] = useState(initialData.telefone || '');
  const [cpf, setCpf] = useState(initialData.cpf || '');
  const [enderecoPessoal, setEnderecoPessoal] = useState(initialData.enderecoPessoal || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const maskCpf = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await updateProfileAction({ nome, telefone, cpf, enderecoPessoal });

    if (result.success) {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil.' });
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Nome Completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            placeholder="Seu nome"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 font-bold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] transition-all"
          />
        </div>

        {/* CPF */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">CPF</label>
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            maxLength={14}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 font-bold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] transition-all"
          />
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Número de Contato</label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 font-bold text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] transition-all"
          />
        </div>

        {/* Endereço */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Endereço Pessoal</label>
          <input
            type="text"
            value={enderecoPessoal}
            onChange={(e) => setEnderecoPessoal(e.target.value)}
            placeholder="Rua, Número, Bairro, Cidade - UF"
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
        className="w-full rounded-2xl bg-[var(--color-primary)] py-4 font-black text-white shadow-lg shadow-[var(--color-primary)]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
      >
        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </form>
  );
}
