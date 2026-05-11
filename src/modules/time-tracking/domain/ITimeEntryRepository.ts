import { Result } from '@/shared/core/Result';
import { TimeEntry } from './TimeEntry';

export interface ITimeEntryRepository {
  save(entry: TimeEntry): Promise<Result<void>>;
  update(entry: TimeEntry): Promise<Result<void>>;
  findById(id: string): Promise<Result<TimeEntry | null>>;
  findActiveByUserId(userId: string): Promise<Result<TimeEntry | null>>;
  findByUserIdAndDate(userId: string, date: Date): Promise<Result<TimeEntry[]>>;
  findByUserIdAndMonth(userId: string, month: number, year: number, companyId?: string): Promise<Result<TimeEntry[]>>;
}
