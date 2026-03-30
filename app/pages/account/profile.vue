<template>
  <div class="mx-auto max-w-3xl space-y-8 pb-20">
    <div>
      <NuxtLink to="/conta" class="text-sm text-zinc-500 transition hover:text-brand">← Minha conta</NuxtLink>
      <h1 class="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">Editar seu perfil</h1>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        Os dados pessoais do cadastro não podem ser alterados aqui. Use as seções abaixo para nome público, local,
        redes e mídias.
      </p>
    </div>

    <section v-if="loading" class="profile-panel text-sm text-zinc-400">Carregando…</section>

    <template v-else-if="profile">
      <!-- Navegação por seções -->
      <nav
        class="flex flex-wrap gap-2 border-b border-zinc-800/80 pb-4"
        aria-label="Seções do perfil"
      >
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          class="profile-nav-pill"
          :class="activeSection === item.id ? 'profile-nav-pill--active' : 'profile-nav-pill--inactive'"
          @click="setSection(item.id)"
        >
          <span class="text-base leading-none opacity-90">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <p
        v-if="msg"
        class="rounded-xl border px-4 py-3 text-sm"
        :class="
          err
            ? 'border-red-900/50 bg-red-950/30 text-red-200'
            : 'border-emerald-900/40 bg-emerald-950/25 text-emerald-100/90'
        "
        role="status"
      >
        {{ msg }}
      </p>

      <!-- Dados pessoais -->
      <section v-show="activeSection === 'dados'" class="profile-panel space-y-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Dados pessoais</h2>
          <p class="mt-1 text-sm text-zinc-500">Informações do cadastro</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="form-label">Nome completo (igual ao documento)</label>
            <input
              class="form-input"
              type="text"
              :value="profile.account_legal_name ?? ''"
              disabled
              readonly
            />
          </div>
          <div class="sm:col-span-2">
            <label class="form-label">E-mail da conta</label>
            <input class="form-input" type="email" :value="user?.email ?? ''" disabled readonly />
          </div>
          <div>
            <label class="form-label">CPF</label>
            <input class="form-input" type="text" :value="maskCpf(profile.cpf)" disabled readonly />
          </div>
          <div>
            <label class="form-label">Data de nascimento</label>
            <input
              class="form-input"
              type="text"
              :value="formatBirthDateDisplay(profile.birth_date)"
              disabled
              readonly
            />
          </div>
          <div class="sm:col-span-2">
            <label class="form-label">Nome da mãe</label>
            <input class="form-input" type="text" :value="profile.mother_name ?? '—'" disabled readonly />
          </div>
        </div>
      </section>

      <template v-if="profile.approval_status === 'approved'">
        <!-- Nome e link -->
        <section v-show="activeSection === 'perfil'" class="profile-panel space-y-4">
          <div>
            <h2 class="text-lg font-semibold text-white">Nome profissional e link público</h2>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">
              O endereço do perfil é gerado automaticamente a partir do nome profissional ao salvar. Se já existir outro
              igual, será adicionado um sufixo (ex.: <span class="text-zinc-300">joao-marques-2</span>). Só muda quando
              você altera o nome e clica em salvar.
            </p>
          </div>
          <p
            v-if="profile.professional_slug_cooldown_active && profile.professional_slug_locked_until"
            class="rounded-xl border border-amber-900/40 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/90"
          >
            Próxima alteração de nome disponível após
            {{ formatDate(profile.professional_slug_locked_until) }} ({{ profile.portal_field_cooldown_hours ?? 24 }}h).
          </p>
          <div class="space-y-4">
            <div>
              <label class="form-label" for="prof-name">Nome profissional (público)</label>
              <input
                id="prof-name"
                v-model="formProfessionalName"
                type="text"
                class="form-input"
                :disabled="profile.professional_slug_cooldown_active"
                maxlength="191"
                autocomplete="off"
              />
            </div>
            <div>
              <label class="form-label" for="public-url">Seu link público (URL completa)</label>
              <div class="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  id="public-url"
                  class="form-input min-w-0 flex-1 font-mono text-xs text-zinc-300"
                  type="text"
                  :value="publicProfileFullUrl"
                  readonly
                />
                <button
                  type="button"
                  class="shrink-0 rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-40"
                  :disabled="publicProfileFullUrl === '—'"
                  @click="copyPublicProfileLink"
                >
                  {{ copyPublicLinkDone ? 'Copiado!' : 'Copiar link' }}
                </button>
              </div>
            </div>
            <button
              type="button"
              class="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:opacity-90 disabled:opacity-45"
              :disabled="savingName || profile.professional_slug_cooldown_active"
              @click="saveProfessionalName"
            >
              {{ savingName ? 'Salvando…' : 'Salvar nome profissional' }}
            </button>
          </div>
        </section>

        <!-- Local -->
        <section v-show="activeSection === 'local'" class="profile-panel space-y-4">
          <div>
            <h2 class="text-lg font-semibold text-white">Local de atendimento</h2>
            <p class="mt-1 text-sm text-zinc-500">
              Estado e cidade na sua página; o bairro só aparece se você atende em local próprio.
            </p>
          </div>
          <p
            v-if="profile.city_change_cooldown_active && profile.city_change_locked_until"
            class="rounded-xl border border-amber-900/40 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/90"
          >
            Próxima alteração do local será permitido apenas após
            {{ formatDate(profile.city_change_locked_until) }} ({{ profile.portal_field_cooldown_hours ?? 24 }}h). O
            bairro pode ser alterado abaixo quando a opção «Tem local próprio para atendimento?» estiver em Sim.
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="form-label" for="st">Estado</label>
              <select
                id="st"
                v-model="formStateId"
                class="form-select"
                :disabled="profile.city_change_cooldown_active"
                @change="onStateChange"
              >
                <option value="">—</option>
                <option v-for="st in states" :key="st.id" :value="String(st.id)">{{ st.name }} ({{ st.uf }})</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="form-label" for="ct">Cidade</label>
              <select
                id="ct"
                v-model="formCityId"
                class="form-select"
                :disabled="profile.city_change_cooldown_active || !formStateId"
              >
                <option value="">—</option>
                <option v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
              </select>
            </div>
            <fieldset class="sm:col-span-2">
              <legend class="mb-2 block text-sm font-medium normal-case tracking-normal text-zinc-400">
                Tem local próprio para atendimento?
              </legend>
              <div class="flex flex-wrap gap-6">
                <label class="flex cursor-pointer items-center gap-2 text-sm font-normal normal-case text-zinc-200">
                  <input v-model="formHasVenue" type="radio" class="h-4 w-4 border-zinc-600 text-brand focus:ring-brand" :value="true" />
                  Sim
                </label>
                <label class="flex cursor-pointer items-center gap-2 text-sm font-normal normal-case text-zinc-200">
                  <input v-model="formHasVenue" type="radio" class="h-4 w-4 border-zinc-600 text-brand focus:ring-brand" :value="false" />
                  Não
                </label>
              </div>
            </fieldset>
            <div v-show="formHasVenue" class="sm:col-span-2">
              <label class="form-label" for="nh">Bairro</label>
              <input id="nh" v-model="formNeighborhood" type="text" class="form-input" maxlength="191" />
            </div>
          </div>
          <button
            type="button"
            class="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:opacity-90 disabled:opacity-45"
            :disabled="savingLoc"
            @click="saveLocation"
          >
            {{ savingLoc ? 'Salvando…' : 'Salvar local' }}
          </button>
        </section>

        <!-- Redes -->
        <section v-show="activeSection === 'redes'" class="profile-panel space-y-4">
          <div>
            <h2 class="text-lg font-semibold text-white">Redes sociais e links</h2>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">
              Use URLs completas (<span
                class="text-zinc-500"
                >https://</span
              >).
            </p>
          </div>
          <div class="space-y-4">
            <div>
              <label class="form-label" for="soc-ig">Instagram</label>
              <div
                class="flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/25"
              >
                <span
                  class="flex w-12 shrink-0 items-center justify-center border-r border-zinc-700 bg-zinc-900/80 text-zinc-400"
                  aria-hidden="true"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                    />
                  </svg>
                </span>
                <input
                  id="soc-ig"
                  v-model="formSocial.instagram"
                  type="url"
                  class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                  placeholder="https://"
                />
              </div>
            </div>
            <div>
              <label class="form-label" for="soc-x">X (Twitter)</label>
              <div
                class="flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/25"
              >
                <span
                  class="flex w-12 shrink-0 items-center justify-center border-r border-zinc-700 bg-zinc-900/80 text-zinc-400"
                  aria-hidden="true"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    />
                  </svg>
                </span>
                <input
                  id="soc-x"
                  v-model="formSocial.x"
                  type="url"
                  class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                  placeholder="https://"
                />
              </div>
            </div>
            <div>
              <label class="form-label" for="soc-of">OnlyFans</label>
              <div
                class="flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/25"
              >
                <span
                  class="flex w-12 shrink-0 items-center justify-center border-r border-zinc-700 bg-zinc-900/80 text-zinc-400"
                  aria-hidden="true"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                    />
                  </svg>
                </span>
                <input
                  id="soc-of"
                  v-model="formSocial.onlyfans"
                  type="url"
                  class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                  placeholder="https://"
                />
              </div>
            </div>
            <div>
              <label class="form-label" for="soc-tt">TikTok</label>
              <div
                class="flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/25"
              >
                <span
                  class="flex w-12 shrink-0 items-center justify-center border-r border-zinc-700 bg-zinc-900/80 text-zinc-400"
                  aria-hidden="true"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                    />
                  </svg>
                </span>
                <input
                  id="soc-tt"
                  v-model="formSocial.tiktok"
                  type="url"
                  class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                  placeholder="https://"
                />
              </div>
            </div>
            <div>
              <label class="form-label" for="soc-pr">Privacy</label>
              <div
                class="flex overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/25"
              >
                <span
                  class="flex w-12 shrink-0 items-center justify-center border-r border-zinc-700 bg-zinc-900/80 text-zinc-400"
                  aria-hidden="true"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  id="soc-pr"
                  v-model="formSocial.privacy"
                  type="url"
                  class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            class="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:opacity-90 disabled:opacity-45"
            :disabled="savingSocial"
            @click="saveSocialLinks"
          >
            {{ savingSocial ? 'Salvando…' : 'Salvar redes' }}
          </button>
        </section>

        <!-- Mídias -->
        <section v-show="activeSection === 'midias'" class="space-y-6">
          <div class="profile-panel space-y-6">
            <div>
              <h2 class="text-lg font-semibold text-white">Foto de perfil</h2>
              <p class="mt-1 text-sm text-zinc-400">
                A foto aprovada continua no site até uma nova troca ser aprovada. Envios novos ficam em análise; você pode
                pré-visualizar e remover antes da decisão da equipe.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <input
                ref="avatarFileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="(e) => onSingleMediaPick(e, 'portal_avatar')"
              />
              <button
                type="button"
                class="rounded-xl border border-zinc-600 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
                :disabled="uploadingAvatar || mediaAccessBusy !== null"
                @click="avatarFileInput?.click()"
              >
                {{ uploadingAvatar ? 'Enviando…' : publishedAvatarMediaId ? 'Enviar nova foto' : 'Enviar foto de perfil' }}
              </button>
            </div>

            <div
              v-if="publishedAvatarMediaId"
              class="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-4"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-emerald-400/90">No perfil público</p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/20"
                  :disabled="uploadingAvatar || (mediaAccessBusy !== null && !imagePreviewUrls[publishedAvatarMediaId])"
                  @click="toggleImagePreview(publishedAvatarMediaId!)"
                >
                  {{
                    imagePreviewUrls[publishedAvatarMediaId!]
                      ? 'Ocultar imagem'
                      : mediaAccessBusy === publishedAvatarMediaId
                        ? 'Abrindo…'
                        : 'Ver imagem'
                  }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-red-900/50 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-950/40"
                  :disabled="uploadingAvatar || mediaAccessBusy !== null"
                  @click="removeSingleMedia('portal_avatar', publishedAvatarMediaId!)"
                >
                  Remover
                </button>
              </div>
              <div
                v-if="imagePreviewUrls[publishedAvatarMediaId!]"
                class="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-black/40 p-2"
              >
                <img
                  :src="imagePreviewUrls[publishedAvatarMediaId!]"
                  alt="Foto no perfil público"
                  class="mx-auto max-h-64 w-auto max-w-full rounded-lg object-contain"
                />
              </div>
            </div>

            <div
              v-if="pendingAvatarMediaId && pendingAvatarMediaId !== publishedAvatarMediaId"
              class="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-amber-200/90">Aguardando aprovação</p>
              <p class="mt-1 text-sm text-amber-100/80">
                Aguarde a análise da equipe. Se já houver foto no site, ela permanece até este envio ser aprovado.
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/20"
                  :disabled="uploadingAvatar || (mediaAccessBusy !== null && !imagePreviewUrls[pendingAvatarMediaId!])"
                  @click="toggleImagePreview(pendingAvatarMediaId!)"
                >
                  {{
                    imagePreviewUrls[pendingAvatarMediaId!]
                      ? 'Ocultar imagem'
                      : mediaAccessBusy === pendingAvatarMediaId
                        ? 'Abrindo…'
                        : 'Ver imagem'
                  }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-red-900/50 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-950/40"
                  :disabled="uploadingAvatar || mediaAccessBusy !== null"
                  @click="removeSingleMedia('portal_avatar', pendingAvatarMediaId!)"
                >
                  Remover envio
                </button>
              </div>
              <div
                v-if="imagePreviewUrls[pendingAvatarMediaId!]"
                class="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-black/40 p-2"
              >
                <img
                  :src="imagePreviewUrls[pendingAvatarMediaId!]"
                  alt="Foto aguardando aprovação"
                  class="mx-auto max-h-64 w-auto max-w-full rounded-lg object-contain"
                />
              </div>
            </div>
          </div>

          <div class="profile-panel space-y-6">
            <div>
              <h2 class="text-lg font-semibold text-white">Áudio (apresentação)</h2>
              <p class="mt-1 text-sm text-zinc-400">
                O áudio aprovado permanece no perfil público até um novo arquivo ser aprovado. Você pode enviar outro,
                ouvir e remover o que está em análise.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <input
                ref="audioFileInput"
                type="file"
                accept="audio/*,.mp3,.m4a,.wav,.ogg"
                class="hidden"
                @change="(e) => onSingleMediaPick(e, 'audio')"
              />
              <button
                type="button"
                class="rounded-xl border border-zinc-600 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
                :disabled="uploadingAudio || mediaAccessBusy !== null"
                @click="audioFileInput?.click()"
              >
                {{ uploadingAudio ? 'Enviando…' : publishedAudioMediaId ? 'Enviar novo áudio' : 'Enviar áudio' }}
              </button>
            </div>

            <div
              v-if="publishedAudioMediaId"
              class="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-4"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-emerald-400/90">No perfil público</p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/20"
                  :disabled="uploadingAudio || (mediaAccessBusy !== null && !(audioPlayerForId === publishedAudioMediaId && audioPlayerUrl))"
                  @click="toggleAudioPlayer(publishedAudioMediaId!)"
                >
                  {{
                    audioPlayerForId === publishedAudioMediaId && audioPlayerUrl
                      ? 'Ocultar áudio'
                      : mediaAccessBusy === publishedAudioMediaId
                        ? 'Carregando…'
                        : 'Ouvir áudio'
                  }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-red-900/50 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-950/40"
                  :disabled="uploadingAudio || mediaAccessBusy !== null"
                  @click="removeSingleMedia('audio', publishedAudioMediaId!)"
                >
                  Remover
                </button>
              </div>
              <div
                v-if="audioPlayerForId === publishedAudioMediaId && audioPlayerUrl"
                class="mt-4 rounded-xl border border-zinc-800 bg-black/40 p-4"
              >
                <audio :src="audioPlayerUrl" controls class="w-full" preload="metadata" />
              </div>
            </div>

            <div
              v-if="pendingAudioMediaId && pendingAudioMediaId !== publishedAudioMediaId"
              class="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-amber-200/90">Aguardando aprovação</p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/20"
                  :disabled="uploadingAudio || (mediaAccessBusy !== null && !(audioPlayerForId === pendingAudioMediaId && audioPlayerUrl))"
                  @click="toggleAudioPlayer(pendingAudioMediaId!)"
                >
                  {{
                    audioPlayerForId === pendingAudioMediaId && audioPlayerUrl
                      ? 'Ocultar áudio'
                      : mediaAccessBusy === pendingAudioMediaId
                        ? 'Carregando…'
                        : 'Ouvir áudio'
                  }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-red-900/50 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-950/40"
                  :disabled="uploadingAudio || mediaAccessBusy !== null"
                  @click="removeSingleMedia('audio', pendingAudioMediaId!)"
                >
                  Remover envio
                </button>
              </div>
              <div
                v-if="audioPlayerForId === pendingAudioMediaId && audioPlayerUrl"
                class="mt-4 rounded-xl border border-zinc-800 bg-black/40 p-4"
              >
                <audio :src="audioPlayerUrl" controls class="w-full" preload="metadata" />
              </div>
            </div>
          </div>

          <div class="profile-panel space-y-4">
            <div>
              <h2 class="text-lg font-semibold text-white">Galeria (fotos e vídeos)</h2>
              <p class="mt-2 text-sm leading-relaxed text-zinc-400">
                Novos arquivos ficam pendentes até moderação. Na página pública, os vídeos aparecem antes das fotos,
                na ordem que você definir abaixo.
              </p>
            </div>
            <div>
              <input
                ref="galleryFileInput"
                type="file"
                accept="image/*,video/*"
                class="hidden"
                @change="onFilePick"
              />
              <button
                type="button"
                class="rounded-xl border border-zinc-600 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
                :disabled="uploading"
                @click="openGalleryPicker"
              >
                {{ uploading ? 'Enviando…' : 'Adicionar foto ou vídeo' }}
              </button>
            </div>
            <ul class="space-y-3">
              <li
                v-for="(id, idx) in galleryOrder"
                :key="id"
                class="rounded-xl border border-zinc-800/90 bg-zinc-950/60 px-4 py-3 text-sm"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-zinc-100">{{ galleryItemPrimaryTitle(id) }}</p>
                    <p class="mt-0.5 text-xs text-zinc-500">Ordem na galeria: {{ idx + 1 }}</p>
                    <p class="mt-1 text-xs font-medium" :class="moderationStatusClass(id)">
                      {{ moderationStatusLabel(id) }}
                    </p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <button
                      type="button"
                      class="rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/20"
                      :disabled="galleryLightboxLoading || mediaAccessBusy !== null"
                      @click="openGalleryLightbox(idx)"
                    >
                      {{ galleryLightboxLoading ? 'Preparando…' : galleryOpenActionLabel(id) }}
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-zinc-600 px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800"
                      :disabled="idx === 0"
                      @click="moveGallery(idx, -1)"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-zinc-600 px-2 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800"
                      :disabled="idx >= galleryOrder.length - 1"
                      @click="moveGallery(idx, 1)"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-red-900/50 px-2 py-1.5 text-xs text-red-300 hover:bg-red-950/40"
                      @click="removeGallery(id)"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            </ul>
            <button
              type="button"
              class="rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-600 disabled:opacity-45"
              :disabled="savingOrder"
              @click="applyGalleryOrder"
            >
              {{ savingOrder ? 'Salvando…' : 'Aplicar ordem na galeria' }}
            </button>
          </div>

          <ProfileMediaLightbox
            v-model="galleryLightboxOpen"
            :items="galleryLightboxItems"
            :start-index="galleryLightboxStart"
            alt-text="Mídia da sua galeria"
          />
        </section>
      </template>

      <section
        v-else
        class="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6 text-sm leading-relaxed text-amber-100/90"
      >
        Seu cadastro ainda não foi aprovado. A edição do nome público, local e galeria ficará disponível após a
        aprovação.
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSwal } from '~/composables/useSwal'
import { buildPublicProfilePath } from '~/utils/public-profile-url'

definePageMeta({
  layout: 'default',
  path: '/conta/perfil',
})

useHead({
  title: 'Editar perfil',
})

type ApiState = { id: number; name: string; uf: string }
type ApiCity = { id: number; name: string }

type SectionId = 'dados' | 'perfil' | 'local' | 'redes' | 'midias'

type MediaMod = {
  id: number
  collection_name: string
  mime_type?: string | null
  name?: string | null
  file_name?: string | null
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
  service_type?: 'companion' | 'masseuse' | string | null
  profile_type?: 'men' | 'women' | 'trans' | null
  cover_media_id?: number | null
  portal_avatar_media_id?: number | null
  portal_avatar_pending_media_id?: number | null
  audio_media_id?: number | null
  audio_pending_media_id?: number | null
  public_portal_avatar_media_id?: number | null
  public_audio_media_id?: number | null
  cpf?: string | null
  mother_name?: string | null
  birth_date?: string | null
  approval_status?: string
  state_id?: number | null
  city_id?: number | null
  neighborhood?: string | null
  has_venue?: boolean | null
  gallery_media_ids?: number[] | null
  media_moderation?: MediaMod[]
  professional_slug_cooldown_active?: boolean
  professional_slug_locked_until?: string | null
  city_change_cooldown_active?: boolean
  city_change_locked_until?: string | null
  portal_field_cooldown_hours?: number
  social_links?: SocialLinksPayload | null
}

const route = useRoute()

const { user, fetchMe } = useAuth()
const { request } = useApi()
const { swalConfirm } = useSwal()

const loading = ref(true)
const profile = ref<Profile | null>(null)
const states = ref<ApiState[]>([])
const cities = ref<ApiCity[]>([])

const activeSection = ref<SectionId>('perfil')

const copyPublicLinkDone = ref(false)

const formProfessionalName = ref('')
const formStateId = ref('')
const formCityId = ref('')
const formNeighborhood = ref('')
/** false = sem local próprio; bairro oculto e limpo ao salvar */
const formHasVenue = ref(true)

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

const imagePreviewUrls = ref<Record<number, string>>({})
const audioPlayerUrl = ref('')
const audioPlayerForId = ref<number | null>(null)
const mediaAccessBusy = ref<number | null>(null)

type ProfileLightboxItem = {
  kind: 'audio' | 'video' | 'image'
  url: string
  caption?: string
}

const galleryLightboxOpen = ref(false)
const galleryLightboxItems = ref<ProfileLightboxItem[]>([])
const galleryLightboxStart = ref(0)
const galleryLightboxLoading = ref(false)

const publishedAvatarMediaId = computed(() => profile.value?.public_portal_avatar_media_id ?? null)

const pendingAvatarMediaId = computed(() => {
  const p = profile.value
  if (!p) {
    return null
  }
  if (p.portal_avatar_pending_media_id) {
    return p.portal_avatar_pending_media_id
  }
  if (!p.public_portal_avatar_media_id && p.portal_avatar_media_id) {
    return p.portal_avatar_media_id
  }
  return null
})

const publishedAudioMediaId = computed(() => profile.value?.public_audio_media_id ?? null)

const pendingAudioMediaId = computed(() => {
  const p = profile.value
  if (!p) {
    return null
  }
  if (p.audio_pending_media_id) {
    return p.audio_pending_media_id
  }
  if (!p.public_audio_media_id && p.audio_media_id) {
    return p.audio_media_id
  }
  return null
})

const navItems = computed(() => {
  const items: { id: SectionId; label: string; icon: string }[] = [
    { id: 'dados', label: 'Dados pessoais', icon: '👤' },
  ]
  if (profile.value?.approval_status === 'approved') {
    items.push(
      { id: 'perfil', label: 'Nome e link', icon: '✨' },
      { id: 'local', label: 'Local', icon: '📍' },
      { id: 'redes', label: 'Redes sociais', icon: '🔗' },
      { id: 'midias', label: 'Mídias', icon: '🖼' },
    )
  }
  return items
})

function normalizeSectionQuery(raw: unknown): SectionId | null {
  const s = typeof raw === 'string' ? raw : ''
  const allowed: SectionId[] = ['dados', 'perfil', 'local', 'redes', 'midias']
  return allowed.includes(s as SectionId) ? (s as SectionId) : null
}

function setSection(id: SectionId) {
  const allowed = navItems.value.some((x) => x.id === id)
  if (!allowed) {
    return
  }
  activeSection.value = id
  navigateTo({ path: '/conta/perfil', query: { ...route.query, secao: id } }, { replace: true })
}

function syncSectionFromRoute() {
  const want = normalizeSectionQuery(route.query.secao)
  if (!want) {
    return
  }
  const allowed = navItems.value.some((x) => x.id === want)
  if (allowed) {
    activeSection.value = want
  }
}

watch(
  () => profile.value?.approval_status,
  () => {
    if (profile.value?.approval_status !== 'approved' && activeSection.value !== 'dados') {
      activeSection.value = 'dados'
      navigateTo({ path: '/conta/perfil', query: { ...route.query, secao: 'dados' } }, { replace: true })
    }
  },
)

watch(
  () => route.query.secao,
  () => syncSectionFromRoute(),
)

watch(activeSection, () => {
  msg.value = ''
  err.value = false
})

watch(formHasVenue, (v) => {
  if (!v) {
    formNeighborhood.value = ''
  }
})

const requestUrl = useRequestURL()

/** Rota pública: /acompanhante/:slug ou /massagista/:slug (slug = public_slug no servidor). */
const publicProfilePath = computed(() => {
  const slug = profile.value?.public_slug
  if (!slug) {
    return '—'
  }
  return buildPublicProfilePath(slug, profile.value?.service_type)
})

const publicProfileFullUrl = computed(() => {
  if (publicProfilePath.value === '—') {
    return '—'
  }
  const origin = import.meta.client ? window.location.origin : requestUrl.origin
  return `${origin}${publicProfilePath.value}`
})

async function copyPublicProfileLink() {
  const text = publicProfileFullUrl.value
  if (!text || text === '—') {
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    copyPublicLinkDone.value = true
    window.setTimeout(() => {
      copyPublicLinkDone.value = false
    }, 2000)
  } catch {
    msg.value = 'Não foi possível copiar. Selecione o link manualmente.'
    err.value = true
  }
}

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

/** Data de nascimento só em calendário, pt-BR (evita ISO com horário na tela). */
function formatBirthDateDisplay(raw: string | null | undefined) {
  if (!raw) {
    return '—'
  }
  const s = String(raw).trim()
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymd) {
    const [, y, mo, d] = ymd
    return `${d}/${mo}/${y}`
  }
  try {
    const t = new Date(s)
    if (!Number.isNaN(t.getTime())) {
      return t.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  } catch {
    /* fallthrough */
  }
  return s
}

type MediaTemporaryUrlResponse = { url: string; expires_at?: string }

function galleryMeta(id: number): MediaMod | undefined {
  return profile.value?.media_moderation?.find((x) => x.id === id)
}

const GALLERY_VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v|mkv|avi|wmv|3gp)$/i

function galleryItemIsVideo(id: number): boolean {
  const m = galleryMeta(id)
  const mt = (m?.mime_type ?? '').toLowerCase()
  if (mt.startsWith('video/')) {
    return true
  }
  if (mt.startsWith('image/')) {
    return false
  }
  const fn = String(m?.file_name ?? '').trim()
  const fnBase = fn.split(/[/\\]/).pop() || fn
  if (GALLERY_VIDEO_EXT.test(fnBase)) {
    return true
  }
  const raw = String(m?.name ?? '')
    .trim()
    .toLowerCase()
  const base = raw.split(/[/\\]/).pop() || raw
  return GALLERY_VIDEO_EXT.test(base)
}

function galleryKindLabel(id: number): string {
  return galleryItemIsVideo(id) ? 'Vídeo' : 'Foto'
}

function extensionFromStoredFileName(fileName: string): string {
  const m = fileName.trim().match(/(\.[^./\\]+)$/)
  return m ? m[1]!.toLowerCase() : ''
}

function galleryExtensionHintFromMime(mime: string): string {
  const map: Record<string, string> = {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'video/3gpp': '.3gp',
    'video/x-msvideo': '.avi',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  }
  return map[mime.toLowerCase()] ?? ''
}

/** Título: `name` + extensão de `file_name` (ou nome completo do arquivo armazenado). */
function galleryItemPrimaryTitle(id: number): string {
  const m = galleryMeta(id)
  if (!m) {
    return galleryKindLabel(id)
  }
  const name = (m.name && String(m.name).trim()) || ''
  const fileName = (m.file_name && String(m.file_name).trim()) || ''
  const extFromFile = extensionFromStoredFileName(fileName)
  if (name && extFromFile && !name.toLowerCase().endsWith(extFromFile)) {
    return `${name}${extFromFile}`
  }
  if (fileName) {
    return fileName.split(/[/\\]/).pop() || fileName
  }
  if (name) {
    const mt = (m.mime_type ?? '').toLowerCase()
    const ext = galleryExtensionHintFromMime(mt)
    return ext && !name.toLowerCase().endsWith(ext) ? `${name}${ext}` : name
  }
  return galleryKindLabel(id)
}

function galleryItemCaptionForLightbox(id: number): string | undefined {
  const t = galleryItemPrimaryTitle(id)
  const fallback = galleryKindLabel(id)
  return t === fallback ? undefined : t
}

function galleryItemKindForLightbox(id: number): 'video' | 'image' {
  return galleryItemIsVideo(id) ? 'video' : 'image'
}

function galleryOpenActionLabel(id: number): string {
  return galleryItemIsVideo(id) ? 'Ver vídeo' : 'Ver imagem'
}

function moderationStatusLabel(id: number): string {
  const s = galleryMeta(id)?.moderation_status
  if (s === 'approved') {
    return 'Aprovada — visível no perfil público'
  }
  if (s === 'rejected') {
    return 'Recusada pela moderação'
  }
  if (s === 'registration') {
    return 'Será publicada quando o cadastro for aprovado'
  }
  return 'Aguardando aprovação'
}

function moderationStatusClass(id: number): string {
  const s = galleryMeta(id)?.moderation_status
  if (s === 'approved') {
    return 'text-emerald-400/90'
  }
  if (s === 'rejected') {
    return 'text-red-400/90'
  }
  if (s === 'registration') {
    return 'text-sky-300/90'
  }
  return 'text-amber-200/90'
}

async function fetchMediaTemporaryUrl(mediaId: number): Promise<string> {
  const r = await request<MediaTemporaryUrlResponse>(`/v1/me/media/${mediaId}/temporary-url`)
  return r.url
}

async function withTemporaryMediaUrl(mediaId: number, onUrl: (url: string) => void) {
  if (mediaAccessBusy.value !== null) {
    return
  }
  mediaAccessBusy.value = mediaId
  err.value = false
  try {
    const url = await fetchMediaTemporaryUrl(mediaId)
    onUrl(url)
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    mediaAccessBusy.value = null
  }
}

function toggleImagePreview(mediaId: number) {
  if (imagePreviewUrls.value[mediaId]) {
    const next = { ...imagePreviewUrls.value }
    delete next[mediaId]
    imagePreviewUrls.value = next
    return
  }
  void withTemporaryMediaUrl(mediaId, (url) => {
    imagePreviewUrls.value = { ...imagePreviewUrls.value, [mediaId]: url }
  })
}

function toggleAudioPlayer(mediaId: number) {
  if (audioPlayerForId.value === mediaId && audioPlayerUrl.value) {
    audioPlayerForId.value = null
    audioPlayerUrl.value = ''
    return
  }
  void withTemporaryMediaUrl(mediaId, (url) => {
    audioPlayerForId.value = mediaId
    audioPlayerUrl.value = url
  })
}

async function openGalleryLightbox(startIdx: number) {
  const ids = [...galleryOrder.value]
  if (ids.length === 0 || galleryLightboxLoading.value) {
    return
  }
  if (mediaAccessBusy.value !== null) {
    return
  }
  galleryLightboxLoading.value = true
  err.value = false
  try {
    const urls = await Promise.all(ids.map((id) => fetchMediaTemporaryUrl(id)))
    galleryLightboxItems.value = ids.map((id, i) => ({
      kind: galleryItemKindForLightbox(id),
      url: urls[i]!,
      caption: galleryItemCaptionForLightbox(id) ?? galleryItemPrimaryTitle(id),
    }))
    galleryLightboxStart.value = startIdx
    galleryLightboxOpen.value = true
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    galleryLightboxLoading.value = false
  }
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
  imagePreviewUrls.value = {}
  audioPlayerUrl.value = ''
  audioPlayerForId.value = null
  profile.value = p
  formProfessionalName.value = (p.professional_name ?? '').trim()
  formStateId.value = p.state_id ? String(p.state_id) : ''
  formHasVenue.value = p.has_venue !== false
  formNeighborhood.value = p.has_venue === false ? '' : (p.neighborhood ?? '')
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
  syncSectionFromRoute()
}

async function load() {
  loading.value = true
  msg.value = ''
  try {
    states.value = await request<ApiState[]>('/v1/states')
    await refreshProfile()
    syncSectionFromRoute()
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
    const hasVenue = formHasVenue.value
    const body: Record<string, unknown> = {
      has_venue: hasVenue,
      neighborhood: hasVenue ? formNeighborhood.value.trim() || null : null,
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
  const uploadingRef = purpose === 'portal_avatar' ? uploadingAvatar : uploadingAudio
  uploadingRef.value = true
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
    uploadingRef.value = false
  }
}

async function removeSingleMedia(_purpose: 'portal_avatar' | 'audio', mediaId: number) {
  const ok = await swalConfirm({
    title: 'Remover este arquivo?',
    text: 'O arquivo será apagado do seu perfil.',
    icon: 'warning',
    confirmButtonText: 'Sim, remover',
    cancelButtonText: 'Cancelar',
  })
  if (!ok) {
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
    msg.value = 'Arquivo enviado. Aparecerá no público após moderação.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    uploading.value = false
  }
}

async function removeGallery(id: number) {
  const ok = await swalConfirm({
    title: 'Remover este item da galeria?',
    text: 'A mídia será excluída e sairá da ordem da galeria.',
    icon: 'warning',
    confirmButtonText: 'Sim, remover',
    cancelButtonText: 'Cancelar',
  })
  if (!ok) {
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
