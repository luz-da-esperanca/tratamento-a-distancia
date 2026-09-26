import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SupabasePatientRepository } from '@/src/features/patients/infrastructure/repositories/SupabasePatientRepository';
import { SupabaseAppointmentRepository } from '@/src/features/appointments/infrastructure/repositories/SupabaseAppointmentRepository';
import { SupabaseEmailTemplateRepository } from '@/src/features/emails/infrastructure/repositories/SupabaseEmailTemplateRepository';
import { ConflictError, RepositoryError } from '@/src/shared/domain/errors';
import { EmailTemplate } from '@/src/features/emails/domain/entities/EmailTemplate';
import { makeAppointment, makePatient, makeProtocolo } from '@/tests/helpers/factories';

/**
 * Testes de integração contra um projeto Supabase de TESTE (staging).
 * Gated por env — pulados sem elas, então `npm test` continua verde:
 *
 *   SUPABASE_TEST_URL=https://xxx.supabase.co
 *   SUPABASE_TEST_SERVICE_ROLE_KEY=...
 *   SUPABASE_TEST_ANON_KEY=...            (opcional, só p/ teste de RLS)
 *   npm run test:int
 *
 * NUNCA aponte para produção: os testes escrevem e apagam linhas reais.
 * Protocolos usam o ano 2099 para não colidir com dados reais.
 */
const URL = process.env.SUPABASE_TEST_URL;
const SERVICE_KEY = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY;
const enabled = !!URL && !!SERVICE_KEY;

let admin: SupabaseClient;
let pacientes: SupabasePatientRepository;
let agendamentos: SupabaseAppointmentRepository;
let templates: SupabaseEmailTemplateRepository;

// Rastreados para limpeza mesmo se um teste falhar no meio.
const createdProtocolos: string[] = [];
const createdPatientIds: string[] = [];
const createdAssuntos: string[] = [];

