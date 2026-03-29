<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-16">
    <div>
      <NuxtLink to="/conta" class="text-sm text-zinc-500 hover:text-brand">← Minha conta</NuxtLink>
      <h1 class="mt-4 text-2xl font-bold text-white">Perfil do anúncio</h1>
      <p class="mt-1 text-sm text-zinc-400">
        Os dados pessoais do cadastro não podem ser alterados aqui. O nome e o link público são definidos pela
        plataforma a partir do seu nome profissional.
      </p>
    </div>

    <section v-if="loading" class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
      Carregando…
    </section>

    <template v-else-if="profile">
      <section class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Dados pessoais</h2>
        <p class="mt-1 text-xs text-zinc-500">Conforme cadastro — não editável pelo anunciante.</p>
        <div class="mt-4 space-y-3 text-sm">
          <div>
            <p class="mb-1 text-xs font-medium text-zinc-500">Nome (cadastro)</p>
            <input class="input cursor-not-allowed opacity-70" type="text" :value="profile.account_legal_name ?? ''" disabled />
          </div>
          <div>
            <p class="mb-1 text-xs font-medium text-zinc-500">E-mail da conta</p>
            <input class="input cursor-not-allowed opacity-70" type="email" :value="user?.email ?? ''" disabled />
          </div>
          <div>
            <p class="mb-1 text-xs font-medium text-zinc-500">CPF</p>
            <input class="input cursor-not-allowed opacity-70" type="text" :value="maskCpf(profile.cpf)" disabled />
          </div>
          <div>
            <p class="mb-1 text-xs font-medium text-zinc-500">Nome da mãe</p>
            <input class="input cursor-not-allowed opacity-70" type="text" :value="profile.mother_name ?? '—'" disabled />
          </div>
          <div>
            <p class="mb-1 text-xs font-medium text-zinc-500">Data de nascimento</p>
            <input class="input cursor-not-allowed opacity-70" type="text" :value="profile.birth_date ?? '—'" disabled />
          </div>
        </div>
      </section>

      <template v-if="profile.approval_status === 'approved'">
        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 class="text-lg font-semibold text-white">Nome profissional e link público</h2>
          <p class="mt-2 text-sm text-zinc-400">
            O endereço do seu perfil é gerado automaticamente. Se já existir outro igual, será adicionado um sufixo
            (ex.: <span class="text-zinc-300">joao-marques-2</span>).
          </p>
          <p
            v-if="profile.professional_slug_cooldown_active && profile.professional_slug_locked_until"
            class="mt-3 rounded-lg border border-amber-900/40 bg-amber-950/25 px-3 py-2 text-sm text-amber-100/90"
          >
            Próxima alteração de nome disponível após
            {{ formatDate(profile.professional_slug_locked_until) }} ({{ profile.portal_field_cooldown_hours ?? 24 }}h).
          </p>
          <div class="mt-4 space-y-3">
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">Nome profissional (público)</p>
              <input
                v-model="formProfessionalName"
                type="text"
                class="input"
                :disabled="profile.professional_slug_cooldown_active"
                maxlength="191"
              />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">Seu link público (somente leitura)</p>
              <input class="input cursor-not-allowed opacity-80" type="text" :value="publicProfileUrl" readonly />
              <p class="mt-1 text-xs text-zinc-600">
                Abre a página pública no site (com banner, contato e galeria após moderação).
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              :disabled="savingName || profile.professional_slug_cooldown_active"
              @click="saveProfessionalName"
            >
              Salvar nome profissional
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 class="text-lg font-semibold text-white">Local de atendimento</h2>
          <p
            v-if="profile.city_change_cooldown_active && profile.city_change_locked_until"
            class="mt-3 rounded-lg border border-amber-900/40 bg-amber-950/25 px-3 py-2 text-sm text-amber-100/90"
          >
            Próxima alteração de estado/cidade após
            {{ formatDate(profile.city_change_locked_until) }} ({{ profile.portal_field_cooldown_hours ?? 24 }}h). Bairro
            pode ser alterado abaixo.
          </p>
          <div class="mt-4 space-y-3 text-sm">
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">Estado</p>
              <select
                v-model="formStateId"
                class="input"
                :disabled="profile.city_change_cooldown_active"
                @change="onStateChange"
              >
                <option value="">—</option>
                <option v-for="st in states" :key="st.id" :value="String(st.id)">{{ st.name }} ({{ st.uf }})</option>
              </select>
            </div>
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">Cidade</p>
              <select v-model="formCityId" class="input" :disabled="profile.city_change_cooldown_active || !formStateId">
                <option value="">—</option>
                <option v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">Bairro</p>
              <input v-model="formNeighborhood" type="text" class="input" maxlength="191" />
            </div>
            <button
              type="button"
              class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              :disabled="savingLoc"
              @click="saveLocation"
            >
              Salvar local
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 class="text-lg font-semibold text-white">Redes sociais e links (opcional)</h2>
          <p class="mt-2 text-sm text-zinc-400">
            Estes ícones aparecem na sua página pública após a descrição. Use URLs completas (https://).
          </p>
          <div class="mt-4 space-y-3 text-sm">
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">Instagram</p>
              <input v-model="formSocial.instagram" type="url" class="input" placeholder="https://" />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">X (Twitter)</p>
              <input v-model="formSocial.x" type="url" class="input" placeholder="https://" />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">OnlyFans</p>
              <input v-model="formSocial.onlyfans" type="url" class="input" placeholder="https://" />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">TikTok</p>
              <input v-model="formSocial.tiktok" type="url" class="input" placeholder="https://" />
            </div>
            <div>
              <p class="mb-1 text-xs font-medium text-zinc-500">Privacy</p>
              <input v-model="formSocial.privacy" type="url" class="input" placeholder="https://" />
            </div>
            <button
              type="button"
              class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              :disabled="savingSocial"
              @click="saveSocialLinks"
            >
              Salvar redes
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 class="text-lg font-semibold text-white">Foto de perfil (público)</h2>
          <p class="mt-2 text-sm text-zinc-400">
            Imagem circular ao lado do contato. Fica pendente até moderação, como as restantes mídias.
          </p>
          <div class="mt-4">
            <input
              ref="avatarFileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="(e) => onSingleMediaPick(e, 'portal_avatar')"
            />
            <button
              type="button"
              class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
              :disabled="uploadingAvatar"
              @click="avatarFileInput?.click()"
            >
              {{ uploadingAvatar ? 'Enviando…' : 'Enviar foto de perfil' }}
            </button>
            <button
              v-if="profile.portal_avatar_media_id"
              type="button"
              class="ml-2 rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
              @click="removeSingleMedia('portal_avatar', profile.portal_avatar_media_id)"
            >
              Remover
            </button>
            <p v-if="profile.portal_avatar_media_id" class="mt-2 text-xs text-zinc-500">
              Estado: {{ moderationLabel(profile.portal_avatar_media_id) }}
            </p>
          </div>
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 class="text-lg font-semibold text-white">Áudio (apresentação)</h2>
          <p class="mt-2 text-sm text-zinc-400">
            Um único ficheiro de áudio (ex.: mp3). Aparece no perfil público após aprovação.
          </p>
          <div class="mt-4">
            <input
              ref="audioFileInput"
              type="file"
              accept="audio/*,.mp3,.m4a,.wav,.ogg"
              class="hidden"
              @change="(e) => onSingleMediaPick(e, 'audio')"
            />
            <button
              type="button"
              class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
              :disabled="uploadingAudio"
              @click="audioFileInput?.click()"
            >
              {{ uploadingAudio ? 'Enviando…' : 'Enviar áudio' }}
            </button>
            <button
              v-if="profile.audio_media_id"
              type="button"
              class="ml-2 rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
              @click="removeSingleMedia('audio', profile.audio_media_id)"
            >
              Remover
            </button>
            <p v-if="profile.audio_media_id" class="mt-2 text-xs text-zinc-500">
              Estado: {{ moderationLabel(profile.audio_media_id) }}
            </p>
          </div>
        </section>

        <section class="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 class="text-lg font-semibold text-white">Galeria (fotos e vídeos)</h2>
          <p class="mt-2 text-sm text-zinc-400">
            Novos arquivos ficam pendentes até a moderação. Remover um item é imediato. Na página pública, vídeos
            aparecem antes das fotos; na ordem que você definir abaixo.
          </p>
          <div class="mt-4">
            <input
              ref="galleryFileInput"
              type="file"
              accept="image/*,video/*"
              class="hidden"
              @change="onFilePick"
            />
            <button
              type="button"
              class="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
              :disabled="uploading"
              @click="openGalleryPicker"
            >
              Adicionar foto ou vídeo
            </button>
          </div>
          <ul class="mt-4 space-y-2">
            <li
              v-for="(id, idx) in galleryOrder"
              :key="id"
              class="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm"
            >
              <span class="min-w-[3rem] text-xs text-zinc-500">#{{ idx + 1 }}</span>
              <span class="flex-1 truncate text-zinc-300">{{ mediaLabel(id) }}</span>
              <span class="text-xs text-zinc-500">{{ moderationLabel(id) }}</span>
              <button
                type="button"
                class="rounded border border-zinc-600 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800"
                :disabled="idx === 0"
                @click="moveGallery(idx, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="rounded border border-zinc-600 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800"
                :disabled="idx >= galleryOrder.length - 1"
                @click="moveGallery(idx, 1)"
              >
                ↓
              </button>
              <button
                type="button"
                class="rounded border border-red-900/50 px-2 py-0.5 text-xs text-red-300 hover:bg-red-950/40"
                @click="removeGallery(id)"
              >
                Remover
              </button>
            </li>
          </ul>
          <button
            type="button"
            class="mt-4 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-600"
            :disabled="savingOrder"
            @click="applyGalleryOrder"
          >
            Aplicar ordem na galeria
          </button>
        </section>

        <p v-if="msg" class="text-sm" :class="err ? 'text-red-400' : 'text-emerald-400'">{{ msg }}</p>
      </template>

      <section v-else class="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6 text-sm text-amber-100/90">
        Seu cadastro ainda não foi aprovado. A edição do nome público, local e galeria ficará disponível após a
        aprovação.
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/conta/perfil',
})

