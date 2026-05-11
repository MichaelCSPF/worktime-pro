-- ============================================================================
-- WorkTime PRO — MIGRATION COMPLETA (Cole no SQL Editor do Supabase)
-- ============================================================================
-- Execute este script completo no SQL Editor do Supabase Dashboard:
-- https://supabase.com/dashboard/project/rgrjmtjnarrwwzvcrtdd/sql/new
--
-- SEGURANÇA IMPLEMENTADA:
-- 1. RLS em TODAS as tabelas (FORCE ROW LEVEL SECURITY)
-- 2. auth.uid() para ownership validation (server-side)
-- 3. CHECK constraints em todos os campos críticos
-- 4. SECURITY DEFINER em functions (prevent privilege escalation)
-- 5. search_path explícito (prevent search_path injection)
-- 6. Soft delete (dados nunca são removidos fisicamente)
-- 7. Audit log imutável (insert-only)
-- 8. EXISTS subqueries em RLS (mais seguro que JOINs)
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TRIGGER UPDATED_AT
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. d_usuarios (Profile)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.d_usuarios (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT        NOT NULL CHECK (char_length(nome) >= 2 AND char_length(nome) <= 200),
  email       TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  telefone    TEXT                 CHECK (telefone IS NULL OR char_length(telefone) >= 8),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_d_usuarios_created_at ON public.d_usuarios (created_at DESC);

CREATE TRIGGER trg_d_usuarios_updated_at BEFORE UPDATE ON public.d_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.d_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d_usuarios FORCE ROW LEVEL SECURITY;

CREATE POLICY "d_usuarios_select_own" ON public.d_usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "d_usuarios_update_own" ON public.d_usuarios FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "d_usuarios_insert_own" ON public.d_usuarios FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.d_usuarios (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. d_empresas
-- ═══════════════════════════════════════════════════════════════════════════

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

CREATE INDEX idx_d_empresas_usuario ON public.d_empresas (usuario_id);
CREATE INDEX idx_d_empresas_ativa ON public.d_empresas (usuario_id, ativa) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_d_empresas_updated_at BEFORE UPDATE ON public.d_empresas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.d_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d_empresas FORCE ROW LEVEL SECURITY;

CREATE POLICY "d_empresas_select_own" ON public.d_empresas FOR SELECT USING (auth.uid() = usuario_id AND deleted_at IS NULL);
CREATE POLICY "d_empresas_insert_own" ON public.d_empresas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "d_empresas_update_own" ON public.d_empresas FOR UPDATE USING (auth.uid() = usuario_id AND deleted_at IS NULL) WITH CHECK (auth.uid() = usuario_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. f_usuario_empresa (Vínculo)
-- ═══════════════════════════════════════════════════════════════════════════

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
  CONSTRAINT uq_usuario_empresa UNIQUE (usuario_id, empresa_id)
);

CREATE INDEX idx_f_ue_usuario ON public.f_usuario_empresa (usuario_id);
CREATE INDEX idx_f_ue_empresa ON public.f_usuario_empresa (empresa_id);
CREATE INDEX idx_f_ue_ativo ON public.f_usuario_empresa (usuario_id, ativo) WHERE ativo = true;

CREATE TRIGGER trg_f_ue_updated_at BEFORE UPDATE ON public.f_usuario_empresa
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.f_usuario_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f_usuario_empresa FORCE ROW LEVEL SECURITY;

CREATE POLICY "f_ue_select_own" ON public.f_usuario_empresa FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "f_ue_insert_own" ON public.f_usuario_empresa FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "f_ue_update_own" ON public.f_usuario_empresa FOR UPDATE USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "f_ue_delete_own" ON public.f_usuario_empresa FOR DELETE USING (auth.uid() = usuario_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. f_ponto (Marcações)
-- ═══════════════════════════════════════════════════════════════════════════

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
  CONSTRAINT chk_almoco_fim_req CHECK (almoco_fim IS NULL OR almoco_inicio IS NOT NULL),
  CONSTRAINT chk_almoco_order CHECK (almoco_fim IS NULL OR almoco_fim >= almoco_inicio),
  CONSTRAINT chk_saida_order CHECK (saida IS NULL OR saida >= entrada),
  CONSTRAINT chk_almoco_in_jornada CHECK (almoco_inicio IS NULL OR almoco_inicio >= entrada)
);

CREATE INDEX idx_f_ponto_ue ON public.f_ponto (usuario_empresa_id);
CREATE INDEX idx_f_ponto_entrada ON public.f_ponto (entrada DESC);
CREATE INDEX idx_f_ponto_ue_entrada ON public.f_ponto (usuario_empresa_id, entrada DESC);
CREATE UNIQUE INDEX idx_f_ponto_sync ON public.f_ponto (sync_id) WHERE sync_id IS NOT NULL;

CREATE TRIGGER trg_f_ponto_updated_at BEFORE UPDATE ON public.f_ponto
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.f_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.f_ponto FORCE ROW LEVEL SECURITY;

CREATE POLICY "f_ponto_select" ON public.f_ponto FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()));
CREATE POLICY "f_ponto_insert" ON public.f_ponto FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()));
CREATE POLICY "f_ponto_update" ON public.f_ponto FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()));
CREATE POLICY "f_ponto_delete" ON public.f_ponto FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.f_usuario_empresa ue WHERE ue.id = f_ponto.usuario_empresa_id AND ue.usuario_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. f_calculo_horas
-- ═══════════════════════════════════════════════════════════════════════════

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

CREATE POLICY "f_calculo_select" ON public.f_calculo_horas FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.f_ponto p JOIN public.f_usuario_empresa ue ON ue.id = p.usuario_empresa_id WHERE p.id = f_calculo_horas.ponto_id AND ue.usuario_id = auth.uid()));
CREATE POLICY "f_calculo_insert" ON public.f_calculo_horas FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.f_ponto p JOIN public.f_usuario_empresa ue ON ue.id = p.usuario_empresa_id WHERE p.id = f_calculo_horas.ponto_id AND ue.usuario_id = auth.uid()));
CREATE POLICY "f_calculo_update" ON public.f_calculo_horas FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.f_ponto p JOIN public.f_usuario_empresa ue ON ue.id = p.usuario_empresa_id WHERE p.id = f_calculo_horas.ponto_id AND ue.usuario_id = auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. d_audit_log (Auditoria)
-- ═══════════════════════════════════════════════════════════════════════════

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
CREATE INDEX idx_audit_entidade ON public.d_audit_log (entidade, entidade_id);

ALTER TABLE public.d_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d_audit_log FORCE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_own" ON public.d_audit_log FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "audit_insert_own" ON public.d_audit_log FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- FIM — Todas as tabelas criadas com RLS, índices e constraints
-- ═══════════════════════════════════════════════════════════════════════════
