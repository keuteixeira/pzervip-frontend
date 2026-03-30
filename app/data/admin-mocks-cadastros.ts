/**
 * Mocks só da lista/detalhe de cadastros admin — arquivo separado para não puxar o restante de admin-mocks no HMR.
 */

export type MockCadastroRow = {
  id: number
  professional_name: string | null
  approval_status: string
  form_status: string
  user?: { name: string; email?: string }
  public_slug?: string | null
  plan_type?: string | null
  premium_tier?: number | null
  registration_paid_at?: string | null
  priority_destaque_paid?: boolean
  analysis_deadline_at?: string | null
  analysis_business_days_allowed?: number
  analysis_is_overdue?: boolean
}

export const ADMIN_MOCK_CADASTROS: MockCadastroRow[] = [
  {
    id: 501,
    professional_name: 'Luna — Massoterapeuta',
    approval_status: 'pending',
    form_status: 'complete',
    plan_type: 'premium',
    premium_tier: 3,
    registration_paid_at: '2026-03-28T14:00:00.000Z',
    priority_destaque_paid: true,
    analysis_deadline_at: '2026-03-31T23:59:59.000Z',
    analysis_business_days_allowed: 2,
    analysis_is_overdue: false,
    user: { name: 'Maria Silva Santos' },
  },
  {
    id: 502,
    professional_name: 'Alexandre VIP',
    approval_status: 'pending',
    form_status: 'complete',
    plan_type: 'basic',
    priority_destaque_paid: false,
    analysis_deadline_at: '2026-04-07T23:59:59.000Z',
    analysis_business_days_allowed: 5,
    analysis_is_overdue: false,
    user: { name: 'Alexandre Costa' },
  },
  {
    id: 503,
    professional_name: 'Camila Rose',
    approval_status: 'pending',
    form_status: 'draft',
    user: { name: 'Camila R. Oliveira' },
  },
  {
    id: 504,
    professional_name: 'Perfil já aprovado (exemplo)',
    approval_status: 'approved',
    form_status: 'complete',
    user: { name: 'Pedro Exemplo' },
  },
  {
    id: 505,
    professional_name: 'Cadastro recusado (exemplo)',
    approval_status: 'rejected',
    form_status: 'complete',
    user: { name: 'Luca Teste' },
  },
]

function sortCadastroRowsLikeApi(rows: MockCadastroRow[]): MockCadastroRow[] {
  return [...rows].sort((a, b) => {
    const aPending = a.approval_status === 'pending'
    const bPending = b.approval_status === 'pending'
    const aPaid = Boolean(a.plan_type === 'premium' && a.registration_paid_at)
    const bPaid = Boolean(b.plan_type === 'premium' && b.registration_paid_at)
    if (aPending && bPending) {
      if (aPaid !== bPaid) {
        return aPaid ? -1 : 1
      }
    }
    return a.id - b.id
  })
}

export function filterMockCadastros(status: string, queue = 'all'): MockCadastroRow[] {
  let rows = ADMIN_MOCK_CADASTROS.filter((r) => r.form_status !== 'draft')
  if (status !== 'all') {
    rows = rows.filter((r) => r.approval_status === status)
  }
  if (queue === 'gratuito') {
    rows = rows.filter((r) => r.plan_type === 'basic' || r.plan_type == null)
  } else if (queue === 'destaque') {
    rows = rows.filter((r) => r.plan_type === 'premium' && r.registration_paid_at)
  }
  return sortCadastroRowsLikeApi(rows)
}
