import { describe, it, expect } from "vitest";
import { validateStep } from "@/src/features/appointments/presentation/utils/formValidation";
import type { FormInscricao } from "@/src/features/appointments/presentation/actions/inscricao.actions";

const base: FormInscricao = {
  nomeCompleto: "Maria Silva",
  dataNascimento: "2000-05-10",
  pais: "BR",
  estado: "CE",
  cidade: "Fortaleza",
  endereco: "Rua Exemplo, 123",
  emailNotificacao: "maria@exemplo.com",
  celular: "+5585988888888",
  tipoWhatsApp: "E_WHATSAPP",
  whatsappAuxiliar: "",
  nomeSolicitante: "",
  tipo: "TRATAMENTO_SEM_CIRURGIA",
};

describe("validateStep", () => {
  it("etapa 0 passa com dados válidos", () => {
    expect(validateStep(0, base)).toEqual({});
  });

  it("etapa 0 aponta campos obrigatórios e data inválida", () => {
    const errors = validateStep(0, { ...base, nomeCompleto: "", dataNascimento: "1900-13-40", cidade: "  " });
    expect(errors.nomeCompleto).toBeTruthy();
    expect(errors.dataNascimento).toBeTruthy();
    expect(errors.cidade).toBeTruthy();
  });

  it("etapa 1 valida e-mail e celular", () => {
    const errors = validateStep(1, {
      ...base,
      emailNotificacao: "invalido",
      celular: "+123",
    });
    expect(errors.emailNotificacao).toBeTruthy();
    expect(errors.celular).toBeTruthy();
  });

  it("etapa 1 exige whatsappAuxiliar quando OUTRO_NUMERO", () => {
    const errors = validateStep(1, { ...base, tipoWhatsApp: "OUTRO_NUMERO", whatsappAuxiliar: "" });
    expect(errors.whatsappAuxiliar).toBeTruthy();
  });

  it("etapa 1 não exige whatsappAuxiliar em outros casos", () => {
    expect(validateStep(1, base).whatsappAuxiliar).toBeUndefined();
  });

  it("etapa 1 não exige celular, mas valida formato quando preenchido", () => {
    expect(validateStep(1, { ...base, celular: "" }).celular).toBeUndefined();
    expect(validateStep(1, { ...base, celular: "+123" }).celular).toBeTruthy();
  });
});
