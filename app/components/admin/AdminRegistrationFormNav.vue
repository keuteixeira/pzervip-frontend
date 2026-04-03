<template>
  <div class="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
    <NuxtLink
      to="/admin/formulario-cadastro"
      class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
      :class="
        active === 'list'
          ? 'border-brand bg-brand/20 text-white'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      "
    >
      ← Formulários
    </NuxtLink>
    <NuxtLink
      :to="basePath"
      class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
      :class="
        active === 'form'
          ? 'border-brand bg-brand/20 text-white'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      "
    >
      Dados do formulário
    </NuxtLink>
    <NuxtLink
      :to="`${basePath}/perguntas`"
      class="rounded-lg border px-3 py-1.5 text-sm transition-colors"
      :class="
        active === 'questions' || active === 'question'
          ? 'border-brand bg-brand/20 text-white'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      "
    >
      Perguntas
    </NuxtLink>
    <span v-if="active === 'question'" class="text-xs text-zinc-600">· edição de pergunta</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  formId: string | number
  active: 'list' | 'form' | 'questions' | 'question'
}>()

const basePath = computed(() => `/admin/formulario-cadastro/${String(props.formId)}`)
</script>
