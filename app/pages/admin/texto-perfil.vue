<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Nome e biografia</h1>
      <p class="mt-1 text-sm text-zinc-500">
        Alterações enviadas pelos anunciantes para o nome profissional (e link) e para a biografia. Aprovar aplica tudo
        o que estiver pendente naquele perfil; ao recusar pode escrever um motivo — se preencher, o anunciante recebe
        por e-mail com a referência (nome, bio ou ambos).
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm"
        :class="
          typeFilter === f.value ? 'border-brand bg-brand/20 text-white' : 'border-zinc-700 text-zinc-400'
        "
        @click="selectFilter(f.value)"
      >
        {{ f.label }}
      </button>
    </div>

    <p
      v-if="actionMsg"
      class="text-sm"
      :class="actionOk ? 'text-emerald-400' : 'text-red-400'"
      role="status"
    >
      {{ actionMsg }}
    </p>

    <p v-if="loading" class="text-zinc-400">Carregando…</p>

    <ul v-else class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li v-for="row in items" :key="row.id" class="space-y-3 px-4 py-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p class="text-sm font-medium text-white">
              {{ row.professional_name || '—' }}
              <span class="font-normal text-zinc-500">· {{ row.public_slug || '—' }}</span>
            </p>
            <p class="mt-1 text-xs text-zinc-500">
              <NuxtLink :to="`/admin/anunciantes/${row.id}`" class="text-brand hover:underline">Perfil do anunciante</NuxtLink>
              <span v-if="row.user?.email"> · {{ row.user.email }}</span>
            </p>
          </div>
          <span v-if="row.portal_text_pending_submitted_at" class="text-xs text-zinc-500">
            Enviado em {{ formatDateTime(row.portal_text_pending_submitted_at) }}
          </span>
        </div>

        <p class="text-xs text-zinc-500">
          <span v-if="row.has_name_pending" class="mr-2 rounded bg-sky-950/60 px-2 py-0.5 text-sky-200/90">Nome</span>
          <span v-if="row.has_bio_pending" class="rounded bg-violet-950/60 px-2 py-0.5 text-violet-200/90">Bio</span>
        </p>

        <div v-if="row.has_name_pending" class="space-y-1 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-sm">
          <p class="font-medium text-zinc-300">Nome profissional</p>
          <p><span class="text-zinc-500">No ar:</span> {{ row.professional_name || '—' }}</p>
          <p><span class="text-zinc-500">Proposta:</span> {{ row.professional_name_pending }}</p>
          <p v-if="row.portal_text_pending?.public_slug_preview" class="font-mono text-xs text-brand">
            Slug se aprovado: {{ row.portal_text_pending.public_slug_preview }}
          </p>
        </div>

        <div v-if="row.has_bio_pending" class="space-y-2">
          <p class="text-sm font-medium text-zinc-300">Biografia (diff por linhas)</p>
          <p class="text-xs text-zinc-500">Vermelho = removido · verde = novo · cinza = igual</p>
          <div class="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <template v-for="(seg, idx) in bioDiffSegments(row)" :key="idx">
              <div
                v-if="seg.type === 'removed'"
                class="whitespace-pre-wrap rounded border border-red-900/40 bg-red-950/35 px-2 py-1.5 text-sm text-red-100/95"
              >
                {{ seg.text }}
              </div>
              <div
                v-else-if="seg.type === 'added'"
                class="whitespace-pre-wrap rounded border border-emerald-900/40 bg-emerald-950/35 px-2 py-1.5 text-sm text-emerald-100/95"
              >
                {{ seg.text }}
              </div>
              <div
                v-else
                class="whitespace-pre-wrap rounded border border-zinc-800/80 bg-zinc-900/40 px-2 py-1.5 text-sm text-zinc-400"
              >
                {{ seg.text }}
              </div>
            </template>
            <p v-if="bioDiffIsEmpty(row)" class="text-sm text-zinc-500">
              (Sem linhas para comparar.)
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            :disabled="isProfileBusy(row.id)"
            @click="approve(row.id)"
          >
            {{ busyByProfileId[row.id] === 'approve' ? 'Aprovando…' : 'Aprovar' }}
          </button>
          <button
            type="button"
            class="rounded bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            :disabled="isProfileBusy(row.id)"
            @click="reject(row.id)"
          >
            {{ busyByProfileId[row.id] === 'reject' ? 'Recusando…' : 'Recusar' }}
          </button>
        </div>
      </li>
    </ul>

    <p v-if="!loading && items.length === 0" class="text-zinc-500">Nenhuma alteração neste filtro.</p>

    <div v-if="meta && meta.last_page > 1" class="flex items-center justify-center gap-4 text-sm text-zinc-400">
      <button
        type="button"
        class="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        :disabled="page <= 1"
        @click="goPrevPage()"
      >
        Anterior
      </button>
      <span>Página {{ meta.current_page }} / {{ meta.last_page }}</span>
      <button
        type="button"
        class="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        :disabled="page >= meta.last_page"
        @click="goNextPage()"
      >
        Próxima
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSwal } from '~/composables/useSwal'
import { apiErrorMessage } from '~/utils/api-error-message'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Nome e biografia — admin' })

