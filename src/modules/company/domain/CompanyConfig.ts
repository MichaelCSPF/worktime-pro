import { ValueObject } from '@/shared/core/ValueObject';
import { Result } from '@/shared/core/Result';
import { ValidationError } from '@/shared/core/DomainError';


interface CompanyConfigProps {
  hourlyRate: number;
  dailyWorkMinutes: number;
  lunchMinutes: number;
}

/**
 * Value Object para Configurações de Jornada (f_usuario_empresa).
 * 
 * Regras:
 * - Salário/Hora >= 0
 * - Jornada > 0 e <= 1440 (24h)
 * - Almoço >= 0 e <= 480 (8h)
 */
export class CompanyConfig extends ValueObject<CompanyConfigProps> {
  get hourlyRate() { return this.props.hourlyRate; }
  get dailyWorkMinutes() { return this.props.dailyWorkMinutes; }
  get lunchMinutes() { return this.props.lunchMinutes; }

  private constructor(props: CompanyConfigProps) {
    super(props);
  }

  public static create(props: CompanyConfigProps): Result<CompanyConfig, ValidationError> {
    if (props.hourlyRate < 0) {
      return Result.fail(new ValidationError('Valor/Hora não pode ser negativo', 'INVALID_HOURLY_RATE'));
    }

    if (props.dailyWorkMinutes <= 0 || props.dailyWorkMinutes > 1440) {
      return Result.fail(new ValidationError('Jornada diária deve ser entre 1 e 1440 minutos', 'INVALID_WORK_MINUTES'));
    }

    if (props.lunchMinutes < 0 || props.lunchMinutes > 480) {
      return Result.fail(new ValidationError('Tempo de almoço deve ser entre 0 e 480 minutos', 'INVALID_LUNCH_MINUTES'));
    }


    return Result.ok(new CompanyConfig(props));
  }
}
