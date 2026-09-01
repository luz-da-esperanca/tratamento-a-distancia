import type { FormInscricao } from "@/src/features/appointments/presentation/actions/inscricao.actions";
import { isNascimentoValido } from "@/src/shared/utils/mask";
import { isValidPhone } from "@/src/shared/utils/phone";

export type FormErrors = Partial<Record<keyof FormInscricao, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(step: number, data: FormInscricao): FormErrors {
  const errors: FormErrors = {};

  if (step === 0) {
    if (!data.nomeCompleto.trim()) {
      errors.nomeCompleto = "Informe o nome completo.";
    }
    if (!data.dataNascimento) {
      errors.dataNascimento = "Informe a data de nascimento.";
    } else if (!isNascimentoValido(data.dataNascimento)) {
      errors.dataNascimento = "Data de nascimento inválida.";
    }
    if (!data.pais) {
      errors.pais = "Selecione o país.";
    }
    if (!data.estado) {
      errors.estado = "Informe o estado/província.";
    }
    if (!data.cidade.trim()) {
      errors.cidade = "Informe a cidade.";
    }
    if (!data.endereco.trim()) {
      errors.endereco = "Informe o endereço.";
    }
  }

  if (step === 1) {
    if (!data.emailNotificacao.trim()) {
      errors.emailNotificacao = "Informe o e-mail.";
    } else if (!EMAIL_REGEX.test(data.emailNotificacao)) {
      errors.emailNotificacao = "E-mail inválido.";
    }
    if (!data.celular.trim()) {
      errors.celular = "Informe o número de celular.";
    } else if (!isValidPhone(data.celular)) {
      errors.celular = "Número de celular inválido.";
    }
    if (data.tipoWhatsApp === "OUTRO_NUMERO") {
      if (!data.whatsappAuxiliar?.trim()) {
        errors.whatsappAuxiliar = "Informe o WhatsApp auxiliar.";
      } else if (!isValidPhone(data.whatsappAuxiliar)) {
        errors.whatsappAuxiliar = "Número de WhatsApp auxiliar inválido.";
      }
    }
  }

  return errors;
}
