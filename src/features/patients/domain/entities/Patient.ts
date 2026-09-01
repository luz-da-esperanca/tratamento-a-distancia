export interface PatientProps {
  id: string;
  nomeCompleto: string;
  dataNascimento: Date;
  pais: string;
  estado: string;
  cidade: string;
  endereco: string;
}

export class Patient {
  private constructor(private props: PatientProps) {}

  static criar(props: PatientProps): Patient {
    return new Patient(props);
  }

  static reconstituir(props: PatientProps): Patient {
    return new Patient(props);
  }

  get id(): string {
    return this.props.id;
  }
  get nomeCompleto(): string {
    return this.props.nomeCompleto;
  }
  get dataNascimento(): Date {
    return this.props.dataNascimento;
  }
  get pais(): string {
    return this.props.pais;
  }
  get estado(): string {
    return this.props.estado;
  }
  get cidade(): string {
    return this.props.cidade;
  }
  get endereco(): string {
    return this.props.endereco;
  }

  toProps(): PatientProps {
    return { ...this.props };
  }
}
