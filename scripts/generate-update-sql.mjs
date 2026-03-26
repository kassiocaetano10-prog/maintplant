import fs from 'fs';

const content = fs.readFileSync('src/data/plantData.js', 'utf8');
const jsonStr = content.match(/export const PLANT_DATA = (\{[\s\S]*?\});/)[1];
const data = JSON.parse(jsonStr);

let sql = `-- ==========================================
-- SCRIPT DE ATUALIZAÇÃO (RODAR NO SUPABASE)
-- Resolve o erro "relation already exists"
-- ==========================================

-- 1. Atualizar senhas dos utilizadores (Hashes)
UPDATE users SET password = '5aca47f8c551b5c4bd56aeebed20c143d30d989d4e9984a218ee3a739484f2f2' WHERE username = 'diretor';
UPDATE users SET password = 'dce1543a2d5ff71f77adf81c3b4d2a74a6c53febb158f391400f446c9998dca4' WHERE username = 'compras';
UPDATE users SET password = '2cb9f84a2ceef908f9e5a63d4ee19006d60639945f7c037e1987528ac8cc2e80' WHERE username = 'chefe';
UPDATE users SET password = 'dcb66c57136a1c6f6aac1328c5cb9557f7481f25c18bda31f07c78cda274481f' WHERE username IN ('tecnico1', 'tecnico2');

-- 2. Atualizar ou Criar a função de login
CREATE OR REPLACE FUNCTION public.app_login(
  p_username TEXT, p_password_hash TEXT, p_password_plain TEXT DEFAULT NULL
) RETURNS TABLE (id UUID, username TEXT, name TEXT, role TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.name, u.role FROM public.users u
  WHERE u.username = p_username
    AND (u.password = p_password_hash OR (p_password_plain IS NOT NULL AND u.password = p_password_plain))
    AND COALESCE(u.active, true) = true
  LIMIT 1;
END; $$;

REVOKE ALL ON FUNCTION public.app_login(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.app_login(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.app_login(TEXT, TEXT, TEXT) TO authenticated;

-- 3. Criar a tabela de válvulas (se não existir)
CREATE TABLE IF NOT EXISTS valves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zona TEXT,
  tag TEXT UNIQUE NOT NULL,
  marca TEXT,
  serie TEXT,
  kit TEXT,
  assento TEXT,
  dn TEXT,
  tipo TEXT,
  ult_kit TEXT,
  ult_man TEXT,
  fabricacao TEXT,
  atuador TEXT,
  lote TEXT,
  mariposa TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE valves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "valves_select" ON valves;
CREATE POLICY "valves_select" ON valves FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "valves_all" ON valves;
CREATE POLICY "valves_all" ON valves FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Inserir dados das válvulas (Ignora as que já existirem pra não dar erro)
INSERT INTO valves (zona, tag, marca, serie, kit, assento, dn, tipo, ult_kit, ult_man, fabricacao, atuador, lote, mariposa) VALUES
`;

const values = data.valves.map(v => {
  const escape = (str) => {
    if (str === null || str === undefined) return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
  };
  return `  (${escape(v.zona)}, ${escape(v.tag)}, ${escape(v.marca)}, ${escape(v.serie)}, ${escape(v.kit)}, ${escape(v.assento)}, ${escape(v.dn)}, ${escape(v.tipo)}, ${escape(v.ult_kit)}, ${escape(v.ult_man)}, ${escape(v.fabricacao)}, ${escape(v.atuador)}, ${escape(v.lote)}, ${escape(v.mariposa)})`;
});

sql += values.join(',\n') + '\nON CONFLICT (tag) DO NOTHING;\n';

fs.writeFileSync('supabase-update.sql', sql);
console.log('Update SQL generated successfully!');
