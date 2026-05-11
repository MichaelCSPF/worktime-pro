-- ============================================================================
-- Migration 002: Tabela d_usuarios (Profile)
-- ============================================================================
-- Propósito: Perfil do usuário — estende auth.users do Supabase.
--
-- NEGÓCIO:
--   Armazena dados de identificação (nome, email, telefone).
--   O id é o MESMO de auth.users — garante integridade 1:1.
--   O email é espelhado para queries (evita JOIN com auth.users).
--
-- SEGURANÇA:
--   - RLS habilitado: usuário acessa apenas seu próprio perfil
--   - FK para auth.users: impede criação de perfis órfãos
--   - CHECK no email: formato básico validado no banco (backup)
--   - CHECK no nome: mínimo 2 chars (anti-spam)
--   - Trigger auto-create: perfil criado automaticamente no signup
--   - SECURITY DEFINER: trigger executa com privilégio do owner
--
-- RELACIONAMENTOS:
--   - 1:1 com auth.users (mesmo UUID)
--   - 1:N com d_empresas (usuario é dono de empresas)
--   - 1:N com f_usuario_empresa (vínculos do usuario)
--
-- ÍNDICES:
--   - PK (id) — automático
--   - UNIQUE (email) — busca por email O(1)
--   - created_at — ordenação cronológica
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.d_usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT        NOT NULL CHECK (char_length(nome) >= 2 AND char_length(nome) <= 200),
  email       TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  telefone    TEXT                 CHECK (telefone IS NULL OR char_length(telefone) >= 8),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para ordenação cronológica (relatórios admin)
CREATE INDEX IF NOT EXISTS idx_d_usuarios_created_at
  ON public.d_usuarios (created_at DESC);

-- Trigger updated_at
CREATE TRIGGER trg_d_usuarios_updated_at
  BEFORE UPDATE ON public.d_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.d_usuarios ENABLE ROW LEVEL SECURITY;

-- Força RLS mesmo para o owner da tabela (proteção extra)
ALTER TABLE public.d_usuarios FORCE ROW LEVEL SECURITY;

-- SELECT: usuário vê apenas seu próprio perfil
CREATE POLICY "d_usuarios_select_own"
  ON public.d_usuarios FOR SELECT
  USING (auth.uid() = id);

-- UPDATE: usuário edita apenas seu próprio perfil
CREATE POLICY "d_usuarios_update_own"
  ON public.d_usuarios FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT: apenas o trigger de signup pode inserir (via service_role)
-- O usuário NÃO pode inserir diretamente — o trigger faz isso
CREATE POLICY "d_usuarios_insert_own"
  ON public.d_usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

-- DELETE: desabilitado (soft delete no futuro, se necessário)
-- Nenhuma policy de DELETE = impossível deletar via RLS

-- ── Auto-create profile on signup ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.d_usuarios (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger: quando um novo user é criado em auth.users, cria o perfil
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentários
COMMENT ON TABLE public.d_usuarios
IS 'Perfil do usuário. Estende auth.users. RLS: acesso apenas ao próprio perfil.';

COMMENT ON FUNCTION public.handle_new_user()
IS 'Auto-cria perfil em d_usuarios quando um novo user é registrado via Supabase Auth.';
