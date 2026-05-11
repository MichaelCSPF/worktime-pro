import { describe, it, expect, vi } from 'vitest';
import { ClockOutUseCase } from '../ClockOutUseCase';
import { ITimeEntryRepository } from '../../domain/ITimeEntryRepository';
import { IAuditRepository } from '@/modules/audit/domain/IAuditRepository';
import { ICompanyRepository } from '@/modules/company/domain/ICompanyRepository';
import { Result } from '@/shared/core/Result';
import { TimeEntry } from '../../domain/TimeEntry';

describe('ClockOutUseCase - Business Rules', () => {
  const mockRepo = {
    findActiveByUserId: vi.fn(),
    update: vi.fn(),
  } as unknown as ITimeEntryRepository;

  const mockAudit = {
    save: vi.fn(),
  } as unknown as IAuditRepository;

  const mockCompanyRepo = {
    findById: vi.fn(),
  } as unknown as ICompanyRepository;

  const useCase = new ClockOutUseCase(mockRepo, mockAudit, mockCompanyRepo);

  it('should fail if exitTime is more than 7 days ago', async () => {
    const entry = TimeEntry.create({
      userCompanyId: 'company-1',
      entry: new Date(),
      timezone: 'America/Sao_Paulo',
    }).getValue();

    vi.mocked(mockRepo.findActiveByUserId).mockResolvedValue(Result.ok(entry));

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const result = await useCase.execute({
      userId: 'user-1',
      exitTime: tenDaysAgo
    });

    expect(result.isFailure()).toBe(true);
    expect(result.getError()?.message).toContain('mais de 7 dias');
  });

  it('should succeed if exitTime is within 7 days', async () => {
    const entry = TimeEntry.create({
      userCompanyId: 'company-1',
      entry: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
      timezone: 'America/Sao_Paulo',
    }).getValue();

    vi.mocked(mockRepo.findActiveByUserId).mockResolvedValue(Result.ok(entry));
    vi.mocked(mockRepo.update).mockResolvedValue(Result.ok());

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await useCase.execute({
      userId: 'user-1',
      exitTime: twoDaysAgo
    });

    expect(result.isSuccess()).toBe(true);
  });
});
