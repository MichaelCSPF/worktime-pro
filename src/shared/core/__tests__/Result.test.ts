/**
 * Result Pattern — Testes unitários
 */

import { describe, it, expect } from 'vitest';
import { Result } from '@/shared/core/Result';

describe('Result', () => {
  describe('ok', () => {
    it('deve criar resultado de sucesso com valor', () => {
      const result = Result.ok<string>('valor');

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.getValue()).toBe('valor');
    });

    it('deve criar resultado de sucesso sem valor', () => {
      const result = Result.ok<void>();

      expect(result.isSuccess()).toBe(true);
    });
  });

  describe('fail', () => {
    it('deve criar resultado de falha com erro', () => {
      const result = Result.fail<string>('erro');

      expect(result.isFailure()).toBe(true);
      expect(result.isSuccess()).toBe(false);
      expect(result.getError()).toBe('erro');
    });

    it('deve lançar ao tentar obter valor de falha', () => {
      const result = Result.fail<string>('erro');

      expect(() => result.getValue()).toThrow();
    });

    it('deve lançar ao tentar obter erro de sucesso', () => {
      const result = Result.ok<string>('valor');

      expect(() => result.getError()).toThrow();
    });
  });
});
