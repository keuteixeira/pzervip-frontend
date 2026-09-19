<template>
  <div class="mx-auto max-w-md space-y-6">
    <h1 class="text-2xl font-bold text-white">Confirmar e-mail</h1>
    <p v-if="pending" class="text-sm text-zinc-400">Validando o link…</p>
    <div
      v-else
      class="rounded-2xl border px-4 py-4 text-sm"
      :class="ok ? 'border-emerald-900/50 bg-emerald-950/30 text-emerald-100' : 'border-amber-900/50 bg-amber-950/30 text-amber-100'"
      role="status"
    >
      {{ message }}
    </div>
    <div class="flex flex-wrap gap-3">
      <NuxtLink
        to="/conta"
        class="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-muted"
      >
        Ir para Minha conta
      </NuxtLink>
      <NuxtLink to="/login" class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:text-white">
        Entrar
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { extractLaravelErrorMessage } from '~/utils/laravelApiErrors'

definePageMeta({
  layout: 'default',
  path: '/confirmar-email',
})

useHead({
  title: 'Confirmar e-mail',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const route = useRoute()
const { request, token } = useApi()
const { fetchMe } = useAuth()

const pending = ref(true)
const ok = ref(false)
const message = ref('')

onMounted(async () => {
  const uid = Number(route.query.uid)
  const exp = Number(route.query.exp)
  const sig = typeof route.query.sig === 'string' ? route.query.sig : ''
  if (!Number.isFinite(uid) || uid < 1 || !Number.isFinite(exp) || sig.length !== 64) {
    pending.value = false
    message.value = 'Este link está incompleto. Entre na conta e peça um novo envio.'
    return
  }
  try {
    await request('/v1/email/confirm', {
      method: 'GET',
      query: { uid, exp, sig },
      skipAuth: true,
    })
    ok.value = true
    message.value = 'E-mail confirmado. Você já pode fechar esta página.'
    if (token.value) {
      await fetchMe()
    }
  } catch (e: unknown) {
    message.value =
      extractLaravelErrorMessage(e, ['sig', 'uid', 'exp']) ??
      'Este link é inválido ou já expirou. Entre na conta e peça um novo envio.'
  } finally {
    pending.value = false
  }
})
</script>
