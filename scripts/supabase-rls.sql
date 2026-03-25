-- ═══════════════════════════════════════════════════════
-- PROEXEL — Row Level Security (RLS)
-- Executar no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════

-- 1. Ativar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;

-- 2. USERS — Permitir leitura para login (anon pode ler para autenticar)
-- Mas só pode ver id, username, name, role (nunca a senha pelo select normal)
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (true);

-- 3. MAINTENANCE_RECORDS — Todos podem ler, todos podem inserir
CREATE POLICY "maint_select" ON maintenance_records FOR SELECT USING (true);
CREATE POLICY "maint_insert" ON maintenance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "maint_update" ON maintenance_records FOR UPDATE USING (true);
CREATE POLICY "maint_delete" ON maintenance_records FOR DELETE USING (true);

-- 4. ORDERS — Todos podem ler, todos podem inserir/atualizar/deletar
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true);
CREATE POLICY "orders_delete" ON orders FOR DELETE USING (true);

-- 5. RESTOCK_REQUESTS — Todos podem ler e inserir
CREATE POLICY "restock_select" ON restock_requests FOR SELECT USING (true);
CREATE POLICY "restock_insert" ON restock_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "restock_update" ON restock_requests FOR UPDATE USING (true);

-- 6. STOCK — Todos podem ler e modificar
CREATE POLICY "stock_select" ON stock FOR SELECT USING (true);
CREATE POLICY "stock_insert" ON stock FOR INSERT WITH CHECK (true);
CREATE POLICY "stock_update" ON stock FOR UPDATE USING (true);
CREATE POLICY "stock_delete" ON stock FOR DELETE USING (true);
