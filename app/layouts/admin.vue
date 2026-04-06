<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100">
    <header class="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:py-4">
        <NuxtLink
          to="/admin/cadastros"
          class="flex min-w-0 shrink items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Painel administrativo — início"
        >
          <img
            :src="brandAssets.logoHorizontal"
            alt="Prazer.Vip"
            class="h-8 w-auto max-w-[min(200px,55vw)] object-contain object-left"
            loading="eager"
          />
        </NuxtLink>

        <nav class="hidden items-center gap-1 text-sm md:flex" aria-label="Secções do painel">
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="rounded-lg px-3 py-2 transition"
            :class="
              isActive(l.to) ? 'bg-brand/20 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            "
          >
            {{ l.label }}
          </NuxtLink>
        </nav>

        <div class="flex shrink-0 items-center gap-2">
          <NuxtLink
            to="/explorar"
            class="hidden rounded-lg px-2 py-1.5 text-xs text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300 md:inline-block"
          >
            Ver site
          </NuxtLink>
          <button
            type="button"
            class="hidden rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800 md:inline-block"
            @click="logoutAndGo"
          >
            Sair
          </button>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 text-zinc-200 transition hover:bg-zinc-800 md:hidden"
            :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
            :aria-controls="mobileMenuOpen ? mobileNavId : undefined"
            :aria-label="mobileMenuOpen ? 'Fechar menu do painel' : 'Abrir menu do painel'"
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
        :id="mobileNavId"
        class="border-t border-zinc-800 bg-zinc-900/95 md:hidden"
      >
        <nav class="mx-auto max-h-[min(70vh,calc(100dvh-5rem))] max-w-7xl overflow-y-auto px-4 py-3" aria-label="Menu administrativo">
          <ul class="flex flex-col gap-0.5">
            <li v-for="l in links" :key="`m-${l.to}`">
              <NuxtLink
                :to="l.to"
                class="block rounded-lg px-3 py-3 text-base font-medium transition"
                :class="
                  isActive(l.to)
                    ? 'bg-brand/20 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                "
                @click="mobileMenuOpen = false"
              >
                {{ l.label }}
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-3 flex flex-col gap-2 border-t border-zinc-800 pt-3">
            <NuxtLink
              to="/explorar"
              class="rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              @click="mobileMenuOpen = false"
            >
              Ver site
            </NuxtLink>
            <button
              type="button"
              class="rounded-lg border border-zinc-600 px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-zinc-800"
              @click="onMobileLogout"
            >
              Sair
            </button>
          </div>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { brandAssets } from '~/config/brand-assets'

const route = useRoute()
const { logout } = useAuth()

const mobileMenuOpen = ref(false)
const mobileNavId = 'admin-mobile-nav'

const links = [
  { to: '/admin/cadastros', label: 'Cadastros' },
  { to: '/admin/anunciantes', label: 'Anunciantes' },
  { to: '/admin/texto-perfil', label: 'Nome e bio' },
  { to: '/admin/midias', label: 'Mídias' },
  { to: '/admin/comentarios', label: 'Comentários' },
  { to: '/admin/destaques', label: 'Destaques' },
  { to: '/admin/chamados', label: 'Chamados' },
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

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

async function logoutAndGo() {
  await logout()
  await navigateTo('/login')
}

async function onMobileLogout() {
  mobileMenuOpen.value = false
  await logoutAndGo()
}
</script>
