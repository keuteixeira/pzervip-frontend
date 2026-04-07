/**
 * Texto curto para badge «Chegou…» (mesmo lugar do «Disponível agora» no card).
 * A data de referência vem de `arrived_in_city_at` (aprovação, mudança de cidade ou reativação do anúncio).
 * Mostra no máximo até ~72h após a referência; depois `null`.
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

  /** Após 3 dias corridos (72h) não exibe mais — último texto é «há 2 dias». */
  const maxMs = 72 * 60 * 60 * 1000
  if (diffMs >= maxMs) {
    return null
  }

  const diffHours = diffMs / 3600000

  if (diffHours < 2) {
    return 'Chegou agora'
  }
  if (diffHours < 24) {
    return 'Chegou há algumas horas'
  }
  if (diffHours < 48) {
    return 'Chegou há 1 dia'
  }
  return 'Chegou há 2 dias'
}
