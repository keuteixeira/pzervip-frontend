<template>
  <div v-if="!ok" class="rounded-xl border border-amber-900/50 bg-amber-950/30 p-6 text-amber-200">
    Categoria inválida. <NuxtLink to="/explorar" class="underline">Voltar</NuxtLink>
  </div>
  <div v-else class="space-y-10 pb-8">
    <nav class="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
      <NuxtLink :to="`/explorar/${gender}`" class="hover:text-brand">← Voltar</NuxtLink>
      <span aria-hidden="true">·</span>
      <NuxtLink to="/explorar" class="hover:text-brand">Início</NuxtLink>
      <span aria-hidden="true">&gt;</span>
    </nav>

    <p v-if="pending" class="text-zinc-400">Carregando perfis…</p>
    <div
      v-else-if="fetchError"
      class="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-red-200"
    >
      Não foi possível carregar esta cidade.
      <NuxtLink :to="`/explorar/${gender}`" class="underline">Voltar</NuxtLink>
    </div>
    <div
      v-else-if="!ctx"
      class="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-red-200"
    >
      Cidade ou região não encontrada.
      <NuxtLink :to="`/explorar/${gender}`" class="underline">Voltar</NuxtLink>
    </div>

    <template v-else>
      <div>
        <p class="text-sm font-medium text-brand">{{ genderTitle }}</p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
          {{ genderTitle }} em {{ ctx.city.name }}
        </h1>
        <p class="mt-2 text-lg text-zinc-400">
          {{ totalFiltered }}
          {{ totalFiltered === 1 ? 'perfil encontrado' : 'perfis encontrados' }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm text-zinc-500">Filtrar:</span>
        <div class="inline-flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
          <button
            v-for="opt in serviceFilters"
            :key="opt.value"
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium transition"
            :class="
              filter === opt.value ? 'bg-brand text-white shadow' : 'text-zinc-400 hover:text-white'
            "
            @click="setFilter(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <section v-if="premiumStarGroups.length > 0" class="space-y-8">
        <div>
          <h2 class="text-xl font-semibold text-white">Perfis Premium</h2>
          <p class="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Destaques verificados em {{ ctx.city.name }}.
          </p>
        </div>

        <div v-for="group in premiumStarGroups" :key="'stars-' + group.stars" class="space-y-3">
          <h3
            class="flex flex-wrap items-center gap-0.5 sm:gap-1"
            :aria-label="`${group.stars} estrelas, ${group.items.length} perfis`"
          >
            <span
              v-for="n in group.stars"
              :key="'star-' + group.stars + '-' + n"
              class="text-xl leading-none text-amber-400 sm:text-2xl"
              aria-hidden="true"
            >
              ★
            </span>
            <span class="ml-1.5 text-sm font-normal text-zinc-500 tabular-nums">
              ({{ group.items.length }})
            </span>
          </h3>
          <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="p in group.items" :key="'p-' + p.id">
              <ExploreProfileCard :gender="gender" :profile="p" />
            </li>
          </ul>
        </div>
      </section>

      <ul
        v-if="restList.length > 0"
        class="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4"
      >
        <li v-for="p in restList" :key="'d-' + p.id" class="min-w-0">
          <ExploreProfileCard :gender="gender" :profile="p" compact />
        </li>
      </ul>

      <p
        v-if="totalFiltered === 0"
        class="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-zinc-400"
      >
        Nenhum perfil para este filtro. Experimenta “Todos”.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePublicExploreApi } from '~/composables/usePublicExploreApi'
import type { AttendimentoSlug, ExploreCityProfilesResponse, GenderSlug, ProfileSummary } from '~/types/explore-catalog'

definePageMeta({
  layout: 'default',
  path: '/explorar/:gender/cidade/:uf/:slug',
})

const route = useRoute()
const { fetchCityProfiles } = usePublicExploreApi()

const gender = computed(() => route.params.gender as string)
const uf = computed(() => route.params.uf as string)
const slug = computed(() => route.params.slug as string)

const genders: GenderSlug[] = ['homens', 'mulheres', 'trans']
const ok = computed(() => genders.includes(gender.value as GenderSlug))

type FilterKey = 'all' | AttendimentoSlug

const filter = computed<FilterKey>(() => {
  const q = route.query.atendimento
  if (q === 'acompanhante' || q === 'massagista') {
    return q
  }
  return 'all'
})

const { data: cityPayload, pending, error: fetchError } = await useAsyncData<ExploreCityProfilesResponse | null>(
  () => `explore-city-${route.params.gender}-${route.params.uf}-${route.params.slug}`,
  async () => {
    const g = route.params.gender as string
    if (!genders.includes(g as GenderSlug)) {
      return null
    }
    return fetchCityProfiles(g as GenderSlug, route.params.uf as string, route.params.slug as string)
  },
  { watch: [() => route.params.gender, () => route.params.uf, () => route.params.slug] },
)

const ctx = computed(() => {
  const d = cityPayload.value
  if (!d) {
    return null
  }
  return {
    city: {
      slug: d.city.slug,
      name: d.city.name,
      count: d.city.count,
    },
  }
})

const genderTitle = computed(() => {
  const m: Record<string, string> = {
    homens: 'Homens',
    mulheres: 'Mulheres',
    trans: 'Trans',
  }
  return m[gender.value] ?? gender.value
})

const baseProfiles = computed((): ProfileSummary[] => cityPayload.value?.profiles ?? [])

const serviceFilters: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'acompanhante', label: 'Acompanhante' },
  { value: 'massagista', label: 'Massagista' },
]

function setFilter(v: FilterKey) {
  navigateTo({
    path: route.path,
    query: v === 'all' ? {} : { atendimento: v },
  })
}

const filteredProfiles = computed(() => {
  const list = baseProfiles.value
  if (filter.value === 'all') {
    return list
  }
  return list.filter((p) => p.tipo_atendimento === filter.value)
})

function starTier(p: ProfileSummary): number {
  const n = p.highlight_stars
  if (typeof n === 'number' && n >= 1 && n <= 10) {
    return n
  }
  return 1
}

const premiumStarGroups = computed(() => {
  const premium = filteredProfiles.value.filter((p) => p.premium)
  const groups: { stars: number; items: ProfileSummary[] }[] = []
  for (let stars = 10; stars >= 1; stars--) {
    const items = premium
      .filter((p) => starTier(p) === stars)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'))
    if (items.length > 0) {
      groups.push({ stars, items })
    }
  }
  return groups
})

const restList = computed(() =>
  filteredProfiles.value
    .filter((p) => !p.premium)
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR')),
)
const totalFiltered = computed(() => filteredProfiles.value.length)

usePublicPageSeo({
  title: computed(() => {
    if (!ctx.value) {
      return 'Cidade'
    }
    return `${genderTitle.value} em ${ctx.value.city.name}`
  }),
  description: computed(() => {
    if (!ctx.value) {
      return 'Perfis por cidade no Prazer.Vip.'
    }
    const n = totalFiltered.value
    return `${n} ${n === 1 ? 'perfil' : 'perfis'} de ${genderTitle.value.toLowerCase()} em ${ctx.value.city.name}. Filtros por tipo de atendimento.`
  }),
})
</script>
