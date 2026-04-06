<template>
  <div>
    <header class="relative z-[90] border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <NuxtLink
          to="/"
          class="flex min-w-0 shrink items-center gap-2"
          aria-label="Prazer.Vip — início"
        >
          <img
            :src="brand.logoHorizontal"
            alt="Prazer.Vip"
            class="h-8 w-auto max-w-[min(200px,calc(100vw-7.5rem))] object-contain object-left md:h-9"
            width="180"
            height="36"
            loading="eager"
            decoding="async"
          />
        </NuxtLink>
        <nav class="hidden items-center gap-3 text-sm md:flex">
          <div
            ref="desktopCityRoot"
            class="relative"
            @mouseenter="desktopCityMenuOpen = true"
            @mouseleave="desktopCityMenuOpen = false"
          >
            <button
              type="button"
              class="rounded-md px-3 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              :aria-expanded="desktopCityMenuOpen ? 'true' : 'false'"
              @focus="desktopCityMenuOpen = true"
              @click.stop="desktopCityMenuOpen = !desktopCityMenuOpen"
            >
              Escolha a cidade
            </button>
            <div
              class="absolute right-0 top-full z-[120] w-[min(92vw,820px)] -mt-1 pt-3 transition"
              :class="desktopCityMenuOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'"
            >
              <div class="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl">
                <p v-if="navPending" class="py-6 text-center text-sm text-zinc-400">Carregando regiões…</p>
                <div v-else-if="navError" class="space-y-3 py-4 text-center text-sm text-zinc-400">
                  <p>Não foi possível carregar o menu de cidades.</p>
                  <button
                    type="button"
                    class="rounded-md border border-zinc-600 px-3 py-1.5 text-xs text-white transition hover:bg-zinc-800"
                    @click="void refreshNav()"
                  >
                    Tentar de novo
                  </button>
                </div>
                <p
                  v-else-if="cityMenuRegions.length === 0"
                  class="py-6 text-center text-sm text-zinc-500"
                >
                  Nenhuma região disponível.
                </p>
                <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div v-for="r in cityMenuRegions" :key="r.slug" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                    <NuxtLink
                      :to="regionMenuTarget(r.slug)"
                      class="block text-sm font-semibold text-brand hover:underline"
                      @click="desktopCityMenuOpen = false"
                    >
                      {{ r.name }}
                    </NuxtLink>
                    <ul class="mt-2 space-y-1">
                      <li v-for="s in r.states" :key="s.uf">
                        <NuxtLink
                          :to="stateMenuTarget(s.uf)"
                          class="flex items-center justify-between rounded px-2 py-1 text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                          @click="desktopCityMenuOpen = false"
                        >
                          <span>{{ s.name }} ({{ s.uf }})</span>
                          <span class="tabular-nums text-zinc-500">{{ s.totalProfiles }}</span>
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NuxtLink
            to="/explorar"
            class="rounded-md px-3 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            Explorar
          </NuxtLink>
          <NuxtLink
            :to="registerOrMyProfileTo"
            class="rounded-md px-3 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            {{ registerOrMyProfileLabel }}
          </NuxtLink>
          <NuxtLink
            :to="advertiserAreaTo"
            class="rounded-md bg-brand px-3 py-2 font-medium text-white transition hover:bg-brand-muted"
          >
            Área do Anunciante
          </NuxtLink>
        </nav>

        <div class="md:hidden">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 text-zinc-200 transition hover:bg-zinc-800"
            :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
            :aria-label="mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span class="relative block h-4 w-5" aria-hidden="true">
              <span
                class="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current transition duration-200"
                :class="mobileMenuOpen ? 'top-[7px] rotate-45' : ''"
              />
              <span
                class="absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-current transition duration-150"
                :class="mobileMenuOpen ? 'opacity-0' : 'opacity-100'"
              />
              <span
                class="absolute left-0 top-[14px] block h-0.5 w-5 rounded-full bg-current transition duration-200"
                :class="mobileMenuOpen ? 'top-[7px] -rotate-45' : ''"
              />
            </span>
          </button>
        </div>
      </div>

      <div
        v-if="mobileMenuOpen"
        class="border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 md:hidden"
      >
        <div class="mx-auto max-h-[70vh] max-w-7xl space-y-3 overflow-auto pr-1">
          <NuxtLink to="/explorar" class="block rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200" @click="mobileMenuOpen = false">
            Explorar
          </NuxtLink>
          <NuxtLink
            :to="registerOrMyProfileTo"
            class="block rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200"
            @click="mobileMenuOpen = false"
          >
            {{ registerOrMyProfileLabel }}
          </NuxtLink>
          <NuxtLink
            :to="advertiserAreaTo"
            class="block rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
            @click="mobileMenuOpen = false"
          >
            Área do Anunciante
          </NuxtLink>

          <div class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <button
              type="button"
              class="w-full text-left text-sm font-semibold text-brand"
              :aria-expanded="mobileCityMenuOpen ? 'true' : 'false'"
              @click="mobileCityMenuOpen = !mobileCityMenuOpen"
            >
              Escolha a cidade
            </button>
            <div v-if="mobileCityMenuOpen" class="mt-3 space-y-3">
              <p v-if="navPending" class="text-center text-xs text-zinc-500">Carregando regiões…</p>
              <div v-else-if="navError" class="space-y-2 text-center text-xs text-zinc-500">
                <p>Não foi possível carregar o menu.</p>
                <button
                  type="button"
                  class="rounded-md border border-zinc-600 px-2 py-1 text-zinc-300"
                  @click="void refreshNav()"
                >
                  Tentar de novo
                </button>
              </div>
              <p v-else-if="cityMenuRegions.length === 0" class="text-center text-xs text-zinc-500">
                Nenhuma região disponível.
              </p>
              <template v-else>
                <div v-for="r in cityMenuRegions" :key="`m-${r.slug}`" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                  <NuxtLink
                    :to="regionMenuTarget(r.slug)"
                    class="block text-sm font-semibold text-brand"
                    @click="mobileMenuOpen = false"
                  >
                    {{ r.name }}
                  </NuxtLink>
                  <ul class="mt-2 space-y-1">
                    <li v-for="s in r.states" :key="`m-${r.slug}-${s.uf}`">
                      <NuxtLink
                        :to="stateMenuTarget(s.uf)"
                        class="flex items-center justify-between rounded px-2 py-1 text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        @click="mobileMenuOpen = false"
                      >
                        <span>{{ s.name }} ({{ s.uf }})</span>
                        <span class="tabular-nums text-zinc-500">{{ s.totalProfiles }}</span>
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main class="bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(225,29,72,0.18),transparent)]">
      <div class="mx-auto max-w-7xl px-4 py-10">
        <slot />
      </div>
    </main>
    <LayoutSiteFooter />
  </div>
