-- Throttle das superfícies públicas (rate limiting server-side).
--
-- Janela deslizante por (superfície + IP + início da janela). Somente o
-- `service_role` acessa: RLS habilitado sem policies (nega tudo para
-- anon/authenticated; service_role bypassa o RLS). Limpeza das janelas
-- expiradas feita pela própria aplicação a cada verificação.

create table if not exists rate_limit_hits (
  chave text not null,
  janela timestamptz not null,
  tentativas integer not null default 1,
  constraint rate_limit_hits_pkey primary key (chave, janela)
);

alter table rate_limit_hits enable row level security;
