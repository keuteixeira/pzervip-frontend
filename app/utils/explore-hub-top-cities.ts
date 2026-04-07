import type { ExploreSummaryResponse, GenderSlug } from '~/types/explore-catalog'

export interface HubCityLink {
  uf: string
  slug: string
  name: string
  homens: number
  mulheres: number
  trans: number
}

/**
 * Junta os três summaries (homens / mulheres / trans) e devolve as cidades com mais perfis no total.
 * Slugs e UF vêm da API — links sempre batem com as rotas reais.
 */
export function topCitiesFromExploreSummaries(
  homens: ExploreSummaryResponse | null,
  mulheres: ExploreSummaryResponse | null,
  trans: ExploreSummaryResponse | null,
  limit = 16,
): HubCityLink[] {
  const map = new Map<string, HubCityLink>()
  const inputs: { g: GenderSlug; data: ExploreSummaryResponse | null }[] = [
    { g: 'homens', data: homens },
    { g: 'mulheres', data: mulheres },
    { g: 'trans', data: trans },
  ]

  for (const { g, data } of inputs) {
    if (!data?.regions?.length) {
      continue
    }
    for (const region of data.regions) {
      for (const st of region.states) {
        const uf = String(st.uf).toUpperCase()
        for (const c of st.cities) {
          const key = `${uf}:${c.slug}`
          let row = map.get(key)
          if (!row) {
            row = {
              uf,
              slug: c.slug,
              name: c.name,
              homens: 0,
              mulheres: 0,
              trans: 0,
            }
            map.set(key, row)
          }
          row[g] = typeof c.count === 'number' ? c.count : 0
        }
      }
    }
  }

  return [...map.values()]
    .filter((x) => x.homens + x.mulheres + x.trans > 0)
    .sort((a, b) => b.homens + b.mulheres + b.trans - (a.homens + a.mulheres + a.trans))
    .slice(0, limit)
}
