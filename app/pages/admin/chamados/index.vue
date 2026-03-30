<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Chamados</h1>
      <p class="mt-1 text-sm text-zinc-500">Fila de suporte com filtro por status, prioridade, assunto e SLA.</p>
    </div>

    <div class="grid gap-2 md:grid-cols-5">
      <input
        v-model="q"
        placeholder="Buscar por título, usuário ou e-mail"
        class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm md:col-span-2"
      />
      <select v-model="status" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm">
        <option value="all">Todos status</option>
        <option value="open">Aberto</option>
        <option value="waiting_admin">Aguardando suporte</option>
        <option value="waiting_user">Aguardando anunciante</option>
        <option value="resolved">Resolvido</option>
        <option value="closed">Fechado</option>
      </select>
      <select v-model="priority" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm">
        <option value="all">Todas prioridades</option>
        <option v-for="p in supportPriorities" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>
      <select v-model="subject" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm">
        <option value="all">Todos assuntos</option>
        <option v-for="s in supportSubjects" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>
    <div class="flex gap-2">
      <button type="button" class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300" @click="overdue = 'all'; load()">
        Tudo
      </button>
      <button type="button" class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300" @click="overdue = 'yes'; load()">
        Só atrasados
      </button>
      <button type="button" class="rounded-lg bg-brand px-3 py-1.5 text-sm text-white" @click="load">Filtrar</button>
    </div>

    <p v-if="loading" class="text-sm text-zinc-400">Carregando...</p>
    <ul v-else class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li v-for="t in items" :key="t.id" class="px-4 py-4">
        <NuxtLink :to="withMock(`/admin/chamados/${t.id}`)" class="block">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-medium text-white">{{ t.title }}</p>
            <span class="text-xs text-zinc-500">#{{ t.id }} · {{ supportStatusLabel(t.status) }}</span>
          </div>
          <p class="mt-1 text-xs text-zinc-500">
            {{ t.user?.name || '—' }} · {{ supportSubjectLabel(t.subject) }} · {{ supportPriorityLabel(t.priority) }}
            <span v-if="t.is_overdue" class="text-red-400"> · SLA atrasado</span>
          </p>
        </NuxtLink>
      </li>
    </ul>
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

const { request } = useApi()
const { withMock } = useAdminMock()

const items = ref<any[]>([])
const loading = ref(true)
const q = ref('')
const status = ref('all')
const priority = ref('all')
const subject = ref('all')
const overdue = ref('all')

async function load() {
  loading.value = true
  try {
    const query = new URLSearchParams({
      q: q.value,
      status: status.value,
      priority: priority.value,
      subject: subject.value,
      overdue: overdue.value,
    })
    const res = await request<{ data: any[] }>(`/v1/admin/support/tickets?${query.toString()}`)
    items.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
