import { HistoryList } from './_components/HistoryList';
import Link from 'next/link';

export default function HistoricoPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] pb-24 pt-12">
      <div className="mx-auto max-w-xl px-6 space-y-12">
        {/* Header Minimalista */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] shadow-sm hover:text-[var(--color-primary)] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-primary)] opacity-80">Registros</p>
            <h1 className="text-xl font-black text-[var(--text-primary)]">Meu Histórico</h1>
          </div>
          <div className="w-12" /> {/* Spacer */}
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <HistoryList />
        </section>
      </div>
    </main>
  );
}

