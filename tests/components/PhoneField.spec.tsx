// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneField } from '@/app/components/shared/PhoneField';

function renderField(props: Partial<Parameters<typeof PhoneField>[0]> = {}) {
  const onChange = vi.fn();
  render(<PhoneField value="" onChange={onChange} {...props} />);
  return { onChange };
}

describe('PhoneField', () => {
  it('renderiza input de telefone com placeholder nacional', () => {
    renderField();

    expect(screen.getByPlaceholderText('(85) 98888-8888')).toBeInTheDocument();
  });

  it('digitação nacional emite E.164 com DDI do Brasil', async () => {
    const user = userEvent.setup();
    const { onChange } = renderField();

    await user.type(screen.getByPlaceholderText('(85) 98888-8888'), '85999999999');

    expect(onChange).toHaveBeenLastCalledWith('+5585999999999');
  });

  it('valor E.164 controlado é exibido formatado (internacional)', () => {
    renderField({ value: '+5585999999999' });

    expect(screen.getByPlaceholderText('(85) 98888-8888')).toHaveValue('+55 85 99999 9999');
  });

  it('hasError marca aria-invalid', () => {
    renderField({ hasError: true });

    expect(screen.getByPlaceholderText('(85) 98888-8888')).toHaveAttribute('aria-invalid', 'true');
  });

  it('disabled desabilita o input', () => {
    renderField({ disabled: true });

    expect(screen.getByPlaceholderText('(85) 98888-8888')).toBeDisabled();
  });
});
