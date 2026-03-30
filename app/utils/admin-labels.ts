export function adminApprovalStatusLabel(status?: string | null): string {
  if (status === 'pending') return 'Pendente'
  if (status === 'approved') return 'Aprovado'
  if (status === 'rejected') return 'Recusado'
  return status || '—'
}

export function adminFormStatusLabel(status?: string | null): string {
  if (status === 'draft') return 'Rascunho'
  if (status === 'submitted') return 'Enviado'
  if (status === 'under_review') return 'Em análise'
  if (status === 'approved') return 'Aprovado'
  if (status === 'rejected') return 'Recusado'
  return status || '—'
}

export function adminCommentStatusLabel(status?: string | null): string {
  if (status === 'pending') return 'Pendente'
  if (status === 'approved') return 'Aprovado'
  if (status === 'rejected') return 'Recusado'
  return status || '—'
}

export function adminPaymentStatusLabel(status?: string | null): string {
  if (status === 'pending') return 'Pendente'
  if (status === 'paid') return 'Pago'
  if (status === 'expired') return 'Expirado'
  if (status === 'failed') return 'Falhou'
  if (status === 'cancelled') return 'Cancelado'
  return status || '—'
}

export function adminGatewayLabel(gateway?: string | null): string {
  if (gateway === 'pix') return 'PIX'
  if (gateway === 'admin') return 'Manual (Admin)'
  return gateway || '—'
}

export function adminMediaModerationStatusLabel(status?: string | null): string {
  if (status === 'pending') return 'Pendente'
  if (status === 'registration') return 'Aguardando aprovação do cadastro'
  if (status === 'approved') return 'Aprovada'
  if (status === 'rejected') return 'Recusada'
  return status || '—'
}

export function adminAccountStatusLabel(status?: string | null): string {
  if (status === 'pending_activation') return 'Pendente ativação'
  if (status === 'active') return 'Ativa'
  if (status === 'suspended') return 'Suspensa'
  return status || '—'
}

export function adminProfileTypeLabel(type?: string | null): string {
  if (type === 'women') return 'Mulher'
  if (type === 'men') return 'Homem'
  if (type === 'trans') return 'Trans'
  return type || '—'
}

export function adminServiceTypeLabel(type?: string | null): string {
  if (type === 'companion') return 'Acompanhante'
  if (type === 'masseuse') return 'Massagista'
  return type || '—'
}
