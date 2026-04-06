<template>
  <div
    class="flex min-h-[min(100dvh,720px)] flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-4 py-12 text-center sm:py-16"
  >
    <h1 class="max-w-lg text-3xl font-bold leading-tight text-white md:text-4xl">
      Conteúdo exclusivo para maiores de 18 anos
    </h1>
    <p class="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
      Ao continuar, confirma que tem idade legal para visualizar este site e que aceita
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
      Se não tem idade legal, clique <a href="https://www.google.com" class="text-brand hover:underline">aqui</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

usePublicPageSeo({
  title: 'Verificação de idade',
  description:
    'Confirme que tem idade legal para aceder ao Prazer.Vip — diretório de classificados para adultos no Brasil.',
})

const { confirmAge } = useAgeGate()
const router = useRouter()

function entrar() {
  confirmAge()
  router.replace('/explorar')
}
</script>
