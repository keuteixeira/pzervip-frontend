<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <NuxtLink to="/admin/anunciantes" class="text-sm text-zinc-500 hover:text-brand">← Anunciantes</NuxtLink>
        <h1 class="mt-2 text-2xl font-bold text-white">{{ detail?.professional_name || 'Perfil' }}</h1>
        <p class="text-sm text-zinc-500">
          ID {{ id }} · {{ adminApprovalStatusLabel(detail?.approval_status) }} · {{ detail?.public_slug || '—' }}
        </p>
      </div>
    </div>

    <p v-if="loading" class="text-zinc-400">Carregando…</p>
    <p v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</p>

    <template v-else-if="detail">
      <section class="rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-6">
        <h2 class="text-lg font-semibold text-emerald-100">Visão geral</h2>
        <p class="mt-1 text-sm text-emerald-100/75">
          Identificadores, status do cadastro e plano. O que estiver vinculado ao perfil aparece nas secções abaixo.
        </p>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-zinc-500">ID do perfil</dt>
            <dd class="font-mono text-zinc-200">{{ detail.id }}</dd>
          </div>
          <div v-if="detail.uuid">
            <dt class="text-zinc-500">UUID</dt>
            <dd class="break-all font-mono text-xs text-zinc-300">{{ detail.uuid }}</dd>
          </div>
          <div v-if="detail.user?.id != null">
            <dt class="text-zinc-500">ID do usuário</dt>
            <dd class="font-mono text-zinc-200">{{ detail.user?.id }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Aprovação do cadastro</dt>
            <dd class="text-zinc-200">{{ adminApprovalStatusLabel(detail.approval_status) }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Estado do formulário</dt>
            <dd class="text-zinc-200">{{ adminFormStatusLabel(detail.form_status) }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Conta (usuário)</dt>
            <dd class="text-zinc-200">{{ adminAccountStatusLabel(detail.user?.account_status) }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Plano / destaque</dt>
            <dd class="text-zinc-200">
              {{ detail.plan_type || '—' }}
              <span v-if="detail.premium_tier != null" class="text-zinc-400"> · tier {{ detail.premium_tier }}</span>
            </dd>
          </div>
          <div>
            <dt class="text-zinc-500">Tipo de perfil / serviço</dt>
            <dd class="text-zinc-200">
              {{ adminProfileTypeLabel(detail.profile_type) }} · {{ adminServiceTypeLabel(detail.service_type) }}
            </dd>
          </div>
          <div v-if="detail.created_at">
            <dt class="text-zinc-500">Criado em</dt>
            <dd class="text-zinc-200">{{ formatDateTime(detail.created_at) }}</dd>
          </div>
          <div v-if="detail.updated_at">
            <dt class="text-zinc-500">Atualizado em</dt>
            <dd class="text-zinc-200">{{ formatDateTime(detail.updated_at) }}</dd>
          </div>
        </dl>
        <div class="mt-4 flex flex-wrap gap-3">
          <NuxtLink
            v-if="publicProfilePath"
            :to="publicProfilePath"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex rounded-lg border border-emerald-600/50 bg-emerald-900/30 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-900/50"
          >
            Abrir perfil público (nova aba)
          </NuxtLink>
          <NuxtLink
            :to="`/admin/cadastros/${id}`"
            class="inline-flex rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Revisão de cadastro (KYC completo)
          </NuxtLink>
        </div>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Localização e apresentação</h2>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-zinc-500">Cidade / UF</dt>
            <dd class="text-zinc-200">{{ detail.city?.name || '—' }} · {{ detail.state?.uf || '—' }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Bairro (anúncio)</dt>
            <dd class="text-zinc-200">{{ detail.neighborhood || '—' }}</dd>
          </div>
          <div v-if="detail.registration?.has_venue != null" class="sm:col-span-2">
            <dt class="text-zinc-500">Possui local para atendimento</dt>
            <dd class="text-zinc-200">{{ detail.registration.has_venue ? 'Sim' : 'Não' }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Visibilidade na plataforma</h2>
        <ul class="mt-3 space-y-2 text-sm text-zinc-300">
          <li>
            <span class="text-zinc-500">Anúncio pausado (vitrine):</span>
            {{ detail.user_paused_listing ? 'Sim — não aparece na listagem' : 'Não — ativo na vitrine' }}
          </li>
          <li>
            <span class="text-zinc-500">Com anúncio pausado, link público:</span>
            {{
              detail.public_profile_visible_when_paused
                ? 'Permanece acessível'
                : 'Oculto (404 / indisponível conforme regra)'
            }}
          </li>
          <li v-if="detail.listing_visibility_locked_until">
            <span class="text-zinc-500">Carência para voltar a inativar até:</span>
            {{ formatDateTime(detail.listing_visibility_locked_until) }}
          </li>
          <li v-if="detail.available_now_activated_at">
            <span class="text-zinc-500">Última ativação «Disponível agora»:</span>
            {{ formatDateTime(detail.available_now_activated_at) }}
          </li>
        </ul>
      </section>

      <section v-if="socialLinksEntries.length" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Redes e links</h2>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="[key, url] in socialLinksEntries" :key="key" class="flex flex-wrap gap-2">
            <span class="text-zinc-500 capitalize">{{ key }}</span>
            <a :href="url" target="_blank" rel="noopener noreferrer" class="text-brand hover:underline">{{ url }}</a>
          </li>
        </ul>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Dados (edição rápida)</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm">
            <span class="text-zinc-500">Nome profissional</span>
            <input v-model="form.professional_name" type="text" class="input mt-1" />
          </label>
          <label class="block text-sm">
            <span class="text-zinc-500">WhatsApp (só números)</span>
            <input v-model="form.whatsapp" type="text" class="input mt-1" />
          </label>
          <label class="sm:col-span-2 block text-sm">
            <span class="text-zinc-500">Bio</span>
            <textarea v-model="form.bio" rows="4" class="input mt-1 min-h-[100px]" />
          </label>
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <input v-model="form.user_paused_listing" type="checkbox" class="rounded border-zinc-600" />
            <span>Anúncio pausado (sumir da vitrine)</span>
          </label>
        </div>
        <p v-if="saveMsg" class="mt-3 text-sm" :class="saveOk ? 'text-emerald-400' : 'text-red-400'">{{ saveMsg }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          :disabled="saving"
          @click="saveDetails"
        >
          {{ saving ? 'Salvando…' : 'Salvar alterações' }}
        </button>
      </section>

      <section class="rounded-xl border border-amber-900/40 bg-amber-950/20 p-6">
        <h2 class="text-lg font-semibold text-amber-100">Destaque gratuito (cortesia)</h2>
        <p class="mt-1 text-sm text-amber-100/80">
          Credita tempo de destaque sem PIX. Perfil precisa estar <strong>aprovado</strong>. Atual:
          {{ detail.destaque_remaining_seconds }}s · estrelas cache: {{ detail.highlight_stars_cached ?? '—' }}
        </p>
        <div class="mt-4 flex flex-wrap items-end gap-3">
          <label class="text-sm">
            <span class="text-zinc-500">Estrelas</span>
            <input v-model.number="grant.stars" type="number" min="1" max="10" class="input mt-1 w-24" />
          </label>
          <label class="text-sm">
            <span class="text-zinc-500">Meses</span>
            <input v-model.number="grant.months" type="number" min="1" max="24" class="input mt-1 w-24" />
          </label>
          <button
            type="button"
            class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
            :disabled="granting"
            @click="grantDestaque"
          >
            {{ granting ? 'Aplicando…' : 'Conceder destaque' }}
          </button>
        </div>
        <p v-if="grantMsg" class="mt-2 text-sm" :class="grantOk ? 'text-emerald-400' : 'text-red-400'">{{ grantMsg }}</p>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Conta (usuário)</h2>
        <ul class="mt-2 space-y-1 text-sm text-zinc-400">
          <li v-if="detail.user?.email"><span class="text-zinc-500">E-mail:</span> {{ detail.user.email }}</li>
          <li v-if="detail.user?.name"><span class="text-zinc-500">Nome legal:</span> {{ detail.user.name }}</li>
        </ul>
      </section>

      <section v-if="detail.registration" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Cadastro (origem) e referências de mídia</h2>
        <p class="mt-1 text-sm text-zinc-500">Dados do formulário inicial e IDs das mídias ligadas no perfil.</p>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <template v-if="detail.registration.mother_name">
            <dt class="text-zinc-500">Nome da mãe</dt>
            <dd class="text-zinc-300">{{ detail.registration.mother_name }}</dd>
          </template>
          <template v-if="detail.registration.birth_date">
            <dt class="text-zinc-500">Nascimento</dt>
            <dd class="text-zinc-300">{{ detail.registration.birth_date }}</dd>
          </template>
          <template v-if="detail.registration.contact_email">
            <dt class="text-zinc-500">E-mail de contato</dt>
            <dd class="text-zinc-300">{{ detail.registration.contact_email }}</dd>
          </template>
          <template v-if="detail.registration.cpf">
            <dt class="text-zinc-500">CPF</dt>
            <dd class="font-mono text-zinc-300">{{ detail.registration.cpf }}</dd>
          </template>
          <template v-if="detail.registration.current_step != null">
            <dt class="text-zinc-500">Último passo do formulário</dt>
            <dd class="text-zinc-300">{{ detail.registration.current_step }}</dd>
          </template>
          <template v-if="detail.registration.registration_paid_at">
            <dt class="text-zinc-500">Taxa de cadastro paga em</dt>
            <dd class="text-zinc-300">{{ formatDateTime(detail.registration.registration_paid_at) }}</dd>
          </template>
          <template v-if="detail.registration.terms_accepted != null">
            <dt class="text-zinc-500">Termos aceitos</dt>
            <dd class="text-zinc-300">{{ detail.registration.terms_accepted ? 'Sim' : 'Não' }}</dd>
          </template>
          <template v-if="detail.registration.privacy_policy_accepted != null">
            <dt class="text-zinc-500">Política de privacidade aceita</dt>
            <dd class="text-zinc-300">{{ detail.registration.privacy_policy_accepted ? 'Sim' : 'Não' }}</dd>
          </template>
        </dl>
        <div v-if="detail.registration.address_json && typeof detail.registration.address_json === 'object'" class="mt-4">
          <h3 class="text-sm font-medium text-zinc-400">Endereço (cadastro)</h3>
          <p class="mt-1 text-sm text-zinc-300">{{ formatAddress(detail.registration.address_json) }}</p>
        </div>
        <div class="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <h3 class="text-sm font-medium text-zinc-400">IDs de mídia no registro (Spatie)</h3>
          <ul class="mt-2 grid gap-1 font-mono text-xs text-zinc-400 sm:grid-cols-2">
            <li v-if="detail.registration.id_document_front_media_id">Documento frente: {{ detail.registration.id_document_front_media_id }}</li>
            <li v-if="detail.registration.id_document_back_media_id">Documento verso: {{ detail.registration.id_document_back_media_id }}</li>
            <li v-if="detail.registration.selfie_media_id">Selfie: {{ detail.registration.selfie_media_id }}</li>
            <li v-if="detail.registration.video_media_id">Vídeo verificação: {{ detail.registration.video_media_id }}</li>
            <li v-if="detail.registration.cover_media_id">Capa: {{ detail.registration.cover_media_id }}</li>
            <li v-if="detail.registration.portal_avatar_media_id">Foto perfil: {{ detail.registration.portal_avatar_media_id }}</li>
            <li v-if="detail.registration.audio_media_id">Áudio: {{ detail.registration.audio_media_id }}</li>
            <li v-if="detail.registration.gallery_media_ids?.length" class="sm:col-span-2">
              Galeria (ordem): {{ detail.registration.gallery_media_ids.join(', ') }}
            </li>
          </ul>
        </div>
        <NuxtLink
          :to="`/admin/cadastros/${id}`"
          class="mt-4 inline-block text-sm text-brand hover:underline"
        >
          Abrir tela de revisão de cadastro (remover arquivos, aprovar) →
        </NuxtLink>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Mídias deste perfil</h2>
        <p class="mt-1 text-sm text-zinc-500">Verificação de identidade e mídias de vitrine, com moderação.</p>

        <div v-if="mediaKyc.length" class="mt-6">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-200/90">Verificação / KYC</h3>
          <ul class="mt-3 space-y-3">
            <li
              v-for="m in mediaKyc"
              :key="m.id"
              class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-sm font-medium text-brand">{{ m.kind_label || m.collection_name }}</p>
                <p class="text-sm text-white">{{ m.file_name }}</p>
                <p class="text-xs text-zinc-500">ID {{ m.id }} · {{ m.mime_type || '—' }} · moderação: {{ adminMediaModerationStatusLabel(m.moderation_status) }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                  :disabled="openingMediaId === m.id"
                  @click="openMedia(m)"
                >
                  {{ openingMediaId === m.id ? 'Abrindo…' : 'Ver' }}
                </button>
                <button
                  type="button"
                  class="rounded bg-emerald-700 px-2 py-1 text-xs text-white"
                  @click="setMediaModeration(m.id, 'approved')"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  class="rounded bg-zinc-700 px-2 py-1 text-xs text-white"
                  @click="setMediaModeration(m.id, 'rejected')"
                >
                  Recusar
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="mediaVitrine.length" class="mt-8">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-200/90">Perfil público (vitrine)</h3>
          <ul class="mt-3 space-y-3">
            <li
              v-for="m in mediaVitrine"
              :key="m.id"
              class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-sm font-medium text-brand">{{ m.kind_label || m.collection_name }}</p>
                <p class="text-sm text-white">{{ m.file_name }}</p>
                <p class="text-xs text-zinc-500">ID {{ m.id }} · {{ m.mime_type || '—' }} · moderação: {{ adminMediaModerationStatusLabel(m.moderation_status) }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                  :disabled="openingMediaId === m.id"
                  @click="openMedia(m)"
                >
                  {{ openingMediaId === m.id ? 'Abrindo…' : 'Ver' }}
                </button>
                <button
                  type="button"
                  class="rounded bg-emerald-700 px-2 py-1 text-xs text-white"
                  @click="setMediaModeration(m.id, 'approved')"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  class="rounded bg-zinc-700 px-2 py-1 text-xs text-white"
                  @click="setMediaModeration(m.id, 'rejected')"
                >
                  Recusar
                </button>
              </div>
            </li>
          </ul>
        </div>

        <p v-if="!mediaList.length" class="mt-4 text-sm text-zinc-500">Nenhuma mídia listada.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { buildPublicProfilePath } from '~/utils/public-profile-url'
import {
  adminAccountStatusLabel,
  adminApprovalStatusLabel,
  adminFormStatusLabel,
  adminMediaModerationStatusLabel,
  adminProfileTypeLabel,
  adminServiceTypeLabel,
} from '~/utils/admin-labels'
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

const route = useRoute()
const id = computed(() => Number(route.params.id))
const { request } = useApi()

useHead(() => ({ title: `Anunciante #${route.params.id}` }))

type AddressJson = Record<string, string | undefined>

type ProfileDetail = {
  id: number
  uuid?: string | null
  professional_name: string | null
  public_slug: string | null
  approval_status: string
  form_status?: string | null
  bio: string | null
  whatsapp: string | null
  profile_type?: string | null
  service_type?: string | null
  plan_type?: string | null
  premium_tier?: number | null
  highlight_stars_cached: number | null
  destaque_remaining_seconds: number
  user_paused_listing: boolean
  public_profile_visible_when_paused?: boolean
  listing_visibility_locked_until?: string | null
  available_now_activated_at?: string | null
  social_links?: Record<string, string | null> | null
  neighborhood?: string | null
  created_at?: string | null
  updated_at?: string | null
  user?: { id?: number; name: string; email?: string; account_status?: string }
  city?: { name: string } | null
  state?: { uf: string } | null
  registration?: {
    mother_name?: string | null
    birth_date?: string | null
    contact_email?: string | null
    cpf?: string | null
    address_json?: AddressJson | null
    has_venue?: boolean
    terms_accepted?: boolean
    privacy_policy_accepted?: boolean
    current_step?: number | null
    registration_paid_at?: string | null
    id_document_front_media_id?: number | null
    id_document_back_media_id?: number | null
    selfie_media_id?: number | null
    video_media_id?: number | null
    cover_media_id?: number | null
    portal_avatar_media_id?: number | null
    audio_media_id?: number | null
    gallery_media_ids?: number[] | null
  } | null
}

const KYC_COLLECTIONS = new Set(['id_document_front', 'id_document_back', 'selfie', 'video'])

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const detail = ref<ProfileDetail | null>(null)

const form = reactive({
  professional_name: '',
  bio: '',
  whatsapp: '',
  user_paused_listing: false,
})

const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)

const grant = reactive({ stars: 3, months: 1 })
const granting = ref(false)
const grantMsg = ref('')
const grantOk = ref(true)

const mediaList = ref<
  {
    id: number
    collection_name: string
    kind?: string
    kind_label?: string
    file_name: string
    mime_type?: string
    moderation_status: string
  }[]
>([])
const openingMediaId = ref<number | null>(null)

const publicProfilePath = computed(() => {
  const d = detail.value
  if (!d?.public_slug || d.approval_status !== 'approved') {
    return null
  }
  return buildPublicProfilePath(d.public_slug, d.service_type)
})

const mediaKyc = computed(() =>
  [...mediaList.value]
    .filter((m) => KYC_COLLECTIONS.has(m.collection_name))
    .sort((a, b) => a.id - b.id),
)

const mediaVitrine = computed(() =>
  [...mediaList.value]
    .filter((m) => !KYC_COLLECTIONS.has(m.collection_name))
    .sort((a, b) => a.id - b.id),
)

const socialLinksEntries = computed((): [string, string][] => {
  const sl = detail.value?.social_links
  if (!sl || typeof sl !== 'object') {
    return []
  }
  return Object.entries(sl).filter(([, v]) => {
    const s = v == null ? '' : String(v).trim()
    return s !== ''
  }) as [string, string][]
})

function formatDateTime(iso: string | null | undefined) {
  if (!iso) {
    return '—'
  }
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}

function formatAddress(a: AddressJson) {
  const parts = [
    a.street && a.number ? `${a.street}, ${a.number}` : a.street,
    a.complement,
    a.neighborhood,
    a.city && a.state_uf ? `${a.city} · ${a.state_uf}` : a.city || a.state_uf,
    a.zipcode ? `CEP ${a.zipcode}` : '',
  ].filter(Boolean)
  return parts.join(' · ') || '—'
}

function applyDetailToForm(p: ProfileDetail) {
  form.professional_name = p.professional_name || ''
  form.bio = p.bio || ''
  form.whatsapp = p.whatsapp || ''
  form.user_paused_listing = p.user_paused_listing
}

async function load() {
  loading.value = true
  errorMsg.value = null
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}`)
    detail.value = p
    applyDetailToForm(p)
    const mediaRes = await request<{ media: typeof mediaList.value }>(`/v1/admin/profiles/${id.value}/media`)
    mediaList.value = mediaRes.media
  } catch {
    errorMsg.value = 'Não foi possível carregar o perfil.'
    detail.value = null
  } finally {
    loading.value = false
  }
}

async function saveDetails() {
  saveMsg.value = ''
  saving.value = true
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}/details`, {
      method: 'PATCH',
      body: {
        professional_name: form.professional_name || null,
        bio: form.bio || null,
        whatsapp: form.whatsapp || null,
        user_paused_listing: form.user_paused_listing,
      },
    })
    detail.value = p
    saveMsg.value = 'Salvo.'
    saveOk.value = true
  } catch {
    saveMsg.value = 'Erro ao salvar.'
    saveOk.value = false
  } finally {
    saving.value = false
  }
}

async function grantDestaque() {
  grantMsg.value = ''
  granting.value = true
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}/grant-destaque`, {
      method: 'POST',
      body: { stars: grant.stars, period_months: grant.months },
    })
    detail.value = p
    grantMsg.value = 'Destaque creditado.'
    grantOk.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string; errors?: Record<string, string[]> } }
    grantMsg.value =
      err.data?.errors?.profile?.[0] || err.data?.message || 'Não foi possível conceder destaque.'
    grantOk.value = false
  } finally {
    granting.value = false
  }
}

async function openMedia(m: (typeof mediaList.value)[number]) {
  openingMediaId.value = m.id
  try {
    const res = await request<{ url: string }>(
      `/v1/admin/profiles/${id.value}/media/${m.id}/temporary-url`,
    )
    if (res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer')
    }
  } finally {
    openingMediaId.value = null
  }
}

async function setMediaModeration(mediaId: number, moderation_status: 'approved' | 'rejected') {
  await request(`/v1/admin/profiles/${id.value}/media/${mediaId}`, {
    method: 'PATCH',
    body: { moderation_status },
  })
  const mediaRes = await request<{ media: typeof mediaList.value }>(`/v1/admin/profiles/${id.value}/media`)
  mediaList.value = mediaRes.media
}

onMounted(() => load())

watch(id, () => load())
</script>

<style scoped>
.input {
  @apply w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
