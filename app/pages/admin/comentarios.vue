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

    <p v-if="loading" class="text-zinc-400">Carregando…</p>

    <ul v-else class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li v-for="c in items" :key="c.id" class="space-y-2 px-4 py-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <p class="text-sm font-medium text-white">{{ c.author_display || 'Anônimo' }}</p>
          <span class="text-xs text-zinc-500">{{ c.status }} · #{{ c.id }}</span>
        </div>
        <p class="text-sm text-zinc-300 whitespace-pre-wrap">{{ c.body }}</p>
        <p v-if="c.advertiser_profile" class="text-xs text-zinc-500">
          Perfil:
          <NuxtLink
            :to="withMock(`/admin/anunciantes/${c.advertiser_profile.id}`)"
            class="text-brand hover:underline"
          >
            {{ c.advertiser_profile.professional_name }} ({{ c.advertiser_profile.public_slug }})
          </NuxtLink>
        </p>
        <div v-if="c.status === 'pending'" class="flex gap-2">
          <button
            type="button"
            class="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
            @click="setStatus(c.id, 'approved')"
          >
            Aprovar
          </button>
          <button
            type="button"
            class="rounded bg-zinc-700 px-2 py-1 text-xs text-white"
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
import { filterMockComments } from '~/data/admin-mocks'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

useHead({ title: 'Comentários' })

const { request } = useApi()
const { isMock, withMock } = useAdminMock()

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

const filters = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

async function load() {
  loading.value = true
  try {
    if (isMock.value) {
      const list = filterMockComments(statusFilter.value)
      items.value = list as typeof items.value
      meta.value = { current_page: 1, last_page: 1 }
      return
    }
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
  if (isMock.value) {
    const row = items.value.find((x) => x.id === id)
    if (row) {
      row.status = status
    }
    return
  }
  await request(`/v1/admin/comments/${id}`, {
    method: 'PATCH',
    body: { status },
  })
  await load()
}

onMounted(() => load())

watch(isMock, () => load())
</script>
