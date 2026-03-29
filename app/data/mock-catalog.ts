/**
 * Mock catalog — replace with Laravel API. Public URLs use Portuguese slugs (homens, mulheres, trans).
 */
export type GenderSlug = 'homens' | 'mulheres' | 'trans'

export interface CityItem {
  slug: string
  name: string
  count: number
  thumbUrl: string
}

export interface RegionItem {
  uf: string
  name: string
  cities: CityItem[]
}

export function cityThumbUrl(uf: string, slug: string): string {
  return `https://i.pravatar.cc/256?u=${encodeURIComponent(`${uf.toUpperCase()}-${slug}`)}`
}

function scaleCount(baseMulheres: number, gender: GenderSlug): number {
  if (gender === 'mulheres') {
    return baseMulheres
  }
  if (gender === 'homens') {
    return Math.max(0, Math.round(baseMulheres * 0.42))
  }
  return Math.max(0, Math.round(baseMulheres * 0.65))
}

type CityRaw = { slug: string; name: string; baseMulheres: number }

const REGIONS_BASE: { uf: string; name: string; cities: CityRaw[] }[] = [
  {
    uf: 'SP',
    name: 'São Paulo',
    cities: [
      { slug: 'sao-paulo', name: 'São Paulo', baseMulheres: 89 },
      { slug: 'campinas', name: 'Campinas', baseMulheres: 22 },
      { slug: 'santos', name: 'Santos', baseMulheres: 11 },
    ],
  },
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    cities: [
      { slug: 'rio-de-janeiro', name: 'Rio de Janeiro', baseMulheres: 67 },
      { slug: 'niteroi', name: 'Niterói', baseMulheres: 15 },
    ],
  },
  {
    uf: 'MG',
    name: 'Minas Gerais',
    cities: [{ slug: 'belo-horizonte', name: 'Belo Horizonte', baseMulheres: 45 }],
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    cities: [{ slug: 'porto-alegre', name: 'Porto Alegre', baseMulheres: 78 }],
  },
  {
    uf: 'BA',
    name: 'Bahia',
    cities: [
      { slug: 'salvador', name: 'Salvador', baseMulheres: 52 },
      { slug: 'feira-de-santana', name: 'Feira de Santana', baseMulheres: 12 },
      { slug: 'vitoria-da-conquista', name: 'Vitória da Conquista', baseMulheres: 0 },
    ],
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    cities: [{ slug: 'brasilia', name: 'Brasília', baseMulheres: 33 }],
  },
]

function sumCounts(region: RegionItem): number {
  return region.cities.reduce((s, c) => s + c.count, 0)
}

const buildRegions = (gender: GenderSlug): RegionItem[] => {
  return REGIONS_BASE.map((r) => {
    const cities: CityItem[] = r.cities
      .map((c) => {
        const count = scaleCount(c.baseMulheres, gender)
        return {
          slug: c.slug,
          name: c.name,
          count,
          thumbUrl: cityThumbUrl(r.uf, c.slug),
        }
      })
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)

    return { uf: r.uf, name: r.name, cities }
  })
    .filter((r) => r.cities.length > 0)
    .sort((a, b) => sumCounts(b) - sumCounts(a))
}

export function getRegionsByGender(gender: GenderSlug): RegionItem[] {
  return buildRegions(gender)
}

export function getTotalListingProfiles(gender: GenderSlug): number {
  return getRegionsByGender(gender).reduce((acc, r) => acc + sumCounts(r), 0)
}

export function getCity(
  gender: GenderSlug,
  uf: string,
  citySlug: string,
): { region: RegionItem; city: CityItem } | null {
  const regions = getRegionsByGender(gender)
  const region = regions.find((x) => x.uf.toLowerCase() === uf.toLowerCase())
  if (!region) {
    return null
  }
  const city = region.cities.find((c) => c.slug === citySlug)
  if (!city) {
    return null
  }
  return { region, city }
}

