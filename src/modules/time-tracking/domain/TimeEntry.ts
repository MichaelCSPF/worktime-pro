import { Entity } from '@/shared/core/Entity';
import { Result } from '@/shared/core/Result';
import { BusinessError } from '@/shared/core/DomainError';

interface EntryCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface TimeEntryProps {
  userCompanyId: string;
  entry: Date;
  lunchStart: Date | null;
  lunchEnd: Date | null;
  exit: Date | null;
  entryCoordinates: EntryCoordinates | null;
  exitCoordinates: EntryCoordinates | null;
  timezone: string;
  source: 'app' | 'manual' | 'offline_sync';
  isOvertime100: boolean;
  syncId: string | null;
  observation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade Marcação de Ponto (f_ponto).
 */
export class TimeEntry extends Entity<TimeEntryProps> {
  get userCompanyId() { return this.props.userCompanyId; }
  get entry() { return this.props.entry; }
  get lunchStart() { return this.props.lunchStart; }
  get lunchEnd() { return this.props.lunchEnd; }
  get exit() { return this.props.exit; }
  get entryCoordinates() { return this.props.entryCoordinates; }
  get exitCoordinates() { return this.props.exitCoordinates; }
  get timezone() { return this.props.timezone; }
  get isOvertime100() { return this.props.isOvertime100; }
  get source() { return this.props.source; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }


  private constructor(props: TimeEntryProps, id?: string) {
    super(props, id);
  }

  public static create(props: Partial<TimeEntryProps> & { userCompanyId: string; entry: Date }, id?: string): Result<TimeEntry> {
    const timeEntry = new TimeEntry({
      userCompanyId: props.userCompanyId,
      entry: props.entry,
      lunchStart: props.lunchStart ?? null,
      lunchEnd: props.lunchEnd ?? null,
      exit: props.exit ?? null,
      entryCoordinates: props.entryCoordinates ?? null,
      exitCoordinates: props.exitCoordinates ?? null,
      timezone: props.timezone ?? 'America/Sao_Paulo',
      source: props.source ?? 'app',
      isOvertime100: props.isOvertime100 ?? false,
      syncId: props.syncId ?? null,
      observation: props.observation ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    }, id);

    return Result.ok(timeEntry);
  }

  public setOvertime100(value: boolean): void {
    this.props.isOvertime100 = value;
    this.props.updatedAt = new Date();
  }

  public startLunch(time: Date): Result<void, BusinessError> {
    if (this.props.lunchStart) return Result.fail(new BusinessError('Almoço já iniciado'));
    if (this.props.exit) return Result.fail(new BusinessError('Não pode iniciar almoço após saída'));
    
    this.props.lunchStart = time;
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public endLunch(time: Date): Result<void, BusinessError> {
    if (!this.props.lunchStart) return Result.fail(new BusinessError('Almoço não iniciado'));
    if (this.props.lunchEnd) return Result.fail(new BusinessError('Almoço já finalizado'));
    if (time < this.props.lunchStart) return Result.fail(new BusinessError('Fim do almoço deve ser após o início'));

    this.props.lunchEnd = time;
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public clockOut(time: Date, coords?: EntryCoordinates): Result<void, BusinessError> {
    if (this.props.exit) return Result.fail(new BusinessError('Saída já registrada'));
    if (time < this.props.entry) return Result.fail(new BusinessError('Saída deve ser após a entrada'));
    if (this.props.lunchStart && !this.props.lunchEnd) return Result.fail(new BusinessError('Finalize o almoço antes de bater a saída'));

    this.props.exit = time;
    if (coords) this.props.exitCoordinates = coords;
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  public markAsManual(): void {
    this.props.source = 'manual';
    this.props.updatedAt = new Date();
  }

  public updateManual(props: {
    entry?: Date;
    lunchStart?: Date | null;
    lunchEnd?: Date | null;
    exit?: Date | null;
    isOvertime100?: boolean;
    observation?: string | null;
  }): Result<void, BusinessError> {
    const newEntry = props.entry ?? this.props.entry;
    const newLunchStart = props.lunchStart !== undefined ? props.lunchStart : this.props.lunchStart;
    const newLunchEnd = props.lunchEnd !== undefined ? props.lunchEnd : this.props.lunchEnd;
    const newExit = props.exit !== undefined ? props.exit : this.props.exit;

    if (newLunchStart && newLunchStart < newEntry) return Result.fail(new BusinessError('Almoço não pode ser antes da entrada'));
    if (newLunchEnd && (!newLunchStart || newLunchEnd < newLunchStart)) return Result.fail(new BusinessError('Fim do almoço inválido'));
    if (newExit && newExit < newEntry) return Result.fail(new BusinessError('Saída não pode ser antes da entrada'));
    if (newExit && newLunchEnd && newExit < newLunchEnd) return Result.fail(new BusinessError('Saída não pode ser antes do fim do almoço'));

    this.props.entry = newEntry;
    this.props.lunchStart = newLunchStart;
    this.props.lunchEnd = newLunchEnd;
    this.props.exit = newExit;
    if (props.isOvertime100 !== undefined) this.props.isOvertime100 = props.isOvertime100;
    if (props.observation !== undefined) this.props.observation = props.observation;
    
    this.props.source = 'manual';
    this.props.updatedAt = new Date();
    
    return Result.ok();
  }

}
