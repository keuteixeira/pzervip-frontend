<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <NuxtLink :to="withMock('/admin/anunciantes')" class="text-sm text-zinc-500 hover:text-brand">← Anunciantes</NuxtLink>
        <h1 class="mt-2 text-2xl font-bold text-white">{{ detail?.professional_name || 'Perfil' }}</h1>
        <p class="text-sm text-zinc-500">ID {{ id }} · {{ detail?.approval_status }} · {{ detail?.public_slug }}</p>
      </div>
    </div>

    <p v-if="loading" class="text-zinc-400">Carregando…</p>
    <p v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</p>

    <template v-else-if="detail">
      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Dados (edição rápida)</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="block text-sm">
            <span class="text-zinc-500">Nome profissional</span>
            <input v-model="form.professional_name" type="text" class="input mt-1" />
          </label>
          <label class="block text-sm">
            <span class="text-zinc-500">WhatsApp (só números)</span>
            <input v-model="form.whatsapp" type="text" class="input mt-1" />
          </label>
          <label class="sm:col-span-2 block text-sm">
            <span class="text-zinc-500">Bio</span>
            <textarea v-model="form.bio" rows="4" class="input mt-1 min-h-[100px]" />
          </label>
          <label class="flex cursor-pointer items-center gap-2 text-sm">
            <input v-model="form.user_paused_listing" type="checkbox" class="rounded border-zinc-600" />
            <span>Anúncio pausado (sumir da vitrine)</span>
          </label>
        </div>
        <p v-if="saveMsg" class="mt-3 text-sm" :class="saveOk ? 'text-emerald-400' : 'text-red-400'">{{ saveMsg }}</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          :disabled="saving"
          @click="saveDetails"
        >
          {{ saving ? 'Salvando…' : 'Salvar alterações' }}
        </button>
      </section>

      <section class="rounded-xl border border-amber-900/40 bg-amber-950/20 p-6">
        <h2 class="text-lg font-semibold text-amber-100">Destaque gratuito (cortesia)</h2>
        <p class="mt-1 text-sm text-amber-100/80">
          Credita tempo de destaque sem PIX. Perfil precisa estar <strong>aprovado</strong>. Atual:
          {{ detail.destaque_remaining_seconds }}s · estrelas cache: {{ detail.highlight_stars_cached ?? '—' }}
        </p>
        <div class="mt-4 flex flex-wrap items-end gap-3">
          <label class="text-sm">
            <span class="text-zinc-500">Estrelas</span>
            <input v-model.number="grant.stars" type="number" min="1" max="10" class="input mt-1 w-24" />
          </label>
          <label class="text-sm">
            <span class="text-zinc-500">Meses</span>
            <input v-model.number="grant.months" type="number" min="1" max="24" class="input mt-1 w-24" />
          </label>
          <button
            type="button"
            class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
            :disabled="granting"
            @click="grantDestaque"
          >
            {{ granting ? 'Aplicando…' : 'Conceder destaque' }}
          </button>
        </div>
        <p v-if="grantMsg" class="mt-2 text-sm" :class="grantOk ? 'text-emerald-400' : 'text-red-400'">{{ grantMsg }}</p>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Conta</h2>
        <ul class="mt-2 space-y-1 text-sm text-zinc-400">
          <li v-if="detail.user?.email">E-mail: {{ detail.user.email }}</li>
          <li v-if="detail.user?.name">Nome legal: {{ detail.user.name }}</li>
          <li>Cidade: {{ detail.city?.name || '—' }} · UF: {{ detail.state?.uf || '—' }}</li>
        </ul>
      </section>

      <section v-if="detail.registration" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Cadastro (origem)</h2>
        <p class="mt-1 text-sm text-zinc-500">Dados enviados no formulário inicial.</p>
        <dl class="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <template v-if="detail.registration.mother_name">
            <dt class="text-zinc-500">Nome da mãe</dt>
            <dd class="text-zinc-300">{{ detail.registration.mother_name }}</dd>
          </template>
          <template v-if="detail.registration.contact_email">
            <dt class="text-zinc-500">E-mail de contato</dt>
            <dd class="text-zinc-300">{{ detail.registration.contact_email }}</dd>
          </template>
          <template v-if="detail.registration.cpf">
            <dt class="text-zinc-500">CPF</dt>
            <dd class="font-mono text-zinc-300">{{ detail.registration.cpf }}</dd>
          </template>
        </dl>
        <NuxtLink
          :to="withMock(`/admin/cadastros/${id}`)"
          class="mt-4 inline-block text-sm text-brand hover:underline"
        >
          Abrir revisão completa do cadastro →
        </NuxtLink>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Mídias deste perfil</h2>
        <p class="mt-1 text-sm text-zinc-500">Tipo, aprovação e visualização.</p>
        <ul v-if="mediaList.length" class="mt-4 space-y-3">
          <li
            v-for="m in mediaList"
            :key="m.id"
            class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm font-medium text-brand">{{ m.kind_label || m.collection_name }}</p>
              <p class="text-sm text-white">{{ m.file_name }}</p>
              <p class="text-xs text-zinc-500">Moderação: {{ m.moderation_status }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                :disabled="openingMediaId === m.id"
                @click="openMedia(m)"
              >
                {{ openingMediaId === m.id ? 'Abrindo…' : 'Ver' }}
              </button>
              <button
                type="button"
                class="rounded bg-emerald-700 px-2 py-1 text-xs text-white"
                @click="setMediaModeration(m.id, 'approved')"
              >
                Aprovar
              </button>
              <button
                type="button"
                class="rounded bg-zinc-700 px-2 py-1 text-xs text-white"
                @click="setMediaModeration(m.id, 'rejected')"
              >
                Recusar
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-zinc-500">Nenhuma mídia listada.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ADMIN_MOCK_MEDIA_FOR_PROFILE, getMockAnuncianteDetail } from '~/data/admin-mocks'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

const route = useRoute()
const id = computed(() => Number(route.params.id))
const { request } = useApi()
const { isMock, withMock } = useAdminMock()

useHead(() => ({ title: `Anunciante #${route.params.id}` }))

type ProfileDetail = {
  id: number
  professional_name: string | null
  public_slug: string | null
  approval_status: string
  bio: string | null
  whatsapp: string | null
  highlight_stars_cached: number | null
  destaque_remaining_seconds: number
  user_paused_listing: boolean
  user?: { name: string; email?: string }
  city?: { name: string } | null
  state?: { uf: string } | null
  registration?: {
    mother_name?: string | null
    contact_email?: string | null
    cpf?: string | null
  } | null
}

const loading = ref(true)
const errorMsg = ref<string | null>(null)
const detail = ref<ProfileDetail | null>(null)

const form = reactive({
  professional_name: '',
  bio: '',
  whatsapp: '',
  user_paused_listing: false,
})

const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)

