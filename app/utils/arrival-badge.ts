/**
 * Texto curto para badge «Chegou…» (mesmo lugar do «Disponível agora» no card).
 * A data de referência vem de `arrived_in_city_at` (aprovação, mudança de cidade ou reativação do anúncio).
 * Só enquanto decorreram menos de 72h desde a referência; depois `null`.
 */
export function formatArrivalBadge(arrivedIso: string | undefined, now = new Date()): string | null {
  if (!arrivedIso) {
    return null
  }
  const arrived = new Date(arrivedIso)
  const t = arrived.getTime()
  if (Number.isNaN(t)) {
    return null
  }
  const diffMs = now.getTime() - t
  if (diffMs < 0) {
    return null
  }

  const maxMs = 72 * 60 * 60 * 1000
  if (diffMs >= maxMs) {
    return null
  }

  const diffHours = diffMs / 3600000

  if (diffHours < 3) {
    return 'Chegou agora'
  }
  if (diffHours < 24) {
    return 'Chegou hoje'
  }
  if (diffHours < 48) {
    return 'Chegou há 1 dia'
  }
  return 'Chegou há 2 dias'
}