useHead({
  title: 'Editar perfil',
})

type ApiState = { id: number; name: string; uf: string }
type ApiCity = { id: number; name: string }

type MediaMod = {
  id: number
  collection_name: string
  mime_type?: string | null
  name?: string | null
  moderation_status?: string
}

type SocialLinksPayload = {
  instagram?: string | null
  x?: string | null
  onlyfans?: string | null
  tiktok?: string | null
  privacy?: string | null
}

type Profile = {
  account_legal_name?: string | null
  professional_name?: string | null
  public_slug?: string | null
  profile_type?: 'men' | 'women' | 'trans' | null
  cover_media_id?: number | null
  portal_avatar_media_id?: number | null
  audio_media_id?: number | null
  cpf?: string | null
  mother_name?: string | null
  birth_date?: string | null
  approval_status?: string
  state_id?: number | null
  city_id?: number | null
  neighborhood?: string | null
  gallery_media_ids?: number[] | null
  media_moderation?: MediaMod[]
  professional_slug_cooldown_active?: boolean
  professional_slug_locked_until?: string | null
  city_change_cooldown_active?: boolean
  city_change_locked_until?: string | null
  portal_field_cooldown_hours?: number
  social_links?: SocialLinksPayload | null
}

const { user, fetchMe } = useAuth()
const { request } = useApi()

