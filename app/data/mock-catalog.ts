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

export type RegionSlug = 'sudeste' | 'nordeste' | 'centro-oeste' | 'sul' | 'norte'

export interface StateItem {
  uf: string
  name: string
  region: RegionSlug
  cities: CityItem[]
  totalProfiles: number
  totalCities: number
}

export interface RegionItem {
  slug: RegionSlug
  name: string
  states: StateItem[]
  totalProfiles: number
  totalStates: number
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

type StateRaw = { uf: string; name: string; region: RegionSlug; cities: CityRaw[] }

type StateDirectoryRaw = { uf: string; name: string; region: RegionSlug }

const STATES_BASE: StateRaw[] = [
  {
    uf: 'SP',
    name: 'São Paulo',
    region: 'sudeste',
    cities: [
      { slug: 'sao-paulo', name: 'São Paulo', baseMulheres: 89 },
      { slug: 'campinas', name: 'Campinas', baseMulheres: 22 },
      { slug: 'guarulhos', name: 'Guarulhos', baseMulheres: 20 },
      { slug: 'sao-bernardo-do-campo', name: 'São Bernardo do Campo', baseMulheres: 18 },
      { slug: 'santo-andre', name: 'Santo André', baseMulheres: 17 },
      { slug: 'osasco', name: 'Osasco', baseMulheres: 16 },
      { slug: 'sao-jose-dos-campos', name: 'São José dos Campos', baseMulheres: 16 },
      { slug: 'sorocaba', name: 'Sorocaba', baseMulheres: 15 },
      { slug: 'ribeirao-preto', name: 'Ribeirão Preto', baseMulheres: 14 },
      { slug: 'sao-jose-do-rio-preto', name: 'São José do Rio Preto', baseMulheres: 13 },
      { slug: 'maua', name: 'Mauá', baseMulheres: 12 },
      { slug: 'mogi-das-cruzes', name: 'Mogi das Cruzes', baseMulheres: 12 },
      { slug: 'jundiai', name: 'Jundiaí', baseMulheres: 11 },
      { slug: 'santos', name: 'Santos', baseMulheres: 11 },
      { slug: 'diadema', name: 'Diadema', baseMulheres: 11 },
      { slug: 'piracicaba', name: 'Piracicaba', baseMulheres: 10 },
      { slug: 'bauru', name: 'Bauru', baseMulheres: 10 },
      { slug: 'sao-vicente', name: 'São Vicente', baseMulheres: 9 },
      { slug: 'taubate', name: 'Taubaté', baseMulheres: 8 },
      { slug: 'franca', name: 'Franca', baseMulheres: 8 },
    ],
  },
  {
    uf: 'RJ',
    name: 'Rio de Janeiro',
    region: 'sudeste',
    cities: [
      { slug: 'rio-de-janeiro', name: 'Rio de Janeiro', baseMulheres: 67 },
      { slug: 'niteroi', name: 'Niterói', baseMulheres: 15 },
      { slug: 'duque-de-caxias', name: 'Duque de Caxias', baseMulheres: 14 },
      { slug: 'nova-iguacu', name: 'Nova Iguaçu', baseMulheres: 13 },
    ],
  },
  {
    uf: 'MG',
    name: 'Minas Gerais',
    region: 'sudeste',
    cities: [
      { slug: 'belo-horizonte', name: 'Belo Horizonte', baseMulheres: 45 },
      { slug: 'uberlandia', name: 'Uberlândia', baseMulheres: 18 },
      { slug: 'contagem', name: 'Contagem', baseMulheres: 14 },
    ],
  },
  {
    uf: 'ES',
    name: 'Espírito Santo',
    region: 'sudeste',
    cities: [
      { slug: 'vitoria', name: 'Vitória', baseMulheres: 16 },
      { slug: 'vila-velha', name: 'Vila Velha', baseMulheres: 14 },
    ],
  },
  {
    uf: 'BA',
    name: 'Bahia',
    region: 'nordeste',
    cities: [
      { slug: 'salvador', name: 'Salvador', baseMulheres: 52 },
      { slug: 'feira-de-santana', name: 'Feira de Santana', baseMulheres: 12 },
      { slug: 'vitoria-da-conquista', name: 'Vitória da Conquista', baseMulheres: 0 },
    ],
  },
  {
    uf: 'PE',
    name: 'Pernambuco',
    region: 'nordeste',
    cities: [
      { slug: 'recife', name: 'Recife', baseMulheres: 34 },
      { slug: 'olinda', name: 'Olinda', baseMulheres: 11 },
    ],
  },
  {
    uf: 'CE',
    name: 'Ceará',
    region: 'nordeste',
    cities: [
      { slug: 'fortaleza', name: 'Fortaleza', baseMulheres: 31 },
      { slug: 'caucaia', name: 'Caucaia', baseMulheres: 8 },
    ],
  },
  {
    uf: 'DF',
    name: 'Distrito Federal',
    region: 'centro-oeste',
    cities: [{ slug: 'brasilia', name: 'Brasília', baseMulheres: 33 }],
  },
  {
    uf: 'GO',
    name: 'Goiás',
    region: 'centro-oeste',
    cities: [
      { slug: 'goiania', name: 'Goiânia', baseMulheres: 22 },
      { slug: 'aparecida-de-goiania', name: 'Aparecida de Goiânia', baseMulheres: 12 },
    ],
  },
  {
    uf: 'MT',
    name: 'Mato Grosso',
    region: 'centro-oeste',
    cities: [{ slug: 'cuiaba', name: 'Cuiabá', baseMulheres: 14 }],
  },
  {
    uf: 'RS',
    name: 'Rio Grande do Sul',
    region: 'sul',
    cities: [{ slug: 'porto-alegre', name: 'Porto Alegre', baseMulheres: 28 }],
  },
  {
    uf: 'PR',
    name: 'Paraná',
    region: 'sul',
    cities: [{ slug: 'curitiba', name: 'Curitiba', baseMulheres: 27 }],
  },
  {
    uf: 'SC',
    name: 'Santa Catarina',
    region: 'sul',
    cities: [{ slug: 'florianopolis', name: 'Florianópolis', baseMulheres: 19 }],
  },
  {
    uf: 'PA',
    name: 'Pará',
    region: 'norte',
    cities: [{ slug: 'belem', name: 'Belém', baseMulheres: 20 }],
  },
  {
    uf: 'AM',
    name: 'Amazonas',
    region: 'norte',
    cities: [{ slug: 'manaus', name: 'Manaus', baseMulheres: 21 }],
  },
]

const STATE_DIRECTORY: StateDirectoryRaw[] = [
  // Sudeste
  { uf: 'SP', name: 'São Paulo', region: 'sudeste' },
  { uf: 'RJ', name: 'Rio de Janeiro', region: 'sudeste' },
  { uf: 'MG', name: 'Minas Gerais', region: 'sudeste' },
  { uf: 'ES', name: 'Espírito Santo', region: 'sudeste' },
  // Nordeste
  { uf: 'BA', name: 'Bahia', region: 'nordeste' },
  { uf: 'PE', name: 'Pernambuco', region: 'nordeste' },
  { uf: 'CE', name: 'Ceará', region: 'nordeste' },
  { uf: 'MA', name: 'Maranhão', region: 'nordeste' },
  { uf: 'PB', name: 'Paraíba', region: 'nordeste' },
  { uf: 'RN', name: 'Rio Grande do Norte', region: 'nordeste' },
  { uf: 'AL', name: 'Alagoas', region: 'nordeste' },
  { uf: 'PI', name: 'Piauí', region: 'nordeste' },
  { uf: 'SE', name: 'Sergipe', region: 'nordeste' },
  // Centro-Oeste
  { uf: 'DF', name: 'Distrito Federal', region: 'centro-oeste' },
  { uf: 'GO', name: 'Goiás', region: 'centro-oeste' },
  { uf: 'MT', name: 'Mato Grosso', region: 'centro-oeste' },
  { uf: 'MS', name: 'Mato Grosso do Sul', region: 'centro-oeste' },
  // Sul
  { uf: 'RS', name: 'Rio Grande do Sul', region: 'sul' },
  { uf: 'PR', name: 'Paraná', region: 'sul' },
  { uf: 'SC', name: 'Santa Catarina', region: 'sul' },
  // Norte
  { uf: 'AM', name: 'Amazonas', region: 'norte' },
  { uf: 'PA', name: 'Pará', region: 'norte' },
  { uf: 'RO', name: 'Rondônia', region: 'norte' },
  { uf: 'RR', name: 'Roraima', region: 'norte' },
  { uf: 'AP', name: 'Amapá', region: 'norte' },
  { uf: 'AC', name: 'Acre', region: 'norte' },
  { uf: 'TO', name: 'Tocantins', region: 'norte' },
]

function sumCounts(cities: CityItem[]): number {
  return cities.reduce((s, c) => s + c.count, 0)
}

const buildStates = (gender: GenderSlug): StateItem[] => {
  const mapped = STATES_BASE.map((r) => {
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

    return {
      uf: r.uf,
      name: r.name,
      region: r.region,
      cities,
      totalProfiles: sumCounts(cities),
      totalCities: cities.length,
    }
  })

  const mapByUf = new Map(mapped.map((s) => [s.uf, s]))
  const merged = STATE_DIRECTORY.map((dir) => {
    const found = mapByUf.get(dir.uf)
    if (found) {
      return found
    }
    return {
      uf: dir.uf,
      name: dir.name,
      region: dir.region,
      cities: [],
      totalProfiles: 0,
      totalCities: 0,
    } satisfies StateItem
  })

  return merged.sort((a, b) => b.totalProfiles - a.totalProfiles)
}

function cityLimitByUf(uf: string): number {
  return uf.toUpperCase() === 'SP' ? 18 : 9
}

function regionName(slug: RegionSlug): string {
  const map: Record<RegionSlug, string> = {
    sudeste: 'Sudeste',
    nordeste: 'Nordeste',
    'centro-oeste': 'Centro-Oeste',
    sul: 'Sul',
    norte: 'Norte',
  }
  return map[slug]
}

const REGION_ORDER: RegionSlug[] = ['sudeste', 'nordeste', 'centro-oeste', 'sul', 'norte']
const DEFAULT_STATES_PER_REGION = 9

export function getRegionsByGender(
  gender: GenderSlug,
  opts?: { showAllCityUfs?: string[]; showAllStateRegions?: RegionSlug[] },
): RegionItem[] {
  const states = buildStates(gender)
  const allCityUfs = new Set((opts?.showAllCityUfs ?? []).map((x) => x.toUpperCase()))
  const allStateRegions = new Set(opts?.showAllStateRegions ?? [])

  return REGION_ORDER.map((regionSlug) => {
    const statesInRegion = states
      .filter((s) => s.region === regionSlug)
      .sort((a, b) => b.totalProfiles - a.totalProfiles)

    const visibleStates = allStateRegions.has(regionSlug)
      ? statesInRegion
      : statesInRegion.slice(0, DEFAULT_STATES_PER_REGION)

    const statesWithCityLimit = visibleStates.map((state) => {
      const maxCities = cityLimitByUf(state.uf)
      const fullList = state.cities
      const visibleCities = allCityUfs.has(state.uf) ? fullList : fullList.slice(0, maxCities)
      return {
        ...state,
        cities: visibleCities,
      }
    })

    return {
      slug: regionSlug,
      name: regionName(regionSlug),
      states: statesWithCityLimit,
      totalProfiles: statesInRegion.reduce((acc, s) => acc + s.totalProfiles, 0),
      totalStates: statesInRegion.length,
    }
  }).filter((r) => r.states.length > 0)
}

export function getTotalListingProfiles(gender: GenderSlug): number {
  return buildStates(gender).reduce((acc, s) => acc + s.totalProfiles, 0)
}

export function getStateByGender(
  gender: GenderSlug,
  uf: string,
  opts?: { showAllCities?: boolean },
): StateItem | null {
  const state = buildStates(gender).find((s) => s.uf.toLowerCase() === uf.toLowerCase()) ?? null
  if (!state) {
    return null
  }
  const maxCities = cityLimitByUf(state.uf)
  return {
    ...state,
    cities: opts?.showAllCities ? state.cities : state.cities.slice(0, maxCities),
  }
}

export function getStatesByRegion(gender: GenderSlug, region: RegionSlug): StateItem[] {
  return buildStates(gender)
    .filter((s) => s.region === region)
    .sort((a, b) => b.totalProfiles - a.totalProfiles)
}

export function getCity(
  gender: GenderSlug,
  uf: string,
  citySlug: string,
): { region: RegionItem; city: CityItem } | null {
  const states = buildStates(gender)
  const state = states.find((x) => x.uf.toLowerCase() === uf.toLowerCase())
  if (!state) {
    return null
  }
  const city = state.cities.find((c) => c.slug === citySlug)
  if (!city) {
    return null
  }
  return {
    region: {
      slug: state.region,
      name: regionName(state.region),
      states: [state],
      totalProfiles: state.totalProfiles,
      totalStates: 1,
    },
    city,
  }
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
  /** Slug público na URL `/acompanhante/:slug` ou `/massagista/:slug` */
  public_slug: string
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
        public_slug: 'ana-silva',
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
        public_slug: 'beatriz-costas',
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
        public_slug: 'carla-santos',
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
      public_slug: 'perfil-exemplo-a',
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
      public_slug: 'perfil-exemplo-b',
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
      public_slug: 'perfil-exemplo-c',
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
  id?: number
  author: string
  text: string
  when: string
  /** Resposta do anunciante (mock) */
  is_advertiser?: boolean
  replies?: ProfileComment[]
}

export type SocialNetworkKey = 'instagram' | 'x' | 'onlyfans' | 'tiktok' | 'privacy'

export type ProfileSocialLinks = Partial<Record<SocialNetworkKey, string>>

export interface ProfileDetail {
  id: string
  public_slug: string
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
  coverUrl?: string
  avatarUrl?: string
  audioUrl?: string
  neighborhood?: string
  cityName?: string
  stateUf?: string
  mapsSearchUrl?: string
  /** Galeria pública (fotos e vídeos) — ordem: áudio é separado em audioUrl */
  galleryMedia: ProfileMediaItem[]
}

const anaSilvaDetail = (): ProfileDetail => ({
  id: '1',
  public_slug: 'ana-silva',
  displayName: 'Ana Silva',
  locationLine: 'Centro, São Paulo',
  memberSince: 'março de 2023',
  neighborhood: 'Centro',
  cityName: 'São Paulo',
  stateUf: 'SP',
  mapsSearchUrl:
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Centro, São Paulo, SP — Brasil'),
  coverUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&q=80',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  audioUrl: undefined,
  galleryMedia: [
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&q=80', type: 'image' },
    { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=640&q=80', type: 'image' },
    {
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      type: 'video',
    },
    { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=640&q=80', type: 'image' },
  ],
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
      id: 1,
      author: 'Carlos M.',
      text: 'Pessoa incrível! Super recomendo conhecer.',
      when: 'há 2 dias',
      replies: [
        {
          id: 101,
          author: 'Ana Silva',
          text: 'Obrigada pelo carinho! Qualquer dúvida, estou no WhatsApp.',
          when: 'há 1 dia',
          is_advertiser: true,
        },
      ],
    },
    {
      id: 2,
      author: 'Marina L.',
      text: 'Ótima companhia, muito divertida e inteligente!',
      when: 'há 1 semana',
      replies: [],
    },
  ],
  whatsappPhone: '5511999196820',
  socialLinks: {
    instagram: 'https://www.instagram.com/',
    x: 'https://x.com/',
    tiktok: 'https://www.tiktok.com/',
  },
})

function galleryFromSummary(row: ProfileSummary): ProfileMediaItem[] {
  return row.gallery?.length ? [...row.gallery] : []
}

export function getProfileDetailMock(gender: GenderSlug, slug: string): ProfileDetail | null {
  const genders: GenderSlug[] = ['homens', 'mulheres', 'trans']
  if (!genders.includes(gender)) {
    return null
  }

  if (gender === 'mulheres' && slug === 'ana-silva') {
    return anaSilvaDetail()
  }

  const row =
    getProfilesMock(gender, 'sp', 'sao-paulo').find((p) => p.public_slug === slug || p.id === slug) ?? null

  if (row) {
    const cityName = 'São Paulo'
    const nh = row.neighborhood
    return {
      id: row.id,
      public_slug: row.public_slug,
      displayName: row.displayName,
      locationLine: nh ? `${nh}, ${cityName}` : cityName,
      memberSince: 'janeiro de 2024',
      neighborhood: nh,
      cityName,
      stateUf: 'SP',
      mapsSearchUrl:
        'https://www.google.com/maps/search/?api=1&query=' +
        encodeURIComponent([nh, cityName, 'SP — Brasil'].filter(Boolean).join(', ')),
      coverUrl: row.gallery?.[0]?.url,
      avatarUrl: row.gallery?.[0]?.url,
      audioUrl: undefined,
      galleryMedia: galleryFromSummary(row),
      premium: row.premium ?? false,
      tipoAtendimento: row.tipo_atendimento ?? 'acompanhante',
      about:
        'Apresentação de exemplo — o conteúdo completo virá da API (equivalente ao perfil público no site).',
      premiumBenefits: [
        'Perfil verificado',
        'Fotos de alta qualidade',
        'Resposta garantida em 24h',
        'Prioridade nos resultados',
      ],
      comments: [
        {
          id: 1,
          author: 'Visitante',
          text: 'Ótima experiência.',
          when: 'há 3 semanas',
          replies: [],
        },
      ],
      whatsappPhone: row.id === '2' ? '5521987654321' : '5511987654321',
      socialLinks:
        row.id === '2'
          ? { onlyfans: 'https://onlyfans.com/', privacy: 'https://www.privacy.com.br/' }
          : { instagram: 'https://www.instagram.com/' },
    }
  }

  return {
    id: slug,
    public_slug: slug,
    displayName: 'Perfil',
    locationLine: 'Brasil',
    memberSince: '2024',
    premium: false,
    tipoAtendimento: 'acompanhante',
    about: 'Texto de apresentação virá do backend.',
    cityName: 'Brasil',
    stateUf: '',
    mapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Brasil'),
    galleryMedia: [],
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
