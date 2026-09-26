# E2E (`tests/e2e/*.e2e.ts`, fora do vitest)

## Rodar local (lê o banco atual, sem escrever)

```powershell
npm run build
npm run test:e2e
```

O Playwright sobe `npm run start` sozinho (`reuseExistingServer: true`).
Passam 8 testes; 2 ficam skipped (gated, ver abaixo).

## Rodar contra staging (com escrita)

Aponta para um deploy + banco de TESTE — **nunca produção**:

```powershell
$env:E2E_BASE_URL="https://staging..."
$env:E2E_WRITE_ENABLED="1"                       # libera cadastro.e2e.ts
$env:E2E_ADMIN_EMAIL="admin@staging..."           # libera admin-fluxo válido
$env:E2E_ADMIN_PASSWORD="..."
npm run test:e2e
```

| Spec | O que faz | Gate |
| --- | --- | --- |
| `home` | hero + bloqueio etapa 0 (só leitura) | — |
| `admin-guard` | redirect sem sessão (só leitura) | — |
| `protocolo` | redirect sem sessão + erro genérico (só leitura) | — |
| `admin-fluxo` inválido | erro sem redirect (só leitura) | — |
| `admin-fluxo` válido | login → painel → reload → logout | `E2E_ADMIN_*` |
| `cadastro` | wizard → protocolo → acesso (ESCREVE) | `E2E_WRITE_ENABLED=1` |

## CI (`.github/workflows/ci.yml`, job `e2e`)

Roda o smoke sem escrita contra build local. Secrets necessários
(Settings → Secrets → Actions), todos de **staging**:

| Secret | Uso |
| --- | --- |
| `E2E_SUPABASE_URL` / `E2E_SUPABASE_ANON_KEY` / `E2E_SUPABASE_SERVICE_ROLE_KEY` | runtime do app |
| `E2E_ADMIN_ALLOWED_EMAILS` | guard admin |
| `E2E_PACIENTE_SESSION_SECRET` | cookie HMAC |
| `E2E_CRON_SECRET` | rotas cron |

O job é `continue-on-error` até os secrets existirem; depois, remover a flag
para o E2E travar o merge.