const loading = ref(true)
const profile = ref<Profile | null>(null)
const states = ref<ApiState[]>([])
const cities = ref<ApiCity[]>([])

const formProfessionalName = ref('')
const formStateId = ref('')
const formCityId = ref('')
const formNeighborhood = ref('')

const galleryOrder = ref<number[]>([])
const uploading = ref(false)
const savingName = ref(false)
const savingLoc = ref(false)
const savingOrder = ref(false)
const msg = ref('')
const err = ref(false)
const galleryFileInput = ref<HTMLInputElement | null>(null)
const avatarFileInput = ref<HTMLInputElement | null>(null)
const audioFileInput = ref<HTMLInputElement | null>(null)
const uploadingAvatar = ref(false)
const uploadingAudio = ref(false)

const formSocial = ref({
  instagram: '',
  x: '',
  onlyfans: '',
  tiktok: '',
  privacy: '',
})
const savingSocial = ref(false)

const exploreGenderSlug = computed(() => {
  const t = profile.value?.profile_type
  if (t === 'men') {
    return 'homens'
  }
  if (t === 'women') {
    return 'mulheres'
  }
  if (t === 'trans') {
    return 'trans'
  }
  return 'mulheres'
})

const requestUrl = useRequestURL()

const publicProfileUrl = computed(() => {
  const slug = profile.value?.public_slug
  if (!slug) {
    return '—'
  }
  const origin = import.meta.client ? window.location.origin : requestUrl.origin
  return `${origin}/explorar/${exploreGenderSlug.value}/perfil/${slug}`
})

