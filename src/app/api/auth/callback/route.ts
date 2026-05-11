/**
 * Auth Callback Route
 *
 * Supabase redireciona para esta rota após:
 * - Confirmação de email
 * - Login via magic link
 * - Reset de senha
 *
 * Troca o code por uma session e redireciona.
 */

import { createClient } from '@/shared/infrastructure/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Se não tem code ou houve erro, redireciona para login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
