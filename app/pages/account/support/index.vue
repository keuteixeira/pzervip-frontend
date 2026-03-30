<template>
  <div class="mx-auto max-w-5xl space-y-6 pb-16">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <NuxtLink to="/conta" class="text-sm text-zinc-500 hover:text-brand">← Minha conta</NuxtLink>
        <h1 class="mt-2 text-2xl font-bold text-white">Chamados de suporte</h1>
        <p class="mt-1 text-sm text-zinc-500">Abra tickets e acompanhe as respostas do administrativo.</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        @click="showNew = !showNew"
      >
        {{ showNew ? 'Fechar formulário' : 'Novo chamado' }}
      </button>
    </div>

    <section v-if="showNew" class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 class="text-lg font-semibold text-white">Abrir novo chamado</h2>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <label class="text-sm text-zinc-300">
          <span class="mb-1 block text-zinc-500">Assunto</span>
          <select v-model="form.subject" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            <option v-for="s in supportSubjects" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </label>
        <label class="text-sm text-zinc-300">
          <span class="mb-1 block text-zinc-500">Prioridade</span>
          <select v-model="form.priority" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            <option v-for="p in supportPriorities" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </label>
      </div>
      <label class="mt-3 block text-sm text-zinc-300">
        <span class="mb-1 block text-zinc-500">Título</span>
        <input v-model="form.title" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" maxlength="191" />
      </label>
      <label class="mt-3 block text-sm text-zinc-300">
        <span class="mb-1 block text-zinc-500">Mensagem</span>
        <textarea v-model="form.message" rows="5" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
      </label>
      <label class="mt-3 block text-sm text-zinc-300">
        <span class="mb-1 block text-zinc-500">Anexos (até 5 arquivos)</span>
        <input type="file" multiple class="block w-full text-sm text-zinc-300" @change="onFilesChange" />
      </label>
      <p v-if="msg" class="mt-3 text-sm" :class="err ? 'text-red-400' : 'text-emerald-400'">{{ msg }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        :disabled="saving"
        @click="createTicket"
      >
        {{ saving ? 'Enviando...' : 'Criar chamado' }}
      </button>
    </section>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm"
        :class="statusFilter === f.value ? 'border-brand bg-brand/20 text-white' : 'border-zinc-700 text-zinc-400'"
        @click="statusFilter = f.value; load()"
      >
        {{ f.label }}
      </button>
    </div>

    <p v-if="loading" class="text-sm text-zinc-400">Carregando...</p>
    <ul v-else class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li v-for="t in tickets" :key="t.id" class="px-4 py-4">
        <NuxtLink :to="`/conta/suporte/${t.id}`" class="block">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-medium text-white">{{ t.title }}</p>
            <span class="text-xs text-zinc-500">#{{ t.id }} · {{ supportStatusLabel(t.status) }}</span>
          </div>
          <p class="mt-1 text-xs text-zinc-500">
            {{ supportSubjectLabel(t.subject) }} · {{ supportPriorityLabel(t.priority) }} · SLA:
            {{ formatDate(t.due_at) }}
            <span v-if="t.is_overdue" class="text-red-400"> · atrasado</span>
          </p>
        </NuxtLink>
      </li>
    </ul>
    <p v-if="!loading && tickets.length === 0" class="text-sm text-zinc-500">Nenhum chamado neste filtro.</p>
  </div>
</template>

<script setup lang="ts">
import { supportPriorities, supportPriorityLabel, supportStatusLabel, supportSubjectLabel, supportSubjects } from '~/utils/support-ticket-labels'

definePageMeta({
  layout: 'default',
  path: '/conta/suporte',
})

useHead({ title: 'Suporte' })

const { request } = useApi()
const loading = ref(true)
const saving = ref(false)
const showNew = ref(false)
const statusFilter = ref('all')
const tickets = ref<any[]>([])
const files = ref<File[]>([])
const msg = ref('')
const err = ref(false)

const form = reactive({
  title: '',
  subject: 'payment',
  priority: 'normal',
  message: '',
})

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abertos' },
  { value: 'waiting_admin', label: 'Aguardando suporte' },
  { value: 'waiting_user', label: 'Aguardando você' },
  { value: 'resolved', label: 'Resolvidos' },
  { value: 'closed', label: 'Fechados' },
]

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR')
}

function onFilesChange(e: Event) {
  const input = e.target as HTMLInputElement
  files.value = Array.from(input.files ?? []).slice(0, 5)
}

async function load() {
  loading.value = true
  try {
    const res = await request<{ data: any[] }>(`/v1/me/support/tickets?status=${encodeURIComponent(statusFilter.value)}`)
    tickets.value = res.data
  } finally {
    loading.value = false
  }
}

async function createTicket() {
  saving.value = true
  msg.value = ''
  err.value = false
  try {
    const fd = new FormData()
    fd.append('title', form.title.trim())
    fd.append('subject', form.subject)
    fd.append('priority', form.priority)
    fd.append('message', form.message.trim())
    files.value.forEach((f) => fd.append('attachments[]', f))
    await request('/v1/me/support/tickets', { method: 'POST', body: fd })
    msg.value = 'Chamado criado com sucesso.'
    showNew.value = false
    form.title = ''
    form.message = ''
    files.value = []
    await load()
  } catch (e: any) {
    err.value = true
    msg.value = e?.data?.message || 'Não foi possível criar o chamado.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
