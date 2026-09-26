# Banco de dados (Supabase)

Fonte de verdade do schema: esta pasta, em ordem numérica.

| Ordem | Arquivo | O que faz |
| --- | --- | --- |
| 1º | `migrations/20260922_00_init_schema.sql` | Snapshot inicial idempotente (ENUMs, `pacientes`, `agendamentos`, `template_emails`, RLS + policies originais) |
| 2º | `migrations/20260922_01_harden_rls_policies.sql` | Endurece o RLS: remove `SELECT` público (`anon`) e CRUD administrativo via RLS, mantendo só o `INSERT` do cadastro |

O `database.sql` na raiz é snapshot de leitura/documentação — não aplique os dois
(`migrations/` **ou** `database.sql` + harden, nunca ambos duplicados sem necessidade;
todos os arquivos são idempotentes, então reexecutar não quebra).

## Como criar um banco novo via Dashboard (SQL Editor)

1. Crie o projeto no Supabase (região `sa-east-1` de preferência) e anote em
   Settings → API: `Project URL`, `anon key` e `service_role key`.
2. **SQL Editor → New query** → cole o conteúdo de
   `migrations/20260922_00_init_schema.sql` → **Run**.
3. **SQL Editor → New query** → cole o conteúdo de
   `migrations/20260922_01_harden_rls_policies.sql` → **Run**.
4. Confira em **Table Editor** as tabelas `pacientes`, `agendamentos` e `template_emails`.
5. Crie o usuário admin em **Authentication → Users → Add user** (o e-mail precisa
   estar no `ADMIN_ALLOWED_EMAILS` do deploy).
6. Configure as 8 envs do deploy (ver `README.md` raiz, seção
   “Variáveis de ambiente”). Para o segredo da sessão:
   `openssl rand -base64 32` → `PACIENTE_SESSION_SECRET`.

## Novas mudanças de schema

Crie um novo arquivo `migrations/<data>_<nn>_<descricao>.sql` (sempre incremental e
idempotente, com `IF NOT EXISTS` / `IF EXISTS`) em vez de editar os arquivos
existentes — a ordem alfabética/numérica define a sequência de aplicação.
