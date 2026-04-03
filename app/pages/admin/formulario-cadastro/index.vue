<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-white">Formulários de cadastro</h1>
      <p class="mt-1 text-sm text-zinc-500">
        Configure o fluxo de pré-cadastro. As alterações ficam salvas neste navegador até integrarmos à API.
      </p>
    </div>

    <ul class="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
      <li
        v-for="f in forms"
        :key="f.id"
        class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <p class="font-medium text-white">{{ f.title }}</p>
          <p class="mt-1 line-clamp-2 text-sm text-zinc-500">{{ f.description || '—' }}</p>
          <p class="mt-1 text-xs text-zinc-600">{{ f.questions.length }} pergunta(s) · ID {{ f.id }}</p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <NuxtLink
            :to="`/admin/formulario-cadastro/${f.id}`"
            class="rounded border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            Editar formulário
          </NuxtLink>
          <NuxtLink
            :to="`/admin/formulario-cadastro/${f.id}/perguntas`"
            class="rounded border border-brand/50 bg-brand/15 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/25"
          >
            Perguntas
          </NuxtLink>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

useHead({ title: 'Formulários de cadastro' })

const { forms, hydrate } = useRegistrationFormBuilder()

onMounted(() => hydrate())
</script>
