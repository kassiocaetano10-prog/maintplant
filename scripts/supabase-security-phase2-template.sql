-- ==========================================================
-- PROEXEL - Security Hardening Phase 2 (strict RLS template)
-- NAO EXECUTAR AGORA sem migrar para Supabase Auth/JWT roles.
--
-- Este arquivo é um template para quando o login estiver em Auth
-- e cada usuário tiver auth.uid() + role confiável em claims.
-- ==========================================================

-- Exemplo de direção:
-- 1) Remover policies "allow all"
-- 2) Criar policies por role:
--    - tecnico: insert em maintenance_records + insert em restock_requests
--    - chefe/admin: update status em orders + aprovar/rejeitar restock
--    - compras/admin: gerenciar stock
-- 3) Validar ownership (created_by_user_id = auth.uid())

-- Este template fica propositalmente sem comandos destrutivos
-- para evitar aplicação acidental e quebra de produção.
