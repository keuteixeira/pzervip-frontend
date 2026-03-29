<template>
  <div class="mx-auto max-w-2xl space-y-10 pb-16">
    <div>
      <h1 class="text-2xl font-bold text-white">Minha conta</h1>
      <p class="mt-1 text-sm text-zinc-400">
        Dados, privacidade e exclusão de conta (conforme LGPD).
      </p>
    </div>

    <section v-if="loading" class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
      Carregando…
    </section>

    <template v-else>
      <section class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Sessão</h2>
        <p v-if="user" class="mt-2 text-sm text-zinc-400">
          <span class="text-zinc-300">{{ user.name }}</span>
          <span class="mx-2 text-zinc-600">·</span>
          {{ user.email }}
          <span v-if="user.account_status" class="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {{ user.account_status }}
          </span>
        </p>
        <div class="mt-4 flex flex-wrap gap-4">
          <NuxtLink
            v-if="profileOk"
            to="/conta/perfil"
            class="rounded-lg border border-brand/50 bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/20"
          >
            Editar perfil público
          </NuxtLink>
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            @click="onLogout"
          >
            Sair
          </button>
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
            Seu perfil já foi aprovado. A exclusão entra em fila com período de carência; depois todos os dados
            pessoais são removidos (soft delete + anonimização).
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

      <section v-if="profileOk && profileDetail" class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Perfil (API)</h2>
        <p class="mt-2 text-sm text-zinc-400">
          Nome profissional:
          <span class="text-zinc-200">{{ profileDetail.professional_name ?? '—' }}</span>
        </p>
      </section>

      <section
        v-if="profileOk && profileDetail && profileDetail.approval_status === 'approved'"
        class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
      >
        <h2 class="text-lg font-semibold text-white">Visibilidade do anúncio</h2>
        <p class="mt-2 text-sm leading-relaxed text-zinc-400">
          Inative o perfil para pausar sua presença na plataforma. Após reativar, é preciso aguardar
          <span class="text-zinc-300">{{ profileDetail.listing_visibility_cooldown_hours ?? 24 }} horas</span>
          antes de inativar de novo.
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span
            class="rounded-full px-3 py-1 text-xs font-medium"
            :class="
              profileDetail.user_paused_listing
                ? 'bg-amber-950/80 text-amber-100/90'
                : 'bg-emerald-950/60 text-emerald-100/90'
            "
          >
            {{
              profileDetail.user_paused_listing
                ? profileDetail.public_profile_visible_when_paused
                  ? 'Inativo — link público ainda ativo'
                  : 'Inativo — anúncio oculto'
                : 'Perfil ativo'
            }}
          </span>
        </div>

        <p
          v-if="
            !profileDetail.user_paused_listing &&
            profileDetail.listing_pause_cooldown_active &&
            profileDetail.listing_visibility_locked_until
          "
          class="mt-4 rounded-lg border border-amber-900/40 bg-amber-950/25 px-3 py-2 text-sm text-amber-100/90"
        >
          Você poderá inativar o perfil novamente após
          <span class="font-medium text-amber-50">{{ formatDate(profileDetail.listing_visibility_locked_until) }}</span>
          (carência após a última reativação).
        </p>

        <div v-if="!profileDetail.user_paused_listing" class="mt-6 space-y-4">
          <p class="text-sm font-medium text-zinc-300">Inativar perfil</p>
          <p class="text-xs text-zinc-500">Escolha o que acontece com o link público do seu anúncio:</p>
          <div class="space-y-2 text-sm text-zinc-300">
            <label class="flex cursor-pointer items-start gap-2">
              <input v-model="pauseChoice" type="radio" value="hide" class="mt-1" />
              <span>Ocultar o anúncio — o link público deixa de exibir o perfil.</span>
            </label>
            <label class="flex cursor-pointer items-start gap-2">
              <input v-model="pauseChoice" type="radio" value="keep" class="mt-1" />
              <span>Manter o link ativo — visitantes ainda veem o perfil enquanto o anúncio está inativo na gestão.</span>
            </label>
          </div>
          <button
            type="button"
            class="rounded-lg border border-amber-700/60 bg-amber-950/40 px-4 py-2 text-sm font-medium text-amber-100/90 transition hover:bg-amber-950/60"
            :disabled="listingLoading || !!profileDetail.listing_pause_cooldown_active"
            @click="onPauseProfile"
          >
            Inativar perfil
          </button>
        </div>

        <div v-else class="mt-6 space-y-4">
          <p class="text-sm text-zinc-400">
            Enquanto estiver inativo, você pode alterar se o link público continua acessível ou não:
          </p>
          <div class="space-y-2 text-sm text-zinc-300">
            <label class="flex cursor-pointer items-start gap-2">
              <input v-model="pauseChoice" type="radio" value="hide" class="mt-1" />
              <span>Ocultar link público</span>
            </label>
            <label class="flex cursor-pointer items-start gap-2">
              <input v-model="pauseChoice" type="radio" value="keep" class="mt-1" />
              <span>Manter link público ativo</span>
            </label>
          </div>
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
              :disabled="listingLoading"
              @click="onUpdatePauseLinkPreference"
            >
              Atualizar preferência do link
            </button>
            <button
              type="button"
              class="rounded-lg bg-emerald-700/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
              :disabled="listingLoading"
              @click="onReactivateProfile"
            >
              Reativar perfil
            </button>
          </div>
        </div>

        <p v-if="listingMsg" class="mt-4 text-sm" :class="listingErr ? 'text-red-400' : 'text-emerald-400'">
          {{ listingMsg }}
        </p>
      </section>

      <section
        v-if="profileOk && profileDetail && profileDetail.approval_status === 'approved' && profileDetail.has_destaque_available_now"
        class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
      >
        <h2 class="text-lg font-semibold text-white">Disponível agora</h2>
        <p class="mt-2 text-sm leading-relaxed text-zinc-400">
          Ao ativar, o seu cartão na listagem da cidade mostra o badge verde «Disponível agora» no mesmo sítio do aviso
          de chegada. O badge fica visível por
          <span class="text-zinc-200">{{ profileDetail.available_now_duration_minutes ?? 60 }} minutos</span>. Pode
          ativar no máximo
          <span class="text-zinc-200">1 vez a cada {{ profileDetail.available_now_cooldown_hours ?? 24 }} horas</span>.
        </p>
        <p
          v-if="profileDetail.available_now_active && profileDetail.available_now_ends_at"
          class="mt-3 rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100/90"
        >
          Badge ativo até {{ formatDate(profileDetail.available_now_ends_at) }}.
        </p>
        <p
          v-else-if="!profileDetail.available_now_can_activate && profileDetail.available_now_next_allowed_at"
          class="mt-3 text-sm text-zinc-500"
        >
          Próxima ativação possível: {{ formatDate(profileDetail.available_now_next_allowed_at) }}.
        </p>
        <button
          v-if="profileDetail.available_now_can_activate"
          type="button"
          class="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
          :disabled="availableNowLoading"
          @click="onActivateAvailableNow"
        >
          {{ availableNowLoading ? 'A ativar…' : 'Ativar «Disponível agora»' }}
        </button>
        <p v-if="availableNowMsg" class="mt-3 text-sm" :class="availableNowErr ? 'text-red-400' : 'text-emerald-400'">
          {{ availableNowMsg }}
        </p>
      </section>

      <section v-else-if="user && user.account_status === 'pending_activation'" class="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6">
        <p class="text-sm text-amber-100/90">
          Sua conta ainda aguarda liberação do administrador. Você pode excluir os dados abaixo se não quiser mais
          seguir.
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AccountDeletionStatus } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
  path: '/conta',
})

