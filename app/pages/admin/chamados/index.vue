<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Chamados</h1>
      <p class="mt-1 text-sm text-zinc-500">Fila de suporte com busca, filtro e paginação.</p>
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
      search-placeholder="Título, UUID, usuário ou e-mail"
      empty-text="Nenhum chamado neste filtro."
      @update:q="onSearch"
      @update:per-page="list.setPerPage"
      @page="list.goToPage"
    >
      <template #filters>
        <select v-model="status" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" @change="reloadFirst">
          <option value="all">Todos status</option>
          <option value="open">Aberto</option>
          <option value="waiting_admin">Aguardando suporte</option>
          <option value="waiting_user">Aguardando anunciante</option>
          <option value="resolved">Resolvido</option>
          <option value="closed">Fechado</option>
        </select>
        <select v-model="priority" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" @change="reloadFirst">
          <option value="all">Todas prioridades</option>
          <option v-for="p in supportPriorities" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
        <select v-model="subject" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" @change="reloadFirst">
          <option value="all">Todos assuntos</option>
          <option v-for="s in supportSubjects" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <button
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm"
          :class="overdue === 'yes' ? 'border-red-500/60 bg-red-500/10 text-red-200' : 'border-zinc-700 text-zinc-300'"
          @click="overdue = overdue === 'yes' ? 'all' : 'yes'; reloadFirst()"
        >
          Só atrasados
        </button>
      </template>
      <template #head>
        <th class="px-4 py-3">Chamado</th>
        <th class="px-4 py-3">Pessoa</th>
        <th class="px-4 py-3">Status</th>
        <th class="px-4 py-3"></th>
      </template>
      <tr v-for="t in list.items.value" :key="t.id" class="text-zinc-300">
        <td class="px-4 py-3">
          <p class="font-medium text-white">{{ t.title }}</p>
          <p class="text-xs text-zinc-500">
            #{{ t.id }} · {{ supportSubjectLabel(t.subject) }} · {{ supportPriorityLabel(t.priority) }}
            <span v-if="t.is_overdue" class="text-red-400"> · SLA atrasado</span>
          </p>
        </td>
        <td class="px-4 py-3 text-sm">{{ t.user?.name || '—' }}</td>
        <td class="px-4 py-3 text-xs text-zinc-400">{{ supportStatusLabel(t.status) }}</td>
        <td class="px-4 py-3">
          <NuxtLink :to="`/admin/chamados/${t.id}`" class="text-xs text-brand hover:underline">Abrir</NuxtLink>
        </td>
      </tr>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import {
  supportPriorities,
  supportPriorityLabel,
  supportStatusLabel,
  supportSubjectLabel,
  supportSubjects,
} from '~/utils/support-ticket-labels'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Chamados' })

const route = useRoute()
const status = ref(String(route.query.status || 'all'))
const priority = ref(String(route.query.priority || 'all'))
const subject = ref(String(route.query.subject || 'all'))
const overdue = ref(String(route.query.overdue || 'all'))

const list = useAdminList<any>({
  endpoint: '/v1/admin/support/tickets',
  extraQuery: () => ({
    status: status.value,
    priority: priority.value,
    subject: subject.value,
    overdue: overdue.value,
  }),
})

function onSearch(value: string) {
  list.q.value = value
  list.scheduleSearch()
}

function reloadFirst() {
  list.page.value = 1
  void list.load()
}

onMounted(() => list.load())
</script>
