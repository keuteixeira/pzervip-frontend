<template>
  <div
    v-if="visible"
    class="border-b border-amber-900/50 bg-amber-950/45"
    role="status"
  >
    <div class="mx-auto max-w-7xl space-y-3 px-4 py-3">
      <p class="text-sm text-amber-50">
        Confirme seu e-mail
        <strong class="font-medium text-white">{{ userEmail }}</strong>
        para receber avisos da conta. Se o envio falhar, você continua usando o site.
      </p>
      <div v-if="!codeSent" class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="rounded-lg bg-amber-200 px-3 py-1.5 text-sm font-semibold text-amber-950 transition hover:bg-white disabled:opacity-50"
          :disabled="busy"
          @click="sendCode"
        >
          {{ busy ? 'Enviando…' : 'Enviar confirmação' }}
        </button>
      </div>
      <div v-else class="space-y-2">
        <p class="text-xs text-amber-100/80">
          Enviamos um código e um link. Digite os 6 dígitos aqui ou abra o e-mail e clique em confirmar.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="000000"
            class="w-28 rounded-lg border border-amber-800/80 bg-zinc-950 px-3 py-1.5 font-mono text-sm tracking-widest text-white outline-none focus:ring-2 focus:ring-amber-400"
            @keydown.enter.prevent="submitCode"
          />
          <button
            type="button"
            class="rounded-lg bg-amber-200 px-3 py-1.5 text-sm font-semibold text-amber-950 transition hover:bg-white disabled:opacity-50"
            :disabled="busy || digits.length !== 6"
            @click="submitCode"
          >
            Confirmar
          </button>
          <button
            type="button"
            class="text-sm font-medium text-amber-100 underline-offset-2 hover:underline disabled:opacity-40"
            :disabled="busy || resendLeft > 0"
            @click="sendCode"
          >
            {{ resendLeft > 0 ? `Reenviar em ${resendLeft}s` : 'Reenviar' }}
          </button>
        </div>
      </div>
      <p v-if="msg" class="text-xs" :class="msgOk ? 'text-emerald-300' : 'text-amber-200'">{{ msg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { extractLaravelErrorMessage } from '~/utils/laravelApiErrors'

const route = useRoute()
const { user, fetchMe } = useAuth()
const { token, request } = useApi()

const busy = ref(false)
const codeSent = ref(false)
const code = ref('')
const msg = ref('')
const msgOk = ref(false)
const resendUntil = ref<number | null>(null)
const nowTs = ref(Math.floor(Date.now() / 1000))
let clockId: ReturnType<typeof setInterval> | null = null

const hideOn = computed(() => {
  const path = route.path
  return (
    path.startsWith('/cadastro') ||
    path.startsWith('/login') ||
    path.startsWith('/entrar') ||
    path.startsWith('/admin') ||
    path.startsWith('/confirmar-email')
  )
})

const emailConfirmed = computed(() => {
  const u = user.value
  if (!u || u.role !== 'advertiser') {
    return true
  }
  return Boolean(u.email_verified_at || u.advertiser_profile?.registration_email_verified_at)
})

const visible = computed(
  () => Boolean(token.value) && Boolean(user.value) && !emailConfirmed.value && !hideOn.value,
)

const userEmail = computed(() => user.value?.email ?? '')
const digits = computed(() => code.value.replace(/\D/g, '').slice(0, 6))
const resendLeft = computed(() => {
  if (resendUntil.value == null) {
    return 0
  }
  return Math.max(0, resendUntil.value - nowTs.value)
})

watch(digits, (d) => {
  if (code.value !== d) {
    code.value = d
  }
})

async function sendCode() {
  msg.value = ''
  msgOk.value = false
  busy.value = true
  try {
    const r = await request<{
      sent?: boolean
      already_verified?: boolean
      can_resend_after?: number | null
    }>('/v1/me/email/send-verification', { method: 'POST' })
    if (r.already_verified) {
      await fetchMe()
      msgOk.value = true
      msg.value = 'E-mail já confirmado.'
      return
    }
    codeSent.value = true
    if (typeof r.can_resend_after === 'number') {
      resendUntil.value = r.can_resend_after
    }
    msgOk.value = true
    msg.value = 'Enviado. Confira a caixa de entrada e o spam.'
  } catch (e: unknown) {
    msgOk.value = false
    msg.value =
      extractLaravelErrorMessage(e, ['cooldown', 'email']) ??
      'Não foi possível enviar agora. Tente de novo. A conta continua liberada.'
  } finally {
    busy.value = false
  }
}

async function submitCode() {
  if (digits.value.length !== 6) {
    return
  }
  msg.value = ''
  msgOk.value = false
  busy.value = true
  try {
    await request('/v1/me/email/verify-code', {
      method: 'POST',
      body: { code: digits.value },
    })
    await fetchMe()
    msgOk.value = true
    msg.value = 'E-mail confirmado.'
  } catch (e: unknown) {
    msgOk.value = false
    msg.value = extractLaravelErrorMessage(e, ['code']) ?? 'Código inválido ou expirado.'
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  clockId = setInterval(() => {
    nowTs.value = Math.floor(Date.now() / 1000)
  }, 1000)
})

onUnmounted(() => {
  if (clockId) {
    clearInterval(clockId)
  }
})
</script>
