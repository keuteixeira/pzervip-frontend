<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink to="/admin/cadastros" class="text-sm text-zinc-500 hover:text-brand">← Cadastros</NuxtLink>
        <h1 class="mt-2 text-2xl font-bold text-white">{{ detail?.professional_name || 'Revisão de cadastro' }}</h1>
        <p class="text-sm text-zinc-500">
          ID {{ id }} · Cadastro: {{ adminApprovalStatusLabel(detail?.approval_status) }} · Formulário:
          {{ adminFormStatusLabel(detail?.form_status) }} · Slug: {{ adminPublicSlugDisplay(detail?.public_slug) }}
        </p>
      </div>
      <div v-if="detail && detail.approval_status === 'pending'" class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          :disabled="busyApproval"
          @click="setApproval('approved')"
        >
          Aprovar cadastro
        </button>
        <button
          type="button"
          class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
          :disabled="busyApproval"
          @click="setApproval('rejected')"
        >
          Recusar
        </button>
      </div>
    </div>

    <p
      v-if="approvalMsg"
      class="text-sm"
      :class="approvalOk ? 'text-emerald-400' : 'text-red-400'"
      role="status"
    >
      {{ approvalMsg }}
    </p>

    <p v-if="loading" class="text-zinc-400">Carregando…</p>
    <p v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</p>

    <template v-else-if="detail">
      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Dados cadastrais</h2>
        <p class="mt-1 text-sm text-zinc-500">
          Ajuste o que for preciso e salve antes de aprovar ou recusar. Alterações vão direto ao perfil do anunciante.
        </p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Nome profissional (anúncio)</span>
            <input v-model="edit.professional_name" type="text" class="admin-input" maxlength="191" />
          </label>
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Bio</span>
            <textarea v-model="edit.bio" rows="4" class="admin-input min-h-[100px]" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">WhatsApp (apenas números)</span>
            <input v-model="edit.whatsapp" type="text" class="admin-input" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">E-mail de contato</span>
            <input v-model="edit.contact_email" type="email" class="admin-input" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Nome da mãe</span>
            <input v-model="edit.mother_name" type="text" class="admin-input" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Data de nascimento</span>
            <input v-model="edit.birth_date" type="date" class="admin-input" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">CPF</span>
            <input v-model="edit.cpf" type="text" class="admin-input font-mono" />
          </label>
          <div class="flex flex-col gap-3 sm:col-span-2">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input v-model="edit.has_venue" type="checkbox" class="rounded border-zinc-600" />
              Possui local próprio para atendimento
            </label>
          </div>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Estado do anúncio</span>
            <select v-model="edit.state_id" class="admin-input" @change="onStateChange">
              <option value="">—</option>
              <option v-for="st in states" :key="st.id" :value="String(st.id)">{{ st.name }} ({{ st.uf }})</option>
            </select>
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Cidade do anúncio</span>
            <select v-model="edit.city_id" class="admin-input" :disabled="!edit.state_id">
              <option value="">—</option>
              <option v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
            </select>
          </label>
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Bairro (anúncio, quando tem local)</span>
            <input v-model="edit.neighborhood" type="text" class="admin-input" />
          </label>
        </div>

        <div class="mt-6 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-4">
          <h3 class="text-sm font-medium text-zinc-300">Endereço (cadastro / documento)</h3>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <label class="block text-sm text-zinc-300 sm:col-span-2">
              <span class="mb-1 block text-zinc-500">Logradouro</span>
              <input v-model="editAddr.street" type="text" class="admin-input" />
            </label>
            <label class="block text-sm text-zinc-300">
              <span class="mb-1 block text-zinc-500">Número</span>
              <input v-model="editAddr.number" type="text" class="admin-input" />
            </label>
            <label class="block text-sm text-zinc-300">
              <span class="mb-1 block text-zinc-500">CEP</span>
              <input v-model="editAddr.zipcode" type="text" class="admin-input" />
            </label>
            <label class="block text-sm text-zinc-300">
              <span class="mb-1 block text-zinc-500">Bairro (endereço)</span>
              <input v-model="editAddr.neighborhood" type="text" class="admin-input" />
            </label>
            <label class="block text-sm text-zinc-300">
              <span class="mb-1 block text-zinc-500">Cidade (texto)</span>
              <input v-model="editAddr.city" type="text" class="admin-input" />
            </label>
            <label class="block text-sm text-zinc-300">
              <span class="mb-1 block text-zinc-500">UF</span>
              <input v-model="editAddr.state_uf" type="text" class="admin-input uppercase" maxlength="2" />
            </label>
          </div>
        </div>

        <div v-if="detail.registration?.current_step != null || detail.registration?.registration_paid_at" class="mt-4 text-xs text-zinc-500">
          <span v-if="detail.registration?.current_step != null">Último passo no formulário: {{ detail.registration.current_step }}</span>
          <span v-if="detail.registration?.registration_paid_at" class="ml-2">
            · Taxa paga em {{ detail.registration.registration_paid_at }}
          </span>
        </div>

        <p v-if="saveMsg" class="mt-4 text-sm" :class="saveOk ? 'text-emerald-400' : 'text-red-400'">{{ saveMsg }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          :disabled="saving"
          @click="saveDetails"
        >
          {{ saving ? 'Salvando…' : 'Salvar alterações' }}
        </button>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Arquivos</h2>
        <p class="mt-1 text-sm text-zinc-500">
          <strong class="font-medium text-zinc-400">Documentos pessoais</strong> — apenas visualização.
          <strong class="ml-1 font-medium text-zinc-400">Mídias</strong> — capa, perfil, galeria, áudio e vídeos da galeria podem ser removidos se necessário.
        </p>
        <p class="mt-2 text-xs text-zinc-500">
          Imagens, vídeos e áudio abrem no visualizador (setas ou botões Anterior/Próximo). Outros tipos abrem numa nova aba.
        </p>
        <div v-if="lightboxableMedia.length > 1" class="mt-2">
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-40"
            :disabled="mediaPreviewBusy"
            @click="openReviewLightbox(0)"
          >
            {{ mediaPreviewBusy ? 'A carregar…' : 'Ver todas em sequência' }}
          </button>
        </div>

        <div class="mt-4 flex flex-wrap gap-2 border-b border-zinc-800 pb-3" role="tablist" aria-label="Tipo de arquivo">
          <button
            type="button"
            role="tab"
            class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
            :class="
              filesTab === 'documentos'
                ? 'border-brand bg-brand/20 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
            "
            :aria-selected="filesTab === 'documentos'"
            @click="filesTab = 'documentos'"
          >
            Documentos pessoais
          </button>
          <button
            type="button"
            role="tab"
            class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
            :class="
              filesTab === 'midias'
                ? 'border-brand bg-brand/20 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
            "
            :aria-selected="filesTab === 'midias'"
            @click="filesTab = 'midias'"
          >
            Mídias
          </button>
        </div>

        <!-- Documentos pessoais -->
        <div v-show="filesTab === 'documentos'" class="mt-4 space-y-3">
          <ul class="space-y-3">
            <li
              v-for="(row, idx) in documentSlotRows"
              :key="'doc-slot-' + idx"
              class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-zinc-200">{{ row.label }}</p>
                <template v-if="row.state === 'empty'">
                  <p class="mt-1 text-sm text-zinc-500">Nenhum arquivo enviado.</p>
                </template>
                <template v-else-if="row.state === 'missing'">
                  <p class="mt-1 text-sm text-amber-400">
                    O cadastro referencia a mídia #{{ row.expectedId }}, mas nenhum arquivo foi encontrado. Pode ser necessário pedir reenvio.
                  </p>
                </template>
                <template v-else-if="row.media">
                  <p class="mt-1 truncate text-sm text-white">{{ row.media.file_name }}</p>
                  <p class="text-xs text-zinc-500">
                    {{ row.media.mime_type || '—' }} · moderação:
                    {{ adminMediaModerationStatusLabel(row.media.moderation_status) }}
                  </p>
                </template>
              </div>
              <div v-if="row.media" class="flex flex-shrink-0">
                <button
                  type="button"
                  class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                  :disabled="mediaPreviewBusy"
                  @click="openMedia(row.media)"
                >
                  {{ mediaPreviewBusy ? 'A carregar…' : 'Visualizar' }}
                </button>
              </div>
            </li>
          </ul>
          <ul v-if="orphanDocumentMedia.length" class="space-y-3 border-t border-zinc-800 pt-4">
            <li class="text-xs font-medium uppercase tracking-wide text-zinc-500">Outros na biblioteca (documento / verificação)</li>
            <li
              v-for="m in orphanDocumentMedia"
              :key="'doc-orphan-' + m.id"
              class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-zinc-300">{{ m.kind_label || m.collection_name }}</p>
                <p class="truncate text-sm text-white">{{ m.file_name }}</p>
                <p class="text-xs text-zinc-500">
                  {{ m.mime_type || '—' }} · moderação: {{ adminMediaModerationStatusLabel(m.moderation_status) }}
                </p>
              </div>
              <button
                type="button"
                class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                :disabled="mediaPreviewBusy"
                @click="openMedia(m)"
              >
                {{ mediaPreviewBusy ? 'A carregar…' : 'Visualizar' }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Mídias -->
        <div v-show="filesTab === 'midias'" class="mt-4 space-y-6">
          <ul class="space-y-3">
            <li
              v-for="(row, idx) in midiaSingleSlotRows"
              :key="'mid-slot-' + idx"
              class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-zinc-200">{{ row.label }}</p>
                <template v-if="row.state === 'empty'">
                  <p class="mt-1 text-sm text-zinc-500">Nenhum arquivo enviado.</p>
                </template>
                <template v-else-if="row.state === 'missing'">
                  <p class="mt-1 text-sm text-amber-400">
                    O cadastro referencia a mídia #{{ row.expectedId }}, mas nenhum arquivo foi encontrado.
                  </p>
                </template>
                <template v-else-if="row.media">
                  <p class="mt-1 truncate text-sm text-white">{{ row.media.file_name }}</p>
                  <p class="text-xs text-zinc-500">
                    {{ row.media.mime_type || '—' }} · moderação:
                    {{ adminMediaModerationStatusLabel(row.media.moderation_status) }}
                  </p>
                </template>
              </div>
              <div v-if="row.media" class="flex flex-shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                  :disabled="mediaPreviewBusy"
                  @click="openMedia(row.media)"
                >
                  {{ mediaPreviewBusy ? 'A carregar…' : 'Visualizar' }}
                </button>
                <button
                  type="button"
                  class="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-900/70 disabled:opacity-40"
                  :disabled="removingId === row.media.id"
                  @click="removeMedia(row.media)"
                >
                  {{ removingId === row.media.id ? 'Removendo…' : 'Remover' }}
                </button>
              </div>
            </li>
          </ul>

          <div>
            <h3 class="text-sm font-medium text-zinc-300">Galeria (fotos e vídeos)</h3>
            <ul v-if="gallerySlotRows.length" class="mt-3 space-y-3">
              <li
                v-for="(row, idx) in gallerySlotRows"
                :key="'gal-' + idx + '-' + (row.media?.id ?? row.expectedId ?? 'e')"
                class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-zinc-200">{{ row.label }}</p>
                  <template v-if="row.state === 'empty'">
                    <p class="mt-1 text-sm text-zinc-500">Nenhuma foto ou vídeo na galeria.</p>
                  </template>
                  <template v-else-if="row.state === 'missing'">
                    <p class="mt-1 text-sm text-amber-400">
                      Referência #{{ row.expectedId }} sem arquivo correspondente na biblioteca.
                    </p>
                  </template>
                  <template v-else-if="row.media">
                    <p class="mt-1 truncate text-sm text-white">{{ row.media.file_name }}</p>
                    <p class="text-xs text-zinc-500">
                      {{ row.media.mime_type || '—' }} · moderação:
                      {{ adminMediaModerationStatusLabel(row.media.moderation_status) }}
                    </p>
                  </template>
                </div>
                <div v-if="row.media" class="flex flex-shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                    :disabled="mediaPreviewBusy"
                    @click="openMedia(row.media)"
                  >
                    {{ mediaPreviewBusy ? 'A carregar…' : 'Visualizar' }}
                  </button>
                  <button
                    type="button"
                    class="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-900/70 disabled:opacity-40"
                    :disabled="removingId === row.media.id"
                    @click="removeMedia(row.media)"
                  >
                    {{ removingId === row.media.id ? 'Removendo…' : 'Remover' }}
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <ul v-if="orphanMidiaMedia.length" class="space-y-3 border-t border-zinc-800 pt-4">
            <li class="text-xs font-medium uppercase tracking-wide text-zinc-500">Outros na biblioteca (mídia)</li>
            <li
              v-for="m in orphanMidiaMedia"
              :key="'mid-orphan-' + m.id"
              class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-brand">{{ m.kind_label || m.collection_name }}</p>
                <p class="truncate text-sm text-white">{{ m.file_name }}</p>
                <p class="text-xs text-zinc-500">
                  {{ m.mime_type || '—' }} · moderação: {{ adminMediaModerationStatusLabel(m.moderation_status) }}
                </p>
              </div>
              <div class="flex flex-shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                  :disabled="mediaPreviewBusy"
                  @click="openMedia(m)"
                >
                  {{ mediaPreviewBusy ? 'A carregar…' : 'Visualizar' }}
                </button>
                <button
                  type="button"
                  class="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-900/70 disabled:opacity-40"
                  :disabled="removingId === m.id"
                  @click="removeMedia(m)"
                >
                  {{ removingId === m.id ? 'Removendo…' : 'Remover' }}
                </button>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </template>

    <ProfileMediaLightbox
      v-model="reviewLightboxOpen"
      :items="reviewLightboxItems"
      :start-index="reviewLightboxStart"
      alt-text="Ficheiro do cadastro"
    />
  </div>
</template>

<script setup lang="ts">
import { useSwal } from '~/composables/useSwal'
import {
  adminApprovalStatusLabel,
  adminFormStatusLabel,
  adminMediaModerationStatusLabel,
  adminPublicSlugDisplay,
} from '~/utils/admin-labels'
import { apiErrorMessage } from '~/utils/api-error-message'

const DOCUMENT_SLOTS = [
  { regKey: 'id_document_front_media_id' as const, label: 'Documento — frente' },
  { regKey: 'id_document_back_media_id' as const, label: 'Documento — verso' },
  { regKey: 'selfie_media_id' as const, label: 'Selfie de verificação' },
  { regKey: 'video_media_id' as const, label: 'Vídeo de verificação' },
]

const MIDIA_SINGLE_SLOTS = [
  { regKey: 'cover_media_id' as const, label: 'Banner (capa)' },
  { regKey: 'portal_avatar_media_id' as const, label: 'Foto de perfil' },
  { regKey: 'audio_media_id' as const, label: 'Áudio' },
]

const DOC_COLLECTION_SET = new Set(['id_document_front', 'id_document_back', 'selfie', 'video'])
const MIDIA_COLLECTION_SET = new Set(['gallery', 'cover', 'portal_avatar', 'audio'])

type SlotState = 'empty' | 'ok' | 'missing'

function normMediaId(raw: unknown): number | null {
  if (raw == null) {
    return null
  }
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

const route = useRoute()
const id = computed(() => Number(route.params.id))
const { request } = useApi()
const { swalConfirm, swalAlert } = useSwal()

const filesTab = ref<'documentos' | 'midias'>('documentos')

useHead(() => ({ title: `Cadastro #${route.params.id}` }))

type ApiState = { id: number; name: string; uf: string }
type ApiCity = { id: number; name: string }

type AddressJson = Record<string, string | undefined>

type Registration = {
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
}

type ProfileDetail = {
  id: number
  professional_name: string | null
  public_slug: string | null
  approval_status: string
  form_status: string
  bio: string | null
  whatsapp?: string | null
  neighborhood?: string | null
  state_id?: number | null
  city_id?: number | null
  user?: { name?: string; email?: string }
  registration?: Registration | null
}

type MediaRow = {
  id: number | string
  collection_name: string
  kind?: string
  kind_label?: string
  file_name: string
  mime_type?: string
  moderation_status: string
}

type ReviewLightboxItem = { kind: 'audio' | 'video' | 'image'; url: string; caption?: string }

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const detail = ref<ProfileDetail | null>(null)
const mediaList = ref<MediaRow[]>([])
const busyApproval = ref(false)
const mediaPreviewBusy = ref(false)
const removingId = ref<number | null>(null)

const reviewLightboxOpen = ref(false)
const reviewLightboxItems = ref<ReviewLightboxItem[]>([])
const reviewLightboxStart = ref(0)

function mediaId(m: Pick<MediaRow, 'id'>): number | null {
  return normMediaId(m.id)
}

function isLightboxableMedia(m: MediaRow): boolean {
  const k = (m.kind || '').toLowerCase()
  if (
    k === 'audio' ||
    k === 'verification_video' ||
    k === 'gallery_video' ||
    k === 'gallery_image' ||
    k === 'id_front' ||
    k === 'id_back' ||
    k === 'selfie' ||
    k === 'banner' ||
    k === 'profile_photo'
  ) {
    return true
  }
  const mime = (m.mime_type || '').toLowerCase()
  return mime.startsWith('image/') || mime.startsWith('video/') || mime.startsWith('audio/')
}

function lightboxKindFromRow(m: MediaRow): 'image' | 'video' | 'audio' {
  const k = (m.kind || '').toLowerCase()
  if (k === 'audio') {
    return 'audio'
  }
  if (k === 'verification_video' || k === 'gallery_video') {
    return 'video'
  }
  const mime = (m.mime_type || '').toLowerCase()
  if (mime.startsWith('video/')) {
    return 'video'
  }
  if (mime.startsWith('audio/')) {
    return 'audio'
  }
  return 'image'
}

const lightboxableMedia = computed(() => mediaList.value.filter(isLightboxableMedia))

const documentSlotRows = computed(() => {
  const reg = detail.value?.registration
  const list = mediaList.value
  return DOCUMENT_SLOTS.map(({ regKey, label }) => {
    const expectedId = normMediaId(reg?.[regKey])
    const media = expectedId != null ? (list.find((m) => mediaId(m) === expectedId) ?? null) : null
    let state: SlotState
    if (expectedId == null) {
      state = 'empty'
    } else if (media) {
      state = 'ok'
    } else {
      state = 'missing'
    }
    return { label, expectedId, media, state }
  })
})

const docSlotMatchedIds = computed(() => {
  const s = new Set<number>()
  for (const r of documentSlotRows.value) {
    if (r.media) {
      const id = mediaId(r.media)
      if (id != null) {
        s.add(id)
      }
    }
  }
  return s
})

const orphanDocumentMedia = computed(() =>
  mediaList.value.filter((m) => {
    const id = mediaId(m)
    return DOC_COLLECTION_SET.has(m.collection_name) && (id == null || !docSlotMatchedIds.value.has(id))
  }),
)

const midiaSingleSlotRows = computed(() => {
  const reg = detail.value?.registration
  const list = mediaList.value
  return MIDIA_SINGLE_SLOTS.map(({ regKey, label }) => {
    const expectedId = normMediaId(reg?.[regKey])
    const media = expectedId != null ? (list.find((m) => mediaId(m) === expectedId) ?? null) : null
    let state: SlotState
    if (expectedId == null) {
      state = 'empty'
    } else if (media) {
      state = 'ok'
    } else {
      state = 'missing'
    }
    return { label, expectedId, media, state }
  })
})

const midiaSingleMatchedIds = computed(() => {
  const s = new Set<number>()
  for (const r of midiaSingleSlotRows.value) {
    if (r.media) {
      const id = mediaId(r.media)
      if (id != null) {
        s.add(id)
      }
    }
  }
  return s
})

const gallerySlotRows = computed(() => {
  const reg = detail.value?.registration
  const list = mediaList.value.filter((m) => m.collection_name === 'gallery')
  const byId = new Map<number, MediaRow>()
  for (const m of list) {
    const id = mediaId(m)
    if (id != null) {
      byId.set(id, m)
    }
  }
  const rawIds = reg?.gallery_media_ids
  const ids = Array.isArray(rawIds)
    ? rawIds.map((x) => normMediaId(x)).filter((x): x is number => x != null)
    : []

  const rows: { label: string; media: MediaRow | null; expectedId: number | null; state: SlotState }[] = []

  if (ids.length === 0 && list.length === 0) {
    rows.push({ label: 'Galeria', media: null, expectedId: null, state: 'empty' })
    return rows
  }

  ids.forEach((gid, i) => {
    const media = byId.get(gid) ?? null
    rows.push({
      label: `Galeria — item ${i + 1}`,
      media,
      expectedId: gid,
      state: media ? 'ok' : 'missing',
    })
  })

  for (const m of list) {
    const id = mediaId(m)
    if (id != null && !ids.includes(id)) {
      rows.push({
        label: 'Galeria — arquivo na biblioteca (sem ordem no cadastro)',
        media: m,
        expectedId: id,
        state: 'ok',
      })
    }
  }
  return rows
})

const galleryMatchedIds = computed(() => {
  const s = new Set<number>()
  for (const r of gallerySlotRows.value) {
    if (r.media) {
      const id = mediaId(r.media)
      if (id != null) {
        s.add(id)
      }
    }
  }
  return s
})

const orphanMidiaMedia = computed(() =>
  mediaList.value.filter((m) => {
    if (!MIDIA_COLLECTION_SET.has(m.collection_name)) {
      return false
    }
    if (m.collection_name === 'gallery') {
      const id = mediaId(m)
      return id == null || !galleryMatchedIds.value.has(id)
    }
    const id = mediaId(m)
    return id == null || !midiaSingleMatchedIds.value.has(id)
  }),
)

const states = ref<ApiState[]>([])
const cities = ref<ApiCity[]>([])

const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)

const approvalMsg = ref('')
const approvalOk = ref(true)

const edit = reactive({
  professional_name: '',
  bio: '',
  whatsapp: '',
  contact_email: '',
  mother_name: '',
  birth_date: '',
  cpf: '',
  has_venue: true,
  terms_accepted: false,
  privacy_policy_accepted: false,
  state_id: '',
  city_id: '',
  neighborhood: '',
})

const editAddr = reactive({
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state_uf: '',
  zipcode: '',
})

function ymdFromApi(raw: string | null | undefined): string {
  if (!raw) {
    return ''
  }
  const m = String(raw).trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    return `${m[1]}-${m[2]}-${m[3]}`
  }
  try {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10)
    }
  } catch {
    /* */
  }
  return ''
}

