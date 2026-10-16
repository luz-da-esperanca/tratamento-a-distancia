import type { SupabaseClient } from '@supabase/supabase-js';
import { Patient } from '../../domain/entities/Patient';
import type { PatientRepository } from '../../domain/repositories/PatientRepository';
import { rethrowAsRepositoryError } from '@/src/shared/infrastructure/database/supabase/supabaseError';
import { parseDateOnly, toDateOnlyISO } from '@/src/shared/utils/date';

export class SupabasePatientRepository implements PatientRepository {
  constructor(private readonly client: SupabaseClient) {}

  async save(patient: Patient): Promise<void> {    
    const { error } = await this.client.from('pacientes').insert({
      id: patient.id,
      nome_completo: patient.nomeCompleto,
      data_nascimento: toDateOnlyISO(patient.dataNascimento),
      pais: patient.pais,
      estado: patient.estado,
      cidade: patient.cidade,
      endereco: patient.endereco,
    });

    if (error) {
      rethrowAsRepositoryError(error, 'Não foi possível salvar o paciente.');
    }
  }

  async findById(id: string): Promise<Patient | null> {
    const { data, error } = await this.client.from('pacientes').select('*').eq('id', id).maybeSingle();

    if (error || !data) {
      return null;
    }

    const dataDeNascimento = data.data_nascimento;

    const date = parseDateOnly(dataDeNascimento);

    return Patient.reconstituir({
      id: data.id,
      nomeCompleto: data.nome_completo,
      dataNascimento: date,
      pais: data.pais,
      estado: data.estado,
      cidade: data.cidade,
      endereco: data.endereco,
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('pacientes').delete().eq('id', id);

    if (error) {
      rethrowAsRepositoryError(error, 'Não foi possível excluir o paciente.');
    }
  }
}
