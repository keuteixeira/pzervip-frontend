<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Cadastros</h1>
      <p class="mt-1 text-sm text-zinc-500">
        Pré-cadastros e análise KYC. Aprovação ou recusa só na ficha do cadastro, após revisão dos dados e mídias.
      </p>
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

    <p v-if="listError" class="text-sm text-red-400">{{ listError }}</p>

    <ul class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li
        v-for="row in items"
        :key="row.id"
        class="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="font-medium text-white">{{ row.user?.name || row.professional_name || 'Perfil' }}</p>
          <p class="text-xs text-zinc-500">
            Cadastro: {{ adminApprovalStatusLabel(row.approval_status) }} · Formulário:
            {{ adminFormStatusLabel(row.form_status) }} · ID {{ row.id }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded border border-brand/50 bg-brand/15 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/25"
            @click="openCadastro(row.id)"
          >
            Visualizar
          </button>
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
import { adminApprovalStatusLabel, adminFormStatusLabel } from '~/utils/admin-labels'
import { useAdminMock } from '~/composables/useAdminMock'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Cadastros' })

const { request } = useApi()
const { isMock, withMock } = useAdminMock()

const statusFilter = ref('pending')
const page = ref(1)
const listError = ref<string | null>(null)
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
  listError.value = null
  if (isMock.value) {
    const q = statusFilter.value === 'all' ? 'all' : statusFilter.value
    const list = filterMockCadastros(q)
    items.value = list
    meta.value = { current_page: 1, last_page: 1, total: list.length }
    return
  }
  try {
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
  } catch {
    listError.value = 'Não foi possível carregar a lista.'
    items.value = []
    meta.value = null
  }
}

function openCadastro(id: number) {
  const path = withMock(`/admin/cadastros/${id}`)
  return navigateTo(path)
}

onMounted(() => load())

watch(isMock, () => load())
</script>