const { user, fetchMe, logout, fetchDeletionStatus, deleteAccountImmediate, requestAccountDeletion, cancelAccountDeletion } =
  useAuth()
const { request } = useApi()

const loading = ref(true)
const actionLoading = ref(false)
const actionMsg = ref<string | null>(null)
const actionErr = ref(false)

const deletionStatus = ref<AccountDeletionStatus | null>(null)

type ProfileDetail = {
  professional_name?: string | null
  approval_status?: string
  uuid?: string
  user_paused_listing?: boolean
  public_profile_visible_when_paused?: boolean
  listing_pause_cooldown_active?: boolean
  listing_visibility_locked_until?: string | null
  listing_visibility_cooldown_hours?: number
  has_destaque_available_now?: boolean
  available_now_active?: boolean
  available_now_ends_at?: string | null
  available_now_can_activate?: boolean
  available_now_next_allowed_at?: string | null
  available_now_duration_minutes?: number
  available_now_cooldown_hours?: number
}

const profileDetail = ref<ProfileDetail | null>(null)
const profileOk = ref(false)
const listingLoading = ref(false)
const listingMsg = ref<string | null>(null)
const listingErr = ref(false)
const pauseChoice = ref<'hide' | 'keep'>('hide')

const availableNowLoading = ref(false)
const availableNowMsg = ref<string | null>(null)
const availableNowErr = ref(false)

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

