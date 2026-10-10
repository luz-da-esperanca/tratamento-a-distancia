import { randomUUID } from 'node:crypto';
import { ConflictError, ValidationError } from '@/src/shared/domain/errors';
import { isNascimentoValido } from '@/src/shared/utils/mask';
import type { OpcaoWhatsApp } from '@/types/database';
import { Patient } from '@/src/features/patients/domain/entities/Patient';
import type { PatientRepository } from '@/src/features/patients/domain/repositories/PatientRepository';
import { Appointment } from '@/src/features/appointments/domain/entities/Appointment';
import { Protocolo } from '@/src/features/appointments/domain/value-objects/Protocolo';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import { validarAntecedencia15Dias } from '@/src/features/appointments/domain/services/SchedulingService';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';
import { buildConfirmationEmail } from '@/src/features/emails/infrastructure/templates/confirmation.template';

export interface CreateAppointmentInput {
  nomeCompleto: string;
  dataNascimento: string;
  pais: string;
  estado: string;
  cidade: string;
  endereco: string;
  emailNotificacao: string;
  celular: string;
  tipoWhatsApp: OpcaoWhatsApp;
  whatsappAuxiliar?: string;
  nomeSolicitante: string;
  tipo: 'TRATAMENTO_COM_CIRURGIA' | 'TRATAMENTO_SEM_CIRURGIA';
}

export interface CreateAppointmentOutput {
  protocolo: string;
  emailEnviado: boolean;
}

export class CreateAppointmentUseCase {
  static readonly MAX_PROTOCOLO_ATTEMPTS = 5;

  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly emailGateway: EmailGateway,
  ) {}

  async execute(input: CreateAppointmentInput): Promise<CreateAppointmentOutput> {
    const dataCadastro = new Date();
    const pacienteId = randomUUID();

    // A string ISO precisa ser validada antes do parse: `new Date()` aplica
    // rollover em dias impossíveis (2000-02-30 vira 01/03) e o Date resultante
    // já não carrega o erro original para `Patient.criar` detectar.
    if (!isNascimentoValido(input.dataNascimento)) {
      throw new ValidationError('Informe uma data de nascimento válida (até hoje).');
    }

    // `Patient.criar` valida os dados do paciente antes de qualquer
    // persistência: falha aqui não deixa resíduo no banco.
    const paciente = Patient.criar({
      id: pacienteId,
      nomeCompleto: input.nomeCompleto,
      dataNascimento: new Date(`${input.dataNascimento}T12:00:00`),
      pais: input.pais,
      estado: input.estado,
      cidade: input.cidade,
      endereco: input.endereco,
    });

    const dataCirurgia =
      input.tipo === 'TRATAMENTO_COM_CIRURGIA' ? validarAntecedencia15Dias(dataCadastro) : undefined;

    const ehIntercessorio =
      input.nomeSolicitante.trim() !== '' &&
      input.nomeSolicitante.trim().toLowerCase() !== input.nomeCompleto.trim().toLowerCase();

    let lastConflict: unknown = null;
    let pacienteSalvo = false;

    for (let attempt = 0; attempt < CreateAppointmentUseCase.MAX_PROTOCOLO_ATTEMPTS; attempt += 1) {
      const protocolo = Protocolo.gerar(dataCadastro.getFullYear());

      // `Appointment.criar` valida (e normaliza) o contato antes de qualquer
      // persistência: falha aqui também não deixa paciente órfão.
      const agendamento = Appointment.criar({
        id: protocolo.valor,
        protocolo,
        pacienteId,
        dataCadastro,
        status: 'AGENDADO',
        emailNotificacao: input.emailNotificacao,
        celular: input.celular,
        tipoWhatsapp: input.tipoWhatsApp,
        whatsappAuxiliar: input.tipoWhatsApp === 'OUTRO_NUMERO' ? input.whatsappAuxiliar : undefined,
        ehIntercessorio,
        nomeSolicitante: input.nomeSolicitante || 'Próprio',
        enviouEmailTerca: false,
        enviouEmailQuarta: false,
        tipo: input.tipo,
        dataCirurgia,
      });

      try {
        if (!pacienteSalvo) {
          await this.patientRepository.save(paciente);
          pacienteSalvo = true;
        }
        await this.appointmentRepository.save(agendamento);
      } catch (error) {
        if (error instanceof ConflictError) {
          lastConflict = error;
          continue;
        }
        throw error;
      }

      const email = buildConfirmationEmail({
        protocolo: protocolo.valor,
        tipo: input.tipo,
        dataCadastro,
        dataCirurgia,
        dataNascimento: input.dataNascimento,
      });

      const emailResult = await this.emailGateway.send({
        para: input.emailNotificacao,
        assunto: email.assunto,
        corpoHtml: email.corpoHtml,
        replyTo: email.replyTo,
      });

      return { protocolo: protocolo.valor, emailEnviado: emailResult.ok };
    }

    throw lastConflict instanceof ConflictError
      ? lastConflict
      : new ConflictError();
  }
}
