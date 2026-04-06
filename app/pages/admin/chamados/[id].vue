<template>
  <div class="space-y-6">
    <div>
      <NuxtLink to="/admin/chamados" class="text-sm text-zinc-500 hover:text-brand">← Voltar</NuxtLink>
      <h1 class="mt-2 text-2xl font-bold text-white">{{ ticket?.title || 'Chamado' }}</h1>
      <p v-if="ticket" class="mt-1 text-sm text-zinc-500">
        {{ ticket.user?.name }} · {{ supportStatusLabel(ticket.status) }} · {{ supportSubjectLabel(ticket.subject) }}
      </p>
    </div>

    <section v-if="ticket" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div class="grid gap-3 md:grid-cols-3">
        <label class="text-sm text-zinc-300">
          <span class="mb-1 block text-zinc-500">Status</span>
          <select v-model="ticket.status" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            <option value="open">Aberto</option>
            <option value="waiting_admin">Aguardando suporte</option>
            <option value="waiting_user">Aguardando anunciante</option>
            <option value="resolved">Resolvido</option>
            <option value="closed">Fechado</option>
          </select>
        </label>
        <label class="text-sm text-zinc-300">
          <span class="mb-1 block text-zinc-500">Prioridade</span>
          <select v-model="ticket.priority" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            <option v-for="p in supportPriorities" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </label>
        <label class="text-sm text-zinc-300">
          <span class="mb-1 block text-zinc-500">Responsável</span>
          <select v-model="assigneeId" class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2">
            <option :value="''">Sem responsável</option>
            <option v-for="a in admins" :key="a.id" :value="String(a.id)">{{ a.name }}</option>
          </select>
        </label>
      </div>
      <button type="button" class="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white" @click="saveMeta">
        Salvar alterações
      </button>
    </section>

    <ul class="space-y-3">
      <li v-for="m in messages" :key="m.id" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm font-medium text-white">
            {{ m.sender_role === 'admin' ? 'Admin' : 'Anunciante' }}
            <span v-if="m.is_internal_note" class="text-amber-300">· Nota interna</span>
          </p>
          <span class="text-xs text-zinc-500">{{ formatDate(m.created_at) }}</span>
        </div>
        <p class="mt-2 whitespace-pre-wrap text-sm text-zinc-200">{{ m.body }}</p>
        <div v-if="m.attachments?.length" class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="a in m.attachments"
            :key="a.id"
            type="button"
            class="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
            @click="openAttachment(m.id, a.id)"
          >
            {{ a.file_name || a.name || `Anexo ${a.id}` }}
          </button>
        </div>
      </li>
    </ul>

    <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 class="text-sm font-semibold text-white">Responder chamado</h2>
      <textarea v-model="replyBody" rows="4" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
      <label class="mt-2 flex items-center gap-2 text-sm text-zinc-300">
        <input v-model="internalNote" type="checkbox" />
        Mensagem interna (não visível ao anunciante)
      </label>
      <input type="file" multiple class="mt-2 block w-full text-sm text-zinc-300" @change="onFilesChange" />
      <button
        type="button"
        class="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        :disabled="sending"
        @click="sendReply"
      >
        {{ sending ? 'Enviando...' : 'Enviar resposta' }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { supportPriorities, supportStatusLabel, supportSubjectLabel } from '~/utils/support-ticket-labels'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

const route = useRoute()
const { request } = useApi()
const ticket = ref<any>(null)
const messages = ref<any[]>([])
const admins = ref<any[]>([])
const assigneeId = ref('')
const replyBody = ref('')
const internalNote = ref(false)
const files = ref<File[]>([])
const sending = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR')
}

function onFilesChange(e: Event) {
  const input = e.target as HTMLInputElement
  files.value = Array.from(input.files ?? []).slice(0, 5)
}

async function load() {
  const res = await request<{ ticket: any; messages: any[]; admins: any[] }>(`/v1/admin/support/tickets/${route.params.id}`)
  ticket.value = res.ticket
  messages.value = res.messages
  admins.value = res.admins
  assigneeId.value = res.ticket?.admin_assignee?.id ? String(res.ticket.admin_assignee.id) : ''
}

async function saveMeta() {
  await request(`/v1/admin/support/tickets/${route.params.id}`, {
    method: 'PATCH',
    body: {
      status: ticket.value.status,
      priority: ticket.value.priority,
      admin_assignee_id: assigneeId.value ? Number(assigneeId.value) : null,
    },
  })
  await load()
}

async function sendReply() {
  sending.value = true
  try {
    const fd = new FormData()
    fd.append('body', replyBody.value.trim())
    fd.append('is_internal_note', internalNote.value ? '1' : '0')
    files.value.forEach((f) => fd.append('attachments[]', f))
    await request(`/v1/admin/support/tickets/${route.params.id}/messages`, { method: 'POST', body: fd })
    replyBody.value = ''
    internalNote.value = false
    files.value = []
    await load()
  } finally {
    sending.value = false
  }
}

async function openAttachment(messageId: number, mediaId: number) {
  const res = await request<{ url: string }>(
    `/v1/admin/support/tickets/${route.params.id}/messages/${messageId}/attachments/${mediaId}/temporary-url`,
  )
  if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  await load()
  timer = setInterval(() => {
    load()
  }, 15000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
