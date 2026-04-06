<template>
  <div class="w-full space-y-10 pb-16">
    <div>
      <NuxtLink to="/conta" class="text-sm text-zinc-500 transition hover:text-brand hover:underline">
        ← Minha conta
      </NuxtLink>
      <h1 class="mt-3 text-2xl font-bold text-white">Segurança e privacidade</h1>
      <p class="mt-1 text-sm text-zinc-400">
        Senha de acesso, dados pessoais (LGPD) e exclusão de conta.
      </p>
    </div>

    <section v-if="loading" class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
      Carregando…
    </section>

    <template v-else>
      <section v-if="user" class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Senha de acesso</h2>
        <p class="mt-2 text-sm text-zinc-400">
          <template v-if="!user.password_set_at">
            Defina uma senha para entrar com e-mail e usar esta área com segurança.
          </template>
          <template v-else>
            Para alterar a senha, informe a senha atual e a nova senha (mínimo 8 caracteres).
          </template>
        </p>
        <div class="mt-4 max-w-md space-y-3">
          <div v-if="user.password_set_at">
            <label class="mb-1 block text-sm font-medium text-zinc-300" for="sec-current-password">Senha atual</label>
            <input
              id="sec-current-password"
              v-model="pwCurrent"
              type="password"
              autocomplete="current-password"
              class="form-input w-full"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-300" for="sec-new-password">
              {{ user.password_set_at ? 'Nova senha' : 'Senha' }}
            </label>
            <input
              id="sec-new-password"
              v-model="pwNew"
              type="password"
              autocomplete="new-password"
              class="form-input w-full"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-zinc-300" for="sec-password-confirm">Confirmar senha</label>
            <input
              id="sec-password-confirm"
              v-model="pwConfirm"
              type="password"
              autocomplete="new-password"
              class="form-input w-full"
            />
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <button
              type="button"
              class="rounded-lg border border-brand/50 bg-brand/15 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/25 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="passwordSaving"
              @click="onSavePassword"
            >
              {{ passwordSaving ? 'Salvando…' : user.password_set_at ? 'Alterar senha' : 'Definir senha' }}
            </button>
            <NuxtLink
              v-if="user.password_set_at"
              to="/entrar/recuperar"
              class="text-sm text-zinc-500 underline-offset-2 hover:text-brand hover:underline"
            >
              Esqueci minha senha
            </NuxtLink>
          </div>
          <p v-if="passwordMsg" class="text-sm" :class="passwordErr ? 'text-red-400' : 'text-emerald-400'">
            {{ passwordMsg }}
          </p>
        </div>
      </section>

      <section v-if="deletionStatus" class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Privacidade e exclusão</h2>
        <p class="mt-2 text-sm leading-relaxed text-zinc-400">
          <template v-if="deletionStatus.deletion_requested_at">
            Exclusão solicitada em
            <span class="text-zinc-300">{{ formatDate(deletionStatus.deletion_requested_at) }}</span>.
            Remoção efetiva prevista até
            <span class="font-medium text-amber-200/90">{{ formatDate(deletionStatus.deletion_grace_ends_at) }}</span>.
          </template>
          <template v-else-if="deletionStatus.can_delete_immediately">
            Seu perfil ainda não foi aprovado. Você pode excluir a conta agora; seus dados serão removidos
            (registro mantido de forma anonimizada para auditoria).
          </template>
          <template v-else-if="deletionStatus.can_request_scheduled_deletion">
            Seu perfil já foi aprovado. Caso solicite a exclusão o mesmo acontecerá em até 30 dias do solicitado, nesse
            período é possível desistir da exclusão.
          </template>
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <button
            v-if="deletionStatus.can_delete_immediately && !deletionStatus.deletion_requested_at"
            type="button"
            class="rounded-lg bg-red-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            :disabled="actionLoading"
            @click="onImmediateDelete"
          >
            Excluir conta e dados agora
          </button>
          <button
            v-if="deletionStatus.can_request_scheduled_deletion && !deletionStatus.deletion_requested_at"
            type="button"
            class="rounded-lg bg-red-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
            :disabled="actionLoading"
            @click="onRequestScheduled"
          >
            Solicitar exclusão da conta
          </button>
          <button
            v-if="deletionStatus.deletion_requested_at"
            type="button"
            class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
            :disabled="actionLoading"
            @click="onCancelScheduled"
          >
            Cancelar pedido de exclusão
          </button>
        </div>
        <p v-if="actionMsg" class="mt-4 text-sm" :class="actionErr ? 'text-red-400' : 'text-emerald-400'">
          {{ actionMsg }}
        </p>
      </section>

      <section
        v-else-if="user && user.account_status === 'pending_activation'"
        class="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6"
      >
        <h2 class="text-lg font-semibold text-amber-100/95">Privacidade e exclusão</h2>
        <p class="mt-2 text-sm text-amber-100/90">
          Sua conta ainda aguarda liberação do administrador. Quando a exclusão estiver disponível para o seu caso,
          use os botões desta página. Enquanto isso, pode falar com o suporte se precisar remover dados.
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AccountDeletionStatus } from '~/composables/useAuth'
import { useSwal } from '~/composables/useSwal'
import { laravelErrorMessage } from '~/utils/laravelApiErrors'

