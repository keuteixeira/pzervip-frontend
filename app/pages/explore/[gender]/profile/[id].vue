<template>
  <div class="space-y-8 pb-10">
    <NuxtLink :to="backLink" class="text-sm text-zinc-500 hover:text-brand">← Voltar</NuxtLink>

    <article v-if="profile" class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div class="relative aspect-[21/9] bg-gradient-to-br from-zinc-800 to-zinc-950">
        <span
          v-if="profile.premium"
          class="absolute right-4 top-4 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-zinc-950"
        >
          Premium
        </span>
      </div>

      <div class="space-y-8 p-6 md:p-8">
        <header class="space-y-4">
          <p class="text-sm font-medium text-brand">Perfil de {{ profile.displayName }}</p>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800/80 px-5 py-2.5 text-sm font-medium text-white transition hover:border-brand/50 hover:bg-zinc-800"
            >
              Curtir
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90"
            >
              Mensagem
            </button>
          </div>

          <div>
            <h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl">{{ profile.displayName }}</h1>
            <ul class="mt-3 space-y-1.5 text-zinc-400">
              <li class="flex items-start gap-2">
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                <span>{{ profile.locationLine }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                <span>Membro desde {{ profile.memberSince }}</span>
              </li>
            </ul>
            <p class="mt-2 text-xs uppercase tracking-wide text-zinc-500">
              {{ serviceLabel }}
            </p>
          </div>
        </header>

        <section class="space-y-3">
          <h2 class="text-xl font-semibold text-white">Sobre mim</h2>
          <div class="prose prose-invert max-w-none text-sm leading-relaxed text-zinc-300">
            <p>{{ profile.about }}</p>
          </div>
        </section>

        <div v-if="profile.socialLinks && Object.keys(profile.socialLinks).length > 0" class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Redes e links</p>
          <AdvertiserSocialLinks :links="profile.socialLinks" />
        </div>

        <div v-if="whatsappUrl" class="pt-2">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-[#20bd5a] sm:w-auto"
          >
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
            Falar no WhatsApp
          </a>
        </div>

        <section
          v-if="profile.premium"
          class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 md:p-6"
        >
          <h2 class="text-lg font-semibold text-amber-100">Membro Premium</h2>
          <ul class="mt-4 space-y-2 text-sm text-zinc-300">
            <li v-for="(b, i) in profile.premiumBenefits" :key="i" class="flex gap-2">
              <span class="text-amber-400/90" aria-hidden="true">✓</span>
              <span>{{ b }}</span>
            </li>
          </ul>
        </section>

        <section class="space-y-4">
          <div>
            <h2 class="text-xl font-semibold text-white">Comentários</h2>
            <p class="mt-1 text-sm text-zinc-500">
              O comentário será publicado após a aprovação pela moderação.
            </p>
          </div>
          <ul v-if="profile.comments.length > 0" class="space-y-4">
            <li
              v-for="(c, idx) in profile.comments"
              :key="idx"
              class="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-4"
            >
              <h3 class="font-medium text-white">{{ c.author }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-zinc-300">{{ c.text }}</p>
              <p class="mt-2 text-xs text-zinc-500">{{ c.when }}</p>
            </li>
          </ul>
          <p v-else class="text-sm text-zinc-500">Ainda não há comentários públicos.</p>
        </section>
      </div>
    </article>

    <div v-else class="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-red-200">
      Género inválido ou não foi possível carregar o perfil.
      <NuxtLink to="/explorar" class="underline">Explorar</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GenderSlug } from '~/data/mock-catalog'
import { getProfileDetailMock } from '~/data/mock-catalog'
import { buildWhatsAppSendUrl } from '~/utils/whatsapp'

definePageMeta({
  layout: 'default',
  path: '/explorar/:gender/perfil/:id',
})

const route = useRoute()
const gender = computed(() => route.params.gender as string)
const id = computed(() => route.params.id as string)

const genders: GenderSlug[] = ['homens', 'mulheres', 'trans']

const profile = computed(() => {
  if (!genders.includes(gender.value as GenderSlug)) {
    return null
  }
  return getProfileDetailMock(gender.value as GenderSlug, id.value)
})

const backLink = computed(() => `/explorar/${gender.value}`)

const serviceLabel = computed(() => {
  const t = profile.value?.tipoAtendimento
  if (t === 'massagista') {
    return 'Massagista'
  }
  return 'Acompanhante'
})

const whatsappUrl = computed(() => {
  const p = profile.value
  if (!p?.whatsappPhone) {
    return ''
  }
  return buildWhatsAppSendUrl(p.whatsappPhone, p.displayName)
})
</script>
