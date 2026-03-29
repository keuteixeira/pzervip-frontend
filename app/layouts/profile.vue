<template>
  <div>
    <header class="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <NuxtLink to="/" class="flex shrink-0 items-center gap-2" aria-label="Prazer.Vip — início">
          <img
            :src="brand.logoHorizontal"
            alt="Prazer.Vip"
            class="hidden h-8 w-auto sm:block md:h-9"
            width="180"
            height="36"
            loading="eager"
            decoding="async"
          />
          <img
            :src="brand.logoVertical"
            alt="Prazer.Vip"
            class="h-10 w-auto sm:hidden"
            width="120"
            height="40"
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
            to="/cadastro"
            class="rounded-md px-3 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            Cadastro de Anunciante
          </NuxtLink>
          <NuxtLink
            to="/login"
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
</script>
