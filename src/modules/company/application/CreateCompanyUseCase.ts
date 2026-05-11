import { Result } from '@/shared/core/Result';
import { UseCase } from '@/shared/core/UseCase';
import { DomainError, InfraError } from '@/shared/core/DomainError';



import { Company } from '../domain/Company';
import { CompanyConfig } from '../domain/CompanyConfig';
import { Coordinates } from '../domain/Coordinates';
import { ICompanyRepository } from '../domain/ICompanyRepository';

export interface CreateCompanyInput {
  userId: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radiusInMeters?: number;
  hourlyRate: number;
  dailyWorkMinutes: number;
  lunchMinutes: number;
}

/**
 * Use Case para criação de empresa e configuração inicial de jornada.
 */
export class CreateCompanyUseCase implements UseCase<CreateCompanyInput, void, DomainError> {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(input: CreateCompanyInput): Promise<Result<void, DomainError>> {
    // 1. Criar coordenadas
    const coordsResult = Coordinates.create({
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      radiusInMeters: input.radiusInMeters ?? null,
    });

    if (coordsResult.isFailure()) return Result.fail(coordsResult.getError()!);

    // 2. Criar configuração de jornada
    const configResult = CompanyConfig.create({
      hourlyRate: input.hourlyRate,
      dailyWorkMinutes: input.dailyWorkMinutes,
      lunchMinutes: input.lunchMinutes,
    });

    if (configResult.isFailure()) return Result.fail(configResult.getError()!);

    // 3. Criar entidade empresa
    const companyResult = Company.create({
      userId: input.userId,
      name: input.name,
      address: input.address,
      coordinates: coordsResult.getValue(),
    });

    if (companyResult.isFailure()) return Result.fail(companyResult.getError()!);




    // 4. Persistir
    const saveResult = await this.companyRepo.save(companyResult.getValue(), configResult.getValue());
    
    if (saveResult.isFailure()) {
      return Result.fail(new InfraError(saveResult.getError()!));
    }

    return Result.ok();

  }
}
