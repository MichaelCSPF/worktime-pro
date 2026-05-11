import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Clock, 
  BarChart3, 
  History, 
  Building2, 
  UserCircle,
  LogOut
} from 'lucide-react';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Início | WorkTime PRO',
  description: 'Sua central de controle de jornada.',
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('d_usuarios')
    .select('nome')
    .eq('id', user.id)
    .single();

  const menuItems = [
    {
      title: 'Registrar Ponto',
      desc: 'Bater entrada, saída ou almoço',
      icon: <Clock size={28} />,
      href: '/ponto',
      color: 'bg-blue-500',
    },
    {
      title: 'Dashboard',
      desc: 'Gráficos e projeções de ganhos',
      icon: <BarChart3 size={28} />,
      href: '/dashboard',
      color: 'bg-indigo-500',
    },
    {
      title: 'Meu Histórico',
      desc: 'Espelho de ponto e relatórios',
      icon: <History size={28} />,
      href: '/ponto/historico',
      color: 'bg-orange-500',
    },
    {
      title: 'Minhas Empresas',
      desc: 'Gerenciar locais de trabalho',
      icon: <Building2 size={28} />,
      href: '/empresas',
      color: 'bg-emerald-500',
    },
    {
      title: 'Meu Perfil',
      desc: 'Dados pessoais e segurança',
      icon: <UserCircle size={28} />,
      href: '/perfil',
      color: 'bg-slate-700',
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 pt-20 px-6">
      <div className="mx-auto max-w-xl space-y-12">
        {/* Saudação */}
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-primary)] opacity-80">Painel de Controle</p>
            <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
              Olá, {profile?.nome.split(' ')[0]}
            </h1>
          </div>
          <form action="/auth/signout" method="post">
            <button className="h-12 w-12 rounded-2xl bg-[var(--surface)] text-[var(--text-muted)] flex items-center justify-center hover:text-red-500 hover:bg-red-50 transition-all border border-[var(--border)] shadow-sm">
              <LogOut size={18} />
            </button>
          </form>
        </div>

        {/* Menu Grid */}
        <div className="grid gap-4">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className="group relative flex items-center gap-5 rounded-[2rem] bg-[var(--surface)] p-5 border border-[var(--border)] shadow-sm hover:shadow-2xl hover:shadow-[var(--color-primary)]/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
            >
              {/* Efeito de Gradiente no Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-primary)]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.color} text-white shadow-lg shadow-black/5 group-hover:scale-105 transition-transform duration-500`}>
                {item.icon}
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">{item.title}</h2>
                <p className="text-xs font-medium text-[var(--text-muted)] opacity-80">{item.desc}</p>
              </div>

              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--background)] text-[var(--text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Rodapé Info */}
        <div className="pt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)]">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Sistema Online v1.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