function maskCpf(raw: string | null | undefined) {
  const d = String(raw ?? '').replace(/\D/g, '')
  if (d.length !== 11) {
    return raw ?? '—'
  }
  return `${d.slice(0, 3)}.***.***-${d.slice(9)}`
}

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

function mediaLabel(id: number) {
  const m = profile.value?.media_moderation?.find((x) => x.id === id)
  if (!m) {
    return `Mídia #${id}`
  }
  const isVid = m.mime_type?.startsWith('video/')
  return `${isVid ? 'Vídeo' : 'Foto'} · ${m.name || m.collection_name}`
}

function moderationLabel(id: number) {
  const m = profile.value?.media_moderation?.find((x) => x.id === id)
  const s = m?.moderation_status ?? '—'
  if (s === 'approved') {
    return 'Aprovada'
  }
  if (s === 'pending') {
    return 'Em análise'
  }
  if (s === 'rejected') {
    return 'Recusada'
  }
  return s
}

function apiErr(e: unknown): string {
  if (e && typeof e === 'object') {
    const x = e as { data?: { message?: string }; response?: { _data?: { message?: string } } }
    if (x.data?.message) {
      return x.data.message
    }
    const m = x.response?._data?.message
    if (m) {
      return m
    }
  }
  return 'Não foi possível concluir.'
}

async function refreshProfile() {
  const p = await request<Profile>('/v1/me/profile')
  profile.value = p
  formProfessionalName.value = (p.professional_name ?? '').trim()
  formStateId.value = p.state_id ? String(p.state_id) : ''
  formNeighborhood.value = p.neighborhood ?? ''
  if (formStateId.value) {
    cities.value = await request<ApiCity[]>(`/v1/states/${formStateId.value}/cities`)
  }
  formCityId.value = p.city_id ? String(p.city_id) : ''
  galleryOrder.value = [...(p.gallery_media_ids ?? [])]
  const sl = p.social_links
  formSocial.value = {
    instagram: typeof sl?.instagram === 'string' ? sl.instagram : '',
    x: typeof sl?.x === 'string' ? sl.x : '',
    onlyfans: typeof sl?.onlyfans === 'string' ? sl.onlyfans : '',
    tiktok: typeof sl?.tiktok === 'string' ? sl.tiktok : '',
    privacy: typeof sl?.privacy === 'string' ? sl.privacy : '',
  }
  await fetchMe()
}

