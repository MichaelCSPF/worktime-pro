import { Metadata } from 'next';
import { getAnalyticsAction } from '@/modules/payroll/application/actions/analyticsActions';
import { DashboardClient } from './_components/DashboardClient';
import { DashboardFilters } from './_components/DashboardFilters';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard | WorkTime PRO',
  description: 'Acompanhe seu desempenho financeiro e produtividade.',
};

export default async function DashboardPage(props: { searchParams: Promise<{ month?: string; year?: string; companyId?: string }> }) {
  const searchParams = await props.searchParams;
  const month = searchParams.month ? parseInt(searchParams.month) : new Date().getMonth() + 1;
  const year = searchParams.year ? parseInt(searchParams.year) : new Date().getFullYear();
  const companyId = searchParams.companyId;

  const analytics = await getAnalyticsAction(month, year, companyId);

  if (!analytics) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 dark:bg-red-950/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p className="mb-4 text-[var(--text-muted)]">Ocorreu um erro ao carregar seus dados.</p>
        <Link href="/ponto" className="font-bold text-[var(--color-primary)]">Voltar para o Ponto</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 pt-8 px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)] font-medium">Insights de desempenho e projeções financeiras</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <DashboardFilters />
            <div className="h-8 w-px bg-[var(--border)] hidden md:block mx-2" />
            <div className="flex items-center gap-2">
              <Link 
                href="/"
                className="px-6 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-bold text-sm hover:bg-[var(--border)] transition-all"
              >
                Voltar
              </Link>
              <Link 
                href="/perfil"
                className="h-12 w-12 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--border)] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </Link>
            </div>
          </div>
        </div>

        <DashboardClient initialData={analytics} />
      </div>
    </main>
  );
}
