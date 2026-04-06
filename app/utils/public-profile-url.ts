/**
 * Segmento de URL pública: /acompanhante/:slug ou /massagista/:slug
 * Aceita valores da API (companion, masseuse) ou segmentos de URL (acompanhante, massagista).
 */
export function publicProfilePathSegment(
  serviceType: string | null | undefined,
): 'acompanhante' | 'massagista' {
  const t = (serviceType ?? '').toLowerCase()
  if (t === 'masseuse' || t === 'massagista') {
    return 'massagista'
  }
  return 'acompanhante'
}

export function buildPublicProfilePath(
  publicSlug: string,
  serviceType: string | null | undefined,
): string {
  return `/${publicProfilePathSegment(serviceType)}/${publicSlug}`
}
