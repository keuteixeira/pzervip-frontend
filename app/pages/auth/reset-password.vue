<template>
  <div class="mx-auto max-w-md space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-white">Nova senha</h1>
      <p class="mt-1 text-sm text-zinc-400">Defina uma nova senha para a conta <strong class="text-zinc-300">{{ emailDisplay }}</strong>.</p>
    </div>

    <form v-if="token && emailFromQuery" class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-300" for="password">Nova senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
          class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-brand focus:ring-2"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-300" for="password_confirmation">Confirmar senha</label>
        <input
          id="password_confirmation"
          v-model="passwordConfirmation"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
          class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-brand focus:ring-2"
        />
      </div>
      <p v-if="errorMsg" class="text-sm text-red-400">{{ errorMsg }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-muted disabled:opacity-50"
      >
        {{ loading ? 'Salvando…' : 'Redefinir senha' }}
      </button>
    </form>

    <div v-else class="rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-200">
      <p>Link inválido ou incompleto. Abra o link enviado por e-mail ou solicite um novo em “Esqueci a senha”.</p>
      <p class="mt-3">
        <NuxtLink to="/entrar/recuperar" class="font-medium text-brand hover:underline">Recuperar senha</NuxtLink>
      </p>
    </div>

    <p class="text-center text-sm text-zinc-500">
      <NuxtLink to="/login" class="text-brand hover:underline">Ir para entrar</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/entrar/redefinir',
})

const route = useRoute()
const token = computed(() => {
  const t = route.query.token
  return typeof t === 'string' && t.length > 0 ? t : ''
})
const emailFromQuery = computed(() => {
  const e = route.query.email
  return typeof e === 'string' && e.length > 0 ? decodeURIComponent(e) : ''
})
const emailDisplay = computed(() => emailFromQuery.value || '—')

const password = ref('')
const passwordConfirmation = ref('')
const errorMsg = ref<string | null>(null)
const { resetPassword, loading, error } = useAuth()

async function onSubmit() {
  errorMsg.value = null
  if (password.value.length < 8) {
    errorMsg.value = 'A senha deve ter no mínimo 8 caracteres.'
    return
  }
  if (password.value !== passwordConfirmation.value) {
    errorMsg.value = 'As senhas não coincidem.'
    return
  }
  try {
    const res = await resetPassword({
      token: token.value,
      email: emailFromQuery.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    await navigateTo({ path: '/login', query: { ok: '1', m: encodeURIComponent(res.message) } })
  } catch (e: unknown) {
    errorMsg.value = apiErrorMessage(e, error.value ?? 'Não foi possível redefinir. Tente novamente.')
  }
}

function apiErrorMessage(e: unknown, fallback: string): string {
  const d = (e as { data?: { errors?: Record<string, string[]>; message?: string } }).data
  if (d?.errors?.email?.[0]) {
    return d.errors.email[0]
  }
  if (d?.errors?.password?.[0]) {
    return d.errors.password[0]
  }
  if (typeof d?.message === 'string') {
    return d.message
  }
  return fallback
}
</script>
