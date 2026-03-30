<template>
  <div class="mx-auto max-w-2xl pb-8">
    <header class="border-b border-zinc-800 pb-8">
      <h1 class="text-3xl font-bold text-white">Contato</h1>
      <p class="mt-2 text-zinc-400">
        Envie a sua mensagem. Para denúncias de perfil ou conteúdo, escolha a opção indicada e, se possível,
        inclua o link ou identificação do anúncio.
      </p>
    </header>

    <form class="mt-10 space-y-6" @submit.prevent="onSubmit">
      <div>
        <label class="mb-2 block text-sm font-medium text-zinc-300" for="subject-type">Assunto</label>
        <select
          id="subject-type"
          v-model="form.subjectType"
          required
          class="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="" disabled>Selecione…</option>
          <option
            v-for="opt in subjectOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div v-if="form.subjectType === 'denuncia_perfil'" class="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-sm text-amber-100/90">
        <p class="font-medium text-amber-200">Denúncia</p>
        <p class="mt-1 text-amber-100/80">
          Indique o link do perfil ou o nome profissional visível no site. A nossa equipa analisa cada caso com
          discrição.
        </p>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-zinc-300" for="profile-ref">
          Link ou referência do perfil (opcional)
        </label>
        <input
          id="profile-ref"
          v-model="form.profileRef"
          type="text"
          class="input"
          placeholder="Ex.: URL do perfil ou nome do anúncio"
          autocomplete="off"
        />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-2 block text-sm font-medium text-zinc-300" for="name">Nome</label>
          <input id="name" v-model="form.name" type="text" required class="input" placeholder="O seu nome" />
        </div>
        <div class="sm:col-span-2">
          <label class="mb-2 block text-sm font-medium text-zinc-300" for="email">E-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="input"
            placeholder="email@exemplo.com"
            autocomplete="email"
          />
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-zinc-300" for="message">Mensagem</label>
        <textarea
          id="message"
          v-model="form.message"
          required
          rows="6"
          class="input min-h-[140px] resize-y"
          placeholder="Escreva aqui a sua mensagem…"
        />
      </div>

      <p v-if="sent" class="rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
        Mensagem recebida. Obrigado — em breve ligaremos este formulário ao backend para resposta automática.
      </p>
      <p v-if="errorMsg" class="text-sm text-red-400">{{ errorMsg }}</p>

      <button
        type="submit"
        class="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        :disabled="sending"
      >
        {{ sending ? 'Enviando…' : 'Enviar mensagem' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/contato',
})

useHead({
  title: 'Contato',
})

const subjectOptions = [
  { value: 'denuncia_perfil', label: 'Denúncia de perfil ou conteúdo' },
  { value: 'duvida_geral', label: 'Dúvida geral' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'problema_tecnico', label: 'Problema técnico no site' },
  { value: 'conta_anunciante', label: 'Conta de anunciante / pagamentos' },
  { value: 'outro', label: 'Outro assunto' },
] as const

const form = reactive({
  subjectType: '' as '' | (typeof subjectOptions)[number]['value'],
  profileRef: '',
  name: '',
  email: '',
  message: '',
})

const sending = ref(false)
const sent = ref(false)
const errorMsg = ref<string | null>(null)

async function onSubmit() {
  errorMsg.value = null
  sending.value = true
  try {
    await new Promise((r) => setTimeout(r, 600))
    sent.value = true
    form.subjectType = ''
    form.profileRef = ''
    form.name = ''
    form.email = ''
    form.message = ''
  } catch {
    errorMsg.value = 'Não foi possível enviar. Tente novamente mais tarde.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.input {
  @apply w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
