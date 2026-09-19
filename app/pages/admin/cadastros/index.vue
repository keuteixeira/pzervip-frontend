<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Cadastros</h1>
      <p class="mt-1 text-sm text-zinc-500">
        Análise KYC, rascunhos abandonados e PIX gerado sem pagar. Aprovação ou recusa só na ficha.
      </p>
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
      empty-text="Nenhum cadastro neste filtro."
      @update:q="onSearch"
      @update:per-page="list.setPerPage"
      @page="list.goToPage"
    >
      <template #filters>
        <button
          v-for="f in statusFilters"
          :key="f.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm"
          :class="statusFilter === f.value ? 'border-brand bg-brand/20 text-white' : 'border-zinc-700 text-zinc-400'"
          @click="setStatus(f.value)"
        >
          {{ f.label }}
        </button>
        <button
          v-for="f in queueFilters"
          :key="f.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm"
          :class="queueFilter === f.value ? 'border-amber-500/60 bg-amber-500/15 text-amber-100' : 'border-zinc-700 text-zinc-400'"
          @click="setQueue(f.value)"
        >
          {{ f.label }}
        </button>
      </template>
      <template #head>
        <th class="px-4 py-3">Pessoa</th>
        <th class="px-4 py-3">Fila</th>
        <th class="px-4 py-3">Prazo</th>
        <th class="px-4 py-3"></th>
      </template>
      <tr
        v-for="row in list.items.value"
        :key="row.id"
        class="text-zinc-300"
        :class="row.priority_destaque_paid ? 'bg-amber-500/5' : ''"
      >
        <td class="px-4 py-3">
          <p class="font-medium text-white">{{ row.user?.name || row.professional_name || 'Perfil' }}</p>
          <p class="text-xs text-zinc-500">
            {{ row.user?.email || '—' }} · {{ adminApprovalStatusLabel(row.approval_status) }} ·
            {{ adminFormStatusLabel(row.form_status) }}
            <span v-if="row.form_status === 'draft'"> · etapa {{ row.current_step }}</span>
          </p>
        </td>
        <td class="px-4 py-3">
          <span
            v-if="row.priority_destaque_paid"
            class="rounded-full bg-amber-500/25 px-2 py-0.5 text-xs font-semibold text-amber-200"
          >Destaque pago</span>
          <span v-else-if="row.plan_type === 'premium'" class="text-xs text-zinc-400">Premium sem PIX</span>
          <span v-else class="text-xs text-zinc-500">Gratuito</span>
        </td>
        <td class="px-4 py-3 text-xs" :class="row.analysis_is_overdue ? 'font-medium text-red-400' : 'text-zinc-500'">
          <template v-if="row.approval_status === 'pending' && row.analysis_deadline_at">
            {{ formatDeadline(row.analysis_deadline_at) }}
            <span v-if="row.analysis_is_overdue"> · atrasado</span>
          </template>
          <template v-else>—</template>
        </td>
        <td class="px-4 py-3">
          <NuxtLink
            :to="`/admin/cadastros/${row.id}`"
            class="rounded border border-brand/50 bg-brand/15 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/25"
          >
            Visualizar
          </NuxtLink>
        </td>
      </tr>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import { adminApprovalStatusLabel, adminFormStatusLabel } from '~/utils/admin-labels'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Cadastros' })

type CadastroListRow = {
  id: number
  professional_name: string | null
  approval_status: string
  form_status: string
  current_step?: number
  plan_type?: string | null
  user?: { name?: string; email?: string }
  priority_destaque_paid?: boolean
  analysis_deadline_at?: string | null
  analysis_is_overdue?: boolean
}

const route = useRoute()
const initialForm = String(route.query.form_status || 'complete')
const initialQueue = String(route.query.queue || 'all')
const statusFilter = ref(String(route.query.approval_status || (initialForm === 'draft' || initialQueue === 'pix_pendente' ? 'all' : 'pending')))
const formStatus = ref(initialForm)
const queueFilter = ref(initialQueue)

const statusFilters = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'drafts', label: 'Rascunhos' },
  { value: 'all', label: 'Todos' },
]

const queueFilters = [
  { value: 'all', label: 'Todos os planos' },
  { value: 'gratuito', label: 'Gratuitos' },
  { value: 'destaque', label: 'Destaques pagos' },
  { value: 'pix_pendente', label: 'PIX pendente' },
] as const

const list = useAdminList<CadastroListRow>({
  endpoint: '/v1/admin/profiles',
  extraQuery: () => ({
    approval_status: statusFilter.value === 'drafts' ? 'all' : statusFilter.value,
    form_status: statusFilter.value === 'drafts' ? 'draft' : formStatus.value,
    queue: queueFilter.value,
  }),
})

function onSearch(value: string) {
  list.q.value = value
  list.scheduleSearch()
}

function setStatus(value: string) {
  statusFilter.value = value
  formStatus.value = value === 'drafts' ? 'draft' : value === 'all' ? 'all' : 'complete'
  list.page.value = 1
  void list.load()
}

function setQueue(value: string) {
  queueFilter.value = value
  if (value === 'pix_pendente') {
    statusFilter.value = 'all'
    formStatus.value = 'all'
  }
  list.page.value = 1
  void list.load()
}

function formatDeadline(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

onMounted(() => list.load())
</script>
