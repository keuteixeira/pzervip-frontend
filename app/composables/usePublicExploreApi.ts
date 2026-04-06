import type {
  ExploreCityProfilesResponse,
  ExploreNavResponse,
  ExploreRegionStatesResponse,
  ExploreStateCitiesResponse,
  ExploreSummaryResponse,
  GenderSlug,
} from '~/types/explore-catalog'

export function usePublicExploreApi() {
  const config = useRuntimeConfig()

  const prefix = (gender: GenderSlug) =>
    `${config.public.apiBase}/v1/public/explore/${gender}`

  return {
    /** Contagens por estado somando homens + mulheres + trans (menu antes de escolher o segmento). */
    fetchNavAllGenders: () => $fetch<ExploreNavResponse>(`${config.public.apiBase}/v1/public/explore/nav`),

    fetchNav: (gender: GenderSlug) =>
      $fetch<ExploreNavResponse>(`${prefix(gender)}/nav`),

    fetchSummary: (gender: GenderSlug) =>
      $fetch<ExploreSummaryResponse>(`${prefix(gender)}/summary`),

    fetchRegionStates: (gender: GenderSlug, regionSlug: string) =>
      $fetch<ExploreRegionStatesResponse>(`${prefix(gender)}/regions/${regionSlug}`),

    fetchStateCities: (gender: GenderSlug, uf: string) =>
      $fetch<ExploreStateCitiesResponse>(`${prefix(gender)}/states/${encodeURIComponent(uf)}`),

    fetchCityProfiles: (gender: GenderSlug, uf: string, citySlug: string, atendimento?: string) => {
      const q = atendimento && atendimento !== 'all' ? { atendimento } : {}
      return $fetch<ExploreCityProfilesResponse>(
        `${prefix(gender)}/cities/${encodeURIComponent(uf)}/${encodeURIComponent(citySlug)}/profiles`,
        { query: q },
      )
    },
  }
}
