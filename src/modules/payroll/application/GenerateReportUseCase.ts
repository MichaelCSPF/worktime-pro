import { Result } from '@/shared/core/Result';
import { UseCase } from '@/shared/core/UseCase';
import { DomainError, BusinessError, InfraError } from '@/shared/core/DomainError';

import { ITimeEntryRepository } from '@/modules/time-tracking/domain/ITimeEntryRepository';

import { PayrollCalculator } from '@/modules/payroll/domain/PayrollCalculator';
import { ReportDataDTO, ReportRowDTO } from './ReportDTO';
import { createClient } from '@/shared/infrastructure/supabase/server';

export interface GenerateReportInput {
  userId: string;
  month: number;
  year: number;
}

export class GenerateReportUseCase implements UseCase<GenerateReportInput, ReportDataDTO, DomainError> {

  constructor(
    private timeRepo: ITimeEntryRepository
  ) {}


  async execute(input: GenerateReportInput): Promise<Result<ReportDataDTO, DomainError>> {
    const supabase = await createClient();

    // 1. Buscar Perfil do Usuário
    const { data: userProfile, error: userError } = await supabase
      .from('d_usuarios')
      .select('nome')
      .eq('id', input.userId)
      .single();

    if (userError || !userProfile) {
      return Result.fail(new BusinessError('Usuário não encontrado'));
    }

    // 2. Buscar Jornadas do Mês
    const entriesResult = await this.timeRepo.findByUserIdAndMonth(input.userId, input.month, input.year);
    if (entriesResult.isFailure()) return Result.fail(new InfraError(entriesResult.getError()!));
    const entries = entriesResult.getValue();

    // 3. Buscar Configurações das Empresas
    const { data: configs } = await supabase
      .from('f_usuario_empresa')
      .select('empresa_id, salario_hora, jornada_minutos, d_empresas(nome)')
      .eq('usuario_id', input.userId);

    const configMap = new Map(configs?.map(c => [c.empresa_id, { 
      name: (c.d_empresas as unknown as { nome: string }).nome, 
      rate: Number(c.salario_hora),
      targetMinutes: Number(c.jornada_minutos)
    }]));

    // 4. Processar Linhas
    const rows: ReportRowDTO[] = entries.map(entry => {
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
      
      const totalHoursRaw = earnings ? (earnings.normalMinutes + earnings.overtime50Minutes + earnings.overtime100Minutes) / 60 : 0;
      const overtimeHours = earnings ? (earnings.overtime50Minutes + earnings.overtime100Minutes) / 60 : 0;
      const nightHours = earnings ? earnings.nightShiftMinutes / 60 : 0;
      
      return {
        date: entry.entry.toLocaleDateString('pt-BR'),
        companyName: config?.name || '---',
        entry: entry.entry.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        lunch: entry.lunchStart ? `${entry.lunchStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${entry.lunchEnd?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '---',
        exit: entry.exit ? entry.exit.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---',
        totalHours: `${Math.floor(totalHoursRaw)}h ${Math.round((totalHoursRaw % 1) * 60)}m`,
        overtimeHours: `${overtimeHours.toFixed(1)}h`,
        nightHours: `${nightHours.toFixed(1)}h`,
        earnings: earnings ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(earnings.totalValue) : 'R$ 0,00',
      };
    });

    // 5. Totais
    const totalEarningsValue = entries.reduce((acc, entry) => {
      const config = configMap.get(entry.userCompanyId);
      if (!config || !entry.exit) return acc;
      const earnings = PayrollCalculator.calculate({
        entry: entry.entry,
        lunchStart: entry.lunchStart,
        lunchEnd: entry.lunchEnd,
        exit: entry.exit,
        dailyTargetMinutes: config.targetMinutes,
        hourlyRate: config.rate,
        timezone: entry.timezone,
        isOvertime100Manual: entry.isOvertime100
      });
      return acc + earnings.totalValue;
    }, 0);

    const totalMinutesWork = entries.reduce((acc, entry) => {
      const config = configMap.get(entry.userCompanyId);
      if (!config || !entry.exit) return acc;
      const earnings = PayrollCalculator.calculate({
        entry: entry.entry,
        lunchStart: entry.lunchStart,
        lunchEnd: entry.lunchEnd,
        exit: entry.exit,
        dailyTargetMinutes: config.targetMinutes,
        hourlyRate: config.rate,
        timezone: entry.timezone,
        isOvertime100Manual: entry.isOvertime100
      });
      return acc + (earnings.normalMinutes + earnings.overtime50Minutes + earnings.overtime100Minutes);
    }, 0);


    const result: ReportDataDTO = {
      userName: userProfile.nome,
      monthYear: `${input.month}/${input.year}`,
      rows,
      totals: {
        hours: `${Math.floor(totalMinutesWork / 60)}h ${Math.round(totalMinutesWork % 60)}m`,
        earnings: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEarningsValue)
      }
    };


    return Result.ok(result);
  }
}
