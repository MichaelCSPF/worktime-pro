-- ============================================================================
-- Migration 004: Tabela f_usuario_empresa (Vínculo)
-- ============================================================================
-- NEGÓCIO:
--   Relacionamento N:N entre usuário e empresa.
--   Cada vínculo possui salário/hora, jornada e tempo de almoço específicos.
--   Permite que um usuário trabalhe em múltiplas empresas com regras diferentes.
--
-- SEGURANÇA:
--   - RLS: acesso apenas aos próprios vínculos
--   - UNIQUE(usuario_id, empresa_id): impede duplicatas
--   - CHECK: salario_hora >= 0, jornada > 0, almoco >= 0
--   - FK CASCADE: se empresa é deletada, vínculos são removidos
--
-- RELACIONAMENTOS:
--   - N:1 com d_usuarios
--   - N:1 com d_empresas
--   - 1:N com f_ponto (cada vínculo tem marcações)
--
-- ÍNDICES:
--   - PK (id) — automático
--   - UNIQUE(usuario_id, empresa_id) — impede duplicata
--   - empresa_id — para JOINs inversos
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.f_usuario_empresa (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        UUID    NOT NULL REFERENCES public.d_usuarios(id) ON DELETE CASCADE,
  empresa_id        UUID    NOT NULL REFERENCES public.d_empresas(id) ON DELETE CASCADE,
  salario_hora      NUMERIC(10,2) NOT NULL CHECK (salario_hora >= 0),
  jornada_minutos   INTEGER       NOT NULL CHECK (jornada_minutos > 0 AND jornada_minutos <= 1440),
  almoco_minutos    INTEGER       NOT NULL DEFAULT 60 CHECK (almoco_minutos >= 0 AND almoco_minutos <= 480),
  ativo             BOOLEAN       NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- Impede duplicata de vínculo
  CONSTRAINT uq_usuario_empresa UNIQUE (usuario_id, empresa_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_f_usuario_empresa_usuario_id
  ON public.f_usuario_empresa (usuario_id);

CREATE INDEX IF NOT EXISTS idx_f_usuario_empresa_empresa_id
  ON public.f_usuario_empresa (empresa_id);

CREATE INDEX IF NOT EXISTS idx_f_usuario_empresa_ativo
  ON public.f_usuario_empresa (usuario_id, ativo)
  WHERE ativo = true;

-- Trigger updated_at
CREATE TRIGGER trg_f_usuario_empresa_updated_at
  BEFORE UPDATE ON public.f_usuario_empresa
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.f_usuario_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f_usuario_empresa FORCE ROW LEVEL SECURITY;

-- SELECT: apenas vínculos do próprio usuário
CREATE POLICY "f_usuario_empresa_select_own"
  ON public.f_usuario_empresa FOR SELECT
  USING (auth.uid() = usuario_id);

-- INSERT: apenas para o próprio usuário
CREATE POLICY "f_usuario_empresa_insert_own"
  ON public.f_usuario_empresa FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- UPDATE: apenas vínculos do próprio usuário
CREATE POLICY "f_usuario_empresa_update_own"
  ON public.f_usuario_empresa FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- DELETE: apenas vínculos do próprio usuário
CREATE POLICY "f_usuario_empresa_delete_own"
  ON public.f_usuario_empresa FOR DELETE
  USING (auth.uid() = usuario_id);

-- Comentários
COMMENT ON TABLE public.f_usuario_empresa
IS 'Vínculo entre usuário e empresa. Armazena salário, jornada e almoço específicos por empresa. RLS: acesso apenas aos próprios vínculos.';

COMMENT ON COLUMN public.f_usuario_empresa.jornada_minutos
IS 'Jornada diária em minutos (ex: 480 = 8 horas). Max 1440 (24h).';

COMMENT ON COLUMN public.f_usuario_empresa.almoco_minutos
IS 'Tempo de almoço em minutos (ex: 60 = 1 hora). Default 60. Max 480 (8h).';
