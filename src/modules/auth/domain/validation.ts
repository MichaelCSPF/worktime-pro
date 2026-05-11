/**
 * Auth Validation Schemas — Zod
 *
 * Validação duplicada: frontend + server actions.
 * NUNCA confiar apenas no frontend.
 */

import { z } from 'zod';

// Helper: normaliza email antes de validar
const emailField = z
  .string()
  .min(1, 'Email é obrigatório')
  .max(255, 'Email muito longo')
  .transform((v) => v.toLowerCase().trim())
  .pipe(z.string().email('Email inválido'));

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(128, 'Senha muito longa'),
});

export const registerSchema = z
  .object({
    nome: z
      .string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(200, 'Nome muito longo')
      .transform((v) => v.trim()),
    email: emailField,
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(128, 'Senha muito longa'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z.object({
  email: emailField,
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(128, 'Senha muito longa'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
