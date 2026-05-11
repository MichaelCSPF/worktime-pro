-- ============================================================================
-- Migration 006: Tabela f_calculo_horas
-- ============================================================================
-- NEGÓCIO: Armazena cálculos de horas normais, extras e adicional noturno.
-- SEGURANÇA: RLS via chain (ponto → usuario_empresa → usuario).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.f_calculo_horas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ponto_id          UUID UNIQUE NOT NULL REFERENCES public.f_ponto(id) ON DELETE CASCADE,
  horas_normais     NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (horas_normais >= 0),
  horas_extras_50   NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (horas_extras_50 >= 0),
  horas_extras_100  NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (horas_extras_100 >= 0),
  adicional_noturno NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (adicional_noturno >= 0),
  valor_total       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_f_calculo_ponto ON public.f_calculo_horas (ponto_id);

CREATE TRIGGER trg_f_calculo_updated_at BEFORE UPDATE ON public.f_calculo_horas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.f_calculo_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f_calculo_horas FORCE ROW LEVEL SECURITY;

CREATE POLICY "f_calculo_select_own" ON public.f_calculo_horas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.f_ponto p
    JOIN public.f_usuario_empresa ue ON ue.id = p.usuario_empresa_id
    WHERE p.id = f_calculo_horas.ponto_id AND ue.usuario_id = auth.uid()
  ));

CREATE POLICY "f_calculo_insert_own" ON public.f_calculo_horas FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.f_ponto p
    JOIN public.f_usuario_empresa ue ON ue.id = p.usuario_empresa_id
    WHERE p.id = f_calculo_horas.ponto_id AND ue.usuario_id = auth.uid()
  ));

CREATE POLICY "f_calculo_update_own" ON public.f_calculo_horas FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.f_ponto p
    JOIN public.f_usuario_empresa ue ON ue.id = p.usuario_empresa_id
    WHERE p.id = f_calculo_horas.ponto_id AND ue.usuario_id = auth.uid()
  ));
