import { getCurrentStatusAction } from '@/modules/time-tracking/application/actions';
import { getMyCompaniesAction } from '@/modules/company/application/actions';
import { ClockInterface } from './_components/ClockInterface';
import Link from 'next/link';

export default async function PontoPage() {
  const currentStatus = await getCurrentStatusAction();
  const companies = await getMyCompaniesAction();

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 pt-12">
      <div className="mx-auto max-w-xl px-6 space-y-10">
        {/* Header Minimalista */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] shadow-sm hover:text-[var(--color-primary)] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-primary)] opacity-80">Jornada</p>
            <h1 className="text-xl font-black text-[var(--text-primary)]">Registrar Ponto</h1>
          </div>
          <Link 
            href="/ponto/historico" 
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--color-primary)] border border-[var(--border)] shadow-sm hover:scale-105 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
          </Link>
        </div>

        {/* Interface de Ponto */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ClockInterface 
            initialStatus={currentStatus} 
            companies={companies} 
          />
        </section>
      </div>
    </main>
  );
}

