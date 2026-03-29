/** Exibe dígitos (com DDI 55) em formato legível para WhatsApp / perfil público. */
export function formatPhoneBrDigits(digits: string | null | undefined): string {
  const d = String(digits ?? '').replace(/\D/g, '')
  if (d.length >= 12 && d.startsWith('55')) {
    const rest = d.slice(2)
    const ddd = rest.slice(0, 2)
    const num = rest.slice(2)
    if (num.length === 9) {
      return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`
    }
    if (num.length === 8) {
      return `+55 (${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`
    }
  }
  if (d.length >= 10 && d.length <= 11 && !d.startsWith('55')) {
    const ddd = d.slice(0, 2)
    const num = d.slice(2)
    if (num.length === 9) {
      return `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`
    }
    return `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`
  }
  return digits ?? '—'
}
