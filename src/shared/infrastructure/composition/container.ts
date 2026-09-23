import { createServerSupabaseClient } from '@/src/shared/infrastructure/database/supabase/server';
import { createAdminSupabaseClient } from '@/src/shared/infrastructure/database/supabase/admin';
import { SupabasePatientRepository } from '@/src/features/patients/infrastructure/repositories/SupabasePatientRepository';
import { SupabaseAppointmentRepository } from '@/src/features/appointments/infrastructure/repositories/SupabaseAppointmentRepository';
import { SupabaseEmailTemplateRepository } from '@/src/features/emails/infrastructure/repositories/SupabaseEmailTemplateRepository';
import { ResendEmailGateway } from '@/src/features/emails/infrastructure/email/ResendEmailGateway';
import { SupabaseAuthGateway } from '@/src/features/auth/infrastructure/gateways/SupabaseAuthGateway';
import { CreateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/CreateAppointmentUseCase';
import { ValidatePatientAccessUseCase } from '@/src/features/appointments/application/use-cases/ValidatePatientAccessUseCase';
import { ListAppointmentsUseCase } from '@/src/features/appointments/application/use-cases/ListAppointmentsUseCase';
import { UpdateAppointmentUseCase } from '@/src/features/appointments/application/use-cases/UpdateAppointmentUseCase';
import { DeleteAppointmentUseCase } from '@/src/features/appointments/application/use-cases/DeleteAppointmentUseCase';
import { GetAppointmentByProtocolUseCase } from '@/src/features/appointments/application/use-cases/GetAppointmentByProtocolUseCase';
import { SaveEmailTemplatesUseCase } from '@/src/features/emails/application/use-cases/SaveEmailTemplatesUseCase';
import { SendSpecificAlertUseCase } from '@/src/features/emails/application/use-cases/SendSpecificAlertUseCase';
import { SendRoutineTuesdayUseCase } from '@/src/features/emails/application/use-cases/SendRoutineTuesdayUseCase';
import { SendRoutineWednesdayUseCase } from '@/src/features/emails/application/use-cases/SendRoutineWednesdayUseCase';
import { SendSurgeryAlertsUseCase } from '@/src/features/emails/application/use-cases/SendSurgeryAlertsUseCase';
import { LoginAdminUseCase } from '@/src/features/auth/application/use-cases/LoginAdminUseCase';
import { LogoutAdminUseCase } from '@/src/features/auth/application/use-cases/LogoutAdminUseCase';

// Cadastro público: client do servidor (anon, respeita RLS - apenas INSERT público)
export async function makeCreateAppointmentUseCase() {
  const client = await createServerSupabaseClient();
  return new CreateAppointmentUseCase(
    new SupabasePatientRepository(client),
    new SupabaseAppointmentRepository(client),
    new ResendEmailGateway(),
  );
}

// Validação do paciente e leitura por protocolo: server-side com service_role
// (anon SELECT foi removido; nunca expõe SELECT geral para anon)
export async function makeValidatePatientAccessUseCase() {
  const client = createAdminSupabaseClient();
  return new ValidatePatientAccessUseCase(
    new SupabaseAppointmentRepository(client),
    new SupabasePatientRepository(client),
  );
}

export async function makeListAppointmentsUseCase() {
  const client = createAdminSupabaseClient();
  return new ListAppointmentsUseCase(
    new SupabaseAppointmentRepository(client),
    new SupabasePatientRepository(client),
  );
}

export async function makeUpdateAppointmentUseCase() {
  const client = createAdminSupabaseClient();
  return new UpdateAppointmentUseCase(new SupabaseAppointmentRepository(client));
}

export async function makeDeleteAppointmentUseCase() {
  const client = createAdminSupabaseClient();
  return new DeleteAppointmentUseCase(
    new SupabaseAppointmentRepository(client),
    new SupabasePatientRepository(client),
  );
}

export async function makeGetAppointmentByProtocolUseCase() {
  const client = createAdminSupabaseClient();
  return new GetAppointmentByProtocolUseCase(
    new SupabaseAppointmentRepository(client),
    new SupabasePatientRepository(client),
  );
}

// Admin (após requireAdmin): service_role server-side, RLS fechado para anon/authenticated comum
export async function makeSaveEmailTemplatesUseCase() {
  const client = createAdminSupabaseClient();
  return new SaveEmailTemplatesUseCase(
    new SupabaseEmailTemplateRepository(client),
    new SupabaseAppointmentRepository(client),
  );
}

export async function makeSendSpecificAlertUseCase() {
  const client = createAdminSupabaseClient();
  return new SendSpecificAlertUseCase(
    new SupabaseAppointmentRepository(client),
    new SupabaseEmailTemplateRepository(client),
    new ResendEmailGateway(),
  );
}

export async function makeLoginAdminUseCase() {
  return new LoginAdminUseCase(new SupabaseAuthGateway());
}

export async function makeLogoutAdminUseCase() {
  return new LogoutAdminUseCase(new SupabaseAuthGateway());
}

// Crons: service role (bypassa RLS)
export function makeSendRoutineTuesdayUseCase() {
  const client = createAdminSupabaseClient();
  return new SendRoutineTuesdayUseCase(
    new SupabaseAppointmentRepository(client),
    new SupabaseEmailTemplateRepository(client),
    new ResendEmailGateway(),
  );
}

export function makeSendRoutineWednesdayUseCase() {
  const client = createAdminSupabaseClient();
  return new SendRoutineWednesdayUseCase(
    new SupabaseAppointmentRepository(client),
    new SupabaseEmailTemplateRepository(client),
    new ResendEmailGateway(),
  );
}

export function makeSendSurgeryAlertsUseCase() {
  const client = createAdminSupabaseClient();
  return new SendSurgeryAlertsUseCase(new SupabaseAppointmentRepository(client), new ResendEmailGateway());
}
