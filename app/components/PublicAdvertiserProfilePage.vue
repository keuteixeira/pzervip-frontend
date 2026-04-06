<template>
  <div class="pb-16">
    <div class="mx-auto max-w-7xl px-4">
      <NuxtLink :to="backLink" class="text-sm text-zinc-500 hover:text-brand">← Voltar</NuxtLink>
    </div>

    <div v-if="pending" class="mx-auto max-w-7xl px-4">
      <div class="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center text-zinc-400">
        Carregando perfil…
      </div>
    </div>

    <template v-else-if="vm">
      <div class="relative mt-6 w-full overflow-hidden border-b border-zinc-800 bg-zinc-950">
        <div
          class="relative w-full bg-gradient-to-br from-zinc-800 to-zinc-950 h-[max(11.25rem,calc((min(100vw,80rem)-2rem)*9/21))] md:h-[max(15rem,calc((min(100vw,80rem)-2rem)*9/21))]"
        >
          <img
            v-if="vm.bannerUrl"
            :src="vm.bannerUrl"
            :alt="`Capa de ${vm.displayName}`"
            class="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </div>
        <div
          v-if="vm.premium"
          class="absolute right-4 top-4 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-semibold text-zinc-950 shadow-lg"
        >
          Premium
        </div>
        <div
          v-if="vm.highlightStars && vm.highlightStars > 0"
          class="absolute left-4 top-4 flex items-center gap-0.5 rounded-full bg-black/50 px-2 py-1 text-amber-400 backdrop-blur-sm"
          :aria-label="`${vm.highlightStars} estrelas`"
        >
          <span v-for="n in vm.highlightStars" :key="'hs-' + n" class="text-sm leading-none">★</span>
        </div>
      </div>

      <div class="mx-auto max-w-7xl px-4">
        <div class="mt-8 space-y-6">
          <section class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6 text-center">
            <h2 class="text-lg font-semibold text-white">Local</h2>
            <p class="mt-2 text-sm leading-relaxed text-zinc-300">
              <template v-if="vm.neighborhood">{{ vm.neighborhood }} · </template>
              <span v-if="vm.cityName">{{ vm.cityName }}</span>
              <span v-if="vm.stateUf" class="text-zinc-400"> · {{ vm.stateUf }}</span>
            </p>
            <a
              v-if="vm.mapsUrl"
              :href="vm.mapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 inline-flex text-sm font-medium text-brand hover:underline"
            >
              Ver no Google Maps
            </a>
          </section>

          <section class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6 text-center">
            <ul class="space-y-2 text-sm text-zinc-300">
              <li v-if="vm.memberSince" class="flex gap-2 justify-center">
                <span class="text-emerald-400/90" aria-hidden="true">✓</span>
                <span>Anunciante desde {{ vm.memberSince }}.</span>
              </li>
              <li v-if="vm.docsVerified" class="flex gap-2 justify-center">
                <span class="text-emerald-400/90" aria-hidden="true">✓</span>
                <span>Documentação de identidade conferida pela equipe.</span>
              </li>
            </ul>
          </section>

          <section
            class="w-full rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-5 md:p-6"
          >
            <div class="flex flex-col items-center gap-6 text-center">
              <div class="shrink-0">
                <div
                  class="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800 sm:h-32 sm:w-32"
                >
                  <img
                    v-if="vm.avatarUrl"
                    :src="vm.avatarUrl"
                    :alt="vm.displayName"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-3xl text-zinc-600">?</div>
                </div>
              </div>
              <div class="mx-auto w-full max-w-sm space-y-3">
                <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">WhatsApp</p>
                <p class="font-mono text-lg text-white">{{ vm.phoneDisplay }}</p>
                <a
                  v-if="whatsappUrl"
                  :href="whatsappUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-[#20bd5a]"
                >
                  <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    />
                  </svg>
                  Conversar no WhatsApp
                </a>
              </div>
            </div>
          </section>

          <section class="w-full rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-sm leading-relaxed text-amber-100/95 md:p-6 text-center">
            <p class="font-medium text-amber-200">Uso profissional</p>
            <p class="mt-2">
              Mensagens fora de contexto profissional podem ser ignoradas ou bloqueadas. Ao entrar em contato, diga que
              viu o anúncio no <strong class="text-white">Prazer.Vip</strong>. Quem anuncia costuma valorizar essa
              referência.
            </p>
            <p class="mt-3 text-amber-100/90">
              A plataforma não media acordos entre anunciantes e visitantes: combine valores, horários e regras diretamente
              com a pessoa anunciada antes do encontro.
            </p>
            <p class="mt-3 font-medium text-amber-200">
              Cuidado com golpes: não envie pagamento antecipado a desconhecidos (incluindo PIX sem confiança prévia).
            </p>
          </section>

          <section v-if="vm.about" class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6 text-center">
            <h2 class="text-lg font-semibold text-white">Sobre</h2>
            <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{{ vm.about }}</p>
            <p class="mt-2 text-xs uppercase tracking-wide text-zinc-500">{{ vm.serviceLabel }}</p>
          </section>

          <section v-if="lightboxItems.length > 0" class="w-full space-y-4">
            <h2 class="text-lg font-semibold text-white">Galeria</h2>
            <p class="text-sm text-zinc-500">Toque ou clique para ampliar e navegar entre áudio, vídeos e fotos.</p>
            <button
              v-for="(it, i) in lightboxItems"
              :key="'lb-' + i"
              type="button"
              class="block w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 text-left transition hover:border-brand/40"
              @click="openLightbox(i)"
            >
              <span class="block border-b border-zinc-800 px-4 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                {{ labelForKind(it.kind) }}
              </span>
              <div class="p-2">
                <audio
                  v-if="it.kind === 'audio'"
                  :src="it.url"
                  controls
                  class="w-full px-2 pb-2"
                  @click.stop
                />
                <div
                  v-else-if="it.kind === 'video'"
                  class="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-950"
                >
                  <video
                    :src="it.url"
                    muted
                    playsinline
                    preload="metadata"
                    class="pointer-events-none h-full w-full object-cover"
                    tabindex="-1"
                    aria-hidden="true"
                  />
                  <div
                    class="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-black/20 to-black/35"
                    aria-hidden="true"
                  >
                    <span
                      class="flex h-16 w-16 items-center justify-center rounded-full bg-white/92 text-zinc-900 shadow-lg ring-2 ring-white/25"
                    >
                      <svg class="ml-1 h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <img
                  v-else
                  :src="it.url"
                  :alt="`Mídia de ${vm.displayName}`"
                  class="max-h-[min(70vh,560px)] w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </button>
          </section>

          <ProfileMediaLightbox
            v-model="lightboxOpen"
            :items="lightboxItems"
            :start-index="lightboxStart"
            :alt-text="`Mídia de ${vm.displayName}`"
          />

          <section
            v-if="whatsappUrl"
            class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center md:p-6"
          >
            <div class="mx-auto max-w-sm">
              <p class="text-sm text-zinc-400">Telefone para contato</p>
              <p class="mt-1 font-mono text-lg text-white">{{ vm.phoneDisplay }}</p>
              <a
                :href="whatsappUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#20bd5a]"
              >
                Abrir WhatsApp
              </a>
            </div>
          </section>

          <div
            v-if="vm.socialLinks && Object.keys(vm.socialLinks).length > 0"
            class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center md:p-6"
          >
            <p class="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500">Redes e links</p>
            <AdvertiserSocialLinks :links="vm.socialLinks" />
          </div>

          <section
            v-if="vm.premium && vm.premiumBenefits.length > 0"
            class="w-full rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 md:p-6"
          >
            <h2 class="text-lg font-semibold text-amber-100">Destaques do plano</h2>
            <ul class="mt-4 space-y-2 text-sm text-zinc-300">
              <li v-for="(b, i) in vm.premiumBenefits" :key="i" class="flex gap-2">
                <span class="text-amber-400/90" aria-hidden="true">✓</span>
                <span>{{ b }}</span>
              </li>
            </ul>
          </section>

          <section class="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 md:p-6">
            <h2 class="text-xl font-semibold text-white">Comentários</h2>
            <p class="mt-1 text-sm text-zinc-500">
              Novos comentários e respostas de visitantes passam por moderação antes de aparecerem.
            </p>

            <form class="mt-6 space-y-3" @submit.prevent="submitVisitorComment">
              <p v-if="replyToId" class="text-sm text-brand">
                Respondendo a um comentário.
                <button type="button" class="ml-2 underline" @click="replyToId = null">Cancelar</button>
              </p>
              <div>
                <label class="mb-1 block text-xs font-medium text-zinc-500" for="cname">Nome (opcional)</label>
                <input
                  id="cname"
                  v-model="commentAuthor"
                  type="text"
                  maxlength="120"
                  class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-brand focus:ring-2"
                  placeholder="Deixe em branco para aparecer como Anônimo"
                  autocomplete="nickname"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-zinc-500" for="cbody">Comentário</label>
                <textarea
                  id="cbody"
                  v-model="commentBody"
                  required
                  rows="3"
                  maxlength="2000"
                  class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-brand focus:ring-2"
                  placeholder="Escreva seu comentário…"
                />
              </div>
              <p v-if="commentFeedback" class="text-sm" :class="commentOk ? 'text-emerald-400' : 'text-red-400'">
                {{ commentFeedback }}
              </p>
              <button
                type="submit"
                class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                :disabled="commentSending || !commentBody.trim()"
              >
                {{ commentSending ? 'Enviando…' : replyToId ? 'Enviar resposta' : 'Enviar comentário' }}
              </button>
            </form>

            <ul v-if="vm.comments.length > 0" class="mt-8 space-y-6 border-t border-zinc-800 pt-8">
              <li
                v-for="c in vm.comments"
                :key="c.id"
                class="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-4"
              >
                <div class="flex flex-wrap items-baseline gap-2">
                  <p class="font-medium text-white">{{ c.author }}</p>
                  <span
                    v-if="c.is_advertiser"
                    class="rounded bg-brand/20 px-2 py-0.5 text-xs font-medium text-brand"
                  >
                    Anúncio
                  </span>
                  <p class="text-xs text-zinc-500">{{ c.when }}</p>
                </div>
                <p class="mt-2 text-sm leading-relaxed text-zinc-300">{{ c.text }}</p>
                <div class="mt-3 flex flex-wrap gap-3">
                  <button
                    v-if="!replyToId || replyToId !== c.id"
                    type="button"
                    class="text-sm text-brand hover:underline"
                    @click="replyToId = c.id"
                  >
                    Responder
                  </button>
                </div>

                <ul v-if="c.replies.length > 0" class="mt-4 space-y-3 border-l-2 border-zinc-700 pl-4">
                  <li v-for="r in c.replies" :key="r.id" class="rounded-lg bg-zinc-900/60 px-3 py-3">
                    <div class="flex flex-wrap items-baseline gap-2">
                      <p class="font-medium text-white">{{ r.author }}</p>
                      <span
                        v-if="r.is_advertiser"
                        class="rounded bg-brand/20 px-2 py-0.5 text-xs font-medium text-brand"
                      >
                        Anúncio
                      </span>
                      <p class="text-xs text-zinc-500">{{ r.when }}</p>
                    </div>
                    <p class="mt-2 text-sm text-zinc-300">{{ r.text }}</p>
                  </li>
                </ul>

                <div v-if="isProfileOwner" class="mt-4 border-t border-zinc-800 pt-4">
                  <p class="mb-2 text-xs font-medium text-zinc-500">Responder como anunciante</p>
                  <textarea
                    v-model="advertiserReplyDraft[c.id]"
                    rows="2"
                    maxlength="2000"
                    class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-brand focus:ring-2"
                    placeholder="Sua resposta visível no anúncio…"
                  />
                  <button
                    type="button"
                    class="mt-2 rounded-lg bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600 disabled:opacity-50"
                    :disabled="advertiserReplySending === c.id || !(advertiserReplyDraft[c.id] ?? '').trim()"
                    @click="submitAdvertiserReply(c.id)"
                  >
                    {{ advertiserReplySending === c.id ? 'Enviando…' : 'Publicar resposta' }}
                  </button>
                  <p v-if="advertiserReplyMsg[c.id]" class="mt-2 text-sm text-emerald-400">{{ advertiserReplyMsg[c.id] }}</p>
                </div>
              </li>
            </ul>
            <p v-else class="mt-8 text-sm text-zinc-500">Ainda não há comentários públicos.</p>
          </section>
        </div>
      </div>
    </template>

    <div v-else class="mx-auto max-w-7xl px-4">
      <div class="mt-8 rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-red-200">
        Não foi possível carregar este perfil.
        <NuxtLink to="/explorar" class="underline">Explorar</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPhoneBrDigits } from '~/utils/format-phone-br'
