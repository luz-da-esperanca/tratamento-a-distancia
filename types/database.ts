export type StatusAgendamento = 'AGENDADO' | 'FINALIZADO';
export type OpcaoWhatsApp = 'E_WHATSAPP' | 'OUTRO_NUMERO' | 'NAO_TEM';
export type TipoEmail = 'PROGRAMADO' | 'PONTUAL';

// Mantivemos os tipos de disparo para uso interno do sistema, 
// corrigindo "ROTINA_QUINTA" para "ROTINA_QUARTA" conforme o diagrama.
export type TipoDisparo = 
  | 'ROTINA_TERCA' 
  | 'ROTINA_QUARTA' 
  | 'ALERTA_15_DIAS' 
  | 'ALERTA_7_DIAS' 
  | 'ALERTA_3_DIAS' 
  | 'ALERTA_0_DIAS';


// ==========================================
// ENTIDADES DE DOMÍNIO
// ==========================================

export interface Paciente {
  id: string; // Mantido para referência no banco de dados
  nome_completo: string;
  data_nascimento: Date; // Ajustado de string para Date
  pais: string;
  estado: string;
  cidade: string;
  endereco: string;
}

// Interface base contendo os atributos comuns da classe abstrata Agendamento
export interface AgendamentoBase {
  protocolo: string; // Atua como PK principal de acesso
  paciente_id: string; // Chave estrangeira ligando ao Paciente
  data_cadastro: Date; // Renomeado de dataSolicitacao para bater com o UML
  status: StatusAgendamento;
  email_notificacao: string; // Novo
  celular: string; // Novo
  tipo_whatsapp: OpcaoWhatsApp; // Novo
  whatsapp_auxiliar?: string; // Opcional, usado se a opção for "OUTRO_NUMERO"
  eh_intercessorio: boolean; // Novo
  nome_solicitante: string; // Novo
  
  // Flags de controle de disparo
  enviou_email_terca: boolean;
  enviou_email_quarta: boolean;

  pacientes: Paciente; // Relacionamento com a entidade Paciente
}

// Representa a herança TratamentoSemCirurgia
export interface TratamentoSemCirurgia extends AgendamentoBase {
  tipo: 'TRATAMENTO_SEM_CIRURGIA';
}

// Representa a herança TratamentoComCirurgia
export interface TratamentoComCirurgia extends AgendamentoBase {
  tipo: 'TRATAMENTO_COM_CIRURGIA';
  data_cirurgia: Date; // Exclusivo desta subclasse
}

// O tipo Agendamento agora é uma União Discriminada. 
// O TypeScript saberá que se `tipo === 'TRATAMENTO_COM_CIRURGIA'`, `data_cirurgia` existe.
export type Agendamento = TratamentoSemCirurgia | TratamentoComCirurgia;

// ==========================================
// SISTEMA DE EMAILS E ACESSO
// ==========================================

// Unificamos EmailProgramado e EmailPersonalizado na entidade TemplateEmail do UML
export interface TemplateEmail {
  id: number; // Long no diagrama
  assunto: string;
  corpo: string; // Ajustado de corpoHtml para corpo (UML)
  tipo: TipoEmail;
  
  // Propriedades de apoio baseadas no tipo de e-mail
  tipoDisparo?: TipoDisparo; // Relevante se for PROGRAMADO
  destinatarios?: string[]; // Relevante se for PONTUAL (Array de emails ou protocolos)
  ativo?: boolean;
}

export interface Administrador {
  id: string;
  login: string;
  senhaHash: string; // Por segurança, salvamos o hash e não a senha em si
}