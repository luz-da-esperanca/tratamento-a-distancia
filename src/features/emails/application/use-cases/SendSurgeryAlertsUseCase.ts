import { differenceInDays, startOfDay } from 'date-fns';
import type { AppointmentRepository } from '@/src/features/appointments/domain/repositories/AppointmentRepository';
import type { EmailGateway } from '@/src/features/emails/domain/gateways/EmailGateway';

const MARCOS_DIAS = [15, 7, 3, 0];

export interface SurgeryAlertsResult {
  alertasEnviados: number;
}

export class SendSurgeryAlertsUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly emailGateway: EmailGateway,
  ) {}

  async execute(): Promise<SurgeryAlertsResult> {
    const candidatos = await this.appointmentRepository.findUpcomingSurgeryAlerts(new Date());
    const hoje = startOfDay(new Date());
    let alertasEnviados = 0;

    for (const agendamento of candidatos) {
      if (!agendamento.dataCirurgia) {
        continue;
      }

      const diasRestantes = differenceInDays(startOfDay(agendamento.dataCirurgia), hoje);

      if (!MARCOS_DIAS.includes(diasRestantes)) {
        continue;
      }

      const assunto =
        diasRestantes === 0
          ? 'É Hoje! Orientações finais para sua Cirurgia Espiritual'
          : `Atualização do seu Tratamento: Falta(m) ${diasRestantes} dia(s)`;

      const corpoHtml = `<p>Olá!</p>
<p>Lembramos que sua cirurgia espiritual está programada para ocorrer em <strong>${diasRestantes === 0 ? 'HOJE' : diasRestantes + ' dias'}</strong>.</p>
<p>Protocolo de acompanhamento: <strong>${agendamento.protocolo.valor}</strong></p>
<p>Siga todas as orientações recomendadas.</p>`;

      const resultado = await this.emailGateway.send({
        para: agendamento.emailNotificacao,
        assunto,
        corpoHtml,
      });

      if (resultado.ok) {
        alertasEnviados++;
      }
    }

    return { alertasEnviados };
  }
}
