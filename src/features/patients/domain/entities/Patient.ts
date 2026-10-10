import { ValidationError } from '@/src/shared/domain/errors';

export interface PatientProps {
  id: string;
  nomeCompleto: string;
  dataNascimento: Date;
  pais: string;
  estado: string;
  cidade: string;
  endereco: string;
}

function exigirTexto(valor: string, campo: string): void {
  if (!valor || valor.trim() === '') {
    throw new ValidationError(`Informe ${campo}.`);
  }
}

export class Patient {
  private constructor(private props: PatientProps) {}

  static criar(props: PatientProps): Patient {
    exigirTexto(props.nomeCompleto, 'o nome completo');
    exigirTexto(props.pais, 'o país');
    exigirTexto(props.estado, 'o estado/província');
    exigirTexto(props.cidade, 'a cidade');
    exigirTexto(props.endereco, 'o endereço');
    if (
      !(props.dataNascimento instanceof Date) ||
      Number.isNaN(props.dataNascimento.getTime())
    ) {
      throw new ValidationError('Informe uma data de nascimento válida.');
    }
    if (props.dataNascimento.getTime() > Date.now()) {
      throw new ValidationError('A data de nascimento não pode ser futura.');
    }
    if (props.dataNascimento.getFullYear() < 1900) {
      throw new ValidationError('Informe uma data de nascimento válida.');
    }
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
