<template>
  <NuxtLayout :name="layoutName">
    <div class="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
      <p
        class="text-5xl font-black tabular-nums text-zinc-700 sm:text-6xl"
        aria-hidden="true"
      >
        {{ statusCode }}
      </p>
      <h1 class="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
        {{ headline }}
      </h1>
      <p class="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
        {{ bodyText }}
      </p>
      <div class="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <button
          v-if="layoutName === 'admin'"
          type="button"
          class="rounded-xl border border-zinc-600 bg-zinc-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
          @click="clearError({ redirect: '/admin/cadastros' })"
        >
          Voltar ao painel
        </button>
        <button
          v-else
          type="button"
          class="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 transition hover:bg-brand-muted"
          @click="clearError({ redirect: '/explorar' })"
        >
          Explorar anúncios
        </button>
        <button
          type="button"
          class="rounded-xl border border-zinc-600 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900/60"
          @click="clearError({ redirect: '/' })"
        >
          Página inicial
        </button>
        <button
          v-if="layoutName !== 'admin'"
          type="button"
          class="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
          @click="clearError({ redirect: '/contato' })"
        >
          Suporte
        </button>
      </div>
      <p v-if="showDevMessage" class="mt-10 break-words text-left font-mono text-xs text-zinc-600">
        {{ error.message }}
      </p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const route = useRoute()

const layoutName = computed(() => (route.path.startsWith('/admin') ? 'admin' : 'default'))

const statusCode = computed(() => {
  const c = props.error?.statusCode
  return typeof c === 'number' ? c : 500
})

const is404 = computed(() => statusCode.value === 404)

const headline = computed(() => {
  if (is404.value) {
    return 'Página não encontrada'
  }
  if (statusCode.value >= 500) {
    return 'Erro no servidor'
  }
  return 'Algo correu mal'
})

const bodyText = computed(() => {
  if (is404.value) {
    return 'O endereço que abriu não existe ou já não está disponível. Verifique o link ou utilize os botões abaixo.'
  }
  if (statusCode.value >= 500) {
    return 'Estamos com uma dificuldade técnica momentânea. Tente de novo dentro de instantes. Se o problema continuar, contacte-nos.'
  }
  const m = props.error?.message?.trim()
  if (m && !m.toLowerCase().startsWith('page not found')) {
    return m
  }
  return 'Não foi possível concluir o pedido. Tente novamente ou volte mais tarde.'
})

const showDevMessage = computed(() => import.meta.dev && Boolean(props.error?.message))

useSeoMeta({
  title: () => (is404.value ? 'Página não encontrada' : 'Erro'),
  description: () =>
    is404.value
      ? 'A página pedida não existe no Prazer.Vip.'
      : 'Ocorreu um erro ao carregar esta página no Prazer.Vip.',
  robots: 'noindex, nofollow',
})

useHead({
  htmlAttrs: {
    lang: 'pt-BR',
  },
})
</script>
