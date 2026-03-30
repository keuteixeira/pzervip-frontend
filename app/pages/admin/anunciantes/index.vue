<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Anunciantes</h1>
      <p class="mt-1 text-sm text-zinc-500">
        Perfis ativos e gestão operacional pós-aprovação.
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm"
        :class="statusFilter === f.value ? 'border-brand bg-brand/20 text-white' : 'border-zinc-700 text-zinc-400'"
        @click="statusFilter = f.value; page = 1; load()"
      >
        {{ f.label }}
      </button>
    </div>

    <p v-if="loading" class="text-zinc-400">Carregando...</p>
    <ul v-else class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li
        v-for="row in items"
        :key="row.id"
        class="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="font-medium text-white">{{ row.professional_name || row.user?.name || 'Perfil' }}</p>
          <p class="text-xs text-zinc-500">
            {{ row.public_slug || '—' }} · Cadastro {{ adminApprovalStatusLabel(row.approval_status) }} · ID {{ row.id }}
          </p>
        </div>
        <NuxtLink
          :to="withMock(`/admin/anunciantes/${row.id}`)"
          class="w-fit rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          Abrir
        </NuxtLink>
      </li>
    </ul>

    <p v-if="!loading && items.length === 0" class="text-zinc-500">Nenhum anunciante neste filtro.</p>
  </div>
</template>

<script setup lang="ts">
import { adminApprovalStatusLabel } from '~/utils/admin-labels'
import { useAdminMock } from '~/composables/useAdminMock'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Anunciantes' })

const { request } = useApi()
const { withMock } = useAdminMock()

const loading = ref(true)
const page = ref(1)
const statusFilter = ref('approved')
const items = ref<
  {
    id: number
    professional_name: string | null
    public_slug: string | null
    approval_status: string
    user?: { name?: string | null }
  }[]
>([])

const filters = [
  { value: 'approved', label: 'Aprovados' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

async function load() {
  loading.value = true
  try {
    const res = await request<{ data: typeof items.value }>(
      `/v1/admin/profiles?approval_status=${encodeURIComponent(statusFilter.value)}&page=${page.value}`,
    )
    items.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