function syncPauseChoiceFromProfile() {
  const p = profileDetail.value
  if (!p) {
    return
  }
  pauseChoice.value = p.public_profile_visible_when_paused ? 'keep' : 'hide'
}

function listingApiMessage(e: unknown): string {
  if (e && typeof e === 'object') {
    const x = e as { data?: { message?: string }; response?: { _data?: { message?: string } } }
    if (x.data?.message && typeof x.data.message === 'string') {
      return x.data.message
    }
    const m = x.response?._data?.message
    if (m && typeof m === 'string') {
      return m
    }
  }
  return 'Não foi possível concluir.'
}

async function load() {
  loading.value = true
  actionMsg.value = null
  try {
    deletionStatus.value = await fetchDeletionStatus()
    try {
      const p = await request<ProfileDetail>('/v1/me/profile')
      profileDetail.value = p
      profileOk.value = true
      syncPauseChoiceFromProfile()
    } catch {
      profileDetail.value = null
      profileOk.value = false
    }
    await fetchMe()
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

async function onLogout() {
  await logout()
  await navigateTo('/login')
}

async function onImmediateDelete() {
  if (!confirm('Excluir conta e dados agora? Esta ação não pode ser desfeita.')) {
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
  if (!confirm('Solicitar exclusão? Após o prazo os dados serão removidos. Você pode cancelar antes.')) {
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

async function onPauseProfile() {
  if (
    !confirm(
      'Inativar o perfil? Você poderá reativar quando quiser; após reativar, a próxima inativação só será permitida após o período de carência.',
    )
  ) {
    return
  }
  listingLoading.value = true
  listingMsg.value = null
  listingErr.value = false
  try {
    const p = await request<ProfileDetail>('/v1/me/profile/listing-visibility', {
      method: 'PATCH',
      body: {
        user_paused_listing: true,
        public_profile_visible_when_paused: pauseChoice.value === 'keep',
      },
    })
    profileDetail.value = p
    syncPauseChoiceFromProfile()
    listingMsg.value = 'Perfil inativado.'
  } catch (e) {
    listingErr.value = true
    listingMsg.value = listingApiMessage(e)
  } finally {
    listingLoading.value = false
  }
}

async function onReactivateProfile() {
  if (!confirm('Reativar o perfil na plataforma?')) {
    return
  }
  listingLoading.value = true
  listingMsg.value = null
  listingErr.value = false
  try {
    const p = await request<ProfileDetail>('/v1/me/profile/listing-visibility', {
      method: 'PATCH',
      body: { user_paused_listing: false },
    })
    profileDetail.value = p
    syncPauseChoiceFromProfile()
    listingMsg.value = 'Perfil reativado. Aguarde o período de carência antes de inativar de novo.'
  } catch (e) {
    listingErr.value = true
    listingMsg.value = listingApiMessage(e)
  } finally {
    listingLoading.value = false
  }
}

async function onActivateAvailableNow() {
  if (
    !confirm(
      'Ativar o badge «Disponível agora»? Ele ficará visível na listagem pelo tempo indicado e só poderá voltar a ser ativado após o intervalo de espera.',
    )
  ) {
    return
  }
  availableNowLoading.value = true
  availableNowMsg.value = null
  availableNowErr.value = false
  try {
    const p = await request<ProfileDetail>('/v1/me/profile/available-now', { method: 'POST' })
    profileDetail.value = p
    syncPauseChoiceFromProfile()
    availableNowMsg.value = 'Badge «Disponível agora» ativado.'
  } catch (e) {
    availableNowErr.value = true
    availableNowMsg.value = listingApiMessage(e)
  } finally {
    availableNowLoading.value = false
  }
}

async function onUpdatePauseLinkPreference() {
  listingLoading.value = true
  listingMsg.value = null
  listingErr.value = false
  try {
    const p = await request<ProfileDetail>('/v1/me/profile/listing-visibility', {
      method: 'PATCH',
      body: {
        public_profile_visible_when_paused: pauseChoice.value === 'keep',
      },
    })
    profileDetail.value = p
    syncPauseChoiceFromProfile()
    listingMsg.value = 'Preferência do link atualizada.'
  } catch (e) {
    listingErr.value = true
    listingMsg.value = listingApiMessage(e)
  } finally {
    listingLoading.value = false
  }
}
</script>