import { publicProfilePathSegment } from '~/utils/public-profile-url'
import { buildWhatsAppSendUrl } from '~/utils/whatsapp'

const props = defineProps<{
  urlServicoSegment: 'acompanhante' | 'massagista'
}>()

type LightboxItem = { kind: 'audio' | 'video' | 'image'; url: string }

type PublicComment = {
  id: number
  author: string
  text: string
  when: string
  is_advertiser: boolean
  replies: PublicComment[]
}

type ApiPublicAdvertiser = {
  explore_gender_slug: string
  professional_name: string
  bio?: string | null
  service_type?: string | null
  neighborhood?: string | null
  city?: { name?: string | null } | null
  state?: { uf?: string | null; name?: string | null } | null
  whatsapp?: string | null
  social_links?: Record<string, string>
  member_since_label?: string | null
  identity_documents_verified?: boolean
  maps_search_url?: string | null
  cover?: { url?: string | null } | null
  profile_avatar?: { url?: string | null } | null
  audio?: { url?: string | null } | null
  gallery?: { url: string; mime_type?: string | null }[]
  comments?: {
    id: number
    author: string
    text: string
    when: string
    is_advertiser?: boolean
    replies?: {
      id: number
      author: string
      text: string
      when: string
      is_advertiser?: boolean
    }[]
  }[]
  highlight_stars_cached?: number | null
  plan_type?: string | null
  premium_tier?: number | null
}

