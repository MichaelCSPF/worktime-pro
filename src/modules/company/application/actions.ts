'use server';

import { SupabaseCompanyRepository } from '../infrastructure/SupabaseCompanyRepository';
import { CreateCompanyUseCase, type CreateCompanyInput } from './CreateCompanyUseCase';
import { createClient } from '@/shared/infrastructure/supabase/server';
import { revalidatePath } from 'next/cache';

import { GetMyCompaniesUseCase } from './GetMyCompaniesUseCase';

const companyRepo = new SupabaseCompanyRepository();
const createCompanyUseCase = new CreateCompanyUseCase(companyRepo);
const getMyCompaniesUseCase = new GetMyCompaniesUseCase(companyRepo);

export interface CompanyActionResult {
  success: boolean;
  error?: string;
}

/**
 * Action para criar uma nova empresa.
 */
export async function createCompanyAction(formData: FormData): Promise<CompanyActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuário não autenticado' };
  }

  const input: CreateCompanyInput = {
    userId: user.id,
    name: formData.get('name') as string,
    address: formData.get('address') as string || undefined,
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : undefined,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : undefined,
    radiusInMeters: formData.get('radiusInMeters') ? Number(formData.get('radiusInMeters')) : undefined,
    hourlyRate: Number(formData.get('hourlyRate')),
    dailyWorkMinutes: Number(formData.get('dailyWorkMinutes')),
    lunchMinutes: Number(formData.get('lunchMinutes')),
  };

  const result = await createCompanyUseCase.execute(input);

  if (result.isFailure()) {
    const error = result.getError();
    return { success: false, error: typeof error === 'string' ? error : (error as { message?: string })?.message || 'Erro ao criar empresa' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/empresas');
  
  return { success: true };
}

/**
 * Action para deletar (soft delete) uma empresa.
 */
export async function deleteCompanyAction(companyId: string): Promise<CompanyActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Não autorizado' };

  const result = await companyRepo.delete(companyId);

  if (result.isFailure()) {
    return { success: false, error: result.getError() || 'Erro ao processar' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/empresas');

  return { success: true };
}

/**
 * Action para buscar empresas do usuário.
 */
export async function getMyCompaniesAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const result = await getMyCompaniesUseCase.execute(user.id);

  if (result.isFailure()) return [];

  return result.getValue().map(item => ({
    id: item.bindingId, // Agora usamos o ID do vínculo, exigido por f_ponto
    companyId: item.company.id,
    name: item.company.name,
    address: item.company.address,
    active: item.company.active,
    config: {
      hourlyRate: item.config.hourlyRate,
      dailyWorkMinutes: item.config.dailyWorkMinutes,
      lunchMinutes: item.config.lunchMinutes,
    }
  }));
}
