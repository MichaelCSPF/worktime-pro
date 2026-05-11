import { describe, it, expect } from 'vitest';
import { TimeEntry } from '../TimeEntry';

describe('TimeEntry Entity', () => {
  const userCompanyId = 'comp-123';
  const entryDate = new Date('2026-05-10T08:00:00Z');

  it('deve criar uma marcação válida', () => {
    const result = TimeEntry.create({
      userCompanyId,
      entry: entryDate,
      timezone: 'America/Sao_Paulo',
    });

    expect(result.isSuccess()).toBe(true);
    const entry = result.getValue();
    expect(entry.userCompanyId).toBe(userCompanyId);
    expect(entry.isOvertime100).toBe(false);
    expect(entry.source).toBe('app');
  });

  it('deve permitir alterar a flag de 100% extra', () => {
    const entry = TimeEntry.create({ userCompanyId, entry: entryDate }).getValue();
    entry.setOvertime100(true);
    expect(entry.isOvertime100).toBe(true);
  });

  it('não deve permitir bater saída antes da entrada', () => {
    const entry = TimeEntry.create({ userCompanyId, entry: entryDate }).getValue();
    const exitDate = new Date(entryDate.getTime() - 1000); // 1s antes
    
    const result = entry.clockOut(exitDate);
    expect(result.isFailure()).toBe(true);
    expect(result.getError()?.message).toContain('Saída deve ser após a entrada');
  });

  it('deve validar fluxo de almoço corretamente', () => {
    const entry = TimeEntry.create({ userCompanyId, entry: entryDate }).getValue();
    
    // Iniciar almoço
    const lunchStart = new Date(entryDate.getTime() + 4 * 60 * 60 * 1000); // +4h
    entry.startLunch(lunchStart);
    expect(entry.lunchStart).toEqual(lunchStart);

    // Tentar bater saída sem fechar almoço
    const result = entry.clockOut(new Date(lunchStart.getTime() + 1000));
    expect(result.isFailure()).toBe(true);
    expect(result.getError()?.message).toContain('Finalize o almoço antes de bater a saída');

    // Fechar almoço
    const lunchEnd = new Date(lunchStart.getTime() + 1 * 60 * 60 * 1000); // +1h
    entry.endLunch(lunchEnd);
    expect(entry.lunchEnd).toEqual(lunchEnd);

    // Agora sim bater saída
    const clockOutResult = entry.clockOut(new Date(lunchEnd.getTime() + 1000));
    expect(clockOutResult.isSuccess()).toBe(true);
  });

  it('deve aceitar fonte manual', () => {
    const entry = TimeEntry.create({ 
      userCompanyId, 
      entry: entryDate,
      source: 'manual' 
    }).getValue();
    
    expect(entry.source).toBe('manual');
  });
});
