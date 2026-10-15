/**
 * Extrai o IP do chamador dos headers. No Netlify/Hospedagem o IP real vem
 * no primeiro item do `x-forwarded-for`; sem ele, retorna 'unknown'
 * (o throttle continua funcionando, agregado por superfície).
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return 'unknown';
}
