
export interface CalculationInput {
  entry: Date;
  lunchStart?: Date | null;
  lunchEnd?: Date | null;
  exit: Date;
  dailyTargetMinutes: number;
  hourlyRate: number;
  isOvertime100Manual?: boolean; // Nova flag manual solicitada pelo usuário
  timezone: string; // Timezone obrigatório para evitar erros GMT
}

export interface CalculationResult {
  normalMinutes: number;
  overtime50Minutes: number;
  overtime100Minutes: number;
  nightShiftMinutes: number;
  totalValue: number;
}

/**
 * Domain Service para cálculos de jornada e folha.
 * 
 * Ajustes realizados:
 * - Validação de horário via Timezone específico (evita GMT mismatch).
 * - Flag manual para Hora Extra 100%.
 */
export class PayrollCalculator {
  private static NIGHT_START_HOUR = 22;
  private static NIGHT_END_HOUR = 5;

  public static calculate(input: CalculationInput): CalculationResult {
    // 1. Calcular minutos totais trabalhados
    let totalMinutes = this.diffInMinutes(input.entry, input.exit);
    
    // Subtrair almoço
    if (input.lunchStart && input.lunchEnd) {
      const lunchDuration = this.diffInMinutes(input.lunchStart, input.lunchEnd);
      totalMinutes -= lunchDuration;
    }

    // 2. Calcular Adicional Noturno (baseado no timezone do local da batida)
    const nightMinutes = this.calculateNightMinutes(input.entry, input.exit, input.timezone);

    // 3. Calcular Horas Extras
    let normalMinutes = 0;
    let overtime50Minutes = 0;
    let overtime100Minutes = 0;

    // Se a flag manual de 100% estiver ativa, toda a jornada é 100%
    if (input.isOvertime100Manual) {
      overtime100Minutes = totalMinutes;
      normalMinutes = 0;
    } else {
      normalMinutes = Math.min(totalMinutes, input.dailyTargetMinutes);
      overtime50Minutes = Math.max(0, totalMinutes - input.dailyTargetMinutes);
    }

    // 4. Calcular Valor Total
    const hourlyBase = input.hourlyRate / 60;
    const valueNormal = normalMinutes * hourlyBase;
    const valueOvertime50 = overtime50Minutes * (hourlyBase * 1.5);
    const valueOvertime100 = overtime100Minutes * (hourlyBase * 2.0);
    
    // Adicional noturno (+20% sobre a hora base)
    const valueNightAddition = nightMinutes * (hourlyBase * 0.2);

    const totalValue = valueNormal + valueOvertime50 + valueOvertime100 + valueNightAddition;

    return {
      normalMinutes,
      overtime50Minutes,
      overtime100Minutes,
      nightShiftMinutes: nightMinutes,
      totalValue: Number(totalValue.toFixed(2)),
    };
  }

  private static diffInMinutes(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }

  /**
   * Calcula minutos noturnos considerando o timezone informado.
   */
  private static calculateNightMinutes(start: Date, end: Date, timezone: string): number {
    let nightMinutes = 0;
    const current = new Date(start.getTime());
    
    // Cache do formatador para performance
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone
    });

    while (current < end) {
      const hourStr = formatter.format(current);
      const hour = parseInt(hourStr === '24' ? '0' : hourStr);
      
      if (hour >= this.NIGHT_START_HOUR || hour < this.NIGHT_END_HOUR) {
        nightMinutes++;
      }
      current.setMinutes(current.getMinutes() + 1);
    }

    return nightMinutes;
  }
}
