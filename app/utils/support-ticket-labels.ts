export const supportSubjects = [
  { value: 'payment', label: 'Pagamentos' },
  { value: 'profile_update', label: 'Atualização cadastral' },
  { value: 'billing', label: 'Cobrança e plano' },
  { value: 'media_moderation', label: 'Mídias e moderação' },
  { value: 'account_access', label: 'Acesso à conta' },
  { value: 'technical_issue', label: 'Problema técnico' },
  { value: 'other', label: 'Outros assuntos' },
] as const

export const supportPriorities = [
  { value: 'low', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
] as const

export function supportStatusLabel(status: string): string {
  if (status === 'open') return 'Aberto'
  if (status === 'waiting_user') return 'Aguardando anunciante'
  if (status === 'waiting_admin') return 'Aguardando suporte'
  if (status === 'resolved') return 'Resolvido'
  if (status === 'closed') return 'Fechado'
  return status
}

export function supportSubjectLabel(subject: string): string {
  return supportSubjects.find((x) => x.value === subject)?.label ?? subject
}

export function supportPriorityLabel(priority: string): string {
  return supportPriorities.find((x) => x.value === priority)?.label ?? priority
}