function syncFormFromDetail() {
  const d = detail.value
  if (!d) {
    return
  }
  edit.professional_name = d.professional_name ?? ''
  edit.bio = d.bio ?? ''
  edit.whatsapp = d.whatsapp ?? ''
  edit.neighborhood = d.neighborhood ?? ''
  edit.state_id = d.state_id ? String(d.state_id) : ''
  edit.city_id = d.city_id ? String(d.city_id) : ''

  const r = d.registration
  edit.contact_email = r?.contact_email ?? ''
  edit.mother_name = r?.mother_name ?? ''
  edit.birth_date = ymdFromApi(r?.birth_date ?? undefined)
  edit.cpf = r?.cpf ?? ''
  edit.has_venue = r?.has_venue !== false
  edit.terms_accepted = !!r?.terms_accepted
  edit.privacy_policy_accepted = !!r?.privacy_policy_accepted

  const a = r?.address_json
  if (a && typeof a === 'object') {
    editAddr.street = a.street ?? ''
    editAddr.number = a.number ?? ''
    editAddr.neighborhood = a.neighborhood ?? ''
    editAddr.city = a.city ?? ''
    editAddr.state_uf = a.state_uf ?? ''
    editAddr.zipcode = a.zipcode ?? ''
  } else {
    editAddr.street = ''
    editAddr.number = ''
    editAddr.neighborhood = ''
    editAddr.city = ''
    editAddr.state_uf = ''
    editAddr.zipcode = ''
  }
}