</template>

<script setup lang="ts">
import { brandAssets } from '~/config/brand-assets'
import { usePublicExploreApi } from '~/composables/usePublicExploreApi'
import type { ExploreNavResponse, GenderSlug, RegionSlug } from '~/types/explore-catalog'

const brand = brandAssets
const route = useRoute()
const { advertiserAreaTo, registerOrMyProfileLabel, registerOrMyProfileTo, hydrateUserIfNeeded } =
  useAdvertiserAreaLink()
const { fetchNav, fetchNavAllGenders } = usePublicExploreApi()
const mobileMenuOpen = ref(false)
const mobileCityMenuOpen = ref(false)
const desktopCityMenuOpen = ref(false)

const genderChosen = computed(() => {
  const p = String(route.params.gender ?? '')
  return p === 'homens' || p === 'mulheres' || p === 'trans'
})

const menuGender = computed<GenderSlug>(() => {
  const p = String(route.params.gender ?? '')
  if (p === 'homens' || p === 'mulheres' || p === 'trans') {
    return p
  }
  return 'mulheres'
})

const desktopCityRoot = ref<HTMLElement | null>(null)

const { data: navPayload, pending: navPending, error: navError, refresh: refreshNav } = await useAsyncData(
  () => (genderChosen.value ? `layout-explore-nav-${menuGender.value}` : 'layout-explore-nav-all'),
  () => (genderChosen.value ? fetchNav(menuGender.value) : fetchNavAllGenders()),
  { watch: [genderChosen, menuGender] },
)

function stateMenuTarget(uf: string) {
  const lowerUf = uf.toLowerCase()
  if (genderChosen.value) {
    return `/explorar/${menuGender.value}/estado/${lowerUf}`
  }
  return {
    path: '/explorar',
    query: { next: `/explorar/__GENDER__/estado/${lowerUf}` },
  }
}

function regionMenuTarget(regionSlug: RegionSlug) {
  if (genderChosen.value) {
    return `/explorar/${menuGender.value}/regiao/${regionSlug}`
  }
  return {
    path: '/explorar',
    query: { next: `/explorar/__GENDER__/regiao/${regionSlug}` },
  }
}

const cityMenuRegions = computed(() => {
  const regions = navPayload.value?.regions ?? []
  return regions.map((r: ExploreNavResponse['regions'][number]) => ({
    slug: r.slug as RegionSlug,
    name: r.name,
    states: r.states,
  }))
})

watch(
  () => route.fullPath,
  () => {
    desktopCityMenuOpen.value = false
    mobileMenuOpen.value = false
    mobileCityMenuOpen.value = false
  },
)

function onDocumentClickCloseCity(e: MouseEvent) {
  const el = desktopCityRoot.value
  if (!el || !desktopCityMenuOpen.value) {
    return
  }
  const t = e.target
  if (t instanceof Node && !el.contains(t)) {
    desktopCityMenuOpen.value = false
  }
}

onMounted(() => {
  void hydrateUserIfNeeded()
  document.addEventListener('click', onDocumentClickCloseCity)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClickCloseCity)
})
</script>
