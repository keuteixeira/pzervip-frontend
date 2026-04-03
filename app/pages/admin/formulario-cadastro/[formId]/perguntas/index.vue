<template>
  <div class="space-y-6">
    <AdminRegistrationFormNav :form-id="formId" active="questions" />

    <div v-if="!form">
      <p class="text-sm text-amber-400">Formulário não encontrado.</p>
      <NuxtLink to="/admin/formulario-cadastro" class="mt-2 inline-block text-sm text-brand hover:underline">
        Voltar à listagem
      </NuxtLink>
    </div>

    <template v-else>
      <div>
        <h1 class="text-2xl font-bold text-white">Perguntas</h1>
        <p class="mt-1 text-sm text-zinc-500">
          Crie uma pergunta e continue na lista — sem redirecionar para a edição. Abra a edição só quando for ajustar
          regras por campo.
        </p>
      </div>

      <p v-if="flashOk" class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
        Pergunta criada. Você pode criar outra abaixo ou editar regras quando quiser.
      </p>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Nova pergunta</h2>
        <p class="mt-1 text-sm text-zinc-500">Campos básicos. Opções e regras ficam na edição da pergunta.</p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Chave interna (slug)</span>
            <input v-model="create.key" type="text" class="admin-input" placeholder="ex.: telefone_comercial" />
          </label>
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Texto da pergunta</span>
            <input v-model="create.label" type="text" class="admin-input" placeholder="Exibido no formulário" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Tipo</span>
            <select v-model="create.field_type" class="admin-input">
              <option value="text">Texto curto</option>
              <option value="textarea">Texto longo</option>
              <option value="number">Número</option>
              <option value="select">Seleção</option>
              <option value="checkbox">Caixa de seleção</option>
            </select>
          </label>
          <label class="flex items-center gap-2 self-end text-sm text-zinc-300 pb-2">
            <input v-model="create.required" type="checkbox" class="rounded border-zinc-600" />
            Obrigatório
          </label>
        </div>
        <p v-if="createError" class="mt-3 text-sm text-red-400">{{ createError }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          :disabled="createBusy"
          @click="submitCreate"
        >
          {{ createBusy ? 'Criando…' : 'Criar pergunta' }}
        </button>
      </section>

      <section>
        <h2 class="text-sm font-medium uppercase tracking-wide text-zinc-500">Lista</h2>
        <ul class="mt-3 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          <li
            v-for="q in sortedQuestions"
            :key="q.id"
            class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0">
              <p class="font-medium text-white">{{ q.label }}</p>
              <p class="text-xs text-zinc-500">
                <span class="font-mono text-zinc-400">{{ q.key }}</span>
                · {{ typeLabel(q.field_type) }} · {{ q.required ? 'obrigatório' : 'opcional' }} · ID {{ q.id }}
              </p>
            </div>
            <div class="flex shrink-0 flex-wrap gap-2">
              <NuxtLink
                :to="`/admin/formulario-cadastro/${formId}/perguntas/${q.id}`"
                class="rounded border border-brand/50 bg-brand/15 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/25"
              >
                Editar regras
              </NuxtLink>
            </div>
          </li>
          <li v-if="sortedQuestions.length === 0" class="px-4 py-8 text-center text-sm text-zinc-500">
            Nenhuma pergunta ainda. Use o formulário acima para criar a primeira.
          </li>
        </ul>
      </section>

      <div class="flex flex-wrap gap-2">
        <NuxtLink
          :to="`/admin/formulario-cadastro/${formId}`"
          class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        >
          Dados do formulário
        </NuxtLink>
        <NuxtLink
          to="/admin/formulario-cadastro"
          class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        >
          Voltar à listagem
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { RegFieldType, RegFormQuestion } from '~/composables/useRegistrationFormBuilder'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

const route = useRoute()
const formId = computed(() => Number(route.params.formId))

const { hydrate, getForm, addQuestion } = useRegistrationFormBuilder()

const form = computed(() => (Number.isFinite(formId.value) ? getForm(formId.value) : null))

const sortedQuestions = computed(() => {
  const qs = form.value?.questions ?? []
  return [...qs].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
})

const create = reactive({
  key: '',
  label: '',
  field_type: 'text' as RegFieldType,
  required: false,
})
const createBusy = ref(false)
const createError = ref('')
const flashOk = ref(false)

let flashTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  hydrate()
})

onUnmounted(() => {
  if (flashTimer) {
    clearTimeout(flashTimer)
  }
})

useHead(() => ({ title: form.value ? `Perguntas — ${form.value.title}` : 'Perguntas' }))

function typeLabel(t: RegFormQuestion['field_type']) {
  const map: Record<string, string> = {
    text: 'Texto curto',
    textarea: 'Texto longo',
    number: 'Número',
    select: 'Seleção',
    checkbox: 'Checkbox',
  }
  return map[t] ?? t
}

function submitCreate() {
  createError.value = ''
  if (!create.key.trim() || !create.label.trim()) {
    createError.value = 'Preencha a chave e o texto da pergunta.'
    return
  }
  createBusy.value = true
  try {
    const q = addQuestion(formId.value, {
      key: create.key,
      label: create.label,
      field_type: create.field_type,
      required: create.required,
    })
    if (!q) {
      createError.value = 'Não foi possível criar.'
      return
    }
    create.key = ''
    create.label = ''
    create.field_type = 'text'
    create.required = false
    flashOk.value = true
    if (flashTimer) {
      clearTimeout(flashTimer)
    }
    flashTimer = setTimeout(() => {
      flashOk.value = false
    }, 6000)
  } finally {
    createBusy.value = false
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