async function onStateChange() {
  edit.city_id = ''
  cities.value = []
  if (!edit.state_id) {
    return
  }
  cities.value = await request<ApiCity[]>(`/v1/states/${edit.state_id}/cities`)
}

async function load() {
  loading.value = true
  errorMsg.value = null
  try {
    if (states.value.length === 0) {
      states.value = await request<ApiState[]>('/v1/states')
    }
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}`)
    detail.value = p
    syncFormFromDetail()
    if (edit.state_id) {
      cities.value = await request<ApiCity[]>(`/v1/states/${edit.state_id}/cities`)
    }
    const mediaRes = await request<{ media: MediaRow[] }>(`/v1/admin/profiles/${id.value}/media`)
    mediaList.value = (mediaRes.media ?? []).map((m) => ({
      ...m,
      id: normMediaId(m.id) ?? m.id,
    }))
  } catch {
    errorMsg.value = 'Não foi possível carregar o cadastro.'
    detail.value = null
    mediaList.value = []
  } finally {
    loading.value = false
  }
}

function buildAddressPayload(): AddressJson | null {
  const o = {
    zipcode: editAddr.zipcode.trim() || undefined,
    street: editAddr.street.trim() || undefined,
    number: editAddr.number.trim() || undefined,
    neighborhood: editAddr.neighborhood.trim() || undefined,
    city: editAddr.city.trim() || undefined,
    state_uf: editAddr.state_uf.trim().toUpperCase() || undefined,
    country: 'BR',
  }
  const hasAny = Object.entries(o).some(([k, v]) => k !== 'country' && v != null && String(v) !== '')
  if (!hasAny) {
    return null
  }
  return o as AddressJson
}

async function saveDetails() {
  saveMsg.value = ''
  saving.value = true
  try {
    const address_json = buildAddressPayload()
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}/details`, {
      method: 'PATCH',
      body: {
        professional_name: edit.professional_name.trim() || null,
        bio: edit.bio.trim() || null,
        whatsapp: edit.whatsapp.trim() || null,
        contact_email: edit.contact_email.trim() || null,
        mother_name: edit.mother_name.trim() || null,
        birth_date: edit.birth_date.trim() || null,
        cpf: edit.cpf.trim() || null,
        has_venue: edit.has_venue,
        terms_accepted: edit.terms_accepted,
        privacy_policy_accepted: edit.privacy_policy_accepted,
        neighborhood: edit.neighborhood.trim() || null,
        state_id: edit.state_id ? Number(edit.state_id) : null,
        city_id: edit.city_id ? Number(edit.city_id) : null,
        address_json,
      },
    })
    detail.value = p
    syncFormFromDetail()
    saveMsg.value = 'Dados salvos.'
    saveOk.value = true
  } catch (e: unknown) {
    saveMsg.value = apiErrorMessage(e, 'Não foi possível salvar.')
    saveOk.value = false
  } finally {
    saving.value = false
  }
}

