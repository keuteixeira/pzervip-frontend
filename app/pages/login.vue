<template>
  <div class="mx-auto max-w-md space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-white">Entrar</h1>
      <p class="mt-1 text-sm text-zinc-400">Acesse sua conta e gerencie suas informações do perfil.</p>
    </div>

    <p
      v-if="resetOkMsg"
      class="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200"
      role="status"
    >
      {{ resetOkMsg }}
    </p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-300" for="identifier">E-mail ou CPF</label>
        <input
          id="identifier"
          v-model="identifier"
          type="text"
          required
          autocomplete="username"
          placeholder="seu@email.com ou 000.000.000-00"
          class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-brand focus:ring-2"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-zinc-300" for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-brand focus:ring-2"
        />
        <div class="mt-1.5 flex justify-end">
          <NuxtLink to="/entrar/recuperar" class="text-sm text-brand hover:underline">
            Esqueci a senha
          </NuxtLink>
        </div>
      </div>
      <p v-if="errorMsg" class="text-sm text-red-400">{{ errorMsg }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-muted disabled:opacity-50"
      >
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>

    <div
      v-if="isDev"
      class="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-400"
    >
      <p class="font-medium text-zinc-300">Ambiente de desenvolvimento</p>
      <p class="mt-1">
        Conta demo (rode no backend:
        <code class="rounded bg-zinc-800 px-1 py-0.5 text-xs">php artisan db:seed --class=DemoAdvertiserSeeder</code>
        ):
      </p>
      <p class="mt-2 font-mono text-xs text-zinc-300">{{ demoEmail }} / {{ demoPassword }}</p>
      <button
        type="button"
        class="mt-3 w-full rounded-lg border border-zinc-600 py-2 text-zinc-200 transition hover:bg-zinc-800"
        @click="fillDemo"
      >
        Preencher e-mail e senha demo
      </button>
    </div>

    <p class="text-center text-sm text-zinc-500">
      Novo por aqui?
      <NuxtLink to="/cadastro" class="text-brand hover:underline">Criar conta</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
/** Public URL: /login — `app/pages/login.vue`. */

definePageMeta({
  layout: 'default',
  path: '/login',
})

const route = useRoute()
const identifier = ref('')
const password = ref('')
const { login, loading, error, user } = useAuth()
const errorMsg = ref<string | null>(null)

const resetOkMsg = computed(() => {
  if (route.query.ok !== '1') {
    return ''
  }
  const m = route.query.m
  if (typeof m === 'string' && m.length > 0) {
    try {
      return decodeURIComponent(m)
    } catch {
      return 'Senha redefinida. Você já pode entrar.'
    }
  }
  return 'Senha redefinida. Você já pode entrar.'
})

const isDev = import.meta.dev
const demoEmail = 'demo@prazervip.local'
const demoPassword = 'demo123456'

function fillDemo() {
  identifier.value = demoEmail
  password.value = demoPassword
}

async function onSubmit() {
  errorMsg.value = null
  try {
    await login(identifier.value, password.value)
    if (user.value?.role === 'admin') {
      await navigateTo('/admin')
    } else {
      await navigateTo('/conta')
    }
  } catch {
    errorMsg.value = error.value
  }
}
</script>
