-- ==========================================================
-- PROEXEL - Security Hardening Phase 1 (compat mode)
-- Versão mais compatível para SQL Editor do Supabase.
-- ==========================================================

-- 0) Pré-check simples
DO $$
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RAISE EXCEPTION 'Tabela public.users não encontrada.';
  END IF;
END $$;

-- 1) Cria função RPC segura (sem dependências extras)
CREATE OR REPLACE FUNCTION public.app_login(
  p_username TEXT,
  p_password_hash TEXT,
  p_password_plain TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  name TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.name, u.role
  FROM public.users u
  WHERE u.username = p_username
    AND (
      u.password = p_password_hash
      OR (p_password_plain IS NOT NULL AND u.password = p_password_plain)
    )
    AND (
      -- Compatível com schemas que não tenham coluna "active"
      NOT EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
          AND c.table_name = 'users'
          AND c.column_name = 'active'
      )
      OR COALESCE(u.active, true) = true
    )
  LIMIT 1;
END;
$$;

-- 2) Permissões da função
REVOKE ALL ON FUNCTION public.app_login(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.app_login(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.app_login(TEXT, TEXT, TEXT) TO authenticated;

-- 3) Bloquear leitura/escrita direta em users para cliente
DO $$
BEGIN
  EXECUTE 'REVOKE ALL ON TABLE public.users FROM anon';
  EXECUTE 'REVOKE ALL ON TABLE public.users FROM authenticated';
EXCEPTION WHEN undefined_object THEN
  RAISE NOTICE 'Role anon/authenticated não encontrada, seguindo.';
END $$;

-- ==========================================================
-- Pós-aplicação:
-- 1) Testar login no app (diretor/chefe/compras/tecnico).
-- 2) Em produção: NEXT_PUBLIC_ENABLE_LOCAL_AUTH_FALLBACK=false
-- ==========================================================
