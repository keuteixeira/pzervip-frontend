<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Mídias pendentes</h1>
      <p class="mt-1 text-sm text-zinc-500">
        Arquivos com moderação “pendente” (galeria, capa, avatar, áudio). Ao recusar, pode informar um motivo. Se
        preencher, o anunciante recebe por e-mail com a referência do ficheiro.
      </p>
    </div>

    <p v-if="actionMsg" class="text-sm" :class="actionOk ? 'text-emerald-400' : 'text-red-400'" role="status">
      {{ actionMsg }}
    </p>

    <AdminDataTable
      :q="list.q.value"
      :page="list.page.value"
      :last-page="list.lastPage.value"
      :per-page="list.perPage.value"
      :total="list.total.value"
      :from="list.from.value"
      :to="list.to.value"
      :loading="list.loading.value"
      :error="list.error.value"
      variant="stack"
      search-placeholder="Arquivo ou nome do perfil"
      empty-text="Nenhuma mídia pendente."
      @update:q="onSearch"
      @update:per-page="list.setPerPage"
      @page="list.goToPage"
    >
      <div
        v-for="row in list.items.value"
        :key="row.id"
        role="button"
        tabindex="0"
        class="flex cursor-pointer flex-col gap-3 px-4 py-4 transition hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
        @click="openMedia(row)"
        @keydown.enter="openMedia(row)"
      >
        <div>
          <p class="font-medium text-brand">{{ row.kind_label || row.collection_name }}</p>
          <p class="font-medium text-white">{{ row.file_name }}</p>
          <p class="text-xs text-zinc-500">{{ row.mime_type || '—' }} · {{ row.collection_name }} · #{{ row.id }}</p>
          <p v-if="row.advertiser_profile" class="text-sm text-zinc-400">
            Perfil: {{ row.advertiser_profile.professional_name || '—' }}
            <span v-if="row.advertiser_profile.approval_status" class="text-zinc-500">
              · cadastro {{ adminApprovalStatusLabel(row.advertiser_profile.approval_status) }}
            </span>
            <NuxtLink :to="`/admin/anunciantes/${row.advertiser_profile.id}`" class="ml-2 text-brand hover:underline">
              Visualizar
            </NuxtLink>
          </p>
        </div>
        <div class="flex flex-wrap gap-2" @click.stop @keydown.stop>
          <button
            type="button"
            class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            :disabled="!row.advertiser_profile || openingId === row.id"
            @click="openMedia(row)"
          >
            {{ openingId === row.id ? 'Abrindo…' : 'Abrir' }}
          </button>
          <button
            type="button"
            class="rounded bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-40"
            :disabled="!row.advertiser_profile || row.id in moderatingByMediaId"
            @click="moderate(row, 'approved')"
          >
            {{ moderatingByMediaId[row.id] === 'approved' ? 'Aprovando…' : 'Aprovar' }}
          </button>
          <button
            type="button"
            class="rounded bg-zinc-700 px-2 py-1 text-xs text-white disabled:opacity-40"
            :disabled="!row.advertiser_profile || row.id in moderatingByMediaId"
            @click="moderate(row, 'rejected')"
          >
            {{ moderatingByMediaId[row.id] === 'rejected' ? 'Recusando…' : 'Recusar' }}
          </button>
        </div>
      </div>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import { useSwal } from '~/composables/useSwal'
import { adminApprovalStatusLabel } from '~/utils/admin-labels'
import { apiErrorMessage } from '~/utils/api-error-message'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Mídias' })

const { request } = useApi()
const { swalRejectWithReason } = useSwal()

type Row = {
  id: number
  collection_name: string
  kind?: string
  kind_label?: string
  file_name: string
  mime_type: string
  advertiser_profile: {
    id: number
    professional_name: string | null
    public_slug: string | null
    approval_status?: string
  } | null
}

const list = useAdminList<Row>({ endpoint: '/v1/admin/media/pending' })
const moderatingByMediaId = ref<Record<number, 'approved' | 'rejected'>>({})
const openingId = ref<number | null>(null)
const actionMsg = ref('')
const actionOk = ref(true)

function onSearch(value: string) {
  list.q.value = value
  list.scheduleSearch()
}

async function openMedia(row: Row) {
  const pid = row.advertiser_profile?.id
  if (!pid) {
    return
  }
  openingId.value = row.id
  try {
    const res = await request<{ url: string }>(`/v1/admin/profiles/${pid}/media/${row.id}/temporary-url`)
    if (res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer')
    }
  } finally {
    openingId.value = null
  }
}

async function moderate(row: Row, moderation_status: 'approved' | 'rejected') {
  const pid = row.advertiser_profile?.id
  if (!pid) {
    return
  }
  let moderation_reject_reason: string | undefined
  if (moderation_status === 'rejected') {
    const { confirmed, reason } = await swalRejectWithReason({
      title: 'Recusar esta mídia?',
      text: `${row.kind_label || row.collection_name} · ${row.file_name}`,
    })
    if (!confirmed) {
      return
    }
    moderation_reject_reason = reason !== '' ? reason : undefined
  }
  actionMsg.value = ''
  moderatingByMediaId.value = { ...moderatingByMediaId.value, [row.id]: moderation_status }
  try {
    await request(`/v1/admin/profiles/${pid}/media/${row.id}`, {
      method: 'PATCH',
      body:
        moderation_status === 'rejected'
          ? { moderation_status, moderation_reject_reason }
          : { moderation_status },
    })
    actionMsg.value = moderation_status === 'approved' ? 'Mídia aprovada com sucesso.' : 'Mídia recusada.'
    actionOk.value = true
    await list.load()
  } catch (e: unknown) {
    actionMsg.value = apiErrorMessage(e, 'Não foi possível moderar esta mídia.')
    actionOk.value = false
  } finally {
    const next = { ...moderatingByMediaId.value }
    delete next[row.id]
    moderatingByMediaId.value = next
  }
}

onMounted(() => list.load())
</script>
