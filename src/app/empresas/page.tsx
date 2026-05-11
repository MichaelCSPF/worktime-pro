// Let me fix the import path in my thought process.
import { getMyCompaniesAction } from '@/modules/company/application/actions';
import Link from 'next/link';
import { CreateCompanyModal } from './_components/CreateCompanyModal';
import { CompanyCard } from './_components/CompanyCard';

export default async function EmpresasPage() {
  const companies = await getMyCompaniesAction();

  return (
    <main className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface-elevated)]/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-[var(--surface)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <h1 className="text-xl font-bold">Minhas Empresas</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex justify-end">
          <CreateCompanyModal />
        </div>
        {companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Nenhuma empresa cadastrada</h2>
              <p className="text-sm text-[var(--text-muted)]">Adicione sua primeira empresa para começar a bater ponto.</p>
            </div>
          </div>
        ) : (
          companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))
        )}
      </div>
    </main>
  );
}