async function setApproval(approval_status: 'approved' | 'rejected') {
  if (!detail.value) {
    return
  }
  approvalMsg.value = ''
  busyApproval.value = true
  try {
    await request(`/v1/admin/profiles/${id.value}`, {
      method: 'PATCH',
      body: { approval_status },
    })
    try {
      await load()
    } catch {
      approvalMsg.value =
        approval_status === 'approved'
          ? 'Cadastro aprovado. Não foi possível recarregar a ficha — atualize a página.'
          : 'Cadastro recusado. Não foi possível recarregar a ficha — atualize a página.'
      approvalOk.value = true
      return
    }
    approvalMsg.value =
      approval_status === 'approved' ? 'Cadastro aprovado com sucesso.' : 'Cadastro recusado.'
    approvalOk.value = true
  } catch (e: unknown) {
    approvalMsg.value = apiErrorMessage(e, 'Não foi possível atualizar o status do cadastro.')
    approvalOk.value = false
  } finally {
    busyApproval.value = false
  }
}

async function fetchAdminTemporaryUrl(mediaNumericId: number): Promise<string> {
  const res = await request<{ url: string }>(
    `/v1/admin/profiles/${id.value}/media/${mediaNumericId}/temporary-url`,
  )
  return res.url
}

/** Mesmo fluxo que a área do anunciante: `ProfileMediaLightbox` com Anterior/Próximo e setas. */
async function openReviewLightbox(startIdx: number) {
  const list = lightboxableMedia.value
  if (list.length === 0 || mediaPreviewBusy.value) {
    return
  }
  const idx = Math.max(0, Math.min(startIdx, list.length - 1))
  mediaPreviewBusy.value = true
  try {
    const urls = await Promise.all(list.map((m) => fetchAdminTemporaryUrl(mediaId(m)!)))
    reviewLightboxItems.value = list.map((m, i) => ({
      kind: lightboxKindFromRow(m),
      url: urls[i]!,
      caption: `${m.kind_label || m.collection_name} · ${m.file_name}`,
    }))
    reviewLightboxStart.value = idx
    reviewLightboxOpen.value = true
  } catch {
    await swalAlert({
      icon: 'error',
      title: 'Pré-visualização',
      text: 'Não foi possível obter os endereços dos ficheiros. Tente de novo.',
    })
  } finally {
    mediaPreviewBusy.value = false
  }
}

