<template>
  <NuxtLink
    :to="publicProfileHref"
    class="group flex flex-col overflow-hidden border border-zinc-800 bg-zinc-900/50 transition hover:border-brand/40 hover:shadow-lg hover:shadow-rose-950/20"
    :class="isCompact ? 'rounded-xl' : 'rounded-2xl'"
  >
    <div
      class="relative overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950"
      :class="isCompact ? 'aspect-[2/1]' : 'aspect-[4/3]'"
    >
      <span
        v-if="profile.premium"
        class="absolute left-2 top-2 z-10 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-950 sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs"
      >
        Premium
      </span>
      <span
        v-if="rightBadgeText"
        class="absolute right-2 top-2 z-10 max-w-[55%] rounded-lg px-2 py-1 text-right text-[10px] font-medium leading-tight backdrop-blur-sm sm:right-3 sm:top-3 sm:max-w-[60%] sm:text-xs"
        :class="
          profile.available_now_active
            ? 'bg-emerald-600/95 text-white shadow-sm shadow-emerald-950/40'
            : 'bg-black/55 text-zinc-100'
        "
      >
        {{ rightBadgeText }}
      </span>

      <template v-if="carouselSlides.length > 0">
        <template v-if="carouselSlides.length > 1">
          <div
            v-for="(item, i) in carouselSlides"
            v-show="i === activeSlide"
            :key="`${profile.id}-slide-${i}`"
            class="absolute inset-0"
          >
            <img
              v-if="item.type === 'image'"
              :src="item.url"
              :alt="`Foto de ${profile.displayName}`"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
            <video
              v-else
              :src="item.url"
              class="h-full w-full object-cover"
              muted
              playsinline
              loop
              autoplay
            />
          </div>
          <div
            class="pointer-events-none absolute bottom-1.5 left-0 right-0 z-10 flex justify-center gap-1 sm:bottom-2"
            aria-hidden="true"
          >
            <span
              v-for="(_, i) in carouselSlides"
              :key="`dot-${i}`"
              class="h-1 rounded-full transition-all"
              :class="[
                i === activeSlide ? 'w-3 bg-white' : 'w-1 bg-white/45',
                isCompact ? 'sm:h-1' : '',
              ]"
            />
          </div>
        </template>
        <template v-else>
          <img
            v-if="carouselSlides[0]!.type === 'image'"
            :src="carouselSlides[0]!.url"
            :alt="`Foto de ${profile.displayName}`"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
          <video
            v-else
            :src="carouselSlides[0]!.url"
            class="h-full w-full object-cover"
            muted
            playsinline
            loop
            autoplay
          />
        </template>
      </template>
    </div>
    <div class="flex flex-1 flex-col" :class="isCompact ? 'p-2' : 'p-4'">
      <h3
        class="font-semibold text-white group-hover:text-brand"
        :class="isCompact ? 'text-sm leading-snug' : 'text-lg'"
      >
        {{ profile.displayName }}
      </h3>
      <p
        v-if="tipoLabel || profile.neighborhood"
        class="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-xs text-zinc-400 sm:text-sm"
      >
        <span
          v-if="tipoLabel"
          class="text-[10px] font-medium uppercase tracking-wide text-brand/90 sm:text-xs"
        >
          {{ tipoLabel }}
        </span>
        <span
          v-if="tipoLabel && profile.neighborhood"
          class="select-none text-zinc-500"
          aria-hidden="true"
        >
          ·
        </span>
        <span v-if="profile.neighborhood">{{ profile.neighborhood }}</span>
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ProfileMediaItem, ProfileSummary } from '~/data/mock-catalog'
import { formatArrivalBadge } from '~/utils/arrival-badge'
import { buildPublicProfilePath } from '~/utils/public-profile-url'

const props = defineProps<{
  gender: string
  profile: ProfileSummary
  /** Cards menores na grelha 4 colunas (sem destaque premium) */
  compact?: boolean
}>()

const isCompact = computed(() => props.compact === true)

const publicProfileHref = computed(() =>
  buildPublicProfilePath(props.profile.public_slug, props.profile.tipo_atendimento),
)

function seededShuffle<T>(items: T[], seedStr: string): T[] {
  const arr = [...items]
  let seed = 2166136261
  for (let k = 0; k < seedStr.length; k++) {
    seed ^= seedStr.charCodeAt(k)
    seed = Math.imul(seed, 16777619)
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0
    const j = seed % (i + 1)
    ;[arr[i]!, arr[j]!] = [arr[j]!, arr[i]!]
  }
  return arr
}

const carouselSlides = computed((): ProfileMediaItem[] => {
  const raw = props.profile.gallery?.filter((x) => x.url) ?? []
  if (raw.length === 0) {
    return []
  }
  if (raw.length === 1) {
    return raw
  }
  const shuffled = seededShuffle(raw, `${props.profile.id}|${props.profile.displayName}`)
  return shuffled.slice(0, Math.min(3, shuffled.length))
})

const activeSlide = ref(0)

watchEffect((onCleanup) => {
  const slides = carouselSlides.value
  activeSlide.value = 0
  if (slides.length <= 1) {
    return
  }
  if (import.meta.server) {
    return
  }
  const id = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % slides.length
  }, 4500)
  onCleanup(() => clearInterval(id))
})

const tipoLabel = computed(() => {
  const t = props.profile.tipo_atendimento
  if (t === 'massagista') {
    return 'Massagista'
  }
  if (t === 'acompanhante') {
    return 'Acompanhante'
  }
  return null
})

const rightBadgeText = computed(() => {
  if (props.profile.available_now_active) {
    return 'Disponível agora'
  }
  return formatArrivalBadge(props.profile.arrived_in_city_at) ?? ''
})
</script>
