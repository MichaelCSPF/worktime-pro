-- ============================================================================
-- Migration 005: Tabela f_ponto (Marcações de Jornada)
-- ============================================================================
-- NEGÓCIO: Registro de entrada/almoço/saída com GPS e timezone.
-- SEGURANÇA: RLS via EXISTS subquery, CHECK constraints temporais/GPS.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.f_ponto (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_empresa_id    UUID        NOT NULL REFERENCES public.f_usuario_empresa(id) ON DELETE CASCADE,
  entrada               TIMESTAMPTZ NOT NULL,
  almoco_inicio         TIMESTAMPTZ,
  almoco_fim            TIMESTAMPTZ,
  saida                 TIMESTAMPTZ,
  latitude_entrada      NUMERIC(10,7) CHECK (latitude_entrada IS NULL OR (latitude_entrada >= -90 AND latitude_entrada <= 90)),
  longitude_entrada     NUMERIC(10,7) CHECK (longitude_entrada IS NULL OR (longitude_entrada >= -180 AND longitude_entrada <= 180)),
  precisao_gps_entrada  NUMERIC(8,2)  CHECK (precisao_gps_entrada IS NULL OR precisao_gps_entrada > 0),
  latitude_saida        NUMERIC(10,7) CHECK (latitude_saida IS NULL OR (latitude_saida >= -90 AND latitude_saida <= 90)),
  longitude_saida       NUMERIC(10,7) CHECK (longitude_saida IS NULL OR (longitude_saida >= -180 AND longitude_saida <= 180)),
  precisao_gps_saida    NUMERIC(8,2)  CHECK (precisao_gps_saida IS NULL OR precisao_gps_saida > 0),
  timezone              TEXT        NOT NULL DEFAULT 'America/Sao_Paulo' CHECK (char_length(timezone) BETWEEN 3 AND 50),
  origem                TEXT        NOT NULL DEFAULT 'app' CHECK (origem IN ('app', 'manual', 'offline_sync')),
  sync_id               UUID,
  observacao            TEXT        CHECK (observacao IS NULL OR char_length(observacao) <= 500),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_almoco_fim_requires_inicio CHECK (almoco_fim IS NULL OR almoco_inicio IS NOT NULL),
  CONSTRAINT chk_almoco_order CHECK (almoco_fim IS NULL OR almoco_fim >= almoco_inicio),
  CONSTRAINT chk_saida_after_entrada CHECK (saida IS NULL OR saida >= entrada),
  CONSTRAINT chk_almoco_within_jornada CHECK (almoco_inicio IS NULL OR almoco_inicio >= entrada)
);

CREATE INDEX idx_f_ponto_ue ON public.f_ponto (usuario_empresa_id);
CREATE INDEX idx_f_ponto_entrada ON public.f_ponto (entrada DESC);
CREATE INDEX idx_f_ponto_ue_entrada ON public.f_ponto (usuario_empresa_id, entrada DESC);
CREATE UNIQUE INDEX idx_f_ponto_sync_id ON public.f_ponto (sync_id) WHERE sync_id IS NOT NULL;

CREATE TRIGGER trg_f_ponto_updated_at BEFORE UPDATE ON public.f_ponto
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.f_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f_ponto FORCE ROW LEVEL SECURITY;

CREATE POLICY "f_ponto_select_own" ON public.f_ponto FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()));

CREATE POLICY "f_ponto_insert_own" ON public.f_ponto FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()));

CREATE POLICY "f_ponto_update_own" ON public.f_ponto FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()));

CREATE POLICY "f_ponto_delete_own" ON public.f_ponto FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()));
