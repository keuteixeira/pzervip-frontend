<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Anunciantes</h1>
      <p class="mt-1 text-sm text-zinc-500">Buscar perfis, ver dados e gerenciar (inclui destaque cortesia na ficha).</p>
    </div>

    <div class="flex flex-wrap items-end gap-3">
      <div>
        <label class="mb-1 block text-xs text-zinc-500">Status</label>
        <select
          v-model="statusFilter"
          class="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          @change="page = 1; load()"
        >
          <option value="approved">Aprovados</option>
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="rejected">Recusados</option>
        </select>
      </div>
      <div class="min-w-[200px] flex-1">
        <label class="mb-1 block text-xs text-zinc-500">Busca (nome, slug, CPF)</label>
        <input
          v-model="searchQ"
          type="search"
          class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          placeholder="Buscar…"
          @keydown.enter="page = 1; load()"
        />
      </div>
      <button
        type="button"
        class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
        @click="page = 1; load()"
      >
        Buscar
      </button>
    </div>

    <ul class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li
        v-for="row in items"
        :key="row.id"
        class="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="font-medium text-white">{{ row.professional_name || row.user?.name || 'Sem nome' }}</p>
          <p class="text-xs text-zinc-500">
            {{ row.approval_status }} · slug: {{ row.public_slug || '—' }} · ID {{ row.id }}
          </p>
        </div>
        <NuxtLink
          :to="withMock(`/admin/anunciantes/${row.id}`)"
          class="rounded-lg border border-brand/50 bg-brand/10 px-4 py-2 text-sm text-brand hover:bg-brand/20"
        >
          Gerenciar
        </NuxtLink>
      </li>
    </ul>

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
import { filterMockAnunciantes } from '~/data/admin-mocks'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

useHead({ title: 'Anunciantes' })

const { request } = useApi()
const { isMock, withMock } = useAdminMock()

const statusFilter = ref('approved')
const searchQ = ref('')
const page = ref(1)
const items = ref<
  {
    id: number
    professional_name: string | null
    public_slug: string | null
    approval_status: string
    user?: { name: string }
  }[]
>([])
const meta = ref<{ current_page: number; last_page: number; total: number } | null>(null)

async function load() {
  if (isMock.value) {
    const list = filterMockAnunciantes(statusFilter.value, searchQ.value)
    items.value = list
    meta.value = { current_page: 1, last_page: 1, total: list.length }
    return
  }
  const st = statusFilter.value
  const term = searchQ.value.trim()
  const qs = new URLSearchParams({ approval_status: st, page: String(page.value) })
  if (term) {
    qs.set('q', term)
  }
  const res = await request<{
    data: typeof items.value
    current_page: number
    last_page: number
    total: number
  }>(`/v1/admin/profiles?${qs.toString()}`)
  items.value = res.data
  meta.value = {
    current_page: res.current_page,
    last_page: res.last_page,
    total: res.total,
  }
}

onMounted(() => load())

watch(isMock, () => load())
</script>
