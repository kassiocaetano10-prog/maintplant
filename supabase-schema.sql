-- ==========================================
-- MAINTPLANT - Schema do Supabase
-- Copiar e colar no SQL Editor do Supabase
-- ==========================================

-- 1. Tabela de utilizadores
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'chefe', 'tecnico', 'compras')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de registos de manutencao
CREATE TABLE maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT now(),
  technician TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('preventiva', 'corretiva')),
  service TEXT,
  kit_changed BOOLEAN DEFAULT false,
  notes TEXT,
  signature TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de ordens de servico
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone TEXT,
  valve_tag TEXT,
  description TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pendente',
  created_by TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de pedidos de restock
CREATE TABLE restock_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kit TEXT,
  quantity INT DEFAULT 1,
  zone TEXT,
  valve_tag TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pendente',
  created_by TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de stock
CREATE TABLE stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kit TEXT NOT NULL,
  quantity INT DEFAULT 0,
  min_quantity INT DEFAULT 2,
  location TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Inserir utilizadores iniciais
-- ==========================================
INSERT INTO users (username, password, name, role) VALUES
  ('diretor', 'dir123', 'Diretor', 'admin'),
  ('compras', 'comp123', 'Equipe de Compras', 'compras'),
  ('chefe', 'chef123', 'Chefe de Equipe', 'chefe'),
  ('tecnico1', 'tec123', 'Técnico 1', 'tecnico'),
  ('tecnico2', 'tec123', 'Técnico 2', 'tecnico');

-- ==========================================
-- Politicas de seguranca (RLS)
-- ==========================================

-- Ativar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;

-- Permitir leitura e escrita para todos (anon key)
-- Em producao, usar Supabase Auth com JWT
CREATE POLICY "allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_maintenance" ON maintenance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_restock" ON restock_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_stock" ON stock FOR ALL USING (true) WITH CHECK (true);
