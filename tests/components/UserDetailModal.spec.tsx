// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserDetailModal } from "@/app/components/appointments/admin/UserDetailModal";
import { parseDateOnly } from "@/src/shared/utils/date";
import type { Agendamento } from "@/types/database";

vi.mock(
  "@/src/features/appointments/presentation/actions/agendamentos.actions",
  () => ({
    atualizarAgendamento: vi.fn(),
    excluirAgendamento: vi.fn(),
  }),
);

function makeModal(protocolo: string, overrides: Partial<Agendamento> = {}): Agendamento {
  const isB = protocolo.endsWith("B");
  return {
    protocolo,
    paciente_id: "pac-1",
    data_cadastro: new Date(2026, 9, 16, 12, 0, 0),
    status: isB ? "FINALIZADO" : "AGENDADO",
    email_notificacao: "a@b.com",
    celular: "+5598999999999",
    tipo_whatsapp: isB ? "NAO_TEM" : "E_WHATSAPP",
    whatsapp_auxiliar: "",
    eh_intercessorio: isB,
    nome_solicitante: isB ? "Maria" : "Próprio",
    enviou_email_terca: false,
    enviou_email_quarta: false,
    tipo: "TRATAMENTO_COM_CIRURGIA",
    data_cirurgia: parseDateOnly("2026-11-27"),
    pacientes: {
      id: "pac-1",
      nome_completo: "Gabriel Lima",
      data_nascimento: parseDateOnly("2003-08-11"),
      pais: "Brasil",
      estado: "Amazonas",
      cidade: "Maral",
      endereco: "Rua 12",
    },
    ...overrides,
  } as unknown as Agendamento;
}

describe("UserDetailModal — troca de registro", () => {
  it("atualiza Tipo WhatsApp, Solicitante e Status ao trocar de agendamento (key por protocolo)", () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const agA = makeModal("AGD-2026-000A");
    const agB = makeModal("AGD-2026-000B");

    const { rerender } = render(
      <UserDetailModal
        key={agA.protocolo}
        agendamento={agA}
        onClose={onClose}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByDisplayValue("É o mesmo do celular")).toBeInTheDocument();

    rerender(
      <UserDetailModal
        key={agB.protocolo}
        agendamento={agB}
        onClose={onClose}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByDisplayValue("Não possui WhatsApp")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Maria")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Finalizado")).toBeInTheDocument();
  });

  it("exibe nascimento 11/08/2003 e cirurgia 27 de nov sem shift", () => {
    render(
      <UserDetailModal
        agendamento={makeModal("AGD-2026-7848")}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("11/08/2003")).toBeInTheDocument();
    expect(screen.getByText(/27 de nov/i)).toBeInTheDocument();
  });

  it("OUTRO_NUMERO exibe campo de WhatsApp auxiliar", () => {
    render(
      <UserDetailModal
        agendamento={makeModal("AGD-2026-000C", {
          tipo_whatsapp: "OUTRO_NUMERO",
          whatsapp_auxiliar: "+5598999888777",
        } as Partial<Agendamento>)}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("+5598999888777")).toBeInTheDocument();
  });

  it("sem cirurgia não mostra Data da Cirurgia e mostra modalidade", () => {
    render(
      <UserDetailModal
        agendamento={makeModal("AGD-2026-000D", {
          tipo: "TRATAMENTO_SEM_CIRURGIA",
        } as Partial<Agendamento>)}
        onClose={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Data da Cirurgia/)).toBeNull();
    expect(screen.getByText("Sem Cirurgia")).toBeInTheDocument();
  });
});
