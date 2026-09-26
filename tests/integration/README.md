# Testes de integração (`tests/integration/*.int.spec.ts`)

Rodam junto com `npm test`, mas são **pulados sem env** (`describe.skipIf`).
Para executar contra um projeto Supabase de TESTE (staging — **nunca produção**):

```powershell
$env:SUPABASE_TEST_URL="https://xxx.supabase.co"
$env:SUPABASE_TEST_SERVICE_ROLE_KEY="..."
$env:SUPABASE_TEST_ANON_KEY="..."   # opcional, só p/ teste de RLS
npm run test:int
```

Pré-requisito: aplicar as migrations em ordem nesse projeto
(`supabase/migrations/20260922_00_init_schema.sql` → `01_harden_rls_policies.sql`;
ver `supabase/README.md`).

Os testes escrevem linhas com protocolo `AGD-2099-00XX` e limpam tudo no
`afterEach`, mesmo em caso de falha.
