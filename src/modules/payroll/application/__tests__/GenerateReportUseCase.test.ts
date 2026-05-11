import { describe, it, expect, vi } from 'vitest';
import { GenerateReportUseCase } from '../GenerateReportUseCase';
import { ITimeEntryRepository } from '@/modules/time-tracking/domain/ITimeEntryRepository';
import { ICompanyRepository } from '@/modules/company/domain/ICompanyRepository';
import { Result } from '@/shared/core/Result';
import { TimeEntry } from '@/modules/time-tracking/domain/TimeEntry';

// Mock Supabase Server Client
vi.mock('@/shared/infrastructure/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: vi.fn() },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ 
      data: { nome: 'Michael' }, 
      error: null 
    }),
  })),
}));

describe('GenerateReportUseCase', () => {
  const mockTimeRepo = {
    findByUserIdAndMonth: vi.fn(),
  } as unknown as ITimeEntryRepository;

  const mockCompanyRepo = {} as unknown as ICompanyRepository;

  const useCase = new GenerateReportUseCase(mockTimeRepo, mockCompanyRepo);

  it('should format data correctly for the report', async () => {
    const entry = TimeEntry.create({
      userCompanyId: 'company-1',
      entry: new Date('2026-05-10T08:00:00Z'),
      exit: new Date('2026-05-10T17:00:00Z'), // 9h total
      timezone: 'UTC',
    }).getValue();

    vi.mocked(mockTimeRepo.findByUserIdAndMonth).mockResolvedValue(Result.ok([entry]));

    const result = await useCase.execute({
      userId: 'user-1',
      month: 5,
      year: 2026
    });

    expect(result.isSuccess()).toBe(true);
    const data = result.getValue();
    expect(data.userName).toBe('Michael');
    expect(data.rows.length).toBe(1);
    // Verificar se contém o formato de hora (HH:mm)
    expect(data.rows[0].entry).toMatch(/\d{2}:\d{2}/);
    expect(data.rows[0].exit).toMatch(/\d{2}:\d{2}/);
  });
});
