<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Contato do site</h1>
      <p class="mt-1 text-sm text-zinc-500">Mensagens enviadas pelo formulário público. Marque como lida depois de tratar.</p>
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
      variant="stack"
      search-placeholder="Buscar por nome, e-mail, mensagem ou perfil"
      empty-text="Nenhuma mensagem neste filtro."
      @update:q="onSearch"
      @update:per-page="list.setPerPage"
      @page="list.goToPage"
    >
      <template #filters>
        <select v-model="subject" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" @change="reloadFirst">
          <option value="all">Todos assuntos</option>
          <option value="denuncia_perfil">Denúncia</option>
          <option value="duvida_geral">Dúvida</option>
          <option value="sugestao">Sugestão</option>
          <option value="problema_tecnico">Problema técnico</option>
          <option value="conta_anunciante">Conta / pagamentos</option>
          <option value="outro">Outro</option>
        </select>
        <select v-model="read" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" @change="reloadFirst">
          <option value="all">Lidas e não lidas</option>
          <option value="unread">Não lidas</option>
          <option value="read">Lidas</option>
        </select>
      </template>

      <article
        v-for="m in list.items.value"
        :key="m.id"
        class="space-y-2 px-4 py-4"
        :class="m.read_at ? 'opacity-80' : ''"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p class="font-medium text-white">{{ m.name }} · {{ m.email }}</p>
            <p class="text-xs text-zinc-500">
              {{ adminContactSubjectLabel(m.subject_type) }} · {{ formatDate(m.created_at) }}
              <span v-if="!m.read_at" class="ml-1 text-amber-300">· Não lida</span>
            </p>
          </div>
          <button
            v-if="!m.read_at"
            type="button"
            class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
            @click="markRead(m.id)"
          >
            Marcar lida
          </button>
        </div>
        <p v-if="m.profile_ref" class="text-xs text-zinc-500">Ref: {{ m.profile_ref }}</p>
        <p class="whitespace-pre-wrap text-sm text-zinc-200">{{ m.message }}</p>
      </article>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import { adminContactSubjectLabel } from '~/utils/admin-labels'
import { apiErrorMessage } from '~/utils/api-error-message'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Contato' })

type Row = {
  id: number
  subject_type: string
  profile_ref?: string | null
  name: string
  email: string
  message: string
  read_at?: string | null
  created_at: string
}

const route = useRoute()
const { request } = useApi()
const subject = ref(String(route.query.subject_type || 'all'))
const read = ref(String(route.query.read || 'all'))

const list = useAdminList<Row>({
  endpoint: '/v1/admin/contact-messages',
  extraQuery: () => ({
    subject_type: subject.value,
    read: read.value,
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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}

async function markRead(id: number) {
  try {
    await request(`/v1/admin/contact-messages/${id}/read`, { method: 'PATCH' })
    await list.load()
  } catch (e: unknown) {
    list.error.value = apiErrorMessage(e, 'Não foi possível marcar como lida.')
  }
}

onMounted(() => list.load())
</script>