type ProfileView = {
  displayName: string
  exploreGenderSlug: string
  about: string
  serviceLabel: string
  neighborhood?: string
  cityName?: string
  stateUf?: string
  mapsUrl?: string
  memberSince: string
  docsVerified: boolean
  phoneDigits?: string
  phoneDisplay: string
  bannerUrl?: string
  avatarUrl?: string
  audioUrl?: string
  galleryVideos: { url: string }[]
  galleryPhotos: { url: string }[]
  socialLinks?: Record<string, string>
  premium: boolean
  premiumBenefits: string[]
  comments: PublicComment[]
  highlightStars?: number
}

const route = useRoute()
const config = useRuntimeConfig()
const { user, fetchMe } = useAuth()
const { request, token } = useApi()

const slug = computed(() => String(route.params.slug ?? ''))

const { data: apiJson, pending } = await useAsyncData(
  () => `public-advertiser-${props.urlServicoSegment}-${slug.value}`,
  async () => {
    try {
      return await $fetch<ApiPublicAdvertiser>(
        `${config.public.apiBase}/v1/public/advertisers/${slug.value}`,
      )
    } catch {
      return null
    }
  },
  { watch: [slug] },
)

watch(
  () => apiJson.value,
  (a) => {
    if (!a) {
      return
    }
    const expected = publicProfilePathSegment(a.service_type)
    if (expected !== props.urlServicoSegment) {
      navigateTo(`/${expected}/${slug.value}`, { replace: true })
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (token.value) {
    fetchMe()
  }
})

const myPublicSlug = computed(() => {
  const p = user.value?.advertiser_profile as { public_slug?: string | null } | undefined
  return p?.public_slug ?? null
})

const isProfileOwner = computed(() => Boolean(myPublicSlug.value && myPublicSlug.value === slug.value))

function normalizeApiComments(raw: ApiPublicAdvertiser['comments']): PublicComment[] {
  if (!raw?.length) {
    return []
  }
  return raw.map((c) => ({
    id: c.id,
    author: c.author,
    text: c.text,
    when: c.when,
    is_advertiser: Boolean(c.is_advertiser),
    replies: (c.replies ?? []).map((r) => ({
      id: r.id,
      author: r.author,
      text: r.text,
      when: r.when,
      is_advertiser: Boolean(r.is_advertiser),
      replies: [],
    })),
  }))
}

function vmFromApi(a: ApiPublicAdvertiser): ProfileView {
  const gallery = a.gallery ?? []
  const galleryVideos = gallery.filter((g) => (g.mime_type ?? '').startsWith('video/'))
  const galleryPhotos = gallery.filter((g) => (g.mime_type ?? '').startsWith('image/'))
  const st = a.service_type ?? ''
  const serviceLabel =
    st === 'masseuse' ? 'Massagista' : st === 'companion' ? 'Acompanhante' : 'Anúncio profissional'
  const premium = a.plan_type === 'premium' || (a.premium_tier ?? 0) > 0 || (a.highlight_stars_cached ?? 0) > 0
  const digits = a.whatsapp?.replace(/\D/g, '') ?? ''
  return {
    displayName: a.professional_name ?? 'Perfil',
    exploreGenderSlug: a.explore_gender_slug,
    about: (a.bio ?? '').trim(),
    serviceLabel,
    neighborhood: a.neighborhood ?? undefined,
    cityName: a.city?.name ?? undefined,
    stateUf: a.state?.uf ?? undefined,
    mapsUrl: a.maps_search_url ?? undefined,
    memberSince: a.member_since_label ?? '',
    docsVerified: a.identity_documents_verified === true,
    phoneDigits: digits || undefined,
    phoneDisplay: formatPhoneBrDigits(digits || undefined),
    bannerUrl: a.cover?.url ?? gallery[0]?.url ?? undefined,
    avatarUrl: a.profile_avatar?.url ?? undefined,
    audioUrl: a.audio?.url ?? undefined,
    galleryVideos,
    galleryPhotos,
    socialLinks: a.social_links && Object.keys(a.social_links).length > 0 ? a.social_links : undefined,
    premium,
    premiumBenefits: premium
      ? ['Perfil verificado', 'Destaque no catálogo', 'Mais visibilidade para o seu anúncio']
      : [],
    comments: normalizeApiComments(a.comments),
    highlightStars: typeof a.highlight_stars_cached === 'number' ? a.highlight_stars_cached : undefined,
  }
}

const vm = computed((): ProfileView | null => {
  if (!slug.value) {
    return null
  }
  if (apiJson.value) {
    return vmFromApi(apiJson.value)
  }
  return null
})

const lightboxItems = computed((): LightboxItem[] => {
  const p = vm.value
  if (!p) {
    return []
  }
  const out: LightboxItem[] = []
  if (p.audioUrl) {
    out.push({ kind: 'audio', url: p.audioUrl })
  }
  p.galleryVideos.forEach((v) => out.push({ kind: 'video', url: v.url }))
  p.galleryPhotos.forEach((ph) => out.push({ kind: 'image', url: ph.url }))
  return out
})

const lightboxOpen = ref(false)
const lightboxStart = ref(0)

function openLightbox(i: number) {
  lightboxStart.value = i
  lightboxOpen.value = true
}

function labelForKind(k: LightboxItem['kind']) {
  if (k === 'audio') {
    return 'Áudio'
  }
  if (k === 'video') {
    return 'Vídeo'
  }
  return 'Foto'
}

const backLink = computed(() => `/explorar/${vm.value?.exploreGenderSlug ?? 'mulheres'}`)

function truncateForMeta(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) {
    return t
  }
  return `${t.slice(0, max - 1).trim()}…`
}