definePageMeta({
  layout: 'default',
  path: '/conta/seguranca',
})

useHead({
  title: 'Segurança e privacidade',
})

const {
  user,
  fetchMe,
  fetchDeletionStatus,
  deleteAccountImmediate,
  requestAccountDeletion,
  cancelAccountDeletion,
  setPassword,
} = useAuth()
const { swalConfirm } = useSwal()

const loading = ref(true)
const deletionStatus = ref<AccountDeletionStatus | null>(null)

const actionLoading = ref(false)
const actionMsg = ref<string | null>(null)
const actionErr = ref(false)

const pwCurrent = ref('')
const pwNew = ref('')
const pwConfirm = ref('')
const passwordSaving = ref(false)
const passwordMsg = ref<string | null>(null)
const passwordErr = ref(false)

function formatDate(iso: string | null | undefined) {
  if (!iso) {
    return '—'
  }
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}

async function load() {
  loading.value = true
  actionMsg.value = null
  try {
    deletionStatus.value = await fetchDeletionStatus()
    await fetchMe()
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

async function onSavePassword() {
  passwordMsg.value = null
  passwordErr.value = false
  if (pwNew.value.length < 8) {
    passwordErr.value = true
    passwordMsg.value = 'A senha deve ter no mínimo 8 caracteres.'
    return
  }
  if (pwNew.value !== pwConfirm.value) {
    passwordErr.value = true
    passwordMsg.value = 'A confirmação não coincide com a nova senha.'
    return
  }
  if (user.value?.password_set_at && !pwCurrent.value.trim()) {
    passwordErr.value = true
    passwordMsg.value = 'Informe a senha atual.'
    return
  }
  passwordSaving.value = true
  const hadPassword = !!user.value?.password_set_at
  try {
    await setPassword(
      pwNew.value,
      pwConfirm.value,
      hadPassword ? pwCurrent.value : undefined,
    )
    passwordErr.value = false
    passwordMsg.value = hadPassword ? 'Senha alterada com sucesso.' : 'Senha definida com sucesso.'
    pwCurrent.value = ''
    pwNew.value = ''
    pwConfirm.value = ''
  } catch (e: unknown) {
    passwordErr.value = true
    passwordMsg.value =
      laravelErrorMessage(e, ['current_password', 'password', 'password_confirmation']) ??
      'Não foi possível salvar a senha.'
  } finally {
    passwordSaving.value = false
  }
}

async function onImmediateDelete() {
  const ok = await swalConfirm({
    title: 'Excluir conta agora?',
    text: 'Todos os dados serão removidos de imediato. Esta ação não pode ser desfeita.',
    icon: 'warning',
    confirmButtonText: 'Sim, excluir agora',
    cancelButtonText: 'Cancelar',
  })
  if (!ok) {
    return
  }
  actionLoading.value = true
  actionMsg.value = null
  actionErr.value = false
  try {
    await deleteAccountImmediate()
    actionMsg.value = 'Conta removida. Redirecionando…'
    await navigateTo('/')
  } catch {
    actionErr.value = true
    actionMsg.value = 'Não foi possível excluir. Tente novamente.'
  } finally {
    actionLoading.value = false
  }
}

async function onRequestScheduled() {
  const ok = await swalConfirm({
    title: 'Solicitar exclusão da conta?',
    text: 'Após o prazo configurado, os dados serão removidos. Você pode cancelar o pedido antes disso.',
    icon: 'question',
  })
  if (!ok) {
    return
  }
  actionLoading.value = true
  actionMsg.value = null
  actionErr.value = false
  try {
    await requestAccountDeletion()
    actionMsg.value = 'Pedido registrado.'
    await load()
  } catch {
    actionErr.value = true
    actionMsg.value = 'Não foi possível concluir o pedido.'
  } finally {
    actionLoading.value = false
  }
}

async function onCancelScheduled() {
  actionLoading.value = true
  actionMsg.value = null
  actionErr.value = false
  try {
    await cancelAccountDeletion()
    actionMsg.value = 'Pedido cancelado.'
    await load()
  } catch {
    actionErr.value = true
    actionMsg.value = 'Não foi possível cancelar.'
  } finally {
    actionLoading.value = false
  }
}
</script>