/** Query `?atendimento=` na listagem por cidade */
export type AttendimentoSlug = 'acompanhante' | 'massagista'

export type ProfileMediaKind = 'image' | 'video'

export interface ProfileMediaItem {
  url: string
  type: ProfileMediaKind
}

export interface ProfileSummary {
  id: string
  displayName: string
  city: string
  featured?: boolean
  neighborhood?: string
  premium?: boolean
  tipo_atendimento?: AttendimentoSlug
  /** Fotos/vídeos públicos (mock; API virá do backend) */
  gallery?: ProfileMediaItem[]
  /** 1–10 — ordenação entre premium (equivale a highlight_stars_cached) */
  highlight_stars?: number
  /** ISO — data de referência para badge "chegou há…" na cidade */
  arrived_in_city_at?: string
  /** Badge verde «Disponível agora» (prioridade sobre chegou há) */
  available_now_active?: boolean
}

export function getProfilesMock(gender: GenderSlug, uf: string, citySlug: string): ProfileSummary[] {
  const cityName =
    citySlug === 'sao-paulo'
      ? 'São Paulo'
      : citySlug === 'rio-de-janeiro'
        ? 'Rio de Janeiro'
        : citySlug === 'salvador'
          ? 'Salvador'
          : 'Cidade'

  const now = Date.now()
  const isoAgoMin = (m: number) => new Date(now - m * 60 * 1000).toISOString()
  const isoAgoDays = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString()

  if (gender === 'mulheres' && uf.toLowerCase() === 'sp' && citySlug === 'sao-paulo') {
    return [
      {
        id: '1',
        displayName: 'Ana Silva',
        city: cityName,
        neighborhood: 'Centro',
        premium: true,
        featured: true,
        highlight_stars: 10,
        arrived_in_city_at: isoAgoMin(40),
        available_now_active: true,
        tipo_atendimento: 'acompanhante',
        gallery: [
          { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&q=80', type: 'image' },
          { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=640&q=80', type: 'image' },
          { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=640&q=80', type: 'image' },
          { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&q=80', type: 'image' },
        ],
      },
      {
        id: '2',
        displayName: 'Beatriz Costas',
        city: cityName,
        neighborhood: 'Barra',
        premium: true,
        featured: true,
        highlight_stars: 8,
        arrived_in_city_at: isoAgoDays(1),
        tipo_atendimento: 'massagista',
        gallery: [
          { url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=640&q=80', type: 'image' },
          { url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=640&q=80', type: 'image' },
        ],
      },
      {
        id: '3',
        displayName: 'Carla Santos',
        city: cityName,
        neighborhood: 'Zona Sul',
        premium: false,
        featured: false,
        arrived_in_city_at: isoAgoDays(2),
        tipo_atendimento: 'acompanhante',
        gallery: [{ url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=640&q=80', type: 'image' }],
      },
    ]
  }

  return [
    {
      id: '1',
      displayName: 'Perfil exemplo A',
      city: cityName,
      neighborhood: 'Centro',
      premium: true,
      featured: true,
      highlight_stars: 10,
      arrived_in_city_at: isoAgoMin(20),
      tipo_atendimento: 'acompanhante',
      gallery: [
        { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=640&q=80', type: 'image' },
        { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=640&q=80', type: 'image' },
        { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=640&q=80', type: 'image' },
      ],
    },
    {
      id: '2',
      displayName: 'Perfil exemplo B',
      city: cityName,
      neighborhood: 'Zona Norte',
      premium: true,
      featured: true,
      highlight_stars: 7,
      arrived_in_city_at: isoAgoMin(200),
      tipo_atendimento: 'massagista',
      gallery: [
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&q=80', type: 'image' },
        { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=640&q=80', type: 'image' },
      ],
    },
    {
      id: '3',
      displayName: 'Perfil exemplo C',
      city: cityName,
      neighborhood: 'Zona Sul',
      premium: false,
      featured: false,
      arrived_in_city_at: isoAgoDays(1),
      tipo_atendimento: 'acompanhante',
      gallery: [{ url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=640&q=80', type: 'image' }],
    },
  ]
}

export interface ProfileComment {
  author: string
  text: string
  when: string
}

export type SocialNetworkKey = 'instagram' | 'x' | 'onlyfans' | 'tiktok' | 'privacy'

export type ProfileSocialLinks = Partial<Record<SocialNetworkKey, string>>

export interface ProfileDetail {
  id: string
  displayName: string
  locationLine: string
  memberSince: string
  premium: boolean
  tipoAtendimento: AttendimentoSlug
  about: string
  premiumBenefits: string[]
  comments: ProfileComment[]
  /** Dígitos com DDI, ex.: 5511999998888 (usado no link do WhatsApp) */
  whatsappPhone?: string
  socialLinks?: ProfileSocialLinks
}

const anaSilvaDetail = (id: string): ProfileDetail => ({
  id,
  displayName: 'Ana Silva',
  locationLine: 'Centro, São Paulo',
  memberSince: 'Março 2023',
  premium: true,
  tipoAtendimento: 'acompanhante',
  about:
    'Apaixonada por viajar e conhecer novas culturas. Amo a vida noturna do Rio e sempre em busca de novas aventuras. Trabalho com marketing digital e nas horas vagas gosto de praticar yoga e ir à praia.',
  premiumBenefits: [
    'Perfil verificado',
    'Fotos de alta qualidade',
    'Resposta garantida em 24h',
    'Prioridade nos resultados',
  ],
  comments: [
    {
      author: 'Carlos M.',
      text: 'Pessoa incrível! Super recomendo conhecer.',
      when: '2 dias atrás',
    },
    {
      author: 'Marina L.',
      text: 'Ótima companhia, muito divertida e inteligente!',
      when: '1 semana atrás',
    },
  ],
  whatsappPhone: '5511999196820',
  socialLinks: {
    instagram: 'https://www.instagram.com/',
    x: 'https://x.com/',
    tiktok: 'https://www.tiktok.com/',
  },
})

export function getProfileDetailMock(gender: GenderSlug, id: string): ProfileDetail | null {
  if (gender === 'mulheres' && id === '1') {
    return anaSilvaDetail(id)
  }

  if (gender === 'mulheres' && (id === '2' || id === '3')) {
    const row = getProfilesMock('mulheres', 'sp', 'sao-paulo').find((p) => p.id === id)
    const displayName = row?.displayName ?? `Perfil ${id}`
    return {
      id,
      displayName,
      locationLine: row?.neighborhood ? `${row.neighborhood}, São Paulo` : 'São Paulo',
      memberSince: 'Janeiro 2024',
      premium: row?.premium ?? false,
      tipoAtendimento: row?.tipo_atendimento ?? 'acompanhante',
      about:
        'Apresentação de exemplo — o conteúdo completo virá da API (equivalente ao perfil público no site).',
      premiumBenefits: [
        'Perfil verificado',
        'Fotos de alta qualidade',
        'Resposta garantida em 24h',
        'Prioridade nos resultados',
      ],
      comments: [{ author: 'Visitante', text: 'Ótima experiência.', when: '3 semanas atrás' }],
      whatsappPhone: id === '2' ? '5521987654321' : '5511987654321',
      socialLinks:
        id === '2'
          ? { onlyfans: 'https://onlyfans.com/', privacy: 'https://www.privacy.com.br/' }
          : { instagram: 'https://www.instagram.com/' },
    }
  }

  return {
    id,
    displayName: 'Perfil',
    locationLine: 'Brasil',
    memberSince: '2024',
    premium: false,
    tipoAtendimento: 'acompanhante',
    about: 'Texto de apresentação virá do backend.',
    premiumBenefits: [
      'Perfil verificado',
      'Fotos de alta qualidade',
      'Resposta garantida em 24h',
      'Prioridade nos resultados',
    ],
    comments: [],
    whatsappPhone: '5511999990000',
    socialLinks: {},
  }
}
