<template>
  <div class="space-y-6">
    <AdminRegistrationFormNav :form-id="formId" active="form" />

    <div v-if="!form">
      <p class="text-sm text-amber-400">Formulário não encontrado.</p>
      <NuxtLink to="/admin/formulario-cadastro" class="mt-2 inline-block text-sm text-brand hover:underline">
        Voltar à listagem
      </NuxtLink>
    </div>

    <template v-else>
      <div>
        <h1 class="text-2xl font-bold text-white">Dados do formulário</h1>
        <p class="mt-1 text-sm text-zinc-500">Título e descrição interna. Perguntas ficam na aba «Perguntas».</p>
      </div>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div class="grid gap-4 sm:max-w-xl">
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Título</span>
            <input v-model="title" type="text" class="admin-input" maxlength="191" />
          </label>
          <label class="block text-sm text-zinc-300">
            <span class="mb-1 block text-zinc-500">Descrição (interna)</span>
            <textarea v-model="description" rows="3" class="admin-input min-h-[80px]" />
          </label>
        </div>
        <p v-if="saveMsg" class="mt-4 text-sm" :class="saveOk ? 'text-emerald-400' : 'text-red-400'">{{ saveMsg }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </button>
      </section>

      <div class="flex flex-wrap gap-2">
        <NuxtLink
          :to="`/admin/formulario-cadastro/${formId}/perguntas`"
          class="rounded-lg border border-brand/50 bg-brand/15 px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/25"
        >
          Ir para perguntas
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
definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

const route = useRoute()
const formId = computed(() => Number(route.params.formId))

const { hydrate, getForm, updateFormMeta } = useRegistrationFormBuilder()

const form = computed(() => (Number.isFinite(formId.value) ? getForm(formId.value) : null))

const title = ref('')
const description = ref('')
const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)

function syncFromForm() {
  const f = form.value
  if (!f) {
    return
  }
  title.value = f.title
  description.value = f.description
}

onMounted(() => {
  hydrate()
  syncFromForm()
})

watch(form, () => syncFromForm(), { immediate: true })

useHead(() => ({ title: form.value ? `Formulário — ${form.value.title}` : 'Formulário' }))

async function save() {
  saveMsg.value = ''
  saving.value = true
  try {
    const ok = updateFormMeta(formId.value, title.value, description.value)
    saveOk.value = ok
    saveMsg.value = ok ? 'Salvo.' : 'Não foi possível salvar.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-input {
  @apply w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
