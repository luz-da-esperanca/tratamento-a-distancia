-- Autorização administrativa passa a ser feita na aplicação
-- (allowlist ADMIN_ALLOWED_EMAILS + service_role server-side) e o acesso
-- do paciente via validação server-side (protocolo + data de nascimento).

DROP POLICY IF EXISTS "Admin tem controle total sobre pacientes" ON pacientes;
DROP POLICY IF EXISTS "Admin tem controle total sobre agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admin tem controle total sobre templates de email" ON template_emails;
DROP POLICY IF EXISTS "Pacientes podem consultar agendamentos via protocolo" ON agendamentos;
DROP POLICY IF EXISTS "Pacientes podem consultar seus dados vinculados" ON pacientes;
