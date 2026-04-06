<template>
  <div v-if="genderOk" class="space-y-10 pb-8">
    <nav class="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
      <NuxtLink to="/explorar" class="hover:text-brand">← Voltar</NuxtLink>
      <span aria-hidden="true">·</span>
      <NuxtLink to="/explorar" class="hover:text-brand">Início</NuxtLink>
      <span aria-hidden="true">&gt;</span>
      <span class="text-zinc-300">{{ genderTitle }}</span>
    </nav>

    <p v-if="pending" class="text-zinc-400">Carregando catálogo…</p>
    <div
      v-else-if="fetchError"
      class="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-red-200"
    >
      Não foi possível carregar o catálogo. Tente novamente mais tarde.
      <NuxtLink to="/explorar" class="ml-2 underline">Voltar</NuxtLink>
    </div>

    <template v-else>
      <header class="space-y-2">
        <p class="text-sm font-medium text-brand">{{ genderTitle }}</p>
        <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">Escolha sua cidade</h1>
        <h2 class="text-lg font-normal text-zinc-400 md:text-xl">
          Encontre {{ genderPhrase }} na sua região
        </h2>
        <p class="text-lg text-zinc-300">
          <span class="tabular-nums font-semibold text-white">{{ totalProfiles }}</span>
          {{ totalProfiles === 1 ? 'perfil' : 'perfis' }}
        </p>
      </header>

      <p
        v-if="regions.length === 0"
        class="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-zinc-400"
      >
        Ainda não há anúncios publicados nesta categoria.
      </p>

      <section v-for="region in regions" :key="region.slug" class="space-y-4">
        <div class="flex items-baseline justify-between gap-4 border-b border-zinc-800 pb-2">
          <h2
            class="inline-flex items-center px-4 py-1.5 text-xl font-extrabold tracking-wide text-white text-center"
          >
            {{ region.name }}
          </h2>
          <span class="text-xs uppercase tracking-wide text-zinc-500">
            <span class="tabular-nums">{{ region.totalProfiles }}</span>
            {{ region.totalProfiles === 1 ? ' perfil' : ' perfis' }}
          </span>
        </div>

        <div class="space-y-6">
          <article
            v-for="state in region.states"
            :key="state.uf"
            class="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h3 class="text-lg font-semibold text-white">
                {{ state.name }}
                <span class="ml-1 text-sm font-normal text-zinc-500">({{ state.uf }})</span>
              </h3>
              <span class="text-xs text-zinc-500">
                <span class="tabular-nums">{{ state.totalProfiles }}</span>
                {{ state.totalProfiles === 1 ? ' perfil' : ' perfis' }}
              </span>
            </div>

            <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <li v-for="c in state.cities" :key="`${state.uf}-${c.slug}`">
                <NuxtLink
                  :to="`/explorar/${gender}/cidade/${state.uf.toLowerCase()}/${c.slug}`"
                  class="group block overflow-hidden rounded-3xl bg-[#111317] shadow-lg ring-1 ring-zinc-800/80 transition hover:ring-brand/50"
                >
                  <div class="relative h-48 w-full overflow-hidden bg-zinc-800">
                    <img
                      :src="c.thumbUrl"
                      :alt="`Foto em destaque em ${c.name}`"
                      class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      width="640"
                      height="384"
                      loading="lazy"
                      decoding="async"
                    />
                    <div
                      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-[#111317]"
                      aria-hidden="true"
                    />
                    <span
                      class="absolute right-3 top-3 rounded-full bg-[#E64C4C] px-3 py-1 text-xs font-medium text-white shadow-sm"
                    >
                      <span class="tabular-nums">{{ c.count }}</span>
                      {{ c.count === 1 ? ' perfil' : ' perfis' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-center px-4 py-6">
                    <h4 class="text-center text-xl font-bold text-white transition group-hover:text-[#E64C4C]">
                      {{ c.name }}
                    </h4>
                  </div>
                </NuxtLink>
              </li>
            </ul>

            <div v-if="state.totalCities > statePreviewLimit(state.uf)" class="pt-1 text-sm text-center">
              <NuxtLink
                :to="`/explorar/${gender}/estado/${state.uf.toLowerCase()}`"
                class="text-brand hover:underline"
              >
                Ver todas as cidades de {{ state.name }}
              </NuxtLink>
            </div>
          </article>
        </div>

        <div class="text-sm text-center">
          <NuxtLink :to="`/explorar/${gender}/regiao/${region.slug}`" class="text-brand hover:underline">
            Ver todos os estados da região {{ region.name }}
          </NuxtLink>
        </div>
      </section>

      <section
        class="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-zinc-900/80 p-6 md:p-8"
      >
        <h2 class="text-xl font-semibold text-white">Destaque seu perfil</h2>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Apareça em primeiro lugar com nossos planos premium e tenha mais visibilidade.
        </p>
        <NuxtLink
          to="/cadastro"
          class="mt-4 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Ver planos e anunciar
        </NuxtLink>
      </section>
    </template>
  </div>
  <div v-else class="rounded-xl border border-amber-900/50 bg-amber-950/30 p-6 text-amber-200">
    Categoria inválida. <NuxtLink to="/explorar" class="underline">Voltar</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { usePublicExploreApi } from '~/composables/usePublicExploreApi'
import type { ExploreSummaryResponse, GenderSlug, RegionItem } from '~/types/explore-catalog'
import { cityThumbUrl } from '~/types/explore-catalog'

definePageMeta({
  layout: 'default',
  path: '/explorar/:gender',
})

const route = useRoute()
const { fetchSummary } = usePublicExploreApi()

const gender = computed(() => route.params.gender as string)

const genders: GenderSlug[] = ['homens', 'mulheres', 'trans']
const genderOk = computed(() => genders.includes(gender.value as GenderSlug))

const genderTitle = computed(() => {
  const m: Record<string, string> = {
    homens: 'Homens',
    mulheres: 'Mulheres',
    trans: 'Trans',
  }
  return m[gender.value] ?? gender.value
})

const genderPhrase = computed(() => {
  const g = gender.value as GenderSlug
  if (g === 'trans') {
    return 'pessoas trans'
  }
  return genderTitle.value.toLowerCase()
})

function statePreviewLimit(uf: string): number {
  return uf.toUpperCase() === 'SP' ? 18 : 9
}

const { data: summaryData, pending, error: fetchError } = await useAsyncData<ExploreSummaryResponse | null>(
  () => `explore-summary-${route.params.gender}`,
  async () => {
    const g = route.params.gender as string
    if (!genders.includes(g as GenderSlug)) {
      return null
    }
    return fetchSummary(g as GenderSlug)
  },
  { watch: [() => route.params.gender] },
)

const regions = computed((): RegionItem[] => {
  const raw = summaryData.value?.regions
  if (!raw?.length) {
    return []
  }
  return raw.map((region: ExploreSummaryResponse['regions'][number]) => ({
    ...region,
    slug: region.slug as RegionItem['slug'],
    states: region.states.map((state: (typeof region.states)[number]) => ({
      ...state,
      region: state.region as RegionItem['slug'],
      cities: state.cities.map((c: (typeof state.cities)[number]) => ({
        ...c,
        thumbUrl: c.thumbUrl?.trim() ? c.thumbUrl : cityThumbUrl(state.uf, c.slug),
      })),
    })),
  }))
})

const totalProfiles = computed(() => summaryData.value?.totalProfiles ?? 0)

usePublicPageSeo({
  title: computed(() =>
    genderOk.value ? `${genderTitle.value} — Escolha sua cidade` : 'Explorar',
  ),
  description: computed(() =>
    genderOk.value
      ? `Explore anúncios de ${genderPhrase.value} por cidade e região no Prazer.Vip. Perfis por localização.`
      : 'Explorar categorias no Prazer.Vip.',
  ),
})
</script>
