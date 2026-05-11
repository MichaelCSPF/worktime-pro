import { Metadata } from 'next';
import { getProfileAction } from '@/modules/auth/application/actions';
import { ProfileForm } from './_components/ProfileForm';
import { PasswordForm } from './_components/PasswordForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Meu Perfil | WorkTime PRO',
  description: 'Gerencie seus dados pessoais e segurança.',
};

export default async function PerfilPage() {
  const profile = await getProfileAction();

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <p className="mb-4 text-[var(--text-muted)]">Sessão expirada ou usuário não encontrado.</p>
        <Link href="/login" className="font-bold text-[var(--color-primary)]">Voltar para Login</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20 pt-8 px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Meu Perfil</h1>
            <p className="text-sm text-[var(--text-muted)]">Gerencie sua conta e segurança</p>
          </div>
          <Link 
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
        </div>

        {/* Profile Section */}
        <section className="rounded-[2.5rem] bg-[var(--surface)] p-8 border border-[var(--border)] shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white text-2xl font-black">
              {profile.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)] text-lg">{profile.nome}</p>
              <p className="text-sm text-[var(--text-muted)]">{profile.email}</p>
            </div>
          </div>

          <div className="h-px bg-[var(--border)]" />

          <ProfileForm initialData={profile} />
        </section>

        {/* Security Section */}
        <section className="rounded-[2.5rem] bg-[var(--surface)] p-8 border border-[var(--border)] shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Segurança</h2>
          </div>

          <PasswordForm />
        </section>

        {/* Account Info */}
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Membro desde {new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] opacity-50">WorkTime PRO v1.0.0</p>
        </div>
      </div>
    </main>
  );
}
