'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Filter, Building2 } from 'lucide-react';
import { getMyCompaniesAction } from '@/modules/company/application/actions';

export function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;
  const currentYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
  const currentCompany = searchParams.get('companyId') || '';
  
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getMyCompaniesAction();
      setCompanies(data.map(c => ({ id: c.id, name: c.name })));
    }
    load();
  }, []);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2
  ];

  const handleUpdate = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Seletor de Mês */}
      <div className="relative group">
        <select 
          value={currentMonth}
          onChange={(e) => handleUpdate('month', e.target.value)}
          className="appearance-none h-12 pl-12 pr-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-bold text-sm text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-all outline-none cursor-pointer"
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none group-hover:text-[var(--color-primary)] transition-colors" size={16} />
      </div>

      {/* Seletor de Ano */}
      <div className="relative group">
        <select 
          value={currentYear}
          onChange={(e) => handleUpdate('year', e.target.value)}
          className="appearance-none h-12 pl-10 pr-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] font-bold text-sm text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-all outline-none cursor-pointer"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none group-hover:text-[var(--color-primary)] transition-colors" size={16} />
      </div>

      {/* Botão de Filtros Adicionais */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-12 w-12 flex items-center justify-center rounded-2xl border transition-all ${isOpen ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
      >
        <Filter size={18} />
      </button>

      {isOpen && (
        <div className="w-full mt-4 p-6 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">Filtros Avançados</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filtro de Empresa */}
            <div className="space-y-2">
              <label className="text-xs font-bold ml-2 text-[var(--text-muted)]">Filtrar por Empresa</label>
              <div className="relative group">
                <select 
                  value={currentCompany}
                  onChange={(e) => handleUpdate('companyId', e.target.value)}
                  className="appearance-none h-12 w-full pl-10 pr-10 rounded-xl bg-[var(--background)] border border-[var(--border)] font-bold text-xs text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-all outline-none cursor-pointer"
                >
                  <option value="">Todas as Empresas</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
              </div>
            </div>

            {/* Status Placeholder */}
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <label className="text-xs font-bold ml-2 text-[var(--text-muted)]">Filtrar por Status</label>
              <div className="h-12 w-full rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center px-4 text-xs font-medium italic text-[var(--text-muted)]">
                Em breve...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