usePublicPageSeo({
  title: computed(() => {
    const v = vm.value
    if (!v) {
      return 'Perfil'
    }
    return `${v.displayName} · ${v.serviceLabel}`
  }),
  description: computed(() => {
    const v = vm.value
    if (!v) {
      return 'Perfil público no Prazer.Vip.'
    }
    const loc = [v.neighborhood, v.cityName, v.stateUf].filter(Boolean).join(' · ')
    const tail = loc ? ` Local: ${loc}.` : ''
    if (v.about) {
      return truncateForMeta(`${v.displayName} — ${v.serviceLabel}. ${v.about}${tail}`, 160)
    }
    return truncateForMeta(`${v.displayName} — ${v.serviceLabel} no Prazer.Vip.${tail}`, 160)
  }),
  image: computed(() => vm.value?.bannerUrl || vm.value?.avatarUrl),
})

const whatsappUrl = computed(() => {
  const p = vm.value
  if (!p?.phoneDigits) {
    return ''
  }
  return buildWhatsAppSendUrl(p.phoneDigits, p.displayName)
})

const commentAuthor = ref('')
const commentBody = ref('')
const commentSending = ref(false)
const commentFeedback = ref('')
const commentOk = ref(false)
const replyToId = ref<number | null>(null)

const advertiserReplyDraft = reactive<Record<number, string>>({})
const advertiserReplySending = ref<number | null>(null)
const advertiserReplyMsg = reactive<Record<number, string>>({})

