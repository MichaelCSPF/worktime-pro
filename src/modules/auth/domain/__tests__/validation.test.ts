/**
 * Auth Validation — Testes unitários
 */

import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from '@/modules/auth/domain/validation';

describe('loginSchema', () => {
  it('deve validar login válido', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'invalid',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar senha curta', () => {
    const result = loginSchema.safeParse({
      email: 'user@test.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('deve normalizar email (lowercase + trim)', () => {
    const result = loginSchema.safeParse({
      email: '  USER@Test.COM  ',
      password: '123456',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@test.com');
    }
  });
});

describe('registerSchema', () => {
  it('deve validar cadastro válido', () => {
    const result = registerSchema.safeParse({
      nome: 'João Silva',
      email: 'joao@test.com',
      password: '123456',
      confirmPassword: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar nome curto', () => {
    const result = registerSchema.safeParse({
      nome: 'A',
      email: 'joao@test.com',
      password: '123456',
      confirmPassword: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar senhas diferentes', () => {
    const result = registerSchema.safeParse({
      nome: 'João Silva',
      email: 'joao@test.com',
      password: '123456',
      confirmPassword: '654321',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Senhas não coincidem');
    }
  });

  it('deve trimmar nome', () => {
    const result = registerSchema.safeParse({
      nome: '  João Silva  ',
      email: 'joao@test.com',
      password: '123456',
      confirmPassword: '123456',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nome).toBe('João Silva');
    }
  });
});

describe('resetPasswordSchema', () => {
  it('deve validar email válido', () => {
    const result = resetPasswordSchema.safeParse({ email: 'user@test.com' });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar email vazio', () => {
    const result = resetPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });
});
