<template>
  <div class="mx-auto max-w-md space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-white">Recuperar senha</h1>
      <p class="mt-1 text-sm text-zinc-400">
        Informe o e-mail da sua conta. Se estiver cadastrado, enviaremos um link para redefinir a senha.
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-300" for="email">E-mail</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-brand focus:ring-2"
        />
      </div>
      <p v-if="infoMsg" class="text-sm text-emerald-400">{{ infoMsg }}</p>
      <p v-if="errorMsg" class="text-sm text-red-400">{{ errorMsg }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-muted disabled:opacity-50"
      >
        {{ loading ? 'Enviando…' : 'Enviar link' }}
      </button>
    </form>

    <p class="text-center text-sm text-zinc-500">
      <NuxtLink to="/login" class="text-brand hover:underline">Voltar para entrar</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/entrar/recuperar',
})

useHead({
  title: 'Recuperar senha',
})

const email = ref('')
const infoMsg = ref<string | null>(null)
const errorMsg = ref<string | null>(null)
const { forgotPassword, loading, error } = useAuth()

async function onSubmit() {
  infoMsg.value = null
  errorMsg.value = null
  try {
    const res = await forgotPassword(email.value)
    infoMsg.value = res.message
  } catch (e: unknown) {
    errorMsg.value = error.value ?? apiErrorMessage(e, 'Não foi possível enviar. Tente novamente.')
  }
}

function apiErrorMessage(e: unknown, fallback: string): string {
  const d = (e as { data?: { errors?: Record<string, string[]>; message?: string } }).data
  if (d?.errors?.email?.[0]) {
    return d.errors.email[0]
  }
  if (typeof d?.message === 'string') {
    return d.message
  }
  return fallback
}
</script>
