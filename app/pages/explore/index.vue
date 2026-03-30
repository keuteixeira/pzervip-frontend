<template>
  <div class="relative -mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
    <div
      class="pointer-events-none absolute inset-x-0 -top-24 h-96"
      aria-hidden="true"
    />

    <div class="relative">
      <section class="pb-12 pt-4 text-center md:pb-16 md:pt-8">
        <h1
          class="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.15]"
        >
          Encontre os melhores <span class="highlight-text">perfis</span> da sua cidade
        </h1>
        <h2
          class="mx-auto mt-6 max-w-3xl text-lg font-normal leading-relaxed text-zinc-400 md:text-xl md:leading-relaxed"
        >
          Descubra pessoas, como acompanhantes e massagistas, organizados por localização.
          Conecte-se facilmente com pessoas próximas a você.
        </h2>

        <div
          class="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:mx-auto sm:max-w-2xl sm:flex-row sm:justify-center sm:gap-4"
        >
          <NuxtLink
            v-for="item in categories"
            :key="item.slug"
            :to="genderLink(item.slug)"
            class="group flex min-h-[52px] items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-900/70 px-8 py-3.5 text-center text-lg font-semibold text-white shadow-sm transition hover:border-brand/60 hover:bg-zinc-900 hover:text-brand sm:flex-1 sm:max-w-[200px]"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/explorar',
})

useHead({
  title: 'Explorar',
})

const categories = [
  { slug: 'homens', label: 'Homens' },
  { slug: 'mulheres', label: 'Mulheres' },
  { slug: 'trans', label: 'Trans' },
] as const

const route = useRoute()

function genderLink(slug: string) {
  const next = route.query.next
  if (typeof next === 'string' && next.includes('__GENDER__')) {
    return next.replace('__GENDER__', slug)
  }
  return `/explorar/${slug}`
}

const year = new Date().getFullYear()

function scrollTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
