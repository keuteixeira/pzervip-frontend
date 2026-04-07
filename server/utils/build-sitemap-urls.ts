type GenderSlug = 'homens' | 'mulheres' | 'trans'

interface ExploreSummaryRegion {
  slug: string
  states: {
    uf: string
    cities: { slug: string; count?: number }[]
  }[]
}

interface ExploreSummaryResponse {
  regions?: ExploreSummaryRegion[]
}

const GENDERS: GenderSlug[] = ['homens', 'mulheres', 'trans']

/** URLs estáticas indexáveis (sem área logada nem fluxos sensíveis). */
export function staticIndexablePaths(): string[] {
  return [
    '/',
    '/explorar',
    '/explorar/homens',
    '/explorar/mulheres',
    '/explorar/trans',
    '/contato',
    '/sobre-nos',
    '/politica-de-privacidade',
    '/termos-de-servico',
    '/anunciar',
  ]
}

/**
 * Agrega URLs do catálogo público a partir dos três summaries da API.
 * Perfis individuais (/acompanhante/…) ficam de fora até existir endpoint de listagem em massa.
 */
export function pathsFromExploreSummaries(
  summaries: Record<GenderSlug, ExploreSummaryResponse | null>,
): string[] {
  const out: string[] = []

  for (const gender of GENDERS) {
    const data = summaries[gender]
    const regions = data?.regions
    if (!regions?.length) {
      continue
    }

    for (const region of regions) {
      const regionSlug = String(region.slug || '').trim()
      if (regionSlug) {
        out.push(`/explorar/${gender}/regiao/${regionSlug}`)
      }
      for (const st of region.states || []) {
        const uf = String(st.uf || '').trim().toLowerCase()
        if (!uf) {
          continue
        }
        out.push(`/explorar/${gender}/estado/${uf}`)
        for (const c of st.cities || []) {
          const slug = String(c.slug || '').trim()
          const n = typeof c.count === 'number' ? c.count : 1
          if (slug && n > 0) {
            out.push(`/explorar/${gender}/cidade/${uf}/${slug}`)
          }
        }
      }
    }
  }

  return out
}

export async function fetchExploreSummaries(apiBase: string): Promise<Record<GenderSlug, ExploreSummaryResponse | null>> {
  const base = apiBase.replace(/\/$/, '')
  const result: Record<GenderSlug, ExploreSummaryResponse | null> = {
    homens: null,
    mulheres: null,
    trans: null,
  }

  await Promise.all(
    GENDERS.map(async (g) => {
      try {
        result[g] = await $fetch<ExploreSummaryResponse>(`${base}/v1/public/explore/${g}/summary`)
      } catch {
        result[g] = null
      }
    }),
  )

  return result
}
