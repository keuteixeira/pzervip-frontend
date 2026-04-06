<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Comentários</h1>
      <p class="mt-1 text-sm text-zinc-500">Moderação de comentários públicos e respostas.</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm"
        :class="
          statusFilter === f.value ? 'border-brand bg-brand/20 text-white' : 'border-zinc-700 text-zinc-400'
        "
        @click="statusFilter = f.value; page = 1; load()"
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
      <li v-for="c in items" :key="c.id" class="space-y-2 px-4 py-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-sm font-medium text-white">{{ c.author_display || 'Anônimo' }}</p>
          <span class="text-xs text-zinc-500">{{ adminCommentStatusLabel(c.status) }} · #{{ c.id }}</span>
        </div>
        <p class="text-sm text-zinc-300 whitespace-pre-wrap">{{ c.body }}</p>
        <p v-if="c.advertiser_profile" class="text-xs text-zinc-500">
          Perfil:
          <NuxtLink
            :to="`/admin/anunciantes/${c.advertiser_profile.id}`"
            class="text-brand hover:underline"
          >
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
      </li>
    </ul>

    <p v-if="!loading && items.length === 0" class="text-zinc-500">Nenhum comentário neste filtro.</p>

    <div v-if="meta && meta.last_page > 1" class="flex items-center justify-center gap-4 text-sm text-zinc-400">
      <button
        type="button"
        class="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        :disabled="page <= 1"
        @click="page--; load()"
      >
        Anterior
      </button>
      <span>Página {{ meta.current_page }} / {{ meta.last_page }}</span>
      <button
        type="button"
        class="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        :disabled="page >= meta.last_page"
        @click="page++; load()"
      >
        Próxima
      </button>
    </div>
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
const page = ref(1)
const loading = ref(true)

const items = ref<
  {
    id: number
    author_display: string | null
    body: string
    status: string
    advertiser_profile?: { id: number; professional_name: string | null; public_slug: string | null }
  }[]
>([])

const meta = ref<{ current_page: number; last_page: number } | null>(null)
const actionMsg = ref('')
const actionOk = ref(true)
const busyCommentId = ref<number | null>(null)

const filters = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

async function load() {
  loading.value = true
  try {
    const res = await request<{
      data: typeof items.value
      current_page: number
      last_page: number
    }>(`/v1/admin/comments?status=${encodeURIComponent(statusFilter.value)}&page=${page.value}`)
    items.value = res.data
    meta.value = { current_page: res.current_page, last_page: res.last_page }
  } finally {
    loading.value = false
  }
}

async function setStatus(id: number, status: 'approved' | 'rejected') {
  actionMsg.value = ''
  busyCommentId.value = id
  try {
    await request(`/v1/admin/comments/${id}`, {
      method: 'PATCH',
      body: { status },
    })
    try {
      await load()
    } catch {
      actionMsg.value =
        status === 'approved'
          ? 'Comentário aprovado. Não foi possível atualizar a lista — atualize a página.'
          : 'Comentário recusado. Não foi possível atualizar a lista — atualize a página.'
      actionOk.value = true
      return
    }
    actionMsg.value =
      status === 'approved' ? 'Comentário aprovado com sucesso.' : 'Comentário recusado.'
    actionOk.value = true
  } catch (e: unknown) {
    actionMsg.value = apiErrorMessage(e, 'Não foi possível atualizar o comentário.')
    actionOk.value = false
  } finally {
    busyCommentId.value = null
  }
}

onMounted(() => load())
</script>
