import { randomUUID } from 'node:crypto';
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
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly emailGateway: EmailGateway,
  ) {}

  async execute(input: CreateAppointmentInput): Promise<CreateAppointmentOutput> {
    const dataCadastro = new Date();
    const pacienteId = randomUUID();

    const paciente = Patient.criar({
      id: pacienteId,
      nomeCompleto: input.nomeCompleto,
      dataNascimento: new Date(`${input.dataNascimento}T12:00:00`),
      pais: input.pais,
      estado: input.estado,
      cidade: input.cidade,
      endereco: input.endereco,
    });

    await this.patientRepository.save(paciente);

    const protocolo = Protocolo.gerar(dataCadastro.getFullYear());

    const dataCirurgia =
      input.tipo === 'TRATAMENTO_COM_CIRURGIA' ? validarAntecedencia15Dias(dataCadastro) : undefined;

    const ehIntercessorio =
      input.nomeSolicitante.trim() !== '' &&
      input.nomeSolicitante.trim().toLowerCase() !== input.nomeCompleto.trim().toLowerCase();

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

    await this.appointmentRepository.save(agendamento);

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
}
