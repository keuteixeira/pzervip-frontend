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
      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Briefing — corrigir dados do pré-cadastro</h2>
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
            <span class="mb-1 block text-zinc-500">E-mail de contato (formulário)</span>
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
            <label class="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input v-model="edit.terms_accepted" type="checkbox" class="rounded border-zinc-600" />
              Termos aceitos
            </label>
          </div>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Estado (vitrine)</span>
            <select v-model="edit.state_id" class="admin-input" @change="onStateChange">
              <option value="">—</option>
              <option v-for="st in states" :key="st.id" :value="String(st.id)">{{ st.name }} ({{ st.uf }})</option>
            </select>
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Cidade (vitrine)</span>
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
              <span class="mb-1 block text-zinc-500">Complemento</span>
              <input v-model="editAddr.complement" type="text" class="admin-input" />
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
        <h2 class="text-lg font-semibold text-white">Conta</h2>
        <p class="mt-2 text-sm text-zinc-400">Nome legal e e-mail de login só com alteração no cadastro do usuário (fora deste formulário).</p>
        <ul class="mt-3 space-y-1 text-sm text-zinc-400">
          <li v-if="detail.user?.name"><span class="text-zinc-500">Nome legal:</span> {{ detail.user.name }}</li>
          <li v-if="detail.user?.email"><span class="text-zinc-500">E-mail da conta:</span> {{ detail.user.email }}</li>
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
import { useAdminMock } from '~/composables/useAdminMock'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

const route = useRoute()
const id = computed(() => Number(route.params.id))
const { request } = useApi()
const { isMock, withMock } = useAdminMock()
const { swalConfirm } = useSwal()

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
  whatsapp?: string | null
  neighborhood?: string | null
  state_id?: number | null
  city_id?: number | null
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

const states = ref<ApiState[]>([])
const cities = ref<ApiCity[]>([])

const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)

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
  state_id: '',
  city_id: '',
  neighborhood: '',
})

const editAddr = reactive({
  street: '',
  number: '',
  complement: '',
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

  const a = r?.address_json
  if (a && typeof a === 'object') {
    editAddr.street = a.street ?? ''
    editAddr.number = a.number ?? ''
    editAddr.complement = a.complement ?? ''
    editAddr.neighborhood = a.neighborhood ?? ''
    editAddr.city = a.city ?? ''
    editAddr.state_uf = a.state_uf ?? ''
    editAddr.zipcode = a.zipcode ?? ''
  } else {
    editAddr.street = ''
    editAddr.number = ''
    editAddr.complement = ''
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
  if (isMock.value) {
    detail.value = getMockCadastroReviewDetail(id.value) as ProfileDetail
    mediaList.value = getMockCadastroMediaList() as MediaRow[]
    syncFormFromDetail()
    loading.value = false
    return
  }
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
    mediaList.value = mediaRes.media
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
    complement: editAddr.complement.trim() || undefined,
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
  if (isMock.value) {
    saveMsg.value = 'Modo demonstração: alterações não são salvas na API.'
    saveOk.value = true
    return
  }
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
    const err = e as { data?: { message?: string; errors?: Record<string, string[]> } }
    const first =
      err.data?.errors && Object.keys(err.data.errors).length > 0
        ? Object.values(err.data.errors)[0]?.[0]
        : null
    saveMsg.value = first || err.data?.message || 'Não foi possível salvar.'
    saveOk.value = false
  } finally {
    saving.value = false
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

<style scoped>
.admin-input {
  @apply w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
