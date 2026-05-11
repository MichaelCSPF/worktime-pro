-- ============================================================================
-- Migration 007: Tabela d_audit_log (Auditoria)
-- ============================================================================
-- NEGÓCIO: Log de auditoria para rastreabilidade de ações.
-- SEGURANÇA: Insert-only para o usuário (não pode editar/deletar logs).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.d_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  UUID        NOT NULL REFERENCES public.d_usuarios(id) ON DELETE CASCADE,
  acao        TEXT        NOT NULL CHECK (char_length(acao) BETWEEN 1 AND 100),
  entidade    TEXT        NOT NULL CHECK (char_length(entidade) BETWEEN 1 AND 100),
  entidade_id UUID,
  detalhes    JSONB,
  ip_address  INET,
  user_agent  TEXT        CHECK (user_agent IS NULL OR char_length(user_agent) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_usuario ON public.d_audit_log (usuario_id);
CREATE INDEX idx_audit_created ON public.d_audit_log (created_at DESC);
CREATE INDEX idx_audit_acao ON public.d_audit_log (acao);
CREATE INDEX idx_audit_entidade ON public.d_audit_log (entidade, entidade_id);

ALTER TABLE public.d_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d_audit_log FORCE ROW LEVEL SECURITY;

-- Usuário pode VER seus próprios logs
CREATE POLICY "audit_select_own" ON public.d_audit_log FOR SELECT
  USING (auth.uid() = usuario_id);

-- Usuário pode INSERIR seus próprios logs
CREATE POLICY "audit_insert_own" ON public.d_audit_log FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- SEM UPDATE/DELETE — logs são imutáveis