async function load() {
  loading.value = true
  msg.value = ''
  try {
    states.value = await request<ApiState[]>('/v1/states')
    await refreshProfile()
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

async function onStateChange() {
  formCityId.value = ''
  cities.value = []
  if (!formStateId.value) {
    return
  }
  cities.value = await request<ApiCity[]>(`/v1/states/${formStateId.value}/cities`)
}

async function saveProfessionalName() {
  savingName.value = true
  err.value = false
  msg.value = ''
  try {
    await request('/v1/me/profile/portal', {
      method: 'PATCH',
      body: { professional_name: formProfessionalName.value.trim() },
    })
    msg.value = 'Nome atualizado. O link público foi ajustado pela plataforma.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    savingName.value = false
  }
}

function openGalleryPicker() {
  galleryFileInput.value?.click()
}

async function saveSocialLinks() {
  savingSocial.value = true
  err.value = false
  msg.value = ''
  try {
    await request('/v1/me/profile/portal', {
      method: 'PATCH',
      body: {
        social_links: {
          instagram: formSocial.value.instagram.trim() || null,
          x: formSocial.value.x.trim() || null,
          onlyfans: formSocial.value.onlyfans.trim() || null,
          tiktok: formSocial.value.tiktok.trim() || null,
          privacy: formSocial.value.privacy.trim() || null,
        },
      },
    })
    msg.value = 'Redes sociais atualizadas.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    savingSocial.value = false
  }
}

async function saveLocation() {
  savingLoc.value = true
  err.value = false
  msg.value = ''
  try {
    const body: Record<string, unknown> = {
      neighborhood: formNeighborhood.value.trim() || null,
    }
    if (!profile.value?.city_change_cooldown_active) {
      if (formStateId.value) {
        body.state_id = Number(formStateId.value)
      }
      if (formCityId.value) {
        body.city_id = Number(formCityId.value)
      }
    }
    await request('/v1/me/profile/portal', {
      method: 'PATCH',
      body,
    })
    msg.value = 'Local atualizado.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    savingLoc.value = false
  }
}

function moveGallery(idx: number, delta: number) {
  const next = idx + delta
  if (next < 0 || next >= galleryOrder.value.length) {
    return
  }
  const arr = [...galleryOrder.value]
  const t = arr[idx]!
  arr[idx] = arr[next]!
  arr[next] = t
  galleryOrder.value = arr
}

async function applyGalleryOrder() {
  savingOrder.value = true
  err.value = false
  msg.value = ''
  try {
    await request('/v1/me/profile/portal', {
      method: 'PATCH',
      body: { gallery_media_ids: galleryOrder.value },
    })
    msg.value = 'Ordem da galeria salva.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    savingOrder.value = false
  }
}

async function onSingleMediaPick(e: Event, purpose: 'portal_avatar' | 'audio') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  const uploading = purpose === 'portal_avatar' ? uploadingAvatar : uploadingAudio
  uploading.value = true
  err.value = false
  msg.value = ''
  try {
    const fd = new FormData()
    fd.append('purpose', purpose)
    fd.append('file', file)
    await request<{ id: number }>('/v1/me/media', { method: 'POST', body: fd })
    msg.value = 'Arquivo enviado. Aparecerá no público após moderação.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    uploading.value = false
  }
}

async function removeSingleMedia(_purpose: 'portal_avatar' | 'audio', mediaId: number) {
  if (!confirm('Remover este ficheiro?')) {
    return
  }
  err.value = false
  msg.value = ''
  try {
    await request(`/v1/me/media/${mediaId}`, { method: 'DELETE' })
    msg.value = 'Removido.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  }
}

async function onFilePick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  uploading.value = true
  err.value = false
  msg.value = ''
  try {
    const fd = new FormData()
    fd.append('purpose', 'gallery')
    fd.append('file', file)
    const res = await request<{ id: number }>('/v1/me/media', { method: 'POST', body: fd })
    galleryOrder.value = [...galleryOrder.value, res.id]
    await request('/v1/me/profile/portal', {
      method: 'PATCH',
      body: { gallery_media_ids: galleryOrder.value },
    })
    msg.value = 'Arquivo enviado. Ele aparecerá no público após moderação.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    uploading.value = false
  }
}

async function removeGallery(id: number) {
  if (!confirm('Remover este item da galeria?')) {
    return
  }
  err.value = false
  msg.value = ''
  try {
    await request(`/v1/me/media/${id}`, { method: 'DELETE' })
    galleryOrder.value = galleryOrder.value.filter((x) => x !== id)
    await request('/v1/me/profile/portal', {
      method: 'PATCH',
      body: { gallery_media_ids: galleryOrder.value },
    })
    msg.value = 'Item removido.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  }
}
</script>
