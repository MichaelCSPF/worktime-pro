/**
 * Supabase Browser Client
 *
 * Para uso em Client Components (browser).
 * Cria uma instância do Supabase configurada para o browser.
 *
 * SEGURANÇA: Utiliza apenas ANON_KEY (chave pública).
 * A proteção real é feita via RLS no PostgreSQL.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
