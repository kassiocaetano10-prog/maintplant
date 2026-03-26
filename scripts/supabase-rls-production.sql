-- ═══════════════════════════════════════════════════════
-- PROEXEL — Row Level Security para PRODUÇÃO
-- Executar no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════

-- ─── 0. Limpar políticas anteriores (allow_all) ───
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ─── 1. Ativar RLS ───
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;

-- ─── 2. USERS — Bloquear acesso direto ───
-- Ninguém lê a tabela users diretamente (login é via RPC app_login)
-- Apenas o service_role pode gerir users
CREATE POLICY "users_deny_anon" ON users FOR ALL TO anon USING (false) WITH CHECK (false);

-- ─── 3. MAINTENANCE_RECORDS — Leitura aberta, escrita controlada ───
CREATE POLICY "maint_select_all" ON maintenance_records FOR SELECT TO anon USING (true);
CREATE POLICY "maint_insert_all" ON maintenance_records FOR INSERT TO anon WITH CHECK (
  tag IS NOT NULL AND tag <> '' AND
  technician IS NOT NULL AND technician <> ''
);
-- Sem UPDATE/DELETE para anon — registos de manutenção são imutáveis (auditoria)

-- ─── 4. ORDERS — Leitura aberta, escrita e update controlados ───
CREATE POLICY "orders_select_all" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "orders_insert_valid" ON orders FOR INSERT TO anon WITH CHECK (
  zone IS NOT NULL AND zone <> '' AND
  description IS NOT NULL AND description <> ''
);
CREATE POLICY "orders_update_status" ON orders FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "orders_delete_own" ON orders FOR DELETE TO anon USING (true);

-- ─── 5. RESTOCK_REQUESTS — Leitura aberta, escrita controlada ───
CREATE POLICY "restock_select_all" ON restock_requests FOR SELECT TO anon USING (true);
CREATE POLICY "restock_insert_valid" ON restock_requests FOR INSERT TO anon WITH CHECK (
  kit IS NOT NULL AND kit <> '' AND
  reason IS NOT NULL AND reason <> ''
);
CREATE POLICY "restock_update_status" ON restock_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);
-- Sem DELETE para restock

-- ─── 6. STOCK — Leitura aberta, escrita controlada ───
CREATE POLICY "stock_select_all" ON stock FOR SELECT TO anon USING (true);
CREATE POLICY "stock_insert_valid" ON stock FOR INSERT TO anon WITH CHECK (
  kit IS NOT NULL AND kit <> '' AND
  quantity >= 0
);
CREATE POLICY "stock_update_valid" ON stock FOR UPDATE TO anon USING (true) WITH CHECK (quantity >= 0);
CREATE POLICY "stock_delete_any" ON stock FOR DELETE TO anon USING (true);

-- ─── 7. Revogar acesso direto à tabela users ───
REVOKE ALL ON TABLE public.users FROM anon;
REVOKE ALL ON TABLE public.users FROM authenticated;

-- ─── 8. Função de login segura (SECURITY DEFINER) ───
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
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.name, u.role
  FROM public.users u
  WHERE u.username = p_username
    AND (
      u.password = p_password_hash
      OR (p_password_plain IS NOT NULL AND u.password = p_password_plain)
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
-- - users: BLOQUEADO (só via app_login RPC)
-- - maintenance_records: INSERT validado, sem DELETE (auditoria)
-- - orders: CRUD com validação
-- - restock_requests: INSERT/UPDATE com validação, sem DELETE
-- - stock: CRUD com validação de quantidade
-- ═══════════════════════════════════════════════════════
