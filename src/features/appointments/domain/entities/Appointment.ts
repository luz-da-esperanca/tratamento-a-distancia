import { DomainError, ValidationError } from '@/src/shared/domain/errors';
import { isStatusAgendamento, StatusAgendamento } from '../value-objects/StatusAgendamento';
import { Protocolo } from '../value-objects/Protocolo';
import { EmailAddress } from '@/src/features/emails/domain/value-objects/EmailAddress';
import { isValidPhone } from '@/src/shared/utils/phoneValidation';

export type TipoTratamento = 'TRATAMENTO_SEM_CIRURGIA' | 'TRATAMENTO_COM_CIRURGIA';

export interface AppointmentProps {
  id: string;
  protocolo: Protocolo;
  pacienteId: string;
  dataCadastro: Date;
  status: StatusAgendamento;
  emailNotificacao: string;
  celular: string;
  tipoWhatsapp: string;
  whatsappAuxiliar?: string;
  ehIntercessorio: boolean;
  nomeSolicitante: string;
  enviouEmailTerca: boolean;
  enviouEmailQuarta: boolean;
  tipo: TipoTratamento;
  dataCirurgia?: Date;
}

export class Appointment {
  private constructor(private props: AppointmentProps) {}

  static criar(props: AppointmentProps): Appointment {
    if (!isStatusAgendamento(props.status)) {
      throw new DomainError('INVALID_APPOINTMENT_STATUS', `Status inválido: ${props.status}`);
    }
    let emailNormalizado: string;
    try {
      emailNormalizado = EmailAddress.criar(props.emailNotificacao).valor;
    } catch {
      throw new ValidationError('Informe um e-mail de notificação válido.');
    }
    if (!isValidPhone(props.celular)) {
      throw new ValidationError('Informe um número de celular válido.');
    }
    if (props.tipoWhatsapp === 'OUTRO_NUMERO' && !isValidPhone(props.whatsappAuxiliar ?? '')) {
      throw new ValidationError('Informe um número de WhatsApp auxiliar válido.');
    }
    return new Appointment({ ...props, emailNotificacao: emailNormalizado });
  }

  static reconstituir(props: AppointmentProps): Appointment {
    return new Appointment(props);
  }

  get id(): string {
    return this.props.id;
  }
  get protocolo(): Protocolo {
    return this.props.protocolo;
  }
  get pacienteId(): string {
    return this.props.pacienteId;
  }
  get dataCadastro(): Date {
    return this.props.dataCadastro;
  }
  get status(): StatusAgendamento {
    return this.props.status;
  }
  get emailNotificacao(): string {
    return this.props.emailNotificacao;
  }
  get celular(): string {
    return this.props.celular;
  }
  get tipoWhatsapp(): string {
    return this.props.tipoWhatsapp;
  }
  get whatsappAuxiliar(): string | undefined {
    return this.props.whatsappAuxiliar;
  }
  get ehIntercessorio(): boolean {
    return this.props.ehIntercessorio;
  }
  get nomeSolicitante(): string {
    return this.props.nomeSolicitante;
  }
  get enviouEmailTerca(): boolean {
    return this.props.enviouEmailTerca;
  }
  get enviouEmailQuarta(): boolean {
    return this.props.enviouEmailQuarta;
  }
  get tipo(): TipoTratamento {
    return this.props.tipo;
  }
  get dataCirurgia(): Date | undefined {
    return this.props.dataCirurgia;
  }

  finalizar(): void {
    if (this.props.status === 'FINALIZADO') {
      throw new DomainError('APPOINTMENT_ALREADY_FINALIZED', 'O agendamento já está finalizado.', 409);
    }
    this.props.status = 'FINALIZADO';
  }

  marcarEmailTercaEnviado(): void {
    this.props.enviouEmailTerca = true;
  }

  marcarEmailQuartaEnviado(): void {
    this.props.enviouEmailQuarta = true;
  }

  toProps(): AppointmentProps {
    return { ...this.props };
  }
}