async function openMedia(m: MediaRow) {
  const mid = mediaId(m)
  if (mid == null) {
    return
  }

  if (!isLightboxableMedia(m)) {
    mediaPreviewBusy.value = true
    try {
      const url = await fetchAdminTemporaryUrl(mid)
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      await swalAlert({
        icon: 'error',
        title: 'Abrir ficheiro',
        text: 'Não foi possível obter o link temporário.',
      })
    } finally {
      mediaPreviewBusy.value = false
    }
    return
  }

  const idx = lightboxableMedia.value.findIndex((x) => mediaId(x) === mid)
  if (idx < 0) {
    return
  }
  await openReviewLightbox(idx)
}

async function removeMedia(m: MediaRow) {
  const mid = mediaId(m)
  if (mid == null) {
    return
  }
  const ok = await swalConfirm({
    title: 'Remover arquivo do cadastro?',
    text: `Deseja remover «${m.file_name}» deste cadastro?`,
    icon: 'warning',
    confirmButtonText: 'Sim, remover',
    cancelButtonText: 'Cancelar',
  })
  if (!ok) {
    return
  }
  removingId.value = mid
  try {
    await request(`/v1/admin/profiles/${id.value}/media/${mid}`, { method: 'DELETE' })
    await load()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    await swalAlert({
      icon: 'error',
      title: 'Não foi possível remover',
      text: err.data?.message ?? 'Tente novamente.',
    })
  } finally {
    removingId.value = null
  }
}

onMounted(() => load())
watch(id, () => load())
</script>

<style scoped>
.admin-input {
  @apply w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