const grant = reactive({ stars: 3, months: 1 })
const granting = ref(false)
const grantMsg = ref('')
const grantOk = ref(true)

const mediaList = ref<
  {
    id: number
    collection_name: string
    kind?: string
    kind_label?: string
    file_name: string
    mime_type?: string
    moderation_status: string
    mock_preview_url?: string | null
  }[]
>([])
const openingMediaId = ref<number | null>(null)

function applyDetailToForm(p: ProfileDetail) {
  form.professional_name = p.professional_name || ''
  form.bio = p.bio || ''
  form.whatsapp = p.whatsapp || ''
  form.user_paused_listing = p.user_paused_listing
}

async function load() {
  loading.value = true
  errorMsg.value = null
  if (isMock.value) {
    const p = getMockAnuncianteDetail(id.value) as unknown as ProfileDetail
    detail.value = p
    applyDetailToForm(p)
    mediaList.value = ADMIN_MOCK_MEDIA_FOR_PROFILE.map((m) => ({ ...m }))
    loading.value = false
    return
  }
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}`)
    detail.value = p
    applyDetailToForm(p)
    const mediaRes = await request<{ media: typeof mediaList.value }>(`/v1/admin/profiles/${id.value}/media`)
    mediaList.value = mediaRes.media
  } catch {
    errorMsg.value = 'Não foi possível carregar o perfil.'
    detail.value = null
  } finally {
    loading.value = false
  }
}

async function saveDetails() {
  saveMsg.value = ''
  if (isMock.value && detail.value) {
    detail.value = {
      ...detail.value,
      professional_name: form.professional_name || null,
      bio: form.bio || null,
      whatsapp: form.whatsapp || null,
      user_paused_listing: form.user_paused_listing,
    }
    saveMsg.value = 'Modo demo: alteração só nesta tela.'
    saveOk.value = true
    return
  }
  saving.value = true
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}/details`, {
      method: 'PATCH',
      body: {
        professional_name: form.professional_name || null,
        bio: form.bio || null,
        whatsapp: form.whatsapp || null,
        user_paused_listing: form.user_paused_listing,
      },
    })
    detail.value = p
    saveMsg.value = 'Salvo.'
    saveOk.value = true
  } catch {
    saveMsg.value = 'Erro ao salvar.'
    saveOk.value = false
  } finally {
    saving.value = false
  }
}

async function grantDestaque() {
  grantMsg.value = ''
  if (isMock.value && detail.value) {
    const monthSec = 30 * 24 * 60 * 60
    const add = grant.months * monthSec
    detail.value = {
      ...detail.value,
      destaque_remaining_seconds: detail.value.destaque_remaining_seconds + add,
      highlight_stars_cached: grant.stars,
    }
    grantMsg.value = 'Modo demo: valores atualizados só nesta tela.'
    grantOk.value = true
    return
  }
  granting.value = true
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}/grant-destaque`, {
      method: 'POST',
      body: { stars: grant.stars, period_months: grant.months },
    })
    detail.value = p
    grantMsg.value = 'Destaque creditado.'
    grantOk.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string; errors?: Record<string, string[]> } }
    grantMsg.value =
      err.data?.errors?.profile?.[0] || err.data?.message || 'Não foi possível conceder destaque.'
    grantOk.value = false
  } finally {
    granting.value = false
  }
}

async function openMedia(m: (typeof mediaList.value)[number]) {
  if (isMock.value) {
    const u = m.mock_preview_url
    if (u) {
      window.open(u, '_blank', 'noopener,noreferrer')
    }
    return
  }
  openingMediaId.value = m.id
  try {
    const res = await request<{ url: string }>(
      `/v1/admin/profiles/${id.value}/media/${m.id}/temporary-url`,
    )
    if (res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer')
    }
  } finally {
    openingMediaId.value = null
  }
}

async function setMediaModeration(mediaId: number, moderation_status: 'approved' | 'rejected') {
  if (isMock.value) {
    const m = mediaList.value.find((x) => x.id === mediaId)
    if (m) {
      m.moderation_status = moderation_status
    }
    return
  }
  await request(`/v1/admin/profiles/${id.value}/media/${mediaId}`, {
    method: 'PATCH',
    body: { moderation_status },
  })
  const mediaRes = await request<{ media: typeof mediaList.value }>(`/v1/admin/profiles/${id.value}/media`)
  mediaList.value = mediaRes.media
}

onMounted(() => load())

watch(isMock, () => load())
watch(id, () => load())
</script>

<style scoped>
.input {
  @apply w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
