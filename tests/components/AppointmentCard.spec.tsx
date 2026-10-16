// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppointmentCard } from "@/app/components/appointments/admin/AppointmentCard";
import { parseDateOnly } from "@/src/shared/utils/date";
import type { Agendamento } from "@/types/database";

function makeCard(
  overrides: Partial<Agendamento> = {},
): Agendamento {
  return {
    protocolo: "AGD-2026-7848",
    paciente_id: "pac-1",
    data_cadastro: new Date(2026, 9, 16, 12, 0, 0),
    status: "AGENDADO",
    email_notificacao: "a@b.com",
    celular: "+5598999999999",
    tipo_whatsapp: "E_WHATSAPP",
    whatsapp_auxiliar: "",
    eh_intercessorio: false,
    nome_solicitante: "Próprio",
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
      endereco: "Rua 12, Bairro São Paulo",
    },
    ...overrides,
  } as unknown as Agendamento;
}

describe("AppointmentCard — data de cirurgia", () => {
  it("renderiza 27/11/2026 quando data_cirurgia é Date (sem Invalid Date)", () => {
    render(
      <AppointmentCard data={makeCard()} onClick={vi.fn()} />,
    );

    expect(screen.getByText(/Cirurgia:/)).toHaveTextContent("27/11/2026");
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  it("renderiza 27/11/2026 quando data_cirurgia é string YYYY-MM-DD", () => {
    render(
      <AppointmentCard
        data={makeCard({ data_cirurgia: "2026-11-27" } as Partial<Agendamento>)}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/Cirurgia:/)).toHaveTextContent("27/11/2026");
  });

  it("sem cirurgia não mostra linha de cirurgia", () => {
    render(
      <AppointmentCard
        data={makeCard({ tipo: "TRATAMENTO_SEM_CIRURGIA" } as Partial<Agendamento>)}
        onClick={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Cirurgia:/)).toBeNull();
    expect(screen.getByText(/AGD-2026-7848/)).toBeInTheDocument();
  });

  it("cadastro inválido mostra 'Data inválida' sem quebrar", () => {
    render(
      <AppointmentCard
        data={makeCard({ data_cadastro: "não-é-data" } as unknown as Partial<Agendamento>)}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText(/Data inválida/)).toBeInTheDocument();
  });
});
