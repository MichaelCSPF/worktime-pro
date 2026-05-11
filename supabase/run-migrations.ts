/**
 * Script para executar migrations no Supabase via REST API
 * Usa a SERVICE_ROLE_KEY para ter acesso admin ao banco
 *
 * USO: npx tsx supabase/run-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rgrjmtjnarrwwzvcrtdd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não definida. Configure no .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function runMigration(filePath: string): Promise<boolean> {
  const fileName = path.basename(filePath);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n📄 Executando: ${fileName}`);

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

  if (error) {
    // Tenta via fetch direto para o endpoint SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY!}`,
      },

      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      console.error(`❌ Erro em ${fileName}:`, error?.message || await response.text());
      return false;
    }
  }

  console.log(`✅ ${fileName} — OK`);
  return true;
}

async function main() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`🚀 Executando ${files.length} migrations...\n`);

  for (const file of files) {
    const success = await runMigration(path.join(migrationsDir, file));
    if (!success) {
      console.error(`\n⛔ Migration falhou. Abortando.`);
      process.exit(1);
    }
  }

  console.log(`\n✅ Todas as ${files.length} migrations executadas com sucesso!`);
}

main().catch(console.error);
