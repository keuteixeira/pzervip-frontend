<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Financeiro</h1>
      <p class="mt-1 text-sm text-zinc-500">
        PIX de cadastro premium e de destaque. Confirmar marca como pago; expirar libera a pessoa para gerar outro.
        Estorno no gateway ainda é manual (Woovi).
      </p>
    </div>

    <p v-if="actionMsg" class="text-sm" :class="actionOk ? 'text-emerald-400' : 'text-red-400'">{{ actionMsg }}</p>

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
      search-placeholder="Buscar por nome, e-mail, UUID ou código PIX"
      empty-text="Nenhum pagamento neste filtro."
      @update:q="onSearch"
      @update:per-page="list.setPerPage"
      @page="list.goToPage"
    >
      <template #filters>
        <select v-model="purpose" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" @change="reloadFirst">
          <option value="all">Todos os tipos</option>
          <option value="registration">Cadastro premium</option>
          <option value="destaque">Destaque</option>
        </select>
        <select v-model="paymentStatus" class="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" @change="reloadFirst">
          <option value="all">Todos status</option>
          <option value="pending">Pendentes</option>
          <option value="paid">Pagos</option>
          <option value="expired">Expirados</option>
          <option value="failed">Falhou</option>
        </select>
      </template>
      <template #head>
        <th class="px-4 py-3">Quando</th>
        <th class="px-4 py-3">Pessoa</th>
        <th class="px-4 py-3">Tipo</th>
        <th class="px-4 py-3">Status</th>
        <th class="px-4 py-3">Valor</th>
        <th class="px-4 py-3">PIX</th>
        <th class="px-4 py-3"></th>
      </template>
      <tr v-for="o in list.items.value" :key="o.id" class="text-zinc-300">
        <td class="px-4 py-3 text-xs text-zinc-500">{{ formatDate(o.created_at) }}</td>
        <td class="px-4 py-3">
          <p class="text-white">{{ o.user?.name || '—' }}</p>
          <p class="text-xs text-zinc-500">{{ o.user?.email }}</p>
          <NuxtLink
            v-if="o.advertiser_profile"
            :to="profileHref(o)"
            class="text-xs text-brand hover:underline"
          >
            {{ o.advertiser_profile.professional_name || 'Abrir perfil' }}
          </NuxtLink>
        </td>
        <td class="px-4 py-3">{{ adminPaymentPurposeLabel(o.purpose) }}</td>
        <td class="px-4 py-3">{{ adminPaymentStatusLabel(o.payment_status) }}</td>
        <td class="px-4 py-3">{{ formatBrl(o.amount_brl) }}</td>
        <td class="max-w-[220px] px-4 py-3 font-mono text-[11px] text-zinc-500">
          <span v-if="o.pix_copy_paste" class="break-all">{{ o.pix_copy_paste }}</span>
          <span v-else>—</span>
        </td>
        <td class="px-4 py-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-if="o.can_confirm"
              type="button"
              class="rounded bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-40"
              :disabled="busyId === o.id"
              @click="act(o.id, 'confirm')"
            >
              Confirmar
            </button>
            <button
              v-if="o.can_expire"
              type="button"
              class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 disabled:opacity-40"
              :disabled="busyId === o.id"
              @click="act(o.id, 'expire')"
            >
              Expirar
            </button>
          </div>
        </td>
      </tr>
    </AdminDataTable>
  </div>
</template>

<script setup lang="ts">
import { adminPaymentPurposeLabel, adminPaymentStatusLabel } from '~/utils/admin-labels'
import { apiErrorMessage } from '~/utils/api-error-message'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Financeiro' })

type OrderRow = {
  id: number
  purpose: string
  payment_status: string
  amount_brl: number
  pix_copy_paste?: string | null
  can_confirm: boolean
  can_expire: boolean
  created_at: string
  user?: { name?: string; email?: string }
  advertiser_profile?: { id: number; professional_name?: string | null }
}

const route = useRoute()
const { request } = useApi()
const purpose = ref(String(route.query.purpose || 'all'))
const paymentStatus = ref(String(route.query.payment_status || 'all'))
const actionMsg = ref('')
const actionOk = ref(true)
const busyId = ref<number | null>(null)

const list = useAdminList<OrderRow>({
  endpoint: '/v1/admin/highlight-orders',
  extraQuery: () => ({
    purpose: purpose.value,
    payment_status: paymentStatus.value,
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

function formatBrl(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

function profileHref(o: OrderRow) {
  if (o.purpose === 'registration_subscription') {
    return `/admin/cadastros/${o.advertiser_profile!.id}`
  }
  return `/admin/anunciantes/${o.advertiser_profile!.id}`
}

async function act(id: number, kind: 'confirm' | 'expire') {
  busyId.value = id
  actionMsg.value = ''
  try {
    await request(`/v1/admin/highlight-orders/${id}/${kind}`, { method: 'POST' })
    actionOk.value = true
    actionMsg.value = kind === 'confirm' ? 'Pagamento confirmado.' : 'PIX expirado.'
    await list.load()
  } catch (e: unknown) {
    actionOk.value = false
    actionMsg.value = apiErrorMessage(e, 'Não foi possível atualizar o pagamento.')
  } finally {
    busyId.value = null
  }
}

onMounted(() => list.load())
</script>
