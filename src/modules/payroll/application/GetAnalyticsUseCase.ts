import { Result } from '@/shared/core/Result';
import { UseCase } from '@/shared/core/UseCase';
import { DomainError, InfraError } from '@/shared/core/DomainError';
import { ITimeEntryRepository } from '@/modules/time-tracking/domain/ITimeEntryRepository';
import { PayrollCalculator } from '@/modules/payroll/domain/PayrollCalculator';
import { AnalyticsDTO, WeeklyEarning, HourDistribution } from './AnalyticsDTO';
import { createClient } from '@/shared/infrastructure/supabase/server';

export interface GetAnalyticsInput {
  userId: string;
  month: number;
  year: number;
  companyId?: string;
}

export class GetAnalyticsUseCase implements UseCase<GetAnalyticsInput, AnalyticsDTO, DomainError> {
  constructor(private timeRepo: ITimeEntryRepository) {}

  async execute(input: GetAnalyticsInput): Promise<Result<AnalyticsDTO, DomainError>> {
    const supabase = await createClient();

    // 1. Buscar Jornadas do Mês
    const entriesResult = await this.timeRepo.findByUserIdAndMonth(input.userId, input.month, input.year, input.companyId);
    if (entriesResult.isFailure()) return Result.fail(new InfraError(entriesResult.getError()!));
    const entries = entriesResult.getValue();

    // 2. Buscar Configurações (Salário e Jornada)
    const { data: configs } = await supabase
      .from('f_usuario_empresa')
      .select('empresa_id, salario_hora, jornada_minutos')
      .eq('usuario_id', input.userId);

    const configMap = new Map(configs?.map(c => [c.empresa_id, {
      rate: Number(c.salario_hora),
      targetMinutes: Number(c.jornada_minutos)
    }]));

    // 3. Agrupamento por Semanas (1-7, 8-14, 15-21, 22-31)
    const weeklyData: WeeklyEarning[] = [
      { week: 'S1', earnings: 0 },
      { week: 'S2', earnings: 0 },
      { week: 'S3', earnings: 0 },
      { week: 'S4+', earnings: 0 },
    ];

    let totalReg = 0;
    let totalExt = 0;
    let totalNig = 0;
    let totalEarnings = 0;
    let entryTimesSum = 0;

    entries.forEach(entry => {
      const config = configMap.get(entry.userCompanyId);
      if (!config || !entry.exit) return;

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

      totalEarnings += earnings.totalValue;
      totalReg += earnings.normalMinutes / 60;
      totalExt += (earnings.overtime50Minutes + earnings.overtime100Minutes) / 60;
      totalNig += earnings.nightShiftMinutes / 60;

      // Média de entrada
      const hours = entry.entry.getHours();
      const mins = entry.entry.getMinutes();
      entryTimesSum += (hours * 60) + mins;

      // Agrupar por semana
      const day = entry.entry.getDate();
      if (day <= 7) weeklyData[0].earnings += earnings.totalValue;
      else if (day <= 14) weeklyData[1].earnings += earnings.totalValue;
      else if (day <= 21) weeklyData[2].earnings += earnings.totalValue;
      else weeklyData[3].earnings += earnings.totalValue;
    });

    const hourDistribution: HourDistribution[] = [
      { name: 'Regular', value: Number(totalReg.toFixed(1)), color: '#2563eb' },
      { name: 'Extra', value: Number(totalExt.toFixed(1)), color: '#f97316' },
      { name: 'Noturno', value: Number(totalNig.toFixed(1)), color: '#7c3aed' },
    ];

    // Projeção: (Ganhos Atuais / Dias Decorridos) * Total Dias no Mês
    const today = new Date();
    const daysInMonth = new Date(input.year, input.month, 0).getDate();
    const elapsedDays = input.month === today.getMonth() + 1 ? today.getDate() : daysInMonth;
    const projectedEarnings = elapsedDays > 0 ? (totalEarnings / elapsedDays) * daysInMonth : 0;

    const avgEntryMins = entries.length > 0 ? entryTimesSum / entries.length : 0;
    const avgH = Math.floor(avgEntryMins / 60);
    const avgM = Math.round(avgEntryMins % 60);

    return Result.ok({
      totalEarnings,
      projectedEarnings,
      totalHours: totalReg + totalExt,
      averageEntryTime: entries.length > 0 ? `${avgH.toString().padStart(2, '0')}:${avgM.toString().padStart(2, '0')}` : '--:--',
      weeklyEarnings: weeklyData,
      hourDistribution: hourDistribution.filter(d => d.value > 0),
    });
  }
}