type BioDiffSegment = { type: 'context' | 'removed' | 'added'; text: string }

type Row = {
  id: number
  public_slug: string | null
  professional_name: string | null
  professional_name_pending?: string | null
  bio: string | null
  bio_pending?: string | null
  portal_text_pending_submitted_at?: string | null
  has_name_pending: boolean
  has_bio_pending: boolean
  portal_text_pending?: {
    has_pending: boolean
    public_slug_preview?: string | null
    bio_line_diff?: BioDiffSegment[]
  } | null
  user?: { id?: number; name: string; email?: string } | null
}

const { request } = useApi()
const { swalRejectWithReason } = useSwal()

const typeFilter = ref<'all' | 'name' | 'bio'>('all')
const page = ref(1)
const loading = ref(true)
const items = ref<Row[]>([])
const meta = ref<{ current_page: number; last_page: number } | null>(null)
const actionMsg = ref('')
const actionOk = ref(true)
const busyByProfileId = ref<Record<number, 'approve' | 'reject'>>({})

const filters = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'name' as const, label: 'Só nome' },
  { value: 'bio' as const, label: 'Só biografia' },
]

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

function bioDiffSegments(row: Row): BioDiffSegment[] {
  const d = row.portal_text_pending?.bio_line_diff
  return Array.isArray(d) ? d : []
}

function bioDiffIsEmpty(row: Row): boolean {
  return bioDiffSegments(row).length === 0
}

function isProfileBusy(profileId: number): boolean {
  return Object.prototype.hasOwnProperty.call(busyByProfileId.value, profileId)
}

function selectFilter(value: 'all' | 'name' | 'bio') {
  typeFilter.value = value
  page.value = 1
  void load()
}

function goPrevPage() {
  page.value--
  void load()
}

function goNextPage() {
  page.value++
  void load()
}

async function load() {
  loading.value = true
  try {
    const res = await request<{
      data: Row[]
      current_page: number
      last_page: number
    }>(
      `/v1/admin/profiles/pending-portal-text?type=${encodeURIComponent(typeFilter.value)}&page=${page.value}`,
    )
    items.value = res.data
    meta.value = { current_page: res.current_page, last_page: res.last_page }
  } finally {
    loading.value = false
  }
}

async function approve(profileId: number) {
  actionMsg.value = ''
  busyByProfileId.value = { ...busyByProfileId.value, [profileId]: 'approve' }
  try {
    await request(`/v1/admin/profiles/${profileId}/approve-portal-text`, { method: 'POST' })
    try {
      await load()
    } catch {
      actionMsg.value = 'Aprovado. Atualize a página se a lista não mudar.'
      actionOk.value = true
      return
    }
    actionMsg.value = 'Alterações aprovadas.'
    actionOk.value = true
  } catch (e: unknown) {
    actionMsg.value = apiErrorMessage(e, 'Não foi possível aprovar.')
    actionOk.value = false
  } finally {
    const next = { ...busyByProfileId.value }
    delete next[profileId]
    busyByProfileId.value = next
  }
}

async function reject(profileId: number) {
  const { confirmed, reason } = await swalRejectWithReason({
    title: 'Recusar nome e/ou biografia?',
    text: 'As propostas pendentes deste perfil serão descartadas. Se escrever um motivo, o anunciante recebe por e-mail.',
  })
  if (!confirmed) {
    return
  }
  actionMsg.value = ''
  busyByProfileId.value = { ...busyByProfileId.value, [profileId]: 'reject' }
  try {
    await request(`/v1/admin/profiles/${profileId}/reject-portal-text`, {
      method: 'POST',
      body: reason !== '' ? { reason } : {},
    })
    try {
      await load()
    } catch {
      actionMsg.value = 'Recusado. Atualize a página se a lista não mudar.'
      actionOk.value = true
      return
    }
    actionMsg.value = 'Alterações recusadas.'
    actionOk.value = true
  } catch (e: unknown) {
    actionMsg.value = apiErrorMessage(e, 'Não foi possível recusar.')
    actionOk.value = false
  } finally {
    const next = { ...busyByProfileId.value }
    delete next[profileId]
    busyByProfileId.value = next
  }
}

onMounted(() => load())
</script>
