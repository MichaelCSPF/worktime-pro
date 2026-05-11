-- ============================================================================
-- Migration 010: Ajuste RLS Empresas (Soft Delete Visibility)
-- ============================================================================
-- Objetivo: Permitir que o dono veja suas empresas deletadas no histórico.
-- ============================================================================

-- 1. Remover política antiga
DROP POLICY IF EXISTS "d_empresas_select_own" ON public.d_empresas;

-- 2. Criar nova política sem o filtro de deleted_at IS NULL
-- O filtro deleted_at continuará sendo usado nas queries de aplicação (repositories)
-- para listagem ativa, mas o banco permitirá a leitura se o ID for solicitado.
CREATE POLICY "d_empresas_select_own"
  ON public.d_empresas FOR SELECT
  USING (auth.uid() = usuario_id);

-- 3. Garantir que UPDATE e DELETE continuem respeitando soft delete
-- (Não alteramos a policy de UPDATE pois ela já bloqueia edições em registros deletados)
