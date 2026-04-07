<template>
  <Teleport to="body">
    <div
      v-if="showOverlay"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/95 px-4 py-12 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-overlay-title"
    >
      <div
        class="flex min-h-[min(100dvh,720px)] w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-4 py-12 text-center sm:py-16"
      >
        <h1 id="age-gate-overlay-title" class="text-3xl font-bold leading-tight text-white md:text-4xl">
          Conteúdo exclusivo para maiores de 18 anos
        </h1>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
          Ao continuar, confirma que tem idade legal para visualizar este site e que aceita os nossos termos de
          utilização.
        </p>
        <button
          type="button"
          class="mt-10 w-full max-w-md rounded-xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-rose-900/40 transition hover:bg-brand-muted"
          @click="entrar"
        >
          Sou maior de 18 anos — Entrar
        </button>
        <p class="mt-8 text-xs text-zinc-600">
          Se não tem idade legal, clique
          <a href="https://www.google.com" class="text-brand hover:underline">aqui</a>.
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { isAgeGateExemptPath } from '~/utils/age-gate-routes'

const route = useRoute()
const { isAgeConfirmed, confirmAge } = useAgeGate()

/**
 * Cobre perfis diretos, explorar, etc. sem trocar de rota — o `<head>` da página atual (title, og:image)
 * continua a ser o definido pela página (SSR), o que mantém o SEO do anúncio.
 * A página dedicada `/` continua a ser o ecrã completo de verificação (sem duplicar overlay).
 */
const showOverlay = computed(() => {
  if (isAgeConfirmed()) {
    return false
  }
  if (route.path === '/') {
    return false
  }
  return !isAgeGateExemptPath(route.path)
})

watch(
  showOverlay,
  (v) => {
    if (!import.meta.client) {
      return
    }
    document.documentElement.classList.toggle('overflow-hidden', v)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (import.meta.client) {
    document.documentElement.classList.remove('overflow-hidden')
  }
})

function entrar() {
  confirmAge()
}
</script>
