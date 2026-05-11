import { Result } from '@/shared/core/Result';
import { UseCase } from '@/shared/core/UseCase';
import { DomainError, BusinessError, InfraError } from '@/shared/core/DomainError';
import { TimeEntry } from '../domain/TimeEntry';
import { ITimeEntryRepository } from '../domain/ITimeEntryRepository';
import { ICompanyRepository } from '@/modules/company/domain/ICompanyRepository';
import { LocationService } from '@/shared/domain/LocationService';

export interface ClockInInput {
  userId: string;
  userCompanyId: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timezone?: string;
  isOvertime100?: boolean;
}

/**
 * Use Case para registrar entrada.
 */
export class ClockInUseCase implements UseCase<ClockInInput, void, DomainError> {
  constructor(
    private timeRepo: ITimeEntryRepository,
    private companyRepo: ICompanyRepository
  ) {}

  async execute(input: ClockInInput): Promise<Result<void, DomainError>> {
    // 1. Verificar se já existe um ponto aberto
    const activeResult = await this.timeRepo.findActiveByUserId(input.userId);
    if (activeResult.isFailure()) return Result.fail(new InfraError(activeResult.getError()!));
    if (activeResult.getValue()) {
      return Result.fail(new BusinessError('Já existe uma jornada em andamento'));
    }

    // 2. Geofencing (Validação de Distância)
    if (input.latitude && input.longitude) {
      const companyResult = await this.companyRepo.findByBindingId(input.userCompanyId);
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

    // 3. Criar entidade
    const entryResult = TimeEntry.create({
      userCompanyId: input.userCompanyId,
      entry: new Date(),
      entryCoordinates: input.latitude && input.longitude && input.accuracy ? {
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy
      } : null,
      timezone: input.timezone,
      isOvertime100: input.isOvertime100,
    });


    if (entryResult.isFailure()) return Result.fail(new BusinessError(entryResult.getError()!));

    // 3. Persistir
    const saveResult = await this.timeRepo.save(entryResult.getValue());
    if (saveResult.isFailure()) return Result.fail(new InfraError(saveResult.getError()!));
    
    return Result.ok();

  }
}
