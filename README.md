<p align="center">
  <img src="public/logo.png" alt="Luz da Esperança" width="180" />
</p>

<h1 align="center">Luz da Esperança — Tratamento Espiritual à Distância</h1>

<p align="center">
  Plataforma 100% virtual do <strong>Centro Espírita Luz da Esperança</strong> (Parnaíba/PI)
  para agendamento e acompanhamento do tratamento espiritual à distância.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.6-black" alt="Next.js 16.2.6" />
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB" alt="React 19.2.4" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Supabase-SSR-3FCF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/Resend-6.16-black" alt="Resend 6.16" />
  <img src="https://img.shields.io/badge/Tailwind-4-38BDF8" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/daisyUI-5.5.20-orange" alt="daisyUI 5.5.20" />
  <img src="https://img.shields.io/badge/Vitest-4.1.11-6E9F18" alt="Vitest 4.1.11" />
</p>

---

## Sobre

O Centro Espírita Luz da Esperança oferece tratamento por meio da oração e atendimentos
virtuais — Evangelhoterapia, passes, desobsessão e atendimento fraterno — sem sair de casa.

- **Modalidade:** 100% virtual
- **Transmissões:** segunda (Evangelho), terça (palestras) e quarta (tratamento), às **19:30**
- **Cirurgia espiritual (opcional):** última sexta-feira do mês, com validação de 15 dias de antecedência
- **Inscrição em 3 etapas:** Paciente → Agendamento → Revisão, com geração de **protocolo** (`AGD-AAAA-NNNN`)
- **Acompanhamento:** acesso com `protocolo + data de nascimento` e sessão assinada (HMAC, 2h)
- **Orientações:** 9 perguntas frequentes + instruções de preparo (água fluidificada, repouso, gratuidade total)
- **Administração:** painel restrito por allowlist de e-mails, com gestão de agendamentos e disparos de e-mail

---

## Funcionalidades

| Área | O que faz |
| --- | --- |
| Hero informativo | Apresentação, CTAs “Fazer inscrição” / “Ver orientações” e cards (100% Virtual, Seg–Qua, 19:30) |
| Inscrição (3 etapas) | Dados do paciente, contato internacional (`PhoneField`), país/estado dinâmicos, opção de cirurgia e revisão |
| Protocolo único | `AGD-AAAA-NNNN` gerado com `crypto.randomInt` e retry (até 5x) em conflito de unicidade |
| Intercessório | Detecta quando o solicitante é diferente do paciente (`eh_intercessorio`) |
| Cirurgia opcional | Calcula `data_cirurgia` (última sexta do mês, regra de 15 dias) |
| E-mail de confirmação | Enviado via Resend após o cadastro (sem bloquear a inscrição em caso de falha) |
| Acompanhamento do paciente | Login por protocolo + nascimento → cookie `paciente_session` assinado → página `/tratamento/[protocolo]` |
| FAQ e instruções | 9 dúvidas frequentes + procedimentos do tratamento e da cirurgia |
| Painel admin | Listagem, edição, exclusão, reagendamento e filtros (com/sem cirurgia) |
| E-mails programados | Templates de terça/quarta + alertas de cirurgia (15/7/3/0 dias) |
| Crons automáticos | Disparos de terça, quarta e alertas diários (08:00 BRT) via Vercel Cron (`vercel.json`) ou Netlify Scheduled Functions (`netlify/functions`), autenticados por `CRON_SECRET` |

---

## Tech Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| UI | Tailwind CSS 4 + daisyUI 5 + lucide-react |
| Backend / Auth / DB | Supabase (`@supabase/ssr` + `supabase-js`, Postgres + RLS) |
| E-mails | Resend |
| Validação | Zod (env), validação de formulário por etapa |
| Telefone i18n | `libphonenumber-js` + `react-phone-number-input` + `world-countries` |
| Datas | `date-fns` |
| Testes | Vitest |
| Deploy | Netlify (Scheduled Functions p/ crons) / Vercel (`vercel.json` p/ crons) + GitHub Actions (lint, test, build) |

---

## Estrutura

```text
/
├── app/                              # Rotas (App Router)
│   ├── page.tsx                      # Home: Hero + Inscrição + FAQ
│   ├── layout.tsx                    # Layout raiz (pt-BR)
│   ├── globals.css                   # Tailwind + daisyUI + tema (--brand, --neutral…)
│   ├── tratamento/
│   │   ├── page.tsx                  # Login do paciente (protocolo + nascimento)
│   │   └── [protocolo]/page.tsx      # Detalhe protegido por sessão HMAC
│   ├── admin/
│   │   ├── page.tsx                  # Área restrita (landing)
│   │   ├── login/page.tsx            # Login admin (allowlist)
│   │   └── painel/page.tsx           # Dashboard admin
│   ├── api/cron/{terca,quarta,alertas}/route.ts
│   └── components/{shared,appointments,appointments/admin}/
├── src/
│   ├── features/{appointments,patients,emails,auth}/
│   │   ├── domain/                   # Entidades, value objects, repositórios (interfaces), erros
│   │   ├── application/              # Casos de uso
│   │   ├── infrastructure/           # Adaptadores Supabase / Resend
│   │   └── presentation/             # Server Actions + validação de formulário
│   └── shared/
│       ├── domain/                   # Result, DomainError
│       ├── utils/                    # date, mask, phone
│       └── infrastructure/
│           ├── config/env.ts         # Validação Zod das variáveis de ambiente
│           ├── composition/container.ts  # DI: factories dos casos de uso
│           ├── database/supabase/    # Clients server / browser / admin (service_role)
│           ├── security/pacienteSession.ts  # Sessão HMAC do paciente
│           ├── auth/requireAdmin.ts  # Guarda administrativa (allowlist)
│           ├── cron/guard.ts         # Autorização dos crons
│           └── data/                 # Países / subdivisões
├── types/database.ts                 # Tipos espelho do banco (união discriminada Agendamento)
├── database.sql                      # Schema inicial (enums, tabelas, RLS)
├── supabase/migrations/              # Migration P0.1 (fecha RLS para anon/authenticated comum)
├── tests/**/*.spec.ts                # Testes Vitest
├── vercel.json                       # Crons (terça, quarta, alertas diários)
├── netlify.toml                      # Build + omit de secrets no scan
└── public/logo.png
```

