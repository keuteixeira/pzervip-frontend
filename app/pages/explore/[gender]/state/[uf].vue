<template>
  <div v-if="genderOk" class="space-y-8 pb-8">
    <nav class="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
      <NuxtLink :to="`/explorar/${gender}`" class="hover:text-brand">← Voltar</NuxtLink>
      <span aria-hidden="true">·</span>
      <NuxtLink to="/explorar" class="hover:text-brand">Início</NuxtLink>
      <span aria-hidden="true">&gt;</span>
      <NuxtLink :to="`/explorar/${gender}`" class="hover:text-brand">{{ genderTitle }}</NuxtLink>
      <span aria-hidden="true">&gt;</span>
      <span class="text-zinc-300">{{ state?.name ?? '…' }}</span>
    </nav>

    <p v-if="pending" class="text-zinc-400">Carregando…</p>
    <div
      v-else-if="fetchError"
      class="rounded-xl border border-amber-900/50 bg-amber-950/30 p-6 text-amber-200"
    >
      Estado inválido ou indisponível.
      <NuxtLink :to="`/explorar/${gender}`" class="underline">Voltar</NuxtLink>
    </div>

    <template v-else-if="state">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Cidades de {{ state.name }} ({{ state.uf }})
        </h1>
        <p class="text-lg text-zinc-400">
          <span class="tabular-nums font-semibold text-white">{{ state.totalProfiles }}</span>
          {{ state.totalProfiles === 1 ? 'perfil no estado' : 'perfis no estado' }}
        </p>
      </header>

      <ul v-if="state.cities.length > 0" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              <span
                class="absolute right-3 top-3 rounded-full bg-[#E64C4C] px-3 py-1 text-xs font-medium text-white shadow-sm"
              >
                <span class="tabular-nums">{{ c.count }}</span>
                {{ c.count === 1 ? ' perfil' : ' perfis' }}
              </span>
            </div>
            <div class="flex items-center justify-center px-4 py-6">
              <h2 class="text-center text-xl font-bold text-white transition group-hover:text-[#E64C4C]">
                {{ c.name }}
              </h2>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <p v-else class="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-zinc-400">
        Ainda não há perfis com cidade publicada neste estado.
      </p>
    </template>
  </div>
  <div v-else class="rounded-xl border border-amber-900/50 bg-amber-950/30 p-6 text-amber-200">
    Categoria inválida. <NuxtLink :to="`/explorar/${gender}`" class="underline">Voltar</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { usePublicExploreApi } from '~/composables/usePublicExploreApi'
import type { ExploreStateCitiesResponse, GenderSlug, StateItem } from '~/types/explore-catalog'
import { cityThumbUrl } from '~/types/explore-catalog'

definePageMeta({
  layout: 'default',
  path: '/explorar/:gender/estado/:uf',
})

const route = useRoute()
const { fetchStateCities } = usePublicExploreApi()

const gender = computed(() => route.params.gender as string)
const uf = computed(() => route.params.uf as string)

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

const { data: statePayload, pending, error: fetchError } = await useAsyncData<ExploreStateCitiesResponse | null>(
  () => `explore-state-${route.params.gender}-${route.params.uf}`,
  async () => {
    const g = route.params.gender as string
    if (!genders.includes(g as GenderSlug)) {
      return null
    }
    return fetchStateCities(g as GenderSlug, route.params.uf as string)
  },
  { watch: [() => route.params.gender, () => route.params.uf] },
)

const state = computed((): StateItem | null => {
  const raw = statePayload.value?.state
  if (!raw) {
    return null
  }
  return {
    ...raw,
    cities: raw.cities.map((c) => ({
      ...c,
      thumbUrl: c.thumbUrl?.trim() ? c.thumbUrl : cityThumbUrl(raw.uf, c.slug),
    })),
  }
})

usePublicPageSeo({
  title: computed(() => {
    if (!genderOk.value) {
      return 'Explorar'
    }
    const s = state.value
    if (!s) {
      return `${genderTitle.value} — Estado`
    }
    return `${genderTitle.value} em ${s.name} (${s.uf}) — cidades`
  }),
  description: computed(() => {
    const s = state.value
    const g = genderTitle.value
    if (!s) {
      return `Cidades e perfis ${g} no Prazer.Vip.`
    }
    return `Lista de cidades em ${s.name} (${s.uf}) com perfis ${g.toLowerCase()} no Prazer.Vip.`
  }),
})
</script>
