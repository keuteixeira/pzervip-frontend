<template>
  <div class="relative -mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
    <div
      class="pointer-events-none absolute inset-x-0 -top-24 h-96"
      aria-hidden="true"
    />

    <div class="relative">
      <section class="pb-12 pt-4 text-center md:pb-16 md:pt-8">
        <h1
          class="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.15]"
        >
          Encontre os melhores <span class="highlight-text">perfis</span> da sua cidade
        </h1>
        <h2
          class="mx-auto mt-6 max-w-3xl text-lg font-normal leading-relaxed text-zinc-400 md:text-xl md:leading-relaxed"
        >
          Garotas e garotos de programa, acompanhantes masculinos e femininas, massagistas e trans — tudo por cidade.
          Busque sua cidade ou selecione uma cidade na lista de destaque.
        </h2>

        <div
          class="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:mx-auto sm:max-w-2xl sm:flex-row sm:justify-center sm:gap-4"
        >
          <NuxtLink
            v-for="item in categories"
            :key="item.slug"
            :to="genderLink(item.slug)"
            class="group flex min-h-[52px] items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-900/70 px-8 py-3.5 text-center text-lg font-semibold text-white shadow-sm transition hover:border-brand/60 hover:bg-zinc-900 hover:text-brand sm:flex-1 sm:max-w-[200px]"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </section>

      <section
        v-if="topCities.length > 0"
        class="mx-auto mt-14 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-8 text-left md:mt-20 md:px-8"
      >
        <h2 class="text-xl font-semibold text-white md:text-2xl">Cidades em destaque</h2>
        <ul class="mt-6 space-y-4" role="list">
          <li
            v-for="c in topCities"
            :key="`${c.uf}-${c.slug}`"
            class="flex flex-col gap-2 border-b border-zinc-800/80 pb-4 last:border-0 last:pb-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1"
          >
            <span class="font-medium text-white">{{ c.name }}</span>
            <span class="text-sm text-zinc-500">({{ c.uf }})</span>
            <span class="hidden text-zinc-600 sm:inline" aria-hidden="true">·</span>
            <span class="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <NuxtLink
                v-if="c.mulheres > 0"
                :to="`/explorar/mulheres/cidade/${c.uf.toLowerCase()}/${c.slug}`"
                class="text-brand underline-offset-2 hover:underline"
              >
                Mulheres em {{ c.name }}
              </NuxtLink>
              <NuxtLink
                v-if="c.homens > 0"
                :to="`/explorar/homens/cidade/${c.uf.toLowerCase()}/${c.slug}`"
                class="text-brand underline-offset-2 hover:underline"
              >
                Homens em {{ c.name }}
              </NuxtLink>
              <NuxtLink
                v-if="c.trans > 0"
                :to="`/explorar/trans/cidade/${c.uf.toLowerCase()}/${c.slug}`"
                class="text-brand underline-offset-2 hover:underline"
              >
                Trans em {{ c.name }}
              </NuxtLink>
            </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePublicExploreApi } from '~/composables/usePublicExploreApi'
import { topCitiesFromExploreSummaries } from '~/utils/explore-hub-top-cities'
import { exploreHubMetaKeywords, exploreHubSeoDescription, exploreHubSeoTitle } from '~/utils/explore-seo-copy'

definePageMeta({
  layout: 'default',
  path: '/explorar',
})

usePublicPageSeo({
  title: exploreHubSeoTitle(),
  description: exploreHubSeoDescription(),
  keywords: exploreHubMetaKeywords,
})

const { fetchSummary } = usePublicExploreApi()

const { data: exploreSummaries } = await useAsyncData(
  'explore-hub-summaries-all-genders',
  async () => {
    const [homens, mulheres, trans] = await Promise.all([
      fetchSummary('homens'),
      fetchSummary('mulheres'),
      fetchSummary('trans'),
    ])
    return { homens, mulheres, trans }
  },
)

const topCities = computed(() => {
  const raw = exploreSummaries.value
  if (!raw) {
    return []
  }
  return topCitiesFromExploreSummaries(raw.homens, raw.mulheres, raw.trans, 16)
})

const categories = [
  { slug: 'homens', label: 'Homens' },
  { slug: 'mulheres', label: 'Mulheres' },
  { slug: 'trans', label: 'Trans' },
] as const

const route = useRoute()

function genderLink(slug: string) {
  const next = route.query.next
  if (typeof next === 'string' && next.includes('__GENDER__')) {
    return next.replace('__GENDER__', slug)
  }
  return `/explorar/${slug}`
}

const year = new Date().getFullYear()

function scrollTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
