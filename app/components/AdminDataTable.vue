<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <input
        :value="q"
        type="search"
        :placeholder="searchPlaceholder"
        class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white lg:max-w-md"
        @input="$emit('update:q', ($event.target as HTMLInputElement).value)"
      />
      <div class="flex flex-wrap gap-2">
        <slot name="filters" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
    <p v-if="loading && total === 0" class="text-sm text-zinc-400">Carregando…</p>

    <div v-else-if="variant === 'table'" class="overflow-x-auto rounded-xl border border-zinc-800">
      <table class="min-w-full divide-y divide-zinc-800 text-left text-sm">
        <thead class="bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <slot name="head" />
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800">
          <slot />
        </tbody>
      </table>
      <p v-if="!loading && total === 0" class="px-4 py-8 text-center text-sm text-zinc-500">{{ emptyText }}</p>
    </div>

    <div v-else class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <slot />
      <p v-if="!loading && total === 0" class="px-4 py-8 text-center text-sm text-zinc-500">{{ emptyText }}</p>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
      <p v-if="total > 0">{{ from }}–{{ to }} de {{ total }}</p>
      <p v-else>&nbsp;</p>
      <div class="flex flex-wrap items-center gap-2">
        <select
          :value="perPage"
          class="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
          @change="$emit('update:perPage', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }} / pág.</option>
        </select>
        <button
          type="button"
          class="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
          :disabled="page <= 1 || loading"
          @click="$emit('page', page - 1)"
        >
          Anterior
        </button>
        <span>Página {{ page }} / {{ lastPage }}</span>
        <button
          type="button"
          class="rounded border border-zinc-700 px-3 py-1 disabled:opacity-40"
          :disabled="page >= lastPage || loading"
          @click="$emit('page', page + 1)"
        >
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    q: string
    page: number
    lastPage: number
    perPage: number
    total: number
    from: number
    to: number
    loading?: boolean
    error?: string
    searchPlaceholder?: string
    emptyText?: string
    variant?: 'table' | 'stack'
    perPageOptions?: number[]
  }>(),
  {
    loading: false,
    error: '',
    searchPlaceholder: 'Pesquisar…',
    emptyText: 'Nenhum registro neste filtro.',
    variant: 'table',
    perPageOptions: () => [10, 20, 50],
  },
)

defineEmits<{
  'update:q': [string]
  'update:perPage': [number]
  page: [number]
}>()
</script>