async function submitVisitorComment() {
  const body = commentBody.value.trim()
  if (!body) {
    return
  }
  commentSending.value = true
  commentFeedback.value = ''
  commentOk.value = false
  try {
    await $fetch(`${config.public.apiBase}/v1/public/advertisers/${slug.value}/comments`, {
      method: 'POST',
      body: {
        author_name: commentAuthor.value.trim() || null,
        body,
        parent_id: replyToId.value,
      },
    })
    commentFeedback.value = 'Obrigado! O envio foi recebido e passará por moderação.'
    commentOk.value = true
    commentBody.value = ''
    commentAuthor.value = ''
    replyToId.value = null
  } catch {
    commentFeedback.value = 'Não foi possível enviar agora. Tente novamente em instantes.'
    commentOk.value = false
  } finally {
    commentSending.value = false
  }
}

async function submitAdvertiserReply(parentId: number) {
  const body = (advertiserReplyDraft[parentId] ?? '').trim()
  if (!body) {
    return
  }
  advertiserReplySending.value = parentId
  advertiserReplyMsg[parentId] = ''
  try {
    await request('/v1/me/profile/comment-replies', {
      method: 'POST',
      body: { parent_id: parentId, body },
    })
    advertiserReplyMsg[parentId] = 'Resposta publicada. Atualize a página para ver.'
    advertiserReplyDraft[parentId] = ''
  } catch {
    advertiserReplyMsg[parentId] = 'Não foi possível enviar. Tente novamente.'
  } finally {
    advertiserReplySending.value = null
  }
}

</script>
