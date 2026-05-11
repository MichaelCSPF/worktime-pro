import { createClient } from '@/shared/infrastructure/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return GET(request);
}

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Usar a URL base da requisição para redirecionar com segurança
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`, {
    status: 302,
  });
}
