import { describe, it, expect } from 'vitest';
import { PayrollCalculator } from '../PayrollCalculator';

describe('PayrollCalculator', () => {
  const hourlyRate = 60; // R$ 60,00/h = R$ 1,00/min
  const dailyTargetMinutes = 480; // 8h

  it('deve calcular jornada normal sem extras', () => {
    const result = PayrollCalculator.calculate({
      entry: new Date('2026-05-11T08:00:00'),
      exit: new Date('2026-05-11T17:00:00'),
      lunchStart: new Date('2026-05-11T12:00:00'),
      lunchEnd: new Date('2026-05-11T13:00:00'),
      dailyTargetMinutes,
      hourlyRate,
      timezone: 'America/Sao_Paulo',
    });

    expect(result.normalMinutes).toBe(480);
    expect(result.overtime50Minutes).toBe(0);
    expect(result.totalValue).toBe(480); // 480 min * 1,00
  });

  it('deve calcular horas extras 50% em dia útil', () => {
    const result = PayrollCalculator.calculate({
      entry: new Date('2026-05-11T08:00:00'),
      exit: new Date('2026-05-11T19:00:00'),
      lunchStart: new Date('2026-05-11T12:00:00'),
      lunchEnd: new Date('2026-05-11T13:00:00'),
      dailyTargetMinutes,
      hourlyRate,
      timezone: 'America/Sao_Paulo',
    });

    expect(result.normalMinutes).toBe(480);
    expect(result.overtime50Minutes).toBe(120); // 2h extra
    expect(result.totalValue).toBe(480 + (120 * 1.5)); // 480 + 180 = 660
  });

  it('deve calcular 100% de extra no domingo (quando flag manual ativa)', () => {
    const result = PayrollCalculator.calculate({
      entry: new Date('2026-05-10T08:00:00'),
      exit: new Date('2026-05-10T12:00:00'),
      dailyTargetMinutes,
      hourlyRate,
      timezone: 'America/Sao_Paulo',
      isOvertime100Manual: true,
    });

    expect(result.normalMinutes).toBe(0);
    expect(result.overtime100Minutes).toBe(240); // 4h
    expect(result.totalValue).toBe(240 * 2.0); // 480
  });

  it('deve calcular adicional noturno corretamente (22h às 05h) usando timezone', () => {
    // 21h às 23h = 2h total, sendo 1h noturna (22h-23h)
    const result = PayrollCalculator.calculate({
      entry: new Date('2026-05-11T21:00:00Z'), // UTC
      exit: new Date('2026-05-11T23:00:00Z'), // UTC
      dailyTargetMinutes,
      hourlyRate,
      timezone: 'UTC',
    });

    expect(result.nightShiftMinutes).toBe(60);
    expect(result.totalValue).toBe(132); // 120 + (60 * 0.2)
  });

  it('deve respeitar a flag manual de 100% mesmo em dia útil', () => {
    const result = PayrollCalculator.calculate({
      entry: new Date('2026-05-11T08:00:00'),
      exit: new Date('2026-05-11T10:00:00'),
      dailyTargetMinutes,
      hourlyRate,
      timezone: 'America/Sao_Paulo',
      isOvertime100Manual: true,
    });

    expect(result.normalMinutes).toBe(0);
    expect(result.overtime100Minutes).toBe(120);
    expect(result.totalValue).toBe(240); // 120 * 2.0
  });
});
