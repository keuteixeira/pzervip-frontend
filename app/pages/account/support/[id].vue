<template>
  <div class="w-full space-y-6 pb-16">
    <div>
      <NuxtLink to="/conta/suporte" class="text-sm text-zinc-500 hover:text-brand">← Voltar aos chamados</NuxtLink>
      <h1 class="mt-2 text-2xl font-bold text-white">{{ ticket?.title || 'Chamado' }}</h1>
      <p v-if="ticket" class="mt-1 text-sm text-zinc-500">
        {{ supportStatusLabel(ticket.status) }} · {{ supportSubjectLabel(ticket.subject) }} · {{ supportPriorityLabel(ticket.priority) }}
      </p>
    </div>

    <div v-if="ticket" class="flex flex-wrap gap-2">
      <button type="button" class="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300" @click="setStatus('resolved')">
        Marcar como resolvido
      </button>
      <button type="button" class="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300" @click="setStatus('closed')">
        Fechar chamado
      </button>
      <button type="button" class="rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300" @click="setStatus('waiting_admin')">
        Reabrir (aguardando suporte)
      </button>
    </div>

    <p v-if="loading" class="text-sm text-zinc-400">Carregando...</p>
    <ul v-else class="space-y-3">
      <li v-for="m in messages" :key="m.id" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm font-medium text-white">
            {{ m.sender_role === 'admin' ? 'Suporte' : 'Você' }}
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
      <h2 class="text-sm font-semibold text-white">Nova resposta</h2>
      <textarea v-model="replyBody" rows="4" class="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
      <input type="file" multiple class="mt-2 block w-full text-sm text-zinc-300" @change="onFilesChange" />
      <p v-if="msg" class="mt-2 text-sm" :class="err ? 'text-red-400' : 'text-emerald-400'">{{ msg }}</p>
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
import { useAdvertiserApproval } from '~/composables/useAdvertiserApproval'
import { supportPriorityLabel, supportStatusLabel, supportSubjectLabel } from '~/utils/support-ticket-labels'

definePageMeta({
  layout: 'default',
  path: '/conta/suporte/:id',
})

const route = useRoute()
const { request } = useApi()
const { guardAccountToolsOrRedirect } = useAdvertiserApproval()
const ticket = ref<any>(null)
const messages = ref<any[]>([])
const loading = ref(true)
const sending = ref(false)
const replyBody = ref('')
const files = ref<File[]>([])
const msg = ref('')
const err = ref(false)
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
  loading.value = true
  try {
    const res = await request<{ ticket: any; messages: any[] }>(`/v1/me/support/tickets/${route.params.id}`)
    ticket.value = res.ticket
    messages.value = res.messages.filter((m) => !m.is_internal_note)
  } finally {
    loading.value = false
  }
}

async function setStatus(status: 'resolved' | 'closed' | 'waiting_admin') {
  await request(`/v1/me/support/tickets/${route.params.id}/status`, {
    method: 'PATCH',
    body: { status },
  })
  await load()
}

async function sendReply() {
  sending.value = true
  msg.value = ''
  err.value = false
  try {
    const fd = new FormData()
    fd.append('body', replyBody.value.trim())
    files.value.forEach((f) => fd.append('attachments[]', f))
    await request(`/v1/me/support/tickets/${route.params.id}/messages`, { method: 'POST', body: fd })
    replyBody.value = ''
    files.value = []
    msg.value = 'Resposta enviada.'
    await load()
  } catch (e: any) {
    err.value = true
    msg.value = e?.data?.message || 'Não foi possível enviar.'
  } finally {
    sending.value = false
  }
}

async function openAttachment(messageId: number, mediaId: number) {
  const res = await request<{ url: string }>(
    `/v1/me/support/tickets/${route.params.id}/messages/${messageId}/attachments/${mediaId}/temporary-url`,
  )
  if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  if (await guardAccountToolsOrRedirect()) {
    return
  }
  await load()
  timer = setInterval(() => {
    void load()
  }, 15000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
