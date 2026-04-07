<template>
  <div>
    <AgeGateOverlay />
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
            class="h-8 w-auto max-w-[min(200px,calc(100vw-7.5rem))] object-contain object-left md:h-9 md:max-w-[min(200px,calc(100vw-2rem))]"
            width="180"
            height="36"
            loading="eager"
            decoding="async"
          />
        </NuxtLink>
        <nav class="hidden items-center gap-3 text-sm md:flex">
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
        <div class="mx-auto max-h-[70vh] max-w-7xl space-y-2 overflow-auto">
          <NuxtLink
            to="/explorar"
            class="block rounded-lg border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200"
            @click="mobileMenuOpen = false"
          >
            Explorar
          </NuxtLink>
          <NuxtLink
            :to="registerOrMyProfileTo"
            class="block rounded-lg border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200"
            @click="mobileMenuOpen = false"
          >
            {{ registerOrMyProfileLabel }}
          </NuxtLink>
          <NuxtLink
            :to="advertiserAreaTo"
            class="block rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-medium text-white"
            @click="mobileMenuOpen = false"
          >
            Área do Anunciante
          </NuxtLink>
        </div>
      </div>
    </header>
    <!-- Sem max-w-7xl: páginas como o perfil público controlam largura (banner em tela cheia) -->
    <main class="bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(225,29,72,0.18),transparent)] py-10">
      <slot />
    </main>
    <LayoutSiteFooter />
  </div>
</template>

<script setup lang="ts">
import { brandAssets } from '~/config/brand-assets'

const brand = brandAssets
const route = useRoute()
const { advertiserAreaTo, registerOrMyProfileLabel, registerOrMyProfileTo, hydrateUserIfNeeded } =
  useAdvertiserAreaLink()

const mobileMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

onMounted(() => {
  void hydrateUserIfNeeded()
})
</script>
