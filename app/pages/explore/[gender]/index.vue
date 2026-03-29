<template>
  <div v-if="genderOk" class="space-y-10 pb-8">
    <nav class="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
      <NuxtLink to="/explorar" class="hover:text-brand">← Voltar</NuxtLink>
      <span aria-hidden="true">·</span>
      <NuxtLink to="/explorar" class="hover:text-brand">Início</NuxtLink>
      <span aria-hidden="true">&gt;</span>
      <span class="text-zinc-300">{{ genderTitle }}</span>
    </nav>

    <header class="space-y-2">
      <p class="text-sm font-medium text-brand">{{ genderTitle }}</p>
      <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">Escolha sua cidade</h1>
      <h2 class="text-lg font-normal text-zinc-400 md:text-xl">
        Encontre {{ genderPhrase }} na sua região
      </h2>
      <p class="text-lg text-zinc-300">
        <span class="tabular-nums font-semibold text-white">{{ totalProfiles }}</span>
        {{ totalProfiles === 1 ? 'perfil' : 'perfis' }}
      </p>
    </header>

    <section v-for="region in regions" :key="region.uf" class="space-y-4">
      <div class="flex items-baseline justify-between gap-4 border-b border-zinc-800 pb-2">
        <h2 class="text-xl font-semibold text-white">{{ region.name }}</h2>
        <span class="text-xs uppercase tracking-wide text-zinc-500">{{ region.uf }}</span>
      </div>
      <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="c in region.cities" :key="`${region.uf}-${c.slug}`">
          <NuxtLink
            :to="`/explorar/${gender}/cidade/${region.uf.toLowerCase()}/${c.slug}`"
            class="group block overflow-hidden rounded-3xl bg-[#111317] shadow-lg ring-1 ring-zinc-800/80 transition hover:ring-brand/50"
          >
            <div class="relative h-48 w-full overflow-hidden bg-zinc-800">
              <img
                :src="c.thumbUrl"
                :alt="`Foto em destaque em ${c.name}`"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                width="640"
                height="384"
                loading="lazy"
                decoding="async"
              />
              <div
                class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-[#111317]"
                aria-hidden="true"
              />
              <span
                class="absolute right-3 top-3 rounded-full bg-[#E64C4C] px-3 py-1 text-xs font-medium text-white shadow-sm"
              >
                <span class="tabular-nums">{{ c.count }}</span>
                {{ c.count === 1 ? ' perfil' : ' perfis' }}
              </span>
            </div>
            <div class="flex items-center justify-center px-4 py-6">
              <h3 class="text-center text-xl font-bold text-white transition group-hover:text-[#E64C4C]">
                {{ c.name }}
              </h3>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section
      class="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-zinc-900/80 p-6 md:p-8"
    >
      <h2 class="text-xl font-semibold text-white">Destaque seu perfil</h2>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Apareça em primeiro lugar com nossos planos premium e tenha mais visibilidade.
      </p>
      <NuxtLink
        to="/cadastro"
        class="mt-4 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Ver planos e anunciar
      </NuxtLink>
    </section>
  </div>
  <div v-else class="rounded-xl border border-amber-900/50 bg-amber-950/30 p-6 text-amber-200">
    Categoria inválida. <NuxtLink to="/explorar" class="underline">Voltar</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { GenderSlug } from '~/data/mock-catalog'
import { getRegionsByGender, getTotalListingProfiles } from '~/data/mock-catalog'

definePageMeta({
  layout: 'default',
  path: '/explorar/:gender',
})

const route = useRoute()
const gender = computed(() => route.params.gender as string)

const genders: GenderSlug[] = ['homens', 'mulheres', 'trans']
const genderOk = computed(() => genders.includes(gender.value as GenderSlug))

const genderTitle = computed(() => {
  const m: Record<string, string> = {
    homens: 'Homens',
    mulheres: 'Mulheres',
    trans: 'Trans',
  }
  return m[gender.value] ?? gender.value
})

const genderPhrase = computed(() => {
  const g = gender.value as GenderSlug
  if (g === 'trans') {
    return 'pessoas trans'
  }
  return genderTitle.value.toLowerCase()
})

const regions = computed(() => {
  if (!genderOk.value) {
    return []
  }
  return getRegionsByGender(gender.value as GenderSlug)
})

const totalProfiles = computed(() => {
  if (!genderOk.value) {
    return 0
  }
  return getTotalListingProfiles(gender.value as GenderSlug)
})

useHead({
  title: computed(() =>
    genderOk.value ? `${genderTitle.value} — Escolha sua cidade` : 'Explorar',
  ),
})
</script>
