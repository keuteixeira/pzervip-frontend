<template>
  <div class="w-full space-y-10 pb-16">
    <div>
      <h1 class="text-2xl font-bold text-white">Minha conta</h1>
      <p class="mt-1 text-sm text-zinc-400">
        Resumo do perfil, visibilidade do anúncio e atalhos. Senha e exclusão de conta ficam em Segurança.
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
            {{ accountStatusLabel(user.account_status) }}
          </span>
        </p>
        <div class="mt-4 flex flex-wrap gap-4">
          <NuxtLink
            v-if="profileOk && isApprovedAdvertiser"
            to="/conta/perfil"
            class="rounded-lg border border-brand/50 bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/20"
          >
            Editar perfil
          </NuxtLink>
          <NuxtLink
            v-if="showAccountSecurityAndSupport"
            to="/conta/seguranca"
            class="rounded-lg border border-violet-700/50 bg-violet-950/30 px-4 py-2 text-sm font-medium text-violet-200/95 transition hover:bg-violet-950/50"
          >
            Segurança
          </NuxtLink>
          <NuxtLink
            v-if="showAccountSecurityAndSupport"
            to="/conta/suporte"
            class="rounded-lg border border-sky-700/60 bg-sky-900/20 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-sky-900/35"
          >
            Suporte
          </NuxtLink>
          <NuxtLink
            v-if="profileOk && user?.role === 'advertiser' && !isApprovedAdvertiser"
            to="/cadastro"
            class="rounded-lg border border-zinc-600 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-brand/40 hover:text-white"
          >
            {{ backToPrecadastroLabel }}
          </NuxtLink>
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            @click="onLogout"
          >
            Sair
          </button>
        </div>
        <div
          v-if="profileOk && isApprovedAdvertiser"
          class="mt-4 flex flex-wrap gap-2 border-t border-zinc-800/80 pt-4"
        >
          <span class="w-full text-xs font-medium uppercase tracking-wide text-zinc-600">Atalhos</span>
          <NuxtLink
            v-for="l in profileSectionLinks"
            :key="l.secao"
            :to="`/conta/perfil?secao=${l.secao}`"
            class="rounded-full border border-zinc-700/90 bg-zinc-950/40 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-brand/40 hover:text-brand"
          >
            {{ l.label }}
          </NuxtLink>
        </div>
      </section>

      <section v-if="profileOk && profileDetail" class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Perfil</h2>
        <p class="mt-2 text-sm text-zinc-400">
          <strong>Nome profissional: </strong> 
          <span class="text-zinc-200">{{ profileDetail.professional_name ?? '—' }}</span>
        </p>
        <div class="mt-3 border-t border-zinc-800/80 pt-3">
          <p class="mt-2 text-sm text-zinc-400">
            <strong>Local no anúncio: </strong> 
            <template v-if="profileLocationLoading">Carregando…</template>
            <template v-else>{{ profileLocationSummary ?? '—' }}</template></p>
        </div>
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
          <p class="text-xs text-zinc-500">
            Marque uma das opções abaixo e só então use o botão para inativar.
          </p>
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
            class="rounded-lg border border-amber-700/60 bg-amber-950/40 px-4 py-2 text-sm font-medium text-amber-100/90 transition hover:bg-amber-950/60 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="listingLoading || !!profileDetail.listing_pause_cooldown_active || pauseChoice === null"
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
          Ao ativar, o seu perfil na listagem da cidade mostra a mensagem verde «Disponível agora». O aviso fica visível por
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAdvertiserApproval } from '~/composables/useAdvertiserApproval'
import { useSwal } from '~/composables/useSwal'
import { accountStatusLabel } from '~/utils/admin-labels'

definePageMeta({
  layout: 'default',
  path: '/conta',
})

useHead({
  title: 'Minha conta',
})

const { user, fetchMe, logout } = useAuth()
const { isApprovedAdvertiser } = useAdvertiserApproval()
const { request } = useApi()
const { swalConfirm } = useSwal()

const loading = ref(true)

type ApiState = { id: number; name: string; uf: string }
type ApiCity = { id: number; name: string }

