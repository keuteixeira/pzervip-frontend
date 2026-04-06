function normKey(status?: string | null): string {
  return (status ?? '').trim().toLowerCase()
}

/** Status do cadastro (aprovação / KYC). */
export function adminApprovalStatusLabel(status?: string | null): string {
  const k = normKey(status)
  if (k === 'pending') return 'Pendente'
  if (k === 'approved') return 'Aprovado'
  if (k === 'rejected') return 'Recusado'
  return status?.trim() || '—'
}

/**
 * Status do formulário de cadastro (pré-cadastro): rascunho vs preenchimento concluído.
 * No banco: `draft` | `complete`.
 */
export function adminFormStatusLabel(status?: string | null): string {
  const k = normKey(status)
  if (k === 'draft') return 'Rascunho'
  if (k === 'complete') return 'Formulário completo'
  if (k === 'submitted') return 'Enviado'
  if (k === 'under_review') return 'Em análise'
  if (k === 'approved') return 'Aprovado'
  if (k === 'rejected') return 'Recusado'
  return status?.trim() || '—'
}

/** Slug público na URL — só para exibição no admin (primeira letra maiúscula). */
export function adminPublicSlugDisplay(slug?: string | null): string {
  const s = (slug ?? '').trim()
  if (!s) return '—'
  return s.charAt(0).toLocaleUpperCase('pt-BR') + s.slice(1)
}

/** Papel da conta (ex.: anunciante). */
export function adminUserRoleLabel(role?: string | null): string {
  const k = normKey(role)
  if (k === 'advertiser') return 'Anunciante'
  if (k === 'admin') return 'Administrador'
  if (!k) return '—'
  const raw = String(role).trim()
  return raw.charAt(0).toLocaleUpperCase('pt-BR') + raw.slice(1)
}

export function adminCommentStatusLabel(status?: string | null): string {
  const k = normKey(status)
  if (k === 'pending') return 'Pendente'
  if (k === 'approved') return 'Aprovado'
  if (k === 'rejected') return 'Recusado'
  return status?.trim() || '—'
}

export function adminPaymentStatusLabel(status?: string | null): string {
  const k = normKey(status)
  if (k === 'pending') return 'Pendente'
  if (k === 'paid') return 'Pago'
  if (k === 'expired') return 'Expirado'
  if (k === 'failed') return 'Falhou'
  if (k === 'cancelled') return 'Cancelado'
  return status?.trim() || '—'
}

export function adminGatewayLabel(gateway?: string | null): string {
  const k = normKey(gateway)
  if (k === 'pix') return 'PIX'
  if (k === 'admin') return 'Manual (Admin)'
  return gateway?.trim() || '—'
}

export function adminMediaModerationStatusLabel(status?: string | null): string {
  const k = normKey(status)
  if (k === 'pending') return 'Pendente'
  if (k === 'registration') return 'Aguardando aprovação do cadastro'
  if (k === 'approved') return 'Aprovada'
  if (k === 'rejected') return 'Recusada'
  return status?.trim() || '—'
}

export function adminAccountStatusLabel(status?: string | null): string {
  const k = normKey(status)
  if (k === 'pending_activation') return 'Pendente ativação'
  if (k === 'active') return 'Ativa'
  if (k === 'suspended') return 'Suspensa'
  return status?.trim() || '—'
}

export function adminProfileTypeLabel(type?: string | null): string {
  const k = normKey(type)
  if (k === 'women') return 'Mulher'
  if (k === 'men') return 'Homem'
  if (k === 'trans') return 'Trans'
  return type?.trim() || '—'
}

export function adminServiceTypeLabel(type?: string | null): string {
  const k = normKey(type)
  if (k === 'companion') return 'Acompanhante'
  if (k === 'masseuse') return 'Massagista'
  return type?.trim() || '—'
}
