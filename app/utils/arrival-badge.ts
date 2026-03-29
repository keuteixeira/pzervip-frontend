/**
 * Texto curto para badge "chegou há…" (até 3 dias corridos após a data de chegada na cidade).
 * Retorna `null` se fora da janela ou data inválida.
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
  /** Até 4 dias no máximo para cobrir "há 3 dias" em calendário sem cortar às 72h exatas */
  const maxMs = 4 * 24 * 60 * 60 * 1000
  if (diffMs > maxMs) {
    return null
  }

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round(
    (startOfDay(now).getTime() - startOfDay(arrived).getTime()) / (24 * 60 * 60 * 1000),
  )
  if (dayDiff > 3) {
    return null
  }

  if (dayDiff === 1) {
    return 'Chegou ontem'
  }
  if (dayDiff === 2) {
    return 'Chegou há 2 dias'
  }
  if (dayDiff === 3) {
    return 'Chegou há 3 dias'
  }

  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)

  if (mins < 90) {
    if (mins < 1) {
      return 'Chegou agora há pouco'
    }
    if (mins < 60) {
      return `Chegou há ${mins} min`
    }
    return 'Chegou há 1 hora'
  }
  if (hours < 24) {
    return 'Chegou há algumas horas'
  }
  return 'Chegou há algumas horas'
}
