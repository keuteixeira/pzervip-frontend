/**
 * Dados fictícios para visualizar o painel admin com `?mock=1` na URL.
 * Não substitui a API em produção.
 */

export type MockCadastroRow = {
  id: number
  professional_name: string | null
  approval_status: string
  form_status: string
  user?: { name: string }
  public_slug?: string | null
}

export const ADMIN_MOCK_CADASTROS: MockCadastroRow[] = [
  {
    id: 501,
    professional_name: 'Luna — Massoterapeuta',
    approval_status: 'pending',
    form_status: 'complete',
    user: { name: 'Maria Silva Santos' },
  },
  {
    id: 502,
    professional_name: 'Alexandre VIP',
    approval_status: 'pending',
    form_status: 'complete',
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

export const ADMIN_MOCK_ANUNCIANTES: MockCadastroRow[] = [
  {
    id: 199,
    professional_name: 'Novo perfil aguardando (mock)',
    public_slug: 'novo-perfil-mock',
    approval_status: 'pending',
    user: { name: 'Fulano Mock' },
  },
  {
    id: 201,
    professional_name: 'Juliana Premium',
    public_slug: 'juliana-premium-sp',
    approval_status: 'approved',
    user: { name: 'Juliana Ferreira' },
  },
  {
    id: 202,
    professional_name: 'Rafa Elite',
    public_slug: 'rafa-elite-rj',
    approval_status: 'approved',
    user: { name: 'Rafael Mendes' },
  },
  {
    id: 203,
    professional_name: 'Studio Aurora',
    public_slug: 'studio-aurora-bh',
    approval_status: 'approved',
    user: { name: 'Patricia Nunes' },
  },
]

export const ADMIN_MOCK_PROFILE_DETAIL = {
  id: 201,
  uuid: '550e8400-e29b-41d4-a716-446655440001',
  public_slug: 'juliana-premium-sp',
  professional_name: 'Juliana Premium',
  approval_status: 'approved',
  form_status: 'complete',
  bio: 'Atendimento personalizado, ambiente discreto e horários flexíveis. Especialista em massagem e companhia para eventos.',
  whatsapp: '11999887766',
  profile_type: 'women',
  service_type: 'companion',
  plan_type: 'premium',
  premium_tier: 4,
  highlight_stars_cached: 4,
  destaque_remaining_seconds: 2_592_000,
  user_paused_listing: false,
  neighborhood: 'Jardins',
  state_id: 26,
  city_id: 3550308,
  state: { id: 26, name: 'São Paulo', uf: 'SP' },
  city: { id: 3550308, name: 'São Paulo' },
  user: {
    id: 88,
    name: 'Juliana Ferreira',
    email: 'juliana.exemplo@email.com',
    account_status: 'active',
  },
  created_at: '2026-02-10T14:22:00.000Z',
  updated_at: '2026-03-28T09:15:00.000Z',
  registration: {
    mother_name: 'Helena Silva Santos',
    birth_date: '1992-04-18',
    contact_email: 'juliana.contato@email.com',
    cpf: '12345678901',
    address_json: {
      zipcode: '01310100',
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Apto 42',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state_uf: 'SP',
      country: 'BR',
    },
    has_venue: true,
    terms_accepted: true,
    current_step: 7,
    registration_paid_at: '2026-03-01T12:00:00.000Z',
    id_document_front_media_id: 9101,
    id_document_back_media_id: 9102,
    selfie_media_id: 9103,
    video_media_id: 9104,
    cover_media_id: 9001,
    portal_avatar_media_id: 9002,
    audio_media_id: null,
    gallery_media_ids: [9003, 9004],
  },
}

/** Ficha rica para revisão de cadastro (mock) — mescla perfil + registro. */
/** Mídias completas para tela de revisão (documentos + galeria + áudio). */
export function getMockCadastroMediaList() {
  const merged = [...ADMIN_MOCK_MEDIA_CADASTRO_EXTRA, ...ADMIN_MOCK_MEDIA_FOR_PROFILE]
  return merged.sort((a, b) => a.id - b.id)
}

/** Ficha de anunciante no mock — alinha nome/slug/status com a lista. */
export function getMockAnuncianteDetail(profileId: number) {
  const row = ADMIN_MOCK_ANUNCIANTES.find((r) => r.id === profileId)
  const base = ADMIN_MOCK_PROFILE_DETAIL
  if (!row) {
    return {
      ...base,
      id: profileId,
      professional_name: `Perfil #${profileId}`,
      public_slug: `perfil-${profileId}`,
    }
  }
  return {
    ...base,
    id: profileId,
    professional_name: row.professional_name,
    public_slug: row.public_slug ?? base.public_slug,
    approval_status: row.approval_status,
    user: {
      ...base.user,
      name: row.user?.name ?? base.user.name,
    },
  }
}

export function getMockCadastroReviewDetail(profileId: number) {
  const row = ADMIN_MOCK_CADASTROS.find((r) => r.id === profileId)
  const name = row?.professional_name ?? 'Candidato mock'
  const userName = row?.user?.name ?? 'Nome legal mock'
  return {
    ...ADMIN_MOCK_PROFILE_DETAIL,
    id: profileId,
    professional_name: name,
    public_slug: `mock-${profileId}`,
    approval_status: row?.approval_status ?? 'pending',
    form_status: row?.form_status ?? 'complete',
    bio: 'Texto de apresentação enviado no formulário. Experiência em atendimento, horários flexíveis e deslocamento.',
    user: {
      id: 8000 + profileId,
      name: userName,
      email: `candidato${profileId}@email.exemplo`,
      account_status: 'active',
    },
    registration: {
      ...ADMIN_MOCK_PROFILE_DETAIL.registration,
      mother_name: 'Mãe do cadastro (mock)',
      birth_date: '1990-08-22',
      contact_email: `contato${profileId}@email.exemplo`,
      cpf: '52998224725',
    },
  }
}

export const ADMIN_MOCK_MEDIA_FOR_PROFILE = [
  {
    id: 9001,
    collection_name: 'cover',
    kind: 'banner',
    kind_label: 'Banner (capa)',
    file_name: 'capa-banner-1920.jpg',
    mime_type: 'image/jpeg',
    moderation_status: 'pending',
    mock_preview_url: 'https://picsum.photos/seed/capa9001/1200/400',
  },
  {
    id: 9002,
    collection_name: 'portal_avatar',
    kind: 'profile_photo',
    kind_label: 'Foto de perfil',
    file_name: 'perfil-quadrado.jpg',
    mime_type: 'image/jpeg',
    moderation_status: 'pending',
    mock_preview_url: 'https://picsum.photos/seed/avatar9002/400/400',
  },
  {
    id: 9003,
    collection_name: 'gallery',
    kind: 'gallery_image',
    kind_label: 'Foto (galeria)',
    file_name: 'galeria-01.jpg',
    mime_type: 'image/jpeg',
    moderation_status: 'approved',
    mock_preview_url: 'https://picsum.photos/seed/gal9003/800/600',
  },
  {
    id: 9004,
    collection_name: 'gallery',
    kind: 'gallery_video',
    kind_label: 'Vídeo (galeria)',
    file_name: 'video-apresentacao.mp4',
    mime_type: 'video/mp4',
    moderation_status: 'pending',
    mock_preview_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: 9105,
    collection_name: 'audio',
    kind: 'audio',
    kind_label: 'Áudio',
    file_name: 'apresentacao.mp3',
    mime_type: 'audio/mpeg',
    moderation_status: 'pending',
    mock_preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
]

export const ADMIN_MOCK_MEDIA_PENDING = [
  {
    id: 8101,
    collection_name: 'gallery',
    kind: 'gallery_image',
    kind_label: 'Foto (galeria)',
    file_name: 'foto-nova-quarto.jpg',
    mime_type: 'image/jpeg',
    mock_preview_url: 'https://picsum.photos/seed/pend8101/900/600',
    advertiser_profile: {
      id: 201,
      professional_name: 'Juliana Premium',
      public_slug: 'juliana-premium-sp',
    },
  },
  {
    id: 8102,
    collection_name: 'cover',
    kind: 'banner',
    kind_label: 'Banner (capa)',
    file_name: 'banner-substituido.webp',
    mime_type: 'image/webp',
    mock_preview_url: 'https://picsum.photos/seed/pend8102/1200/400',
    advertiser_profile: {
      id: 202,
      professional_name: 'Rafa Elite',
      public_slug: 'rafa-elite-rj',
    },
  },
  {
    id: 8103,
    collection_name: 'portal_avatar',
    kind: 'profile_photo',
    kind_label: 'Foto de perfil',
    file_name: 'avatar-atualizado.png',
    mime_type: 'image/png',
    mock_preview_url: 'https://picsum.photos/seed/pend8103/400/400',
    advertiser_profile: {
      id: 203,
      professional_name: 'Studio Aurora',
      public_slug: 'studio-aurora-bh',
    },
  },
]

/** Mídias extras só na tela de revisão de cadastro (documentos + verificação). */
export const ADMIN_MOCK_MEDIA_CADASTRO_EXTRA = [
  {
    id: 9101,
    collection_name: 'id_document_front',
    kind: 'id_front',
    kind_label: 'Documento — frente',
    file_name: 'rg-frente.jpg',
    mime_type: 'image/jpeg',
    moderation_status: 'pending',
    mock_preview_url: 'https://picsum.photos/seed/rgf/700/440',
  },
  {
    id: 9102,
    collection_name: 'id_document_back',
    kind: 'id_back',
    kind_label: 'Documento — verso',
    file_name: 'rg-verso.jpg',
    mime_type: 'image/jpeg',
    moderation_status: 'pending',
    mock_preview_url: 'https://picsum.photos/seed/rgv/700/440',
  },
  {
    id: 9103,
    collection_name: 'selfie',
    kind: 'selfie',
    kind_label: 'Selfie de verificação',
    file_name: 'selfie.jpg',
    mime_type: 'image/jpeg',
    moderation_status: 'pending',
    mock_preview_url: 'https://picsum.photos/seed/selfie/500/500',
  },
  {
    id: 9104,
    collection_name: 'video',
    kind: 'verification_video',
    kind_label: 'Vídeo de verificação',
    file_name: 'verificacao.mp4',
    mime_type: 'video/mp4',
    moderation_status: 'pending',
    mock_preview_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
]

export const ADMIN_MOCK_COMMENTS = [
  {
    id: 4001,
    author_display: 'Carlos M.',
    body: 'Muito profissional, recomendo. O horário combinado foi respeitado.',
    status: 'pending',
    advertiser_profile: {
      id: 201,
      professional_name: 'Juliana Premium',
      public_slug: 'juliana-premium-sp',
    },
  },
  {
    id: 4002,
    author_display: 'Anônimo',
    body: 'Gostaria de saber se atende na região da Paulista.',
    status: 'pending',
    advertiser_profile: {
      id: 202,
      professional_name: 'Rafa Elite',
      public_slug: 'rafa-elite-rj',
    },
  },
  {
    id: 4003,
    author_display: 'Fernanda',
    body: 'Obrigada pela atenção no atendimento.',
    status: 'approved',
    advertiser_profile: {
      id: 201,
      professional_name: 'Juliana Premium',
      public_slug: 'juliana-premium-sp',
    },
  },
]

export const ADMIN_MOCK_HIGHLIGHT_ORDERS = [
  {
    id: 7001,
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    gateway: 'woovi',
    amount_brl: 450,
    stars: 3,
    period_months: 1,
    payment_status: 'paid',
    created_at: '2026-03-27T18:30:00.000Z',
    user: { name: 'Juliana Ferreira', email: 'juliana.exemplo@email.com' },
  },
  {
    id: 7002,
    uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    gateway: 'admin',
    amount_brl: 0,
    stars: 5,
    period_months: 2,
    payment_status: 'paid',
    created_at: '2026-03-26T10:00:00.000Z',
    user: { name: 'Rafael Mendes', email: 'rafa.exemplo@email.com' },
  },
  {
    id: 7003,
    uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    gateway: 'woovi',
    amount_brl: 900,
    stars: 4,
    period_months: 2,
    payment_status: 'pending',
    created_at: '2026-03-29T08:45:00.000Z',
    user: { name: 'Patricia Nunes', email: 'patricia.exemplo@email.com' },
  },
  {
    id: 7004,
    uuid: 'd4e5f6a7-b8c9-0123-def0-234567890123',
    gateway: 'woovi',
    amount_brl: 150,
    stars: 1,
    period_months: 1,
    payment_status: 'failed',
    created_at: '2026-03-25T22:10:00.000Z',
    user: { name: 'Visitante Teste', email: 'visitante@email.com' },
  },
]

export function filterMockCadastros(status: string): MockCadastroRow[] {
  if (status === 'all') {
    return [...ADMIN_MOCK_CADASTROS]
  }
  return ADMIN_MOCK_CADASTROS.filter((r) => r.approval_status === status)
}

export function filterMockAnunciantes(status: string, q: string): MockCadastroRow[] {
  let rows = [...ADMIN_MOCK_ANUNCIANTES]
  if (status !== 'all') {
    rows = rows.filter((r) => r.approval_status === status)
  }
  const term = q.trim().toLowerCase()
  if (term) {
    rows = rows.filter(
      (r) =>
        (r.professional_name && r.professional_name.toLowerCase().includes(term)) ||
        (r.public_slug && r.public_slug.toLowerCase().includes(term)) ||
        (r.user?.name && r.user.name.toLowerCase().includes(term)),
    )
  }
  return rows
}

export function filterMockComments(status: string) {
  if (status === 'all') {
    return [...ADMIN_MOCK_COMMENTS]
  }
  return ADMIN_MOCK_COMMENTS.filter((c) => c.status === status)
}

export function filterMockHighlightOrders(paymentStatus: string) {
  if (paymentStatus === 'all' || !paymentStatus) {
    return [...ADMIN_MOCK_HIGHLIGHT_ORDERS]
  }
  return ADMIN_MOCK_HIGHLIGHT_ORDERS.filter((o) => o.payment_status === paymentStatus)
}
