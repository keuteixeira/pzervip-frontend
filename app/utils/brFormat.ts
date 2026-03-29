/** Digits only, max 11. */
export function cpfDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}

/** Visual mask 000.000.000-00 */
export function formatCpfMask(value: string): string {
  const d = cpfDigits(value)
  if (d.length <= 3) {
    return d
  }
  if (d.length <= 6) {
    return `${d.slice(0, 3)}.${d.slice(3)}`
  }
  if (d.length <= 9) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  }
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
}

export function formatCepMask(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) {
    return d
  }
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

/** Apenas dígitos (WhatsApp BR: até 13 com DDI 55). */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 13)
}

/**
 * Máscara BR: (DD) NNNNN-NNNN ou +55 (DD) NNNNN-NNNN se começar com 55 (DDI).
 */
export function formatPhoneBrMask(value: string): string {
  const d = phoneDigits(value)
  if (d.startsWith('55')) {
    const rest = d.slice(2)
    if (rest.length === 0) {
      return '+55'
    }
    if (rest.length <= 2) {
      return `+55 (${rest}`
    }
    if (rest.length <= 6) {
      return `+55 (${rest.slice(0, 2)}) ${rest.slice(2)}`
    }
    if (rest.length <= 10) {
      return `+55 (${rest.slice(0, 2)}) ${rest.slice(2, 6)}-${rest.slice(6)}`
    }
    return `+55 (${rest.slice(0, 2)}) ${rest.slice(2, 7)}-${rest.slice(7, 11)}`
  }
  const n = d.slice(0, 11)
  if (n.length <= 2) {
    return n.length ? `(${n}` : ''
  }
  if (n.length <= 6) {
    return `(${n.slice(0, 2)}) ${n.slice(2)}`
  }
  if (n.length <= 10) {
    return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  }
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`
}
