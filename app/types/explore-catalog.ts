/**
 * Tipos do catálogo público (explorar) — alinhados à API `/v1/public/explore/...`.
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
  /** Presente no summary; opcional em `states/{uf}` */
  region?: RegionSlug
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

/** Query `?atendimento=` na listagem por cidade */
export type AttendimentoSlug = 'acompanhante' | 'massagista'

export type ProfileMediaKind = 'image' | 'video'

export interface ProfileMediaItem {
  url: string
  type: ProfileMediaKind
}

export interface ProfileSummary {
  id: string
  public_slug: string
  displayName: string
  city: string
  /** UF do estado (listagem por cidade), ex.: RN */
  state_uf?: string
  neighborhood?: string
  premium?: boolean
  featured?: boolean
  tipo_atendimento?: AttendimentoSlug
  gallery?: ProfileMediaItem[]
  highlight_stars?: number
  arrived_in_city_at?: string
  available_now_active?: boolean
}

export interface ProfileComment {
  id?: number
  author: string
  text: string
  when: string
  is_advertiser?: boolean
  replies?: ProfileComment[]
}

export type SocialNetworkKey = 'instagram' | 'x' | 'onlyfans' | 'tiktok' | 'privacy'

export type ProfileSocialLinks = Partial<Record<SocialNetworkKey, string>>

/** Resposta de `GET /v1/public/explore/{gender}/nav` */
export interface ExploreNavResponse {
  regions: {
    slug: string
    name: string
    states: { uf: string; name: string; totalProfiles: number }[]
  }[]
}

/** Resposta de `GET /v1/public/explore/{gender}/summary` */
export interface ExploreSummaryResponse {
  totalProfiles: number
  regions: RegionItem[]
}

/** Resposta de `GET /v1/public/explore/{gender}/regions/{region}` */
export interface ExploreRegionStatesResponse {
  region: { slug: string; name: string }
  states: { uf: string; name: string; totalProfiles: number }[]
}

/** Resposta de `GET /v1/public/explore/{gender}/states/{uf}` */
export interface ExploreStateCitiesResponse {
  state: StateItem
}

/** Resposta de `GET /v1/public/explore/{gender}/cities/{uf}/{slug}/profiles` */
export interface ExploreCityProfilesResponse {
  city: { slug: string; name: string; count: number }
  state: { uf: string; name: string }
  region: { slug: string; name: string } | null
  profiles: ProfileSummary[]
}
