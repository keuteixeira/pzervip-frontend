<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Cadastros</h1>
      <p class="mt-1 text-sm text-zinc-500">Aprovar ou recusar novos cadastros (fila de análise).</p>
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

    <ul class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li
        v-for="row in items"
        :key="row.id"
        class="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="font-medium text-white">{{ row.user?.name || row.professional_name || 'Perfil' }}</p>
          <p class="text-xs text-zinc-500">
            Status: {{ row.approval_status }} · Formulário: {{ row.form_status }} · ID {{ row.id }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-40"
            :disabled="row.approval_status === 'approved'"
            @click="setStatus(row.id, 'approved')"
          >
            Aprovar
          </button>
          <button
            type="button"
            class="rounded bg-zinc-700 px-2 py-1 text-xs text-white disabled:opacity-40"
            :disabled="row.approval_status === 'rejected'"
            @click="setStatus(row.id, 'rejected')"
          >
            Recusar
          </button>
          <NuxtLink
            :to="withMock(`/admin/cadastros/${row.id}`)"
            class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Abrir
          </NuxtLink>
        </div>
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
import { filterMockCadastros } from '~/data/admin-mocks'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

useHead({ title: 'Cadastros' })

const { request } = useApi()
const { isMock, withMock } = useAdminMock()

const statusFilter = ref('pending')
const page = ref(1)
const items = ref<
  {
    id: number
    professional_name: string | null
    approval_status: string
    form_status: string
    user?: { name: string }
  }[]
>([])
const meta = ref<{ current_page: number; last_page: number; total: number } | null>(null)

const filters = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

async function load() {
  if (isMock.value) {
    const q = statusFilter.value === 'all' ? 'all' : statusFilter.value
    const list = filterMockCadastros(q)
    items.value = list
    meta.value = { current_page: 1, last_page: 1, total: list.length }
    return
  }
  const q = statusFilter.value === 'all' ? 'all' : statusFilter.value
  const res = await request<{
    data: typeof items.value
    current_page: number
    last_page: number
    total: number
  }>(`/v1/admin/profiles?approval_status=${encodeURIComponent(q)}&page=${page.value}`)
  items.value = res.data
  meta.value = {
    current_page: res.current_page,
    last_page: res.last_page,
    total: res.total,
  }
}

async function setStatus(id: number, approval_status: 'approved' | 'rejected') {
  if (isMock.value) {
    const row = items.value.find((r) => r.id === id)
    if (row) {
      row.approval_status = approval_status
    }
    return
  }
  await request(`/v1/admin/profiles/${id}`, {
    method: 'PATCH',
    body: { approval_status },
  })
  await load()
}

onMounted(() => load())

watch(isMock, () => load())
</script>
