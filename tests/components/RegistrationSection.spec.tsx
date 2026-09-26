// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationSection } from '@/app/components/appointments/RegistrationSection';
import {
  codeByName,
  countries,
  getStates,
  hasStates,
} from '@/src/shared/infrastructure/data/locations';

vi.mock('@/src/features/appointments/presentation/actions/inscricao.actions', () => ({
  salvarAgendamento: vi.fn(),
}));

const PAIS_COM_ESTADOS = 'Brasil';
const ESTADO_BR = getStates(codeByName[PAIS_COM_ESTADOS])![0].name;
const OUTRO_PAIS_COM_ESTADOS = countries.find(
  (c) =>
    c.name !== PAIS_COM_ESTADOS &&
    hasStates(c.code) &&
    !getStates(c.code)!.some((s) => s.name === ESTADO_BR),
)!.name;
const PAIS_SEM_ESTADOS = countries.find((c) => !hasStates(c.code))!.name;

async function selecionarOpcao(
  user: ReturnType<typeof userEvent.setup>,
  triggerPlaceholder: string,
  searchPlaceholder: string,
  termo: string,
  nomeOpcao: string,
) {
  await user.click(screen.getByPlaceholderText(triggerPlaceholder));
  await user.type(screen.getByPlaceholderText(searchPlaceholder), termo);
  const listbox = await screen.findByRole('listbox');
  const option = within(listbox).getByRole('option', { name: nomeOpcao });
  await user.click(within(option).getByRole('button'));
}

describe('RegistrationSection — País/Estado', () => {
  it('Estado começa desabilitado pedindo o país', () => {
    render(<RegistrationSection />);

    const estado = screen.getByPlaceholderText('Selecione primeiro o país');
    expect(estado).toBeDisabled();
    expect(
      screen.getByText('Escolha o país para selecionar o estado.'),
    ).toBeInTheDocument();
  });

  it('troca de país restaura o estado anterior e limpa quando inválido na nova lista', async () => {
    const user = userEvent.setup();
    render(<RegistrationSection />);

    await selecionarOpcao(
      user,
      'Selecione o país',
      'Digite o nome do país...',
      PAIS_COM_ESTADOS,
      PAIS_COM_ESTADOS,
    );
    await selecionarOpcao(
      user,
      'Selecione o estado',
      'Digite o nome do estado...',
      ESTADO_BR,
      ESTADO_BR,
    );
    expect(screen.getByPlaceholderText('Selecione o estado')).toHaveValue(
      ESTADO_BR,
    );

    // Troca para país com outra lista: limpa (valor não existe lá).
    await selecionarOpcao(
      user,
      'Selecione o país',
      'Digite o nome do país...',
      OUTRO_PAIS_COM_ESTADOS,
      OUTRO_PAIS_COM_ESTADOS,
    );
    expect(screen.getByPlaceholderText('Selecione o estado')).toHaveValue('');

    // Volta ao país anterior: restaura sem precisar redigitar.
    await selecionarOpcao(
      user,
      'Selecione o país',
      'Digite o nome do país...',
      PAIS_COM_ESTADOS,
      PAIS_COM_ESTADOS,
    );
    expect(screen.getByPlaceholderText('Selecione o estado')).toHaveValue(
      ESTADO_BR,
    );
  });

  it('país sem lista mantém texto livre com orientação e restaura ao voltar', async () => {
    const user = userEvent.setup();
    render(<RegistrationSection />);

    await selecionarOpcao(
      user,
      'Selecione o país',
      'Digite o nome do país...',
      PAIS_SEM_ESTADOS,
      PAIS_SEM_ESTADOS,
    );

    const livre = screen.getByPlaceholderText('Ex.: Piauí');
    expect(
      screen.getByText(/não possui lista oficial/i),
    ).toBeInTheDocument();
    await user.type(livre, 'Região X');

    await selecionarOpcao(
      user,
      'Selecione o país',
      'Digite o nome do país...',
      PAIS_COM_ESTADOS,
      PAIS_COM_ESTADOS,
    );
    expect(screen.getByPlaceholderText('Selecione o estado')).toHaveValue('');

    await selecionarOpcao(
      user,
      'Selecione o país',
      'Digite o nome do país...',
      PAIS_SEM_ESTADOS,
      PAIS_SEM_ESTADOS,
    );
    expect(screen.getByPlaceholderText('Ex.: Piauí')).toHaveValue('Região X');
  });
});
