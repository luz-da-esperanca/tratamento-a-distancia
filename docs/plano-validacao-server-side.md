# Plano — Validação server-side + conversão dos `it.fails`

> Origem: auditoria da estratégia de testes + instrução de implementação
> ("não aceite testes verdes enquanto a lógica de produção estiver errada").
> Status: **pendente de execução**. Salvo para tratamento posterior.

## Princípio absoluto

```text
código correto → teste correto → PASS
código incorreto → teste correto → FAIL
```

- Não manter `it.fails` como solução permanente.
- Não remover nem enfraquecer testes para deixar o CI verde.
- Não converter `it.fails` → `it` antes de corrigir a produção.
- O teste deve falhar se a proteção for removida (prova anti-regressão obrigatória).

## Diagnóstico por camada (código real)

```text
UI (formValidation.ts:9-56)         valida: nome, nascimento, email regex, celular/auxiliar
  ↓
Action (salvarAgendamento)          valida: NADA — repassa tudo
  ↓
Use-case (CreateAppointmentUseCase) valida: NADA (só gera protocolo + retry)
  ↓
Domain (Patient.criar / Appointment.criar)  valida: só `status` (Appointment.ts:29)
  ↓
DB                                  valida: NOT NULL (string vazia passa)
```

Regras reutilizáveis existentes, hoje **sem uso no server**:

- `EmailAddress.criar` (`src/features/emails/domain/value-objects/EmailAddress.ts`) —
  regex + trim + lower. Fonte única para e-mail (não duplicar regex na action).
- `isValidPhone` (`src/shared/utils/phone.ts:41`) — libphonenumber.
- `isNascimentoValido` (`src/shared/utils/mask.ts:19`) — com bug de rollover
  (`new Date('2000-02-30')` vira 01/03 em vez de inválido).

**A invariante mora no domínio** (`Patient.criar`, `Appointment.criar`), não na
action: assim `curl`, actions futuras e qualquer entry point herdam a proteção.
A action já mapeia `DomainError → { sucesso: false }` via `toAppError`
(comportamento provado por `tests/appointments/presentation/inscricaoAction.spec.ts`).

## Correções de produção (nesta ordem)

1. **`src/shared/utils/mask.ts` — `isNascimentoValido`**: rejeitar dia impossível
   comparando componentes decompostos (`new Date(y, m-1, d)` e conferir
   `getDate() === d && getMonth() === m-1`), sem mudar a assinatura.
   Corrige UI e server de uma vez.
2. **`src/features/patients/domain/entities/Patient.ts` — `Patient.criar`**:
   rejeitar (`ValidationError`) nome/país/estado/cidade/endereço vazios
   (só-whitespace) e nascimento inválido/futuro (reusa `isNascimentoValido`).
3. **`src/features/appointments/domain/entities/Appointment.ts` — `Appointment.criar`**:
   rejeitar e-mail inválido (via `EmailAddress.criar`, que também normaliza),
   celular vazio/inválido (via `isValidPhone`), `OUTRO_NUMERO` sem auxiliar válido.
4. **P0 segurança — `buscarAgendamentoPorProtocolo`**
   (`src/features/appointments/presentation/actions/agendamentos.actions.ts:152-160`):
   verificar a sessão **dentro da action** (`cookies()` +
   `verifyPacienteSession(session, protocolo)`; `null` se inválida).
   Sem isso há IDOR: a action é invocável por POST direto, não lê cookie,
   retorna PII completa (`toLegacyAgendamento`, linhas 27-64) e o protocolo é
   enumerável (`Protocolo.gerar`: `randomInt(1000,10000)` → 9000/ano).
   A página `/tratamento/[protocolo]` continua funcionando (o cookie vai junto).
5. Sem mudança em use-case, DB ou UI (fora o bug do mask, cujo efeito na UI é
   positivo e intencional).

## Decisões travadas

- **Trust boundary**: corrigir na action (item 4), não preservar o contrato
  inseguro. Teste correspondente deve ser invertido (sem sessão → `null` +
  use-case não alcançado; com sessão → dados).
- **E-mail**: normalizar e aceitar (trim+lower via `EmailAddress`), rejeitar só
  malformado. Alinha com Supabase Auth e evita divergências futuras.

## Conversão dos `it.fails` (somente após as correções)

| Teste | Conversão |
| --- | --- |
| `tests/security/inscricaoValidation.spec.ts` (4: nome vazio, e-mail malformado, celular vazio, OUTRO_NUMERO sem auxiliar) | `it` normal + assertion de efeito colateral: `patientRepo.save` / `appointmentRepo.save` **não chamados** |
| `tests/shared/utils/mask.spec.ts` (1: `2000-02-30`) | `it` normal |
| `tests/security/adminActionsGuard.spec.ts` (trust boundary, hoje documenta acesso sem sessão) | Inverter: sem sessão válida → `null` + use-case não alcançado |

## Prova anti-regressão (obrigatória por regra)

Para cada regra corrigida: remover temporariamente a validação em branch local
(sem commit), confirmar o teste fica vermelho, restaurar.

## P0 restantes — status (sem retrabalho)

`requireAdmin`, 5 admin actions fail-closed e `validarAcessoPaciente` já são `it`
normais desde as Fases 1–3. Falta só a revalidação da prova anti-regressão
(a maioria já asserta `not.toHaveBeenCalled`).

## Critério de conclusão por item

```text
produção corrigida + it normal + vermelho-sem-proteção + suíte + lint + build verdes
PASS = código correto segundo o comportamento especificado
```

Meta: **zero `it.fails` permanente para bugs conhecidos**.

## Ordem de execução

1. Analisar o código relacionado aos `it.fails` (feito — ver Diagnóstico).
2. Corrigir a implementação de produção (itens 1–4 acima).
3. Converter os `it.fails` em testes normais (+ inverter trust boundary).
4. Prova anti-regressão por regra.
5. Suíte completa → lint → build.
6. Tratar P0 restantes (revalidação).
7. Seguir para P1; só então ajustes de CI/E2E/coverage.
