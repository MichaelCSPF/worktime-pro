-- ============================================================================
-- Migration 011: Novos campos de perfil
-- ============================================================================
-- Objetivo: Adicionar CPF e Endereço Pessoal para completar o perfil.
-- ============================================================================

ALTER TABLE public.d_usuarios
  ADD COLUMN IF NOT EXISTS cpf TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS endereco_pessoal TEXT;

-- Índice para busca rápida por CPF (se necessário no futuro)
CREATE INDEX IF NOT EXISTS idx_d_usuarios_cpf ON public.d_usuarios(cpf);

COMMENT ON COLUMN public.d_usuarios.cpf IS 'CPF do usuário.';
COMMENT ON COLUMN public.d_usuarios.endereco_pessoal IS 'Endereço completo do usuário.';
