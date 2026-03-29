<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-4 py-16 text-center"
  >
    <img
      :src="brand.logoHorizontal"
      alt="Prazer.Vip"
      class="mx-auto h-10 w-auto max-w-[min(100%,280px)] sm:h-12"
      width="280"
      height="48"
      loading="eager"
      decoding="async"
    />
    <h1 class="mt-6 max-w-lg text-3xl font-bold leading-tight text-white md:text-4xl">
      Conteúdo exclusivo para maiores de 18 anos
    </h1>
    <p class="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
      Ao continuar, confirmas que tens idade legal no teu país para visualizar este site e que aceitas
      os nossos termos de utilização.
    </p>
    <button
      type="button"
      class="mt-10 w-full max-w-md rounded-xl bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-rose-900/40 transition hover:bg-brand-muted"
      @click="entrar"
    >
      Sou maior de 18 anos — Entrar
    </button>
    <p class="mt-8 text-xs text-zinc-600">
      Se não tens idade legal, deves sair deste site.
    </p>
  </div>
</template>

<script setup lang="ts">
import { brandAssets } from '~/config/brand-assets'

definePageMeta({
  layout: false,
})

const brand = brandAssets

const { confirmAge } = useAgeGate()
const router = useRouter()

function entrar() {
  confirmAge()
  router.replace('/explorar')
}
</script>
