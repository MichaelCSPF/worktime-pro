/**
 * Auth Server Actions
 *
 * Todas as operações de auth executam no SERVER.
 * O frontend apenas chama estas funções — nunca acessa Supabase diretamente.
 *
 * SEGURANÇA:
 * - Validação Zod server-side (não confia no frontend)
 * - Supabase Auth gerencia JWT e sessions
 * - Cookies HTTP-only (não acessíveis por JS)
 * - Rate limiting delegado ao Supabase Auth
 */

'use server';

import { createClient } from '@/shared/infrastructure/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { SupabaseUserRepository } from '../infrastructure/SupabaseUserRepository';

import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/modules/auth/domain/validation';

const userRepo = new SupabaseUserRepository();

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

/**
 * Login — Email + Senha
 */
export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  // Validação server-side (NUNCA confiar no frontend)
  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Mensagem genérica para não revelar se o email existe
    return { success: false, error: 'Email ou senha incorretos' };
  }

  redirect('/');
}

/**
 * Cadastro — Nome + Email + Senha
 */
export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    nome: formData.get('nome'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nome: parsed.data.nome,
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: 'Este email já está cadastrado' };
    }
    return { success: false, error: 'Erro ao criar conta. Tente novamente.' };
  }

  return { success: true };
}

/**
 * Logout
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Recuperar senha — envia email
 */
export async function resetPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const rawData = { email: formData.get('email') };

  const parsed = resetPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${baseUrl}/atualizar-senha`,
  });

  if (error) {
    // Sempre retorna sucesso para não revelar se email existe
    return { success: true };
  }

  return { success: true };
}

/**
 * Buscar Perfil do Usuário
 */
export async function getProfileAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const result = await userRepo.findById(user.id);
  return result.isSuccess() ? result.getValue() : null;
}

/**
 * Atualizar Dados do Perfil
 */
export async function updateProfileAction(data: { 
  nome: string; 
  telefone?: string; 
  cpf?: string; 
  enderecoPessoal?: string; 
}): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Não autorizado' };

  const result = await userRepo.update(user.id, data);

  
  if (result.isFailure()) {
    return { success: false, error: result.getError() || 'Erro ao atualizar perfil' };
  }

  revalidatePath('/perfil');
  return { success: true };
}

/**
 * Alterar Senha
 */
export async function changePasswordAction(password: string): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

