// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchableSelect, type SelectOption } from '@/app/components/shared/SearchableSelect';

const OPTIONS: SelectOption[] = [
  { code: 'BR', name: 'Brasil' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DE', name: 'Alemanha' },
];

function renderSelect(props: Partial<Parameters<typeof SearchableSelect>[0]> = {}) {
  const onChange = vi.fn();
  render(
    <SearchableSelect
      options={OPTIONS}
      value=""
      onChange={onChange}
      placeholder="Selecione o país"
      searchPlaceholder="Digite o nome do país..."
      {...props}
    />,
  );
  return { onChange };
}

describe('SearchableSelect', () => {
  it('abre a lista ao clicar e seleciona a opção', async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect();

    await user.click(screen.getByPlaceholderText('Selecione o país'));
    const listbox = await screen.findByRole('listbox');
    const option = within(listbox).getByRole('option', { name: 'Ceará' });
    await user.click(within(option).getByRole('button'));

    expect(onChange).toHaveBeenCalledWith('Ceará');
  });

  it('filtra sem acento (ceara encontra Ceará)', async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByPlaceholderText('Selecione o país'));
    await user.type(screen.getByPlaceholderText('Digite o nome do país...'), 'ceara');

    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByRole('option', { name: 'Ceará' })).toBeInTheDocument();
    expect(within(listbox).queryByRole('option', { name: 'Brasil' })).not.toBeInTheDocument();
  });

  it('mostra "Nenhum resultado" sem matches', async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByPlaceholderText('Selecione o país'));
    await user.type(screen.getByPlaceholderText('Digite o nome do país...'), 'zzz');

    expect(await screen.findByText('Nenhum resultado')).toBeInTheDocument();
  });

  it('fecha com Escape', async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByPlaceholderText('Selecione o país'));
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('fecha ao clicar fora', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button>fora</button>
        <SearchableSelect options={OPTIONS} value="" onChange={vi.fn()} />
      </div>,
    );

    await user.click(screen.getByRole('combobox'));
    await screen.findByRole('listbox');
    await user.click(screen.getByRole('button', { name: 'fora' }));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('desabilitado não abre', async () => {
    const user = userEvent.setup();
    renderSelect({ disabled: true });

    await user.click(screen.getByPlaceholderText('Selecione o país'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('exibe o valor selecionado no trigger', () => {
    renderSelect({ value: 'Brasil' });

    expect(screen.getByPlaceholderText('Selecione o país')).toHaveValue('Brasil');
  });
});

describe('SearchableSelect — teclado mobile', () => {
  it('resize na abertura (teclado) reposiciona sem fechar', async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByPlaceholderText('Selecione o país'));
    await screen.findByRole('listbox');

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('scroll na abertura (teclado) não fecha', async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByPlaceholderText('Selecione o país'));
    await screen.findByRole('listbox');

    act(() => {
      document.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('depois da carência, sem teclado, scroll do usuário fecha', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    const base = Date.now();
    nowSpy.mockReturnValue(base);

    try {
      renderSelect();
      fireEvent.click(screen.getByPlaceholderText('Selecione o país'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      nowSpy.mockReturnValue(base + 1000);
      act(() => {
        document.dispatchEvent(new Event('scroll', { bubbles: true }));
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('mudanças do visualViewport (teclado aberto) nunca fecham', async () => {
    const handlers: Record<string, Array<(event: Event) => void>> = {};
    const fakeViewport = {
      height: 400,
      offsetTop: 0,
      addEventListener: vi.fn((type: string, cb: EventListenerOrEventListenerObject) => {
        (handlers[type] ??= []).push(cb as (event: Event) => void);
      }),
      removeEventListener: vi.fn((type: string, cb: EventListenerOrEventListenerObject) => {
        handlers[type] = (handlers[type] ?? []).filter((h) => h !== cb);
      }),
    };
    Object.defineProperty(window, 'visualViewport', {
      value: fakeViewport,
      configurable: true,
    });

    try {
      const user = userEvent.setup();
      renderSelect();

      await user.click(screen.getByPlaceholderText('Selecione o país'));
      await screen.findByRole('listbox');
      expect(handlers.resize?.length).toBeGreaterThan(0);

      act(() => {
        handlers.resize?.forEach((h) => h(new Event('resize')));
        handlers.scroll?.forEach((h) => h(new Event('scroll')));
      });

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    } finally {
      Reflect.deleteProperty(window, 'visualViewport');
    }
  });
});