type ProfileDetail = {
  professional_name?: string | null
  form_status?: string | null
  approval_status?: string
  uuid?: string
  state_id?: number | null
  city_id?: number | null
  neighborhood?: string | null
  has_venue?: boolean | null
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
const profileLocationSummary = ref<string | null>(null)
const profileLocationLoading = ref(false)

const profileSectionLinks = [
  { secao: 'dados', label: 'Dados pessoais' },
  { secao: 'perfil', label: 'Nome profissional e link' },
  { secao: 'local', label: 'Local' },
  { secao: 'whatsapp', label: 'WhatsApp do anúncio' },
  { secao: 'redes', label: 'Redes' },
  { secao: 'midias', label: 'Mídias' },
] as const

/** Admin ou anunciante já aprovado — anunciante em pré-cadastro/análise não vê estes atalhos. */
const showAccountSecurityAndSupport = computed(
  () => user.value?.role !== 'advertiser' || isApprovedAdvertiser.value,
)

const backToPrecadastroLabel = computed(() =>
  profileDetail.value?.form_status === 'draft' ? 'Voltar ao pré-cadastro' : 'Retomar cadastro',
)
const listingLoading = ref(false)
const listingMsg = ref<string | null>(null)
const listingErr = ref(false)
const pauseChoice = ref<'hide' | 'keep' | null>(null)

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
  if (!p.user_paused_listing) {
    pauseChoice.value = null
    return
  }
  pauseChoice.value = p.public_profile_visible_when_paused ? 'keep' : 'hide'
}

/** Cidade, UF e bairro (se público), alinhado ao perfil público (has_venue). */
async function hydrateProfileLocationSummary() {
  profileLocationSummary.value = null
  const p = profileDetail.value
  if (!p) {
    return
  }

  const showNeighborhood = p.has_venue !== false
  const nh = showNeighborhood ? (p.neighborhood ?? '').trim() : ''

  if (!p.state_id) {
    profileLocationSummary.value = nh
      ? nh
      : 'Estado e cidade ainda não informados.'
    return
  }

  profileLocationLoading.value = true
  try {
    const states = await request<ApiState[]>('/v1/states')
    const st = states.find((s) => s.id === p.state_id)
    const uf = st?.uf ?? ''
    const stateName = st?.name ?? ''

    let cityName = ''
    if (p.city_id) {
      const cities = await request<ApiCity[]>(`/v1/states/${p.state_id}/cities`)
      const ct = cities.find((c) => c.id === p.city_id)
      cityName = ct?.name ?? ''
    }

    const parts: string[] = []
    if (cityName && uf) {
      parts.push(`${cityName} — ${uf}`)
    } else if (cityName) {
      parts.push(cityName)
    } else if (stateName && uf) {
      parts.push(`${stateName} (${uf})`)
    }

    if (nh) {
      parts.push(nh)
    }

    profileLocationSummary.value =
      parts.length > 0
        ? parts.join(' · ')
        : 'Complete cidade e estado em Editar perfil → Local.'
  } catch {
    profileLocationSummary.value = 'Não foi possível carregar o local. Tente atualizar a página.'
  } finally {
    profileLocationLoading.value = false
  }
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
  try {
    try {
      const p = await request<ProfileDetail>('/v1/me/profile')
      profileDetail.value = p
      profileOk.value = true
      syncPauseChoiceFromProfile()
    } catch {
      profileDetail.value = null
      profileOk.value = false
      profileLocationSummary.value = null
    }
    await fetchMe()
  } finally {
    loading.value = false
  }
}

watch(
  profileDetail,
  (p) => {
    if (!p) {
      profileLocationSummary.value = null
      return
    }
    void hydrateProfileLocationSummary()
  },
  { deep: true },
)

onMounted(() => load())

async function onLogout() {
  await logout()
  await navigateTo('/login')
}

async function onPauseProfile() {
  if (pauseChoice.value === null) {
    return
  }
  const okPause = await swalConfirm({
    title: 'Inativar o perfil?',
    text: 'Você poderá reativar quando quiser. Depois de reativar, a próxima inativação só será permitida após o período de carência.',
    icon: 'question',
  })
  if (!okPause) {
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
  const ok = await swalConfirm({
    title: 'Reativar o perfil?',
    text: 'Seu anúncio voltará a aparecer na plataforma conforme as regras de visibilidade.',
    icon: 'question',
  })
  if (!ok) {
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
  const ok = await swalConfirm({
    title: 'Ativar o selo «Disponível agora»?',
    text: 'Ele ficará visível na listagem pelo tempo indicado e só poderá ser ativado de novo após o intervalo de espera.',
    icon: 'question',
  })
  if (!ok) {
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
