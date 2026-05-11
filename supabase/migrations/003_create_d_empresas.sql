-- ============================================================================
-- Migration 003: Tabela d_empresas
-- ============================================================================
-- NEGÓCIO:
--   Representa empresas/empregadores cadastrados pelo usuário.
--   Cada empresa tem localização GPS (para validação de ponto).
--   O usuario_id é quem criou/é dono da empresa no sistema.
--
-- SEGURANÇA:
--   - RLS: acesso apenas a empresas do próprio usuario
--   - CHECK: latitude [-90,90], longitude [-180,180]
--   - CHECK: nome mínimo 2 chars
--   - FK: usuario_id referencia d_usuarios
--   - Soft delete via deleted_at (não remove dados)
--
-- RELACIONAMENTOS:
--   - N:1 com d_usuarios (usuario é dono)
--   - 1:N com f_usuario_empresa (empresa tem vínculos)
--
-- ÍNDICES:
--   - PK (id) — automático
--   - usuario_id — filtro principal (queries por owner)
--   - created_at — ordenação cronológica
--   - (usuario_id, deleted_at) — filtra empresas ativas do owner
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.d_empresas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID        NOT NULL REFERENCES public.d_usuarios(id) ON DELETE CASCADE,
  nome        TEXT        NOT NULL CHECK (char_length(nome) >= 2 AND char_length(nome) <= 200),
  endereco    TEXT,
  latitude    NUMERIC(10,7) CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude   NUMERIC(10,7) CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  raio_metros INTEGER     CHECK (raio_metros IS NULL OR (raio_metros > 0 AND raio_metros <= 50000)),
  ativa       BOOLEAN     NOT NULL DEFAULT true,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_d_empresas_usuario_id
  ON public.d_empresas (usuario_id);

CREATE INDEX IF NOT EXISTS idx_d_empresas_usuario_ativa
  ON public.d_empresas (usuario_id, ativa)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_d_empresas_created_at
  ON public.d_empresas (created_at DESC);

-- Trigger updated_at
CREATE TRIGGER trg_d_empresas_updated_at
  BEFORE UPDATE ON public.d_empresas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.d_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d_empresas FORCE ROW LEVEL SECURITY;

-- SELECT: apenas empresas do próprio usuário (não deletadas)
CREATE POLICY "d_empresas_select_own"
  ON public.d_empresas FOR SELECT
  USING (auth.uid() = usuario_id AND deleted_at IS NULL);

-- INSERT: apenas para o próprio usuário
CREATE POLICY "d_empresas_insert_own"
  ON public.d_empresas FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- UPDATE: apenas empresas do próprio usuário
CREATE POLICY "d_empresas_update_own"
  ON public.d_empresas FOR UPDATE
  USING (auth.uid() = usuario_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = usuario_id);

-- DELETE: soft delete only (via UPDATE de deleted_at)
-- Sem policy de DELETE real — dados nunca são removidos fisicamente

-- Comentários
COMMENT ON TABLE public.d_empresas
IS 'Empresas cadastradas pelo usuário. RLS: acesso apenas às próprias empresas. Soft delete via deleted_at.';

COMMENT ON COLUMN public.d_empresas.raio_metros
IS 'Raio em metros para validação de proximidade GPS ao registrar ponto.';