### Arquitetura

Clean Architecture por feature (`domain → application ← infrastructure`, `presentation` nas bordas),
com container de DI (`make*UseCase`) separando:

- **Cliente anon** (`createServerSupabaseClient`) — somente `INSERT` público do cadastro;
- **Cliente admin** (`createAdminSupabaseClient`, `service_role`, server-only) — operações
  administrativas após `requireAdmin()` e validações do paciente (sem `SELECT` geral para `anon`);
- **Sessão do paciente** — HMAC-SHA256 (`protocolo.timestamp.assinatura`), `httpOnly`,
  `sameSite=strict`, expiração server-side de 2h;
- **Autorização admin** — allowlist `ADMIN_ALLOWED_EMAILS` verificada no gateway, no middleware
  e em cada Server Action administrativa;
- **Crons** — `Authorization: Bearer CRON_SECRET`, clientes `service_role`.

---

## Instalação

```bash
git clone <repo> && cd tratamento-a-distancia
npm ci
cp .env.example .env   # preencher as 8 variáveis abaixo
npm run dev            # http://localhost:3000 (Webpack; use npm run dev:turbo p/ Turbopack)
```

```bash
npm run lint           # ESLint (Next core-web-vitals + TS)
npm test               # Vitest (tests/**/*.spec.ts)
npm run build && npm start
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto Supabase (client SSR) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | Chave anon (somente `INSERT` público) |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | Server-only: admin, paciente server-side e crons (bypass RLS) |
| `RESEND_API_KEY` | sim* | Envio de e-mails |
| `RESEND_FROM` | sim* | Remetente dos e-mails |
| `CRON_SECRET` | sim | `Authorization: Bearer` das rotas `/api/cron/*` |
| `ADMIN_ALLOWED_EMAILS` | sim | CSV de e-mails admin (ex.: `admin@exemplo.com,outro@exemplo.com`) |
| `PACIENTE_SESSION_SECRET` | sim | Segredo HMAC da sessão (mín. 32 chars — ex.: `openssl rand -base64 32`) |

\* E-mail degrada com warning se ausente (cadastro continua funcionando).

---

## Banco de dados

Fonte de verdade: `supabase/migrations/` (ordem numérica) — ver `supabase/README.md`.

- **Snapshot inicial:** `database.sql` — enums (`status_agendamento`, `opcao_whatsapp`, `tipo_email`,
  `tipo_tratamento`), tabelas `pacientes` (`id UUID`), `agendamentos` (`protocolo VARCHAR PK`,
  `paciente_id FK CASCADE`, flags `enviou_email_terca/quarta`, `data_cirurgia`) e `template_emails`,
  com RLS habilitado. Somente leitura/documentação.
- **Migrations (aplicar nesta ordem via SQL Editor):**
  1. `supabase/migrations/20260922_00_init_schema.sql` — snapshot inicial idempotente;
  2. `supabase/migrations/20260922_01_harden_rls_policies.sql` — remove `SELECT` público
     (`anon`) e CRUD administrativo via RLS para `authenticated` comum, mantendo apenas o `INSERT`
     público do cadastro.

---

## Scripts

| Script | Comando |
| --- | --- |
| `dev` | `next dev --webpack` |
| `dev:turbo` | `next dev` (Turbopack) |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |
| `test` | `vitest run` |

CI (`.github/workflows/ci.yml`): Node 22 → `npm ci` → `lint` → `test` → `build` em `push`/`PR`.

---

## Deploy

- **Vercel (principal):** crons em `vercel.json` — `/api/cron/terca` (ter `0 11 * * 2`),
  `/api/cron/quarta` (`0 11 * * 3`) e `/api/cron/alertas` (diário `0 11 * * *`), autenticados por
  `CRON_SECRET`. `next.config.ts` inclui `serverExternalPackages: ["@opentelemetry/api"]`.
- **Netlify (alternativo):** `netlify.toml` (`command = "npm run build"`, `publish = ".next"`) com
  `SECRETS_SCAN_OMIT_KEYS = "ADMIN_ALLOWED_EMAILS,PACIENTE_SESSION_SECRET"` (valores server-only
  embutidos nos chunks SSR) + Scheduled Functions em `netlify/functions/` (mesmos horários:
  ter `0 11 * * 2`, qua `0 11 * * 3`, alertas diário `0 11 * * *`) que chamam as rotas com
  `Bearer CRON_SECRET` (envs `URL` automática + `CRON_SECRET` existente; logs em
  Netlify → Functions). Alertas de cirurgia rodam exatamente 1x/dia (sem flag de
  enviado — rodada dupla duplicaria e-mails).

---

## Licença

Todos os direitos reservados — **Luz da Esperança Centro Espírita**.