describe.skipIf(!enabled)('Supabase repositories (integração)', () => {
  beforeEach(() => {
    admin = createClient(URL!, SERVICE_KEY!);
    pacientes = new SupabasePatientRepository(admin);
    agendamentos = new SupabaseAppointmentRepository(admin);
    templates = new SupabaseEmailTemplateRepository(admin);
    createdProtocolos.length = 0;
    createdPatientIds.length = 0;
    createdAssuntos.length = 0;
  });

  afterEach(async () => {
    for (const protocolo of createdProtocolos) {
      await admin.from('agendamentos').delete().eq('protocolo', protocolo);
    }
    for (const id of createdPatientIds) {
      await admin.from('pacientes').delete().eq('id', id);
    }
    for (const assunto of createdAssuntos) {
      await admin.from('template_emails').delete().eq('assunto', assunto);
    }
  });

  it('paciente: save → findById (mapeamento snake_case + data) → delete', async () => {
    const id = randomUUID();
    createdPatientIds.push(id);
    const patient = makePatient({ id, dataNascimento: new Date('2000-05-10T12:00:00') });

    await pacientes.save(patient);
    const found = await pacientes.findById(id);

    expect(found?.nomeCompleto).toBe('Maria Silva');
    expect(found?.cidade).toBe('Fortaleza');
    // data_nascimento DATE volta sem timezone; compara só a data
    expect(found?.dataNascimento.toISOString().split('T')[0]).toBe('2000-05-10');

    await pacientes.delete(id);
    expect(await pacientes.findById(id)).toBeNull();
  });

  it('agendamento: save → findByProtocol → update flags → findPendingRoutine → delete', async () => {
    const patientId = randomUUID();
    createdPatientIds.push(patientId);
    const protocolo = 'AGD-2099-0001';
    createdProtocolos.push(protocolo);
    await pacientes.save(makePatient({ id: patientId }));

    const appointment = makeAppointment({
      id: protocolo,
      protocolo: makeProtocolo(protocolo),
      pacienteId: patientId,
      dataCirurgia: new Date('2099-09-25T12:00:00'),
    });
    await agendamentos.save(appointment);

    const found = await agendamentos.findByProtocol(makeProtocolo(protocolo));
    expect(found?.emailNotificacao).toBe('a@b.com');
    expect(found?.enviouEmailTerca).toBe(false);
    expect(found?.dataCirurgia?.toISOString().split('T')[0]).toBe('2099-09-25');

    // pendente de terça antes da flag...
    const pendentesAntes = await agendamentos.findPendingRoutine('terca');
    expect(pendentesAntes.map((a) => a.protocolo.valor)).toContain(protocolo);

    // ...e some após marcar + update
    found!.marcarEmailTercaEnviado();
    await agendamentos.update(found!);
    const pendentesDepois = await agendamentos.findPendingRoutine('terca');
    expect(pendentesDepois.map((a) => a.protocolo.valor)).not.toContain(protocolo);

    await agendamentos.delete(protocolo);
    expect(await agendamentos.findByProtocol(makeProtocolo(protocolo))).toBeNull();
  });

  it('protocolo duplicado vira ConflictError (23505)', async () => {
    const patientId = randomUUID();
    createdPatientIds.push(patientId);
    const protocolo = 'AGD-2099-0002';
    createdProtocolos.push(protocolo);
    await pacientes.save(makePatient({ id: patientId }));
    const appointment = makeAppointment({
      id: protocolo,
      protocolo: makeProtocolo(protocolo),
      pacienteId: patientId,
    });
    await agendamentos.save(appointment);

    await expect(agendamentos.save(appointment)).rejects.toBeInstanceOf(ConflictError);
  });

  it('agendamento com paciente inexistente vira RepositoryError (FK 23503)', async () => {
    const protocolo = 'AGD-2099-0003';
    createdProtocolos.push(protocolo);
    const appointment = makeAppointment({
      id: protocolo,
      protocolo: makeProtocolo(protocolo),
      pacienteId: randomUUID(),
    });

    await expect(agendamentos.save(appointment)).rejects.toBeInstanceOf(RepositoryError);
  });

  it('templates: upsert → findById + registrarEnvioPontual', async () => {
    const assunto = `E2E-UP-${Date.now()}`;
    createdAssuntos.push(assunto);
    await templates.upsert(
      EmailTemplate.criar({ id: 9001, assunto, corpo: '<p>T</p>', tipo: 'PROGRAMADO' }),
    );

    const found = await templates.findById(9001);
    expect(found?.assunto).toBe(assunto);
    expect(found?.tipo).toBe('PROGRAMADO');

    const pontual = `E2E-PONTUAL-${Date.now()}`;
    createdAssuntos.push(pontual);
    await templates.registrarEnvioPontual(pontual, '<p>Oi</p>');
    const { data } = await admin
      .from('template_emails')
      .select('tipo')
      .eq('assunto', pontual)
      .maybeSingle();
    expect(data?.tipo).toBe('PONTUAL');

    await admin.from('template_emails').delete().eq('id', 9001);
  });

  it('resetRoutineFlags zera terca+quarta dos AGENDADOS', async () => {
    const patientId = randomUUID();
    createdPatientIds.push(patientId);
    const protocolo = 'AGD-2099-0004';
    createdProtocolos.push(protocolo);
    await pacientes.save(makePatient({ id: patientId }));
    const appointment = makeAppointment({
      id: protocolo,
      protocolo: makeProtocolo(protocolo),
      pacienteId: patientId,
      enviouEmailTerca: true,
      enviouEmailQuarta: true,
    });
    await agendamentos.save(appointment);

    await agendamentos.resetRoutineFlags();

    const found = await agendamentos.findByProtocol(makeProtocolo(protocolo));
    expect(found?.enviouEmailTerca).toBe(false);
    expect(found?.enviouEmailQuarta).toBe(false);
  });

  it('RLS endurecido: anon não lê (sem SELECT) mas pode inserir cadastro', async () => {
    if (!ANON_KEY) return; // RLS test exige SUPABASE_TEST_ANON_KEY
    const anon = createClient(URL!, ANON_KEY);

    // SELECT bloqueado para anon após 01_harden_rls_policies
    const { data } = await anon.from('agendamentos').select('protocolo').limit(1);
    expect(data ?? []).toEqual([]);

    // INSERT público do cadastro mantido
    const patientId = randomUUID();
    createdPatientIds.push(patientId);
    const { error } = await anon.from('pacientes').insert({
      id: patientId,
      nome_completo: 'RLS E2E',
      data_nascimento: '2000-01-01',
      pais: 'BR',
      estado: 'CE',
      cidade: 'Fortaleza',
      endereco: 'Rua E2E',
    });
    expect(error).toBeNull();
  });
});
