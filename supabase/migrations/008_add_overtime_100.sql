-- ============================================================================
-- Migration 008: Adicionar is_overtime_100 à tabela f_ponto
-- ============================================================================

ALTER TABLE public.f_ponto 
ADD COLUMN IF NOT EXISTS is_overtime_100 BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.f_ponto.is_overtime_100 IS 'Flag manual para indicar que a jornada deve ser calculada a 100% (ex: feriado/domingo clicado pelo usuário)';
