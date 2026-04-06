<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Cadastros</h1>
      <p class="mt-1 text-sm text-zinc-500">
        Pré-cadastros e análise KYC. Aprovação ou recusa só na ficha do cadastro, após revisão dos dados e mídias.
      </p>
    </div>

    <div class="space-y-3">
      <p class="text-xs font-medium tracking-wide text-zinc-500">Status</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in statusFilters"
          :key="f.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm"
          :class="
            statusFilter === f.value ? 'border-brand bg-brand/20 text-white' : 'border-zinc-700 text-zinc-400'
          "
          @click="statusFilter = f.value; page = 1; load()"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <p class="text-xs font-medium tracking-wide text-zinc-500">Tipo</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in queueFilters"
          :key="f.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm"
          :class="
            queueFilter === f.value ? 'border-amber-500/60 bg-amber-500/15 text-amber-100' : 'border-zinc-700 text-zinc-400'
          "
          @click="queueFilter = f.value; page = 1; load()"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <p v-if="listError" class="text-sm text-red-400">{{ listError }}</p>

    <ul class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li
        v-for="row in items"
        :key="row.id"
        class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        :class="row.priority_destaque_paid
          ? 'border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-500/10 to-transparent'
          : ''"
      >
        <div class="min-w-0 flex-1 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-medium text-white">{{ row.user?.name || row.professional_name || 'Perfil' }}</p>
            <span
              v-if="row.priority_destaque_paid"
              class="inline-flex items-center gap-1 rounded-full bg-amber-500/25 px-2 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/40"
            >
              <span class="text-amber-300" aria-hidden="true">★</span>
              Destaque pago
            </span>
            <span
              v-else
              class="rounded-full border border-zinc-600 bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400"
            >
              Gratuito
            </span>
          </div>
          <p class="text-xs text-zinc-500">
            Cadastro: {{ adminApprovalStatusLabel(row.approval_status) }} · Formulário:
            {{ adminFormStatusLabel(row.form_status) }} · ID {{ row.id }}
          </p>
          <p
            v-if="row.approval_status === 'pending' && row.analysis_deadline_at"
            class="text-xs"
            :class="row.analysis_is_overdue ? 'font-medium text-red-400' : 'text-zinc-400'"
          >
            <span class="text-zinc-500">Prazo de análise:</span>
            {{ formatDeadline(row.analysis_deadline_at) }}
            <span v-if="row.analysis_business_days_allowed != null" class="text-zinc-600">
              ({{ row.analysis_business_days_allowed }}
              {{ row.analysis_business_days_allowed === 1 ? 'dia útil' : 'dias úteis' }})
            </span>
            <span v-if="row.analysis_is_overdue" class="ml-1 text-red-400">— em atraso</span>
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            class="rounded border border-brand/50 bg-brand/15 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/25"
            @click="openCadastro(row.id)"
          >
            Visualizar
          </button>
        </div>
      </li>
    </ul>

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
import { adminApprovalStatusLabel, adminFormStatusLabel } from '~/utils/admin-labels'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Cadastros' })

const { request } = useApi()

type CadastroListRow = {
  id: number
  professional_name: string | null
  approval_status: string
  form_status: string
  user?: { name: string }
  public_slug?: string | null
  priority_destaque_paid?: boolean
  analysis_deadline_at?: string | null
  analysis_is_overdue?: boolean
  analysis_business_days_allowed?: number | null
}

const statusFilter = ref('pending')
const queueFilter = ref<'all' | 'gratuito' | 'destaque'>('all')
const page = ref(1)
const listError = ref<string | null>(null)
const items = ref<CadastroListRow[]>([])
const meta = ref<{ current_page: number; last_page: number; total: number } | null>(null)

const statusFilters = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

const queueFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'gratuito', label: 'Gratuitos' },
  { value: 'destaque', label: 'Destaques' },
] as const

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

async function load() {
  listError.value = null
  try {
    const q = statusFilter.value === 'all' ? 'all' : statusFilter.value
    const queue = queueFilter.value
    const queueParam = queue === 'all' ? '' : `&queue=${encodeURIComponent(queue)}`
    const res = await request<{
      data: CadastroListRow[]
      current_page: number
      last_page: number
      total: number
    }>(`/v1/admin/profiles?approval_status=${encodeURIComponent(q)}${queueParam}&page=${page.value}`)
    items.value = res.data
    meta.value = {
      current_page: res.current_page,
      last_page: res.last_page,
      total: res.total,
    }
  } catch {
    listError.value = 'Não foi possível carregar a lista.'
    items.value = []
    meta.value = null
  }
}

function openCadastro(id: number) {
  return navigateTo(`/admin/cadastros/${id}`)
}

onMounted(() => load())
</script>
