import { lastDayOfMonth, subDays, differenceInDays, addMonths, isFriday } from 'date-fns';

/**
 * Regra de negócio: a data da cirurgia é sempre a última sexta-feira do mês.
 */
export function calcularUltimaSextaDoMes(dataReferencia: Date = new Date()): Date {
  let data = lastDayOfMonth(dataReferencia);

  while (!isFriday(data)) {
    data = subDays(data, 1);
  }

  return data;
}

/**
 * Regra de negócio: trava de antecedência de 15 dias a partir do cadastro.
 * Se faltar menos de 15 dias para a última sexta do mês atual, a cirurgia
 * é movida para a última sexta-feira do mês seguinte.
 */
export function validarAntecedencia15Dias(dataCadastro: Date): Date {
  const ultimaSextaAtual = calcularUltimaSextaDoMes(dataCadastro);
  const diferencaDias = differenceInDays(ultimaSextaAtual, dataCadastro);

  if (diferencaDias < 15) {
    const mesSeguinte = addMonths(dataCadastro, 1);
    return calcularUltimaSextaDoMes(mesSeguinte);
  }

  return ultimaSextaAtual;
}
