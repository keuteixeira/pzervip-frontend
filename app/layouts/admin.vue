<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100">
    <header class="border-b border-zinc-800 bg-zinc-900/80">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div class="flex items-center gap-6">
          <NuxtLink
            :to="withMock('/admin/cadastros')"
            class="flex shrink-0 items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Painel administrativo — início"
          >
            <img
              :src="brandAssets.logoHorizontal"
              alt="Prazer.Vip"
              class="h-8 w-auto max-w-[min(200px,45vw)] object-contain object-left"
              loading="eager"
            />
          </NuxtLink>
          <nav class="flex flex-wrap gap-1 text-sm">
            <NuxtLink
              v-for="l in links"
              :key="l.to"
              :to="withMock(l.to)"
              class="rounded-lg px-3 py-2 transition"
              :class="
                isActive(l.to) ? 'bg-brand/20 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              "
            >
              {{ l.label }}
            </NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/explorar" class="text-xs text-zinc-500 hover:text-zinc-300">Ver site</NuxtLink>
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
            @click="logoutAndGo"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
    <div
      v-if="isMock"
      class="border-b border-amber-800/60 bg-amber-950/40 px-4 py-2 text-center text-sm text-amber-100"
    >
      <strong class="text-amber-200">Modo demonstração</strong> — dados fictícios (query
      <code class="rounded bg-zinc-900 px-1 py-0.5 text-xs">?mock=1</code>). Remova da URL para usar a API real.
    </div>
    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { brandAssets } from '~/config/brand-assets'

const route = useRoute()
const { logout } = useAuth()
const { isMock, withMock } = useAdminMock()

const links = [
  { to: '/admin/cadastros', label: 'Cadastros' },
  { to: '/admin/anunciantes', label: 'Anunciantes' },
  { to: '/admin/midias', label: 'Mídias' },
  { to: '/admin/comentarios', label: 'Comentários' },
  { to: '/admin/destaques', label: 'Destaques' },
]

function isActive(to: string) {
  if (to === '/admin/anunciantes') {
    return route.path === '/admin/anunciantes' || route.path.startsWith('/admin/anunciantes/')
  }
  if (to === '/admin/cadastros') {
    return route.path === '/admin/cadastros' || route.path.startsWith('/admin/cadastros/')
  }
  return route.path === to || route.path.startsWith(`${to}/`)
}

async function logoutAndGo() {
  await logout()
  await navigateTo('/login')
}
</script>
