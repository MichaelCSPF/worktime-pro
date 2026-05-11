'use server';

import { createClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseTimeEntryRepository } from '../infrastructure/SupabaseTimeEntryRepository';
import { SupabaseAuditRepository } from '@/modules/audit/infrastructure/SupabaseAuditRepository';
import { SupabaseCompanyRepository } from '@/modules/company/infrastructure/SupabaseCompanyRepository';
import { ClockInUseCase } from './ClockInUseCase';
import { ClockOutUseCase } from './ClockOutUseCase';
import { EditTimeEntryUseCase } from './EditTimeEntryUseCase';
import { revalidatePath } from 'next/cache';
import { PayrollCalculator } from '@/modules/payroll/domain/PayrollCalculator';

const timeRepo = new SupabaseTimeEntryRepository();
const auditRepo = new SupabaseAuditRepository();
const companyRepo = new SupabaseCompanyRepository();
const clockInUseCase = new ClockInUseCase(timeRepo, companyRepo);
const clockOutUseCase = new ClockOutUseCase(timeRepo, auditRepo, companyRepo);
const editTimeEntryUseCase = new EditTimeEntryUseCase(timeRepo, auditRepo);

export interface TimeTrackingResult {
  success: boolean;
  error?: string;
}

/**
 * Action para editar um ponto manualmente.
 */
export async function editTimeEntryAction(
  entryId: string,
  data: {
    entry?: Date;
    lunchStart?: Date | null;
    lunchEnd?: Date | null;
    exit?: Date | null;
    isOvertime100?: boolean;
    observation?: string | null;
  }
): Promise<TimeTrackingResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Não autenticado' };

  const result = await editTimeEntryUseCase.execute({
    userId: user.id,
    entryId,
    ...data
  });

  if (result.isFailure()) return { success: false, error: result.getError()?.message };

  revalidatePath('/dashboard');
  revalidatePath('/ponto');
  revalidatePath('/ponto/historico');
  
  return { success: true };
}

/**
 * Action para bater a entrada.
 */
export async function clockInAction(
  userCompanyId: string, 
  coords?: { lat: number; lng: number; acc: number },
  isOvertime100: boolean = false,
  timezone: string = 'America/Sao_Paulo'
): Promise<TimeTrackingResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Não autenticado' };

  const result = await clockInUseCase.execute({
    userId: user.id,
    userCompanyId,
    latitude: coords?.lat,
    longitude: coords?.lng,
    accuracy: coords?.acc,
    timezone,
    isOvertime100,
  });

  if (result.isFailure()) return { success: false, error: result.getError()?.message };

  revalidatePath('/dashboard');
  revalidatePath('/ponto');
  return { success: true };
}

/**
 * Action para bater a saída.
 */
export async function clockOutAction(
  coords?: { lat: number; lng: number; acc: number },
  isOvertime100?: boolean,
  exitTime?: Date
): Promise<TimeTrackingResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Não autenticado' };

  const result = await clockOutUseCase.execute({
    userId: user.id,
    latitude: coords?.lat,
    longitude: coords?.lng,
    accuracy: coords?.acc,
    isOvertime100,
    exitTime,
  });

  if (result.isFailure()) return { success: false, error: result.getError()?.message };

  revalidatePath('/dashboard');
  revalidatePath('/ponto');
  return { success: true };
}

/**
 * Busca o status atual da jornada.
 */
export async function getCurrentStatusAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const result = await timeRepo.findActiveByUserId(user.id);
  if (result.isFailure() || !result.getValue()) return null;

  const entry = result.getValue()!;
  return {
    id: entry.id,
    userCompanyId: entry.userCompanyId,
    entry: entry.entry.toISOString(),
    lunchStart: entry.lunchStart?.toISOString(),
    lunchEnd: entry.lunchEnd?.toISOString(),
    exit: entry.exit?.toISOString(),
    isOvertime100: entry.isOvertime100,
    source: entry.source,
  };
}

/**
 * Busca histórico mensal de pontos.
 */
export async function getHistoryAction(month: number, year: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const result = await timeRepo.findByUserIdAndMonth(user.id, month, year);
  if (result.isFailure()) return [];

  // Buscar nomes das empresas e salário para o DTO
  const { data: configs } = await supabase
    .from('f_usuario_empresa')
    .select('id, empresa_id, salario_hora, jornada_minutos, d_empresas(nome)')
    .eq('usuario_id', user.id);

  const configMap = new Map(configs?.map(c => [c.id, { 
    name: (c.d_empresas as unknown as { nome: string }).nome, 
    rate: Number(c.salario_hora),
    targetMinutes: Number(c.jornada_minutos)
  }]));

  return result.getValue().map(entry => {
    const config = configMap.get(entry.userCompanyId);
    
    const earnings = (config && entry.exit) ? PayrollCalculator.calculate({
      entry: entry.entry,
      lunchStart: entry.lunchStart,
      lunchEnd: entry.lunchEnd,
      exit: entry.exit,
      dailyTargetMinutes: config.targetMinutes,
      hourlyRate: config.rate,
      timezone: entry.timezone,
      isOvertime100Manual: entry.isOvertime100
    }) : null;

    return {
      id: entry.id,
      companyName: config?.name || 'Empresa desconhecida',
      entry: entry.entry.toISOString(),
      lunchStart: entry.lunchStart?.toISOString(),
      lunchEnd: entry.lunchEnd?.toISOString(),
      exit: entry.exit?.toISOString(),
      isOvertime100: entry.isOvertime100,
      source: entry.source,
      timezone: entry.timezone,
      totalEarnings: earnings?.totalValue || 0,
      regularHours: earnings ? earnings.normalMinutes / 60 : 0,
      overtimeHours: earnings ? (earnings.overtime50Minutes + earnings.overtime100Minutes) / 60 : 0,
      nightHours: earnings ? earnings.nightShiftMinutes / 60 : 0,
    };
  });
}

