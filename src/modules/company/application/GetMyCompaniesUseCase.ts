import { Result } from '@/shared/core/Result';
import { UseCase } from '@/shared/core/UseCase';
import { DomainError, InfraError } from '@/shared/core/DomainError';

import { Company } from '../domain/Company';
import { CompanyConfig } from '../domain/CompanyConfig';
import { ICompanyRepository } from '../domain/ICompanyRepository';

/**
 * Use Case para listar empresas do usuário logado.
 */
export class GetMyCompaniesUseCase implements UseCase<string, Array<{ company: Company; config: CompanyConfig; bindingId: string }>, DomainError> {
  constructor(private companyRepo: ICompanyRepository) {}

  async execute(userId: string): Promise<Result<Array<{ company: Company; config: CompanyConfig; bindingId: string }>, DomainError>> {
    const result = await this.companyRepo.listByUserId(userId);
    
    if (result.isFailure()) {
      return Result.fail(new InfraError(result.getError()!));
    }

    return Result.ok(result.getValue());
  }

}
