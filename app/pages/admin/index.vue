<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">Administração</h1>
      <button
        type="button"
        class="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        @click="logoutAndGo"
      >
        Sair
      </button>
    </div>

    <p v-if="!ready" class="text-zinc-400">Carregando…</p>
    <p v-else-if="forbidden" class="text-red-400">Acesso restrito a administradores.</p>

    <template v-else>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="rounded-lg border px-3 py-1.5 text-sm"
          :class="
            statusFilter === f.value
              ? 'border-brand bg-brand/20 text-white'
              : 'border-zinc-700 text-zinc-400'
          "
          @click="statusFilter = f.value; load()"
        >
          {{ f.label }}
        </button>
      </div>

      <ul class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
        <li v-for="row in items" :key="row.id" class="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-medium text-white">{{ row.user?.name || row.professional_name || 'Perfil' }}</p>
            <p class="text-xs text-zinc-500">Status: {{ row.approval_status }} · Formulário: {{ row.form_status }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
              @click="setStatus(row.id, 'approved')"
            >
              Aprovar
            </button>
            <button
              type="button"
              class="rounded bg-zinc-700 px-2 py-1 text-xs text-white"
              @click="setStatus(row.id, 'rejected')"
            >
              Recusar
            </button>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { request } = useApi()
const { fetchMe, logout, user } = useAuth()
const ready = ref(false)
const forbidden = ref(false)
const statusFilter = ref('pending')
const items = ref<
  {
    id: number
    professional_name: string | null
    approval_status: string
    form_status: string
    user?: { name: string }
  }[]
>([])

const filters = [
  { value: 'pending', label: 'Pendentes' },
  { value: 'approved', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'all', label: 'Todos' },
]

async function load() {
  const q = statusFilter.value === 'all' ? 'all' : statusFilter.value
  const res = await request<{ data: typeof items.value }>(
    `/v1/admin/profiles?approval_status=${encodeURIComponent(q)}`,
  )
  items.value = res.data
}

async function setStatus(id: number, approval_status: 'approved' | 'rejected') {
  await request(`/v1/admin/profiles/${id}`, {
    method: 'PATCH',
    body: { approval_status },
  })
  await load()
}

async function logoutAndGo() {
  await logout()
  await navigateTo('/login')
}

onMounted(async () => {
  await fetchMe()
  ready.value = true
  if (user.value?.role !== 'admin') {
    forbidden.value = true
    return
  }
  await load()
})
</script>
