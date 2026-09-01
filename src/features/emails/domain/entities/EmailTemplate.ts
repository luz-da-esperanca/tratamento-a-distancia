export type TipoEmail = 'PROGRAMADO' | 'PONTUAL';

export type TipoDisparo =
  | 'ROTINA_TERCA'
  | 'ROTINA_QUARTA'
  | 'ALERTA_15_DIAS'
  | 'ALERTA_7_DIAS'
  | 'ALERTA_3_DIAS'
  | 'ALERTA_0_DIAS';

export interface EmailTemplateProps {
  id: number;
  assunto: string;
  corpo: string;
  tipo: TipoEmail;
  tipoDisparo?: TipoDisparo;
  destinatarios?: string[];
  ativo?: boolean;
}

export class EmailTemplate {
  private constructor(private props: EmailTemplateProps) {}

  static criar(props: EmailTemplateProps): EmailTemplate {
    return new EmailTemplate(props);
  }

  static reconstituir(props: EmailTemplateProps): EmailTemplate {
    return new EmailTemplate(props);
  }

  get id(): number {
    return this.props.id;
  }
  get assunto(): string {
    return this.props.assunto;
  }
  get corpo(): string {
    return this.props.corpo;
  }
  get tipo(): TipoEmail {
    return this.props.tipo;
  }
  get tipoDisparo(): TipoDisparo | undefined {
    return this.props.tipoDisparo;
  }
  get destinatarios(): string[] | undefined {
    return this.props.destinatarios;
  }
  get ativo(): boolean {
    return this.props.ativo ?? true;
  }
}
