<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Comentários</h1>
      <p class="mt-1 text-sm text-zinc-500">Moderação de comentários públicos e respostas.</p>
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
      search-placeholder="Autor, texto ou perfil"
      empty-text="Nenhum comentário neste filtro."
      @update:q="onSearch"
      @update:per-page="list.setPerPage"
      @page="list.goToPage"
    >
      <template #filters>
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm"
          :class="statusFilter === f.value ? 'border-brand bg-brand/20 text-white' : 'border-zinc-700 text-zinc-400'"
          @click="statusFilter = f.value; list.page.value = 1; list.load()"
        >
          {{ f.label }}
        </button>
      </template>

      <div v-for="c in list.items.value" :key="c.id" class="space-y-2 px-4 py-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-sm font-medium text-white">{{ c.author_display || 'Anônimo' }}</p>
          <span class="text-xs text-zinc-500">{{ adminCommentStatusLabel(c.status) }} · #{{ c.id }}</span>
        </div>
        <p class="whitespace-pre-wrap text-sm text-zinc-300">{{ c.body }}</p>
        <p v-if="c.advertiser_profile" class="text-xs text-zinc-500">
          Perfil:
          <NuxtLink :to="`/admin/anunciantes/${c.advertiser_profile.id}`" class="text-brand hover:underline">
            {{ c.advertiser_profile.professional_name }} ({{ c.advertiser_profile.public_slug }})
          </NuxtLink>
        </p>
        <div v-if="c.status === 'pending'" class="flex gap-2">
          <button
            type="button"
            class="rounded bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-40"
            :disabled="busyCommentId === c.id"
            @click="setStatus(c.id, 'approved')"
          >
            Aprovar
          </button>
          <button
            type="button"
            class="rounded bg-zinc-700 px-2 py-1 text-xs text-white disabled:opacity-40"
            :disabled="busyCommentId === c.id"
            @click="setStatus(c.id, 'rejected')"
          >
            Recusar
          </button>
        </div>
      </div>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import { adminCommentStatusLabel } from '~/utils/admin-labels'
import { apiErrorMessage } from '~/utils/api-error-message'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Comentários' })

const { request } = useApi()
const statusFilter = ref('pending')
const actionMsg = ref('')
const actionOk = ref(true)
const busyCommentId = ref<number | null>(null)
const filters = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

const list = useAdminList<{
  id: number
  author_display: string | null
  body: string
  status: string
  advertiser_profile?: { id: number; professional_name: string | null; public_slug: string | null }
}>({
  endpoint: '/v1/admin/comments',
  extraQuery: () => ({ status: statusFilter.value }),
})

function onSearch(value: string) {
  list.q.value = value
  list.scheduleSearch()
}

async function setStatus(id: number, status: 'approved' | 'rejected') {
  actionMsg.value = ''
  busyCommentId.value = id
  try {
    await request(`/v1/admin/comments/${id}`, { method: 'PATCH', body: { status } })
    actionMsg.value = status === 'approved' ? 'Comentário aprovado com sucesso.' : 'Comentário recusado.'
    actionOk.value = true
    await list.load()
  } catch (e: unknown) {
    actionMsg.value = apiErrorMessage(e, 'Não foi possível atualizar o comentário.')
    actionOk.value = false
  } finally {
    busyCommentId.value = null
  }
}

onMounted(() => list.load())
</script>
