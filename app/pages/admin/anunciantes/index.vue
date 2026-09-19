<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Anunciantes</h1>
      <p class="mt-1 text-sm text-zinc-500">Perfis após a aprovação: busca, suspensão e exclusão ficam na ficha.</p>
    </div>

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
      search-placeholder="Nome, e-mail, slug ou CPF"
      empty-text="Nenhum anunciante neste filtro."
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
      <template #head>
        <th class="px-4 py-3">Anunciante</th>
        <th class="px-4 py-3">Cadastro</th>
        <th class="px-4 py-3"></th>
      </template>
      <tr v-for="row in list.items.value" :key="row.id" class="text-zinc-300">
        <td class="px-4 py-3">
          <p class="font-medium text-white">{{ row.professional_name || row.user?.name || 'Perfil' }}</p>
          <p class="text-xs text-zinc-500">{{ row.public_slug || '—' }} · {{ row.user?.email || '—' }}</p>
          <p v-if="row.user?.deletion_requested_at" class="text-xs text-amber-300">Exclusão agendada</p>
        </td>
        <td class="px-4 py-3 text-xs text-zinc-400">{{ adminApprovalStatusLabel(row.approval_status) }}</td>
        <td class="px-4 py-3">
          <NuxtLink
            :to="`/admin/anunciantes/${row.id}`"
            class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Abrir
          </NuxtLink>
        </td>
      </tr>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import { adminApprovalStatusLabel } from '~/utils/admin-labels'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Anunciantes' })

const statusFilter = ref('approved')
const filters = [
  { value: 'approved', label: 'Aprovados' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

const list = useAdminList<{
  id: number
  professional_name: string | null
  public_slug: string | null
  approval_status: string
  user?: { name?: string | null; email?: string | null; deletion_requested_at?: string | null }
}>({
  endpoint: '/v1/admin/profiles',
  extraQuery: () => ({ approval_status: statusFilter.value }),
})

function onSearch(value: string) {
  list.q.value = value
  list.scheduleSearch()
}

onMounted(() => list.load())
</script>
