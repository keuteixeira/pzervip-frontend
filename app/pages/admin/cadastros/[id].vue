<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink :to="withMock('/admin/cadastros')" class="text-sm text-zinc-500 hover:text-brand">← Cadastros</NuxtLink>
        <h1 class="mt-2 text-2xl font-bold text-white">{{ detail?.professional_name || 'Revisão de cadastro' }}</h1>
        <p class="text-sm text-zinc-500">
          ID {{ id }} · {{ adminApprovalStatusLabel(detail?.approval_status) }} ·
          {{ adminFormStatusLabel(detail?.form_status) }} · {{ detail?.public_slug || '—' }}
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

    <p v-if="loading" class="text-zinc-400">Carregando…</p>
    <p v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</p>

    <template v-else-if="detail">
      <section v-if="reg" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Dados do formulário de cadastro</h2>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div v-if="reg.mother_name">
            <dt class="text-zinc-500">Nome da mãe</dt>
            <dd class="text-zinc-200">{{ reg.mother_name }}</dd>
          </div>
          <div v-if="reg.birth_date">
            <dt class="text-zinc-500">Nascimento</dt>
            <dd class="text-zinc-200">{{ reg.birth_date }}</dd>
          </div>
          <div v-if="reg.contact_email">
            <dt class="text-zinc-500">E-mail de contato</dt>
            <dd class="text-zinc-200">{{ reg.contact_email }}</dd>
          </div>
          <div v-if="reg.cpf">
            <dt class="text-zinc-500">CPF</dt>
            <dd class="font-mono text-zinc-200">{{ reg.cpf }}</dd>
          </div>
          <div v-if="reg.current_step != null">
            <dt class="text-zinc-500">Último passo</dt>
            <dd class="text-zinc-200">{{ reg.current_step }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Possui local</dt>
            <dd class="text-zinc-200">{{ reg.has_venue ? 'Sim' : 'Não' }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Termos aceitos</dt>
            <dd class="text-zinc-200">{{ reg.terms_accepted ? 'Sim' : 'Não' }}</dd>
          </div>
          <div v-if="reg.registration_paid_at">
            <dt class="text-zinc-500">Taxa paga em</dt>
            <dd class="text-zinc-200">{{ reg.registration_paid_at }}</dd>
          </div>
        </dl>
        <div v-if="reg.address_json && typeof reg.address_json === 'object'" class="mt-4">
          <h3 class="text-sm font-medium text-zinc-300">Endereço</h3>
          <p class="mt-1 text-sm text-zinc-400">
            {{ formatAddress(reg.address_json) }}
          </p>
        </div>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Perfil público (pré-aprovação)</h2>
        <ul class="mt-3 space-y-1 text-sm text-zinc-400">
          <li v-if="detail.user?.name">Nome legal: {{ detail.user.name }}</li>
          <li v-if="detail.user?.email">E-mail da conta: {{ detail.user.email }}</li>
          <li v-if="detail.bio" class="whitespace-pre-wrap text-zinc-300">{{ detail.bio }}</li>
        </ul>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Arquivos enviados</h2>
        <p class="mt-1 text-sm text-zinc-500">Abrir para conferir ou remover do cadastro.</p>
        <ul v-if="mediaList.length" class="mt-4 space-y-3">
          <li
            v-for="m in mediaList"
            :key="m.id"
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
                :disabled="openingId === m.id"
                @click="openMedia(m)"
              >
                {{ openingId === m.id ? 'Abrindo…' : 'Ver arquivo' }}
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
        <p v-else class="mt-4 text-sm text-zinc-500">Nenhuma mídia listada.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSwal } from '~/composables/useSwal'
import { getMockCadastroMediaList, getMockCadastroReviewDetail } from '~/data/admin-mocks'
import {
  adminApprovalStatusLabel,
  adminFormStatusLabel,
  adminMediaModerationStatusLabel,
} from '~/utils/admin-labels'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

const route = useRoute()
const id = computed(() => Number(route.params.id))
const { request } = useApi()
const { isMock, withMock } = useAdminMock()
const { swalConfirm } = useSwal()

useHead(() => ({ title: `Cadastro #${route.params.id}` }))

type AddressJson = Record<string, string | undefined>

type Registration = {
  mother_name?: string | null
  birth_date?: string | null
  contact_email?: string | null
  cpf?: string | null
  address_json?: AddressJson | null
  has_venue?: boolean
  terms_accepted?: boolean
  current_step?: number | null
  registration_paid_at?: string | null
}

type ProfileDetail = {
  id: number
  professional_name: string | null
  public_slug: string | null
  approval_status: string
  form_status: string
  bio: string | null
  user?: { name?: string; email?: string }
  registration?: Registration | null
}

type MediaRow = {
  id: number
  collection_name: string
  kind?: string
  kind_label?: string
  file_name: string
  mime_type?: string
  moderation_status: string
  mock_preview_url?: string | null
}

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const detail = ref<ProfileDetail | null>(null)
const mediaList = ref<MediaRow[]>([])
const busyApproval = ref(false)
const openingId = ref<number | null>(null)
const removingId = ref<number | null>(null)

const reg = computed(() => detail.value?.registration ?? null)

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

async function load() {
  loading.value = true
  errorMsg.value = null
  if (isMock.value) {
    detail.value = getMockCadastroReviewDetail(id.value) as ProfileDetail
    mediaList.value = getMockCadastroMediaList() as MediaRow[]
    loading.value = false
    return
  }
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}`)
    detail.value = p
    const mediaRes = await request<{ media: MediaRow[] }>(`/v1/admin/profiles/${id.value}/media`)
    mediaList.value = mediaRes.media
  } catch {
    errorMsg.value = 'Não foi possível carregar o cadastro.'
    detail.value = null
    mediaList.value = []
  } finally {
    loading.value = false
  }
}

async function setApproval(approval_status: 'approved' | 'rejected') {
  if (!detail.value) {
    return
  }
  busyApproval.value = true
  try {
    if (isMock.value) {
      detail.value = { ...detail.value, approval_status }
      return
    }
    await request(`/v1/admin/profiles/${id.value}`, {
      method: 'PATCH',
      body: { approval_status },
    })
    await load()
  } finally {
    busyApproval.value = false
  }
}

async function openMedia(m: MediaRow) {
  const mockUrl = m.mock_preview_url
  if (isMock.value) {
    if (mockUrl) {
      window.open(mockUrl, '_blank', 'noopener,noreferrer')
    }
    return
  }
  openingId.value = m.id
  try {
    const res = await request<{ url: string }>(
      `/v1/admin/profiles/${id.value}/media/${m.id}/temporary-url`,
    )
    if (res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer')
    }
  } finally {
    openingId.value = null
  }
}

async function removeMedia(m: MediaRow) {
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
  if (isMock.value) {
    mediaList.value = mediaList.value.filter((x) => x.id !== m.id)
    return
  }
  removingId.value = m.id
  try {
    await request(`/v1/admin/profiles/${id.value}/media/${m.id}`, { method: 'DELETE' })
    await load()
  } finally {
    removingId.value = null
  }
}

onMounted(() => load())
watch(isMock, () => load())
watch(id, () => load())
</script>
