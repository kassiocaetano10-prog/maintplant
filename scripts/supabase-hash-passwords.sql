-- ═══════════════════════════════════════════════════════
-- PROEXEL — Migrar passwords para SHA-256 hash
-- Executar no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════

-- 1. Ativar extensão pgcrypto (necessária para SHA-256)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Hashear todas as passwords em plain text
-- SHA-256 com salt '_proexel_salt_2026' (mesmo salt do frontend)
UPDATE users SET password = encode(
  digest(password || '_proexel_salt_2026', 'sha256'), 'hex'
)
WHERE length(password) < 64; -- plain text passwords são curtas, SHA-256 hex = 64 chars

-- 3. Actualizar a função de login para usar APENAS hash
CREATE OR REPLACE FUNCTION public.app_login(
  p_username TEXT,
  p_password_hash TEXT,
  p_password_plain TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, username TEXT, name TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plain_hash TEXT;
BEGIN
  -- Se o cliente enviou plain text, hashear no servidor para comparar
  IF p_password_plain IS NOT NULL THEN
    v_plain_hash := encode(digest(p_password_plain || '_proexel_salt_2026', 'sha256'), 'hex');
  END IF;

  RETURN QUERY
  SELECT u.id, u.username, u.name, u.role
  FROM public.users u
  WHERE u.username = p_username
    AND (
      u.password = p_password_hash
      OR (v_plain_hash IS NOT NULL AND u.password = v_plain_hash)
    )
    AND COALESCE(u.active, true) = true
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.app_login(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.app_login(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.app_login(TEXT, TEXT, TEXT) TO authenticated;

-- ═══════════════════════════════════════════════════════
-- RESULTADO:
-- - Passwords na BD são agora SHA-256 hashes
-- - Função aceita hash OU plain text (hasheia no servidor)
-- - Nunca mais armazena plain text
-- ═══════════════════════════════════════════════════════
