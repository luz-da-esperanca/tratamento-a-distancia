import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Núcleo server-safe da validação de telefone (sem dependências de UI).
 *
 * `phone.ts` importa `react-phone-number-input` (CSS/componentes React) e por
 * isso não pode ser puxado por entidades de domínio usadas em Server
 * Actions e rotas API — o bundle server quebra na avaliação do módulo.
 * Esta função é a fonte única da regra; `phone.ts` a reexporta.
 */
export function isValidPhone(value: string): boolean {
  if (!value) return false;
  try {
    return isValidPhoneNumber(value);
  } catch {
    return false;
  }
}
