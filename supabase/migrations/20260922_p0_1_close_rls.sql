-- P0.1: fecha RLS para anon SELECT e authenticated CRUD administrativo.
-- Mantém apenas INSERT público necessário ao cadastro.
-- Idempotente: usa IF EXISTS, sem CREATE substituta permissiva.

DROP POLICY IF EXISTS "Admin tem controle total sobre pacientes" ON pacientes;
DROP POLICY IF EXISTS "Admin tem controle total sobre agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admin tem controle total sobre templates de email" ON template_emails;
DROP POLICY IF EXISTS "Pacientes podem consultar agendamentos via protocolo" ON agendamentos;
DROP POLICY IF EXISTS "Pacientes podem consultar seus dados vinculados" ON pacientes;
