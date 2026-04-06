<template>
  <div>
    <header class="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <NuxtLink
          to="/"
          class="flex min-w-0 shrink items-center gap-2"
          aria-label="Prazer.Vip — início"
        >
          <img
            :src="brand.logoHorizontal"
            alt="Prazer.Vip"
            class="h-8 w-auto max-w-[min(200px,calc(100vw-2rem))] object-contain object-left md:h-9"
            width="180"
            height="36"
            loading="eager"
            decoding="async"
          />
        </NuxtLink>
        <nav class="flex items-center gap-3 text-sm">
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
const { advertiserAreaTo, registerOrMyProfileLabel, registerOrMyProfileTo, hydrateUserIfNeeded } =
  useAdvertiserAreaLink()

onMounted(() => {
  void hydrateUserIfNeeded()
})
</script>
