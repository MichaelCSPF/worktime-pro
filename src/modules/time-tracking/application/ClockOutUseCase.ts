import { Result } from '@/shared/core/Result';
import { UseCase } from '@/shared/core/UseCase';
import { DomainError, BusinessError, InfraError } from '@/shared/core/DomainError';

import { ITimeEntryRepository } from '../domain/ITimeEntryRepository';
import { IAuditRepository } from '@/modules/audit/domain/IAuditRepository';
import { ICompanyRepository } from '@/modules/company/domain/ICompanyRepository';
import { LocationService } from '@/shared/domain/LocationService';

export interface ClockOutInput {
  userId: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  isOvertime100?: boolean;
  exitTime?: Date;
}

/**
 * Use Case para registrar saída.
 */
export class ClockOutUseCase implements UseCase<ClockOutInput, void, DomainError> {
  constructor(
    private timeRepo: ITimeEntryRepository,
    private auditRepo: IAuditRepository,
    private companyRepo: ICompanyRepository
  ) {}

  async execute(input: ClockOutInput): Promise<Result<void, DomainError>> {
    // 1. Buscar ponto ativo
    const activeResult = await this.timeRepo.findActiveByUserId(input.userId);
    if (activeResult.isFailure()) return Result.fail(new InfraError(activeResult.getError()!));
    
    const entry = activeResult.getValue();
    if (!entry) {
      return Result.fail(new BusinessError('Nenhuma jornada ativa encontrada'));
    }

    // 2. Geofencing (Validação de Distância)
    // Se NÃO for ajuste manual (input.exitTime ausente) e tivermos coordenadas
    if (!input.exitTime && input.latitude && input.longitude) {
      const companyResult = await this.companyRepo.findById(entry.userCompanyId);
      if (companyResult.isSuccess()) {
        const company = companyResult.getValue();
        if (company && company.coordinates.latitude && company.coordinates.longitude && company.coordinates.radiusInMeters) {
          const isWithin = LocationService.isWithinRadius(
            input.latitude,
            input.longitude,
            company.coordinates.latitude,
            company.coordinates.longitude,
            company.coordinates.radiusInMeters,
            input.accuracy || 0
          );

          if (!isWithin) {
            return Result.fail(new BusinessError('Você está fora do raio permitido para esta empresa'));
          }
        }
      }
    }


    // Validação de limite de 7 dias para edição manual
    if (input.exitTime) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (input.exitTime < sevenDaysAgo) {
        return Result.fail(new BusinessError('Não é permitido ajuste manual com mais de 7 dias de atraso'));
      }
    }

    // 2. Registrar saída na entidade
    const exitTime = input.exitTime || new Date();
    const clockOutResult = entry.clockOut(
      exitTime,
      input.latitude && input.longitude && input.accuracy ? {
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy
      } : undefined
    );

    if (clockOutResult.isFailure()) return Result.fail(clockOutResult.getError()!); // Já é BusinessError se TimeEntry foi atualizado


    if (input.isOvertime100 !== undefined) {
      entry.setOvertime100(input.isOvertime100);
    }

    if (input.exitTime) {
      entry.markAsManual();
    }

    // 3. Persistir atualização
    const result = await this.timeRepo.update(entry);
    if (result.isFailure()) return Result.fail(new InfraError(result.getError()!));

    if (input.exitTime) {
      await this.auditRepo.save({
        userId: input.userId,
        action: 'CLOCK_OUT_MANUAL',
        entity: 'f_ponto',
        entityId: entry.id,
        details: { exit_time: input.exitTime.toISOString() }
      });
    }

    return Result.ok();
  }
}
