<template>
  <div v-if="genderOk" class="space-y-8 pb-8">
    <nav class="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
      <NuxtLink :to="`/explorar/${gender}`" class="hover:text-brand">← Voltar</NuxtLink>
      <span aria-hidden="true">·</span>
      <NuxtLink to="/explorar" class="hover:text-brand">Início</NuxtLink>
      <span aria-hidden="true">&gt;</span>
      <NuxtLink :to="`/explorar/${gender}`" class="hover:text-brand">{{ genderTitle }}</NuxtLink>
      <span aria-hidden="true">&gt;</span>
      <span class="text-zinc-300">{{ regionTitle }}</span>
    </nav>

    <p v-if="pending" class="text-zinc-400">Carregando…</p>
    <div
      v-else-if="fetchError || !regionOk"
      class="rounded-xl border border-amber-900/50 bg-amber-950/30 p-6 text-amber-200"
    >
      Região inválida ou indisponível.
      <NuxtLink :to="`/explorar/${gender}`" class="underline">Voltar</NuxtLink>
    </div>

    <template v-else>
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Estados da região {{ regionTitle }}
        </h1>
        <p class="text-lg text-zinc-400">
          <span class="tabular-nums font-semibold text-white">{{ totalProfiles }}</span>
          {{ totalProfiles === 1 ? 'perfil na região' : 'perfis na região' }}
        </p>
      </header>

      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="s in states" :key="s.uf">
          <NuxtLink
            :to="`/explorar/${gender}/estado/${s.uf.toLowerCase()}`"
            class="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 transition hover:border-brand/50 hover:bg-zinc-900"
          >
            <span class="font-medium text-white">{{ s.name }} <span class="text-zinc-500">({{ s.uf }})</span></span>
            <span class="text-xs text-zinc-500 tabular-nums">{{ s.totalProfiles }}</span>
          </NuxtLink>
        </li>
      </ul>
    </template>
  </div>
  <div v-else class="rounded-xl border border-amber-900/50 bg-amber-950/30 p-6 text-amber-200">
    Categoria inválida. <NuxtLink :to="`/explorar/${gender}`" class="underline">Voltar</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { usePublicExploreApi } from '~/composables/usePublicExploreApi'
import type { ExploreRegionStatesResponse, GenderSlug, RegionSlug } from '~/types/explore-catalog'

definePageMeta({
  layout: 'default',
  path: '/explorar/:gender/regiao/:region',
})

const route = useRoute()
const { fetchRegionStates } = usePublicExploreApi()

const gender = computed(() => route.params.gender as string)
const region = computed(() => route.params.region as string)

const genders: GenderSlug[] = ['homens', 'mulheres', 'trans']
const regionSlugs: RegionSlug[] = ['sudeste', 'nordeste', 'centro-oeste', 'sul', 'norte']
const genderOk = computed(() => genders.includes(gender.value as GenderSlug))
const regionOk = computed(() => regionSlugs.includes(region.value as RegionSlug))

const genderTitle = computed(() => {
  const m: Record<string, string> = {
    homens: 'Homens',
    mulheres: 'Mulheres',
    trans: 'Trans',
  }
  return m[gender.value] ?? gender.value
})

const { data: regionPayload, pending, error: fetchError } = await useAsyncData<ExploreRegionStatesResponse | null>(
  () => `explore-region-${route.params.gender}-${route.params.region}`,
  async () => {
    const g = route.params.gender as string
    const r = route.params.region as string
    if (!genders.includes(g as GenderSlug) || !regionSlugs.includes(r as RegionSlug)) {
      return null
    }
    return fetchRegionStates(g as GenderSlug, r)
  },
  { watch: [() => route.params.gender, () => route.params.region] },
)

const regionTitle = computed(() => regionPayload.value?.region.name ?? '')

const states = computed(() => regionPayload.value?.states ?? [])

const totalProfiles = computed(() => states.value.reduce((acc, s) => acc + s.totalProfiles, 0))

usePublicPageSeo({
  title: computed(() =>
    genderOk.value && regionOk.value && regionTitle.value
      ? `${genderTitle.value} — ${regionTitle.value}`
      : 'Explorar',
  ),
  description: computed(() => {
    if (!genderOk.value || !regionOk.value) {
      return 'Região no Prazer.Vip.'
    }
    return `Estados da região ${regionTitle.value}: explore perfis ${genderTitle.value.toLowerCase()} por UF.`
  }),
})
</script>
