import { Result } from '@/shared/core/Result';
import { UseCase } from '@/shared/core/UseCase';
import { DomainError, BusinessError, InfraError } from '@/shared/core/DomainError';
import { ITimeEntryRepository } from '../domain/ITimeEntryRepository';
import { IAuditRepository } from '@/modules/audit/domain/IAuditRepository';

export interface EditTimeEntryInput {
  userId: string;
  entryId: string;
  entry?: Date;
  lunchStart?: Date | null;
  lunchEnd?: Date | null;
  exit?: Date | null;
  isOvertime100?: boolean;
  observation?: string | null;
}

/**
 * Use Case para editar uma marcação de ponto manualmente.
 */
export class EditTimeEntryUseCase implements UseCase<EditTimeEntryInput, void, DomainError> {
  constructor(
    private timeRepo: ITimeEntryRepository,
    private auditRepo: IAuditRepository
  ) {}

  async execute(input: EditTimeEntryInput): Promise<Result<void, DomainError>> {
    // 1. Buscar a marcação
    const findResult = await this.timeRepo.findById(input.entryId);
    if (findResult.isFailure()) return Result.fail(new InfraError(findResult.getError()!));
    
    const entry = findResult.getValue();
    if (!entry) {
      return Result.fail(new BusinessError('Marcação não encontrada'));
    }

    // TODO: Validar se a marcação pertence ao usuário (Ownership)
    // No repository, findById já deve estar filtrado por RLS no Supabase se usarmos o client do usuário,
    // mas aqui no UseCase podemos reforçar ou assumir que o repositório cuidou disso.
    // Em arquitetura limpa, o repositório deveria talvez aceitar o userId para garantir.

    // 2. Aplicar alterações manuais
    const updateResult = entry.updateManual({
      entry: input.entry,
      lunchStart: input.lunchStart,
      lunchEnd: input.lunchEnd,
      exit: input.exit,
      isOvertime100: input.isOvertime100,
      observation: input.observation,
    });

    if (updateResult.isFailure()) return Result.fail(updateResult.getError()!);

    // 3. Persistir
    const saveResult = await this.timeRepo.update(entry);
    if (saveResult.isFailure()) return Result.fail(new InfraError(saveResult.getError()!));

    // 4. Auditoria
    await this.auditRepo.save({
      userId: input.userId,
      action: 'TIME_ENTRY_EDIT',
      entity: 'f_ponto',
      entityId: entry.id,
      details: {
        before: {
          entry: entry.entry.toISOString(),
          lunchStart: entry.lunchStart?.toISOString(),
          lunchEnd: entry.lunchEnd?.toISOString(),
          exit: entry.exit?.toISOString(),
        },
        input: {
          entry: input.entry?.toISOString(),
          lunchStart: input.lunchStart?.toISOString(),
          lunchEnd: input.lunchEnd?.toISOString(),
          exit: input.exit?.toISOString(),
        }
      }
    });

    return Result.ok();
  }
}
