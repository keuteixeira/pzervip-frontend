<template>
  <div class="space-y-6">
    <AdminRegistrationFormNav :form-id="formId" active="question" />

    <div v-if="!form || !question">
      <p class="text-sm text-amber-400">Pergunta não encontrada.</p>
      <NuxtLink
        :to="`/admin/formulario-cadastro/${formId}/perguntas`"
        class="mt-2 inline-block text-sm text-brand hover:underline"
      >
        ← Voltar às perguntas
      </NuxtLink>
    </div>

    <template v-else>
      <div>
        <h1 class="text-2xl font-bold text-white">Editar pergunta</h1>
        <p class="mt-1 text-sm text-zinc-500">
          Ajuste tipo, obrigatoriedade, opções (para seleção) e notas de regra. ID {{ question.id }}
        </p>
      </div>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Chave interna</span>
            <input v-model="edit.key" type="text" class="admin-input font-mono" />
          </label>
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Texto da pergunta</span>
            <input v-model="edit.label" type="text" class="admin-input" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Tipo</span>
            <select v-model="edit.field_type" class="admin-input">
              <option value="text">Texto curto</option>
              <option value="textarea">Texto longo</option>
              <option value="number">Número</option>
              <option value="select">Seleção</option>
              <option value="checkbox">Caixa de seleção</option>
            </select>
          </label>
          <label class="flex items-center gap-2 self-end text-sm text-zinc-300 pb-2">
            <input v-model="edit.required" type="checkbox" class="rounded border-zinc-600" />
            Obrigatório
          </label>
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Opções (uma por linha, só para tipo «Seleção»)</span>
            <textarea v-model="optionsText" rows="4" class="admin-input min-h-[96px] font-mono text-xs" />
          </label>
          <label class="block text-sm text-zinc-300 sm:col-span-2">
            <span class="mb-1 block text-zinc-500">Notas de regras / validação (interno)</span>
            <textarea v-model="edit.rules_note" rows="3" class="admin-input min-h-[80px]" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Ordem na lista</span>
            <input v-model.number="edit.sort_order" type="number" min="0" class="admin-input" />
          </label>
        </div>
        <p v-if="saveMsg" class="mt-4 text-sm" :class="saveOk ? 'text-emerald-400' : 'text-red-400'">{{ saveMsg }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? 'Salvando…' : 'Salvar' }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-red-800/60 bg-red-950/40 px-4 py-2 text-sm text-red-200 hover:bg-red-950/60 disabled:opacity-50"
            :disabled="removing"
            @click="remove"
          >
            {{ removing ? 'Removendo…' : 'Excluir pergunta' }}
          </button>
        </div>
      </section>

      <div class="flex flex-wrap gap-2">
        <NuxtLink
          :to="`/admin/formulario-cadastro/${formId}/perguntas`"
          class="rounded-lg border border-brand/50 bg-brand/15 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/25"
        >
          ← Voltar às perguntas
        </NuxtLink>
        <NuxtLink
          :to="`/admin/formulario-cadastro/${formId}`"
          class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        >
          Dados do formulário
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSwal } from '~/composables/useSwal'
import type { RegFieldType } from '~/composables/useRegistrationFormBuilder'

definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

const route = useRoute()
const formId = computed(() => Number(route.params.formId))
const questionId = computed(() => Number(route.params.questionId))

const { hydrate, getForm, getQuestion, updateQuestion, removeQuestion } = useRegistrationFormBuilder()
const { swalConfirm } = useSwal()

const form = computed(() => (Number.isFinite(formId.value) ? getForm(formId.value) : null))
const question = computed(() =>
  Number.isFinite(formId.value) && Number.isFinite(questionId.value)
    ? getQuestion(formId.value, questionId.value)
    : null,
)

const edit = reactive({
  key: '',
  label: '',
  field_type: 'text' as RegFieldType,
  required: false,
  rules_note: '',
  sort_order: 0,
})
const optionsText = ref('')
const saving = ref(false)
const removing = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)

function sync() {
  const q = question.value
  if (!q) {
    return
  }
  edit.key = q.key
  edit.label = q.label
  edit.field_type = q.field_type
  edit.required = q.required
  edit.rules_note = q.rules_note
  edit.sort_order = q.sort_order
  optionsText.value = (q.options ?? []).join('\n')
}

onMounted(() => {
  hydrate()
  sync()
})

watch(question, () => sync(), { immediate: true })

useHead(() => ({ title: question.value ? `Pergunta — ${question.value.label}` : 'Pergunta' }))

function parseOptions(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

async function save() {
  saveMsg.value = ''
  saving.value = true
  try {
    const ok = updateQuestion(formId.value, questionId.value, {
      key: edit.key.trim(),
      label: edit.label.trim(),
      field_type: edit.field_type,
      required: edit.required,
      rules_note: edit.rules_note.trim(),
      sort_order: Math.max(0, Number(edit.sort_order) || 0),
      options: parseOptions(optionsText.value),
    })
    saveOk.value = ok
    saveMsg.value = ok ? 'Salvo.' : 'Não foi possível salvar.'
  } finally {
    saving.value = false
  }
}

async function remove() {
  const ok = await swalConfirm({
    title: 'Excluir esta pergunta?',
    text: 'Esta ação remove a pergunta do rascunho do formulário neste navegador.',
    icon: 'warning',
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
  })
  if (!ok) {
    return
  }
  removing.value = true
  try {
    removeQuestion(formId.value, questionId.value)
    await navigateTo(`/admin/formulario-cadastro/${formId.value}/perguntas`)
  } finally {
    removing.value = false
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
