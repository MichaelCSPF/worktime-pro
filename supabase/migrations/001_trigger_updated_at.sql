-- ============================================================================
-- Migration 001: Função auxiliar updated_at
-- ============================================================================
-- Propósito: Trigger reutilizável para auto-atualizar updated_at.
-- Segurança: SECURITY DEFINER — executa com privilégio do criador,
--            não do caller. Isso impede manipulação.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Comentário para documentação
COMMENT ON FUNCTION public.handle_updated_at()
IS 'Trigger function: auto-atualiza updated_at em cada UPDATE. SECURITY DEFINER para segurança.';
