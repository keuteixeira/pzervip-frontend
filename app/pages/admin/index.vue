<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-white">Operação</h1>
      <p class="mt-1 text-sm text-zinc-500">Filas do dia: o que está parado, atrasado ou sem pagamento.</p>
    </div>

    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    <p v-else-if="loading" class="text-sm text-zinc-400">Carregando números…</p>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        v-for="card in cards"
        :key="card.to"
        :to="card.to"
        class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-600"
      >
        <p class="text-xs uppercase tracking-wide text-zinc-500">{{ card.label }}</p>
        <p class="mt-2 text-3xl font-semibold" :class="card.tone || 'text-white'">{{ card.value }}</p>
        <p v-if="card.hint" class="mt-1 text-xs text-zinc-500">{{ card.hint }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiErrorMessage } from '~/utils/api-error-message'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Operação' })

const { request } = useApi()
const loading = ref(true)
const error = ref('')
const data = ref<Record<string, number> | null>(null)

const cards = computed(() => {
  const d = data.value || {}
  return [
    { to: '/admin/cadastros', label: 'KYC pendente', value: d.kyc_pending ?? 0, hint: d.kyc_overdue ? `${d.kyc_overdue} atrasado(s)` : 'Fila de análise', tone: d.kyc_overdue ? 'text-red-400' : 'text-white' },
    { to: '/admin/cadastros?form_status=draft', label: 'Rascunhos', value: d.drafts ?? 0, hint: 'Cadastro incompleto' },
    { to: '/admin/cadastros?queue=pix_pendente', label: 'PIX cadastro pendente', value: d.pix_pending_registration ?? 0 },
    { to: '/admin/financeiro?payment_status=pending', label: 'PIX no financeiro', value: d.payments_pending ?? 0, hint: d.payments_today_count ? `${d.payments_today_count} pagos hoje` : 'Aguardando confirmação' },
    { to: '/admin/midias', label: 'Mídias pendentes', value: d.media_pending ?? 0 },
    { to: '/admin/texto-perfil', label: 'Nome e bio', value: d.portal_text_pending ?? 0 },
    { to: '/admin/comentarios', label: 'Comentários', value: d.comments_pending ?? 0 },
    { to: '/admin/chamados?overdue=yes', label: 'Chamados atrasados', value: d.tickets_overdue ?? 0, hint: `${d.tickets_open ?? 0} abertos`, tone: d.tickets_overdue ? 'text-red-400' : 'text-white' },
    { to: '/admin/contato?read=unread', label: 'Contato não lido', value: d.contact_unread ?? 0 },
    { to: '/admin/anunciantes', label: 'Exclusões agendadas', value: d.scheduled_deletions ?? 0 },
  ]
})

onMounted(async () => {
  try {
    data.value = await request('/v1/admin/dashboard')
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Não foi possível carregar o painel.')
  } finally {
    loading.value = false
  }
})
</script>
