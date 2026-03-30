<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Destaques (pedidos)</h1>
      <p class="mt-1 text-sm text-zinc-500">Pagamentos de upgrade de estrelas / período.</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        class="rounded-lg border px-3 py-1.5 text-sm"
        :class="
          payFilter === f.value ? 'border-brand bg-brand/20 text-white' : 'border-zinc-700 text-zinc-400'
        "
        @click="payFilter = f.value; page = 1; load()"
      >
        {{ f.label }}
      </button>
    </div>

    <p v-if="loading" class="text-zinc-400">Carregando…</p>

    <div v-else class="overflow-x-auto rounded-xl border border-zinc-800">
      <table class="min-w-full divide-y divide-zinc-800 text-left text-sm">
        <thead class="bg-zinc-900/80 text-xs uppercase text-zinc-500">
          <tr>
            <th class="px-4 py-3">ID</th>
            <th class="px-4 py-3">Quando</th>
            <th class="px-4 py-3">Usuário</th>
            <th class="px-4 py-3">Gateway</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Valor</th>
            <th class="px-4 py-3">Estrelas</th>
            <th class="px-4 py-3">Meses</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800">
          <tr v-for="o in items" :key="o.id" class="text-zinc-300">
            <td class="px-4 py-3 font-mono text-xs">{{ o.id }}</td>
            <td class="px-4 py-3 text-xs text-zinc-500">{{ formatDate(o.created_at) }}</td>
            <td class="px-4 py-3">
              <span v-if="o.user">{{ o.user.name }}</span>
              <span v-else class="text-zinc-600">—</span>
            </td>
            <td class="px-4 py-3">{{ adminGatewayLabel(o.gateway) }}</td>
            <td class="px-4 py-3">{{ adminPaymentStatusLabel(o.payment_status) }}</td>
            <td class="px-4 py-3">{{ formatBrl(o.amount_brl) }}</td>
            <td class="px-4 py-3">{{ o.stars }}</td>
            <td class="px-4 py-3">{{ o.period_months ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="!loading && items.length === 0" class="text-zinc-500">Nenhum pedido neste filtro.</p>

    <div v-if="meta && meta.last_page > 1" class="flex items-center justify-center gap-4 text-sm text-zinc-400">
      <button
        type="button"
        class="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        :disabled="page <= 1"
        @click="page--; load()"
      >
        Anterior
      </button>
      <span>Página {{ meta.current_page }} / {{ meta.last_page }}</span>
      <button
        type="button"
        class="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
        :disabled="page >= meta.last_page"
        @click="page++; load()"
      >
        Próxima
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { filterMockHighlightOrders } from '~/data/admin-mocks'
import { adminGatewayLabel, adminPaymentStatusLabel } from '~/utils/admin-labels'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

useHead({ title: 'Destaques' })

const { request } = useApi()
const { isMock } = useAdminMock()

const payFilter = ref('all')
const page = ref(1)
const loading = ref(true)

const items = ref<
  {
    id: number
    uuid?: string
    gateway: string
    amount_brl: string | number
    stars: number
    period_months?: number | null
    payment_status: string
    created_at: string
    user?: { name: string; email?: string }
  }[]
>([])

const meta = ref<{ current_page: number; last_page: number } | null>(null)

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Pagos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'failed', label: 'Falhou' },
]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}

function formatBrl(v: string | number) {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)
}

async function load() {
  loading.value = true
  try {
    if (isMock.value) {
      items.value = filterMockHighlightOrders(payFilter.value) as typeof items.value
      meta.value = { current_page: 1, last_page: 1 }
      return
    }
    const qs = new URLSearchParams({ page: String(page.value) })
    if (payFilter.value !== 'all') {
      qs.set('payment_status', payFilter.value)
    }
    const res = await request<{
      data: typeof items.value
      current_page: number
      last_page: number
    }>(`/v1/admin/highlight-orders?${qs.toString()}`)
    items.value = res.data
    meta.value = { current_page: res.current_page, last_page: res.last_page }
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

watch(isMock, () => load())
</script>
