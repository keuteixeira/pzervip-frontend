<template>
  <div class="w-full space-y-8 pb-20">
    <div>
      <NuxtLink to="/conta" class="text-sm text-zinc-500 transition hover:text-brand">← Minha conta</NuxtLink>
      <h1 class="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">Editar seu perfil</h1>
      <p class="mt-2 max-w-4xl text-sm leading-relaxed text-zinc-400">
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
            <h2 class="text-lg font-semibold text-white">Nome profissional, biografia e link público</h2>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">
              O link do perfil é gerado a partir do nome profissional após a nossa aprovação. Enquanto isso, o site
              continua com o nome e o endereço atuais. A biografia também só entra no ar depois de validada.
            </p>
          </div>
          <p
            v-if="profile.has_portal_text_pending"
            class="rounded-xl border border-sky-900/50 bg-sky-950/30 px-4 py-3 text-sm text-sky-100/95"
          >
            Há alterações de nome e/ou biografia em análise.
            <span v-if="profile.portal_text_pending_submitted_at" class="block mt-1 text-sky-200/80">
              Enviado em {{ formatDate(profile.portal_text_pending_submitted_at) }}.
            </span>
          </p>
          <p
            v-if="profile.professional_slug_cooldown_active && profile.professional_slug_locked_until"
            class="rounded-xl border border-amber-900/40 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/90"
          >
            Após a última alteração de nome aprovada, o link público só é
            republicado conforme a regra de carência até
            {{ formatDate(profile.professional_slug_locked_until) }} ({{ profile.portal_field_cooldown_hours ?? 24 }}h).
            Você ainda pode enviar uma nova proposta; ela entra na fila de análise.
          </p>
          <div class="space-y-4">
            <div>
              <label class="form-label" for="prof-name">Nome profissional (público)</label>
              <input
                id="prof-name"
                v-model="formProfessionalName"
                type="text"
                class="form-input"
                maxlength="191"
                autocomplete="off"
              />
            </div>
            <div>
              <label class="form-label" for="public-bio">Biografia (público)</label>
              <textarea
                id="public-bio"
                v-model="formBio"
                rows="6"
                class="form-input min-h-[140px] resize-y"
                maxlength="20000"
                placeholder="Texto que aparece no seu perfil público após aprovação."
              />
              <p class="mt-1 text-xs text-zinc-500">Máx. 20&nbsp;000 caracteres. Envio gera revisão pela equipe.</p>
            </div>
            <div>
              <label class="form-label" for="public-url">Seu link público atual (URL completa)</label>
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
            <div
              v-if="profile.public_slug_preview_from_pending_name"
              class="rounded-xl border border-zinc-700/60 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Prévia do link (se o nome pendente for aprovado)</p>
              <p class="mt-1 break-all font-mono text-xs text-brand">{{ pendingPublicProfileFullUrl }}</p>
            </div>
            <button
              type="button"
              class="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:opacity-90 disabled:opacity-45"
              :disabled="savingPortalText"
              @click="savePortalTextPresentation"
            >
              {{ savingPortalText ? 'Enviando…' : 'Enviar nome e biografia para análise' }}
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

        <!-- WhatsApp do anúncio -->
        <section v-show="activeSection === 'whatsapp'" class="profile-panel space-y-4">
          <div>
            <h2 class="text-lg font-semibold text-white">WhatsApp do anúncio</h2>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">
              Número exibido no perfil público para visitantes entrarem em contacto. Para alterar, confirme o código de 6
              dígitos que enviamos ao <strong class="text-zinc-300">novo</strong> número (mesmo fluxo do cadastro).
            </p>
          </div>
          <div class="rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3">
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Número atual</p>
            <p class="mt-1 font-mono text-lg text-white">
              {{ profileWhatsappDisplay }}
            </p>
          </div>
          <p
            v-if="waFeedback"
            class="rounded-lg border px-3 py-2 text-sm"
            :class="
              waFeedbackErr ? 'border-red-900/50 bg-red-950/30 text-red-200' : 'border-emerald-900/40 bg-emerald-950/25 text-emerald-100/90'
            "
          >
            {{ waFeedback }}
          </p>
          <button
            type="button"
            class="rounded-xl border border-zinc-600 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-brand/50 hover:bg-zinc-900"
            @click="toggleWaChangePanel"
          >
            {{ waChangeOpen ? 'Fechar' : 'Trocar número' }}
          </button>
          <div v-if="waChangeOpen" class="space-y-4 border-t border-zinc-800 pt-4">
            <template v-if="!waAwaitingOtp">
              <label class="form-label" for="wa-new">Novo WhatsApp (com DDD)</label>
              <input
                id="wa-new"
                :value="waNewPhone"
                type="text"
                inputmode="tel"
                autocomplete="tel"
                maxlength="15"
                class="form-input mt-2 max-w-md font-mono"
                placeholder="(11) 98765-4321"
                @input="onWaNewInput"
              />
              <button
                type="button"
                class="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:opacity-90 disabled:opacity-45"
                :disabled="waBusy || phoneDigits(waNewPhone).length < 10 || waResendSecondsLeft > 0"
                @click="waSendOtp"
              >
                {{ waBusy ? 'Enviando…' : 'Enviar código por WhatsApp' }}
              </button>
              <p v-if="waResendSecondsLeft > 0" class="text-sm text-zinc-500">
                Pode pedir novo código em {{ waResendSecondsLeft }}s
              </p>
            </template>
            <template v-else>
              <p class="text-sm text-zinc-400">
                Código enviado para
                <strong class="text-emerald-200/95">{{ formatPhoneBrMask(phoneDigits(waNewPhone)) }}</strong>
              </p>
              <label class="form-label" for="wa-otp">Código de 6 dígitos</label>
              <input
                id="wa-otp"
                :value="waOtpDigits"
                type="text"
                inputmode="numeric"
                maxlength="6"
                autocomplete="one-time-code"
                class="form-input mt-2 max-w-xs font-mono text-xl tracking-[0.35em]"
                placeholder="000000"
                @input="onWaOtpInput"
              />
              <div class="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:opacity-90 disabled:opacity-45"
                  :disabled="waBusy || waOtpDigits.length !== 6"
                  @click="waVerifyOtp"
                >
                  {{ waBusy ? 'A confirmar…' : 'Confirmar novo número' }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-45"
                  :disabled="waBusy || waResendSecondsLeft > 0 || phoneDigits(waNewPhone).length < 10"
                  @click="waSendOtp"
                >
                  Reenviar código
                </button>
                <span v-if="waResendSecondsLeft > 0" class="text-sm text-zinc-500">
                  Reenvio em {{ waResendSecondsLeft }}s
                </span>
              </div>
            </template>
          </div>
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
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <h2 class="text-lg font-semibold text-white">Banner (capa)</h2>
              <p class="mt-1 text-sm text-zinc-400">
                Uma imagem larga no topo do seu perfil público. Só existe um banner: ao enviar outro, o anterior deixa de
                ser a capa ativa. Novos envios ficam em análise até a equipe aprovar. Formatos: JPG, PNG ou WebP; até
                {{ REGISTER_IMAGE_MAX_FILE_MB }} MB.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <input
                ref="coverFileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="(e) => onSingleMediaPick(e, 'cover')"
              />
              <button
                type="button"
                class="rounded-xl border border-zinc-600 bg-zinc-900/50 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
                :disabled="uploadingCover || uploadingAvatar || uploadingAudio || uploading || mediaAccessBusy !== null"
                @click="coverFileInput?.click()"
              >
                {{
                  uploadingCover
                    ? 'Enviando…'
                    : publishedCoverMediaId
                      ? 'Enviar novo banner'
                      : 'Enviar banner'
                }}
              </button>
            </div>

            <div
              v-if="publishedCoverMediaId"
              class="rounded-xl border border-zinc-800/90 bg-zinc-950/50 p-4"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-emerald-400/90">No perfil público</p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/20"
                  :disabled="uploadingCover || uploadingAvatar || uploadingAudio || uploading || (mediaAccessBusy !== null && !imagePreviewUrls[publishedCoverMediaId])"
                  @click="toggleImagePreview(publishedCoverMediaId!)"
                >
                  {{
                    imagePreviewUrls[publishedCoverMediaId!]
                      ? 'Ocultar imagem'
                      : mediaAccessBusy === publishedCoverMediaId
                        ? 'Abrindo…'
                        : 'Ver banner'
                  }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-red-900/50 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-950/40"
                  :disabled="uploadingCover || uploadingAvatar || uploadingAudio || uploading || mediaAccessBusy !== null"
                  @click="removeSingleMedia('cover', publishedCoverMediaId!)"
                >
                  Remover banner
                </button>
              </div>
              <div
                v-if="imagePreviewUrls[publishedCoverMediaId!]"
                class="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-black/40 p-2"
              >
                <img
                  :src="imagePreviewUrls[publishedCoverMediaId!]"
                  alt="Banner no perfil público"
                  class="mx-auto max-h-48 w-full max-w-full rounded-lg object-cover"
                />
              </div>
            </div>

            <div
              v-if="pendingCoverMediaId && pendingCoverMediaId !== publishedCoverMediaId"
              class="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4"
            >
              <p class="text-xs font-medium uppercase tracking-wide text-amber-200/90">Aguardando aprovação</p>
              <p class="mt-1 text-sm text-amber-100/80">
                Só entra no perfil público depois da aprovação. Se já existir outra capa aprovada, ela permanece até este
                envio ser aceito.
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-medium text-brand transition hover:bg-brand/20"
                  :disabled="uploadingCover || uploadingAvatar || uploadingAudio || uploading || (mediaAccessBusy !== null && !imagePreviewUrls[pendingCoverMediaId!])"
                  @click="toggleImagePreview(pendingCoverMediaId!)"
                >
                  {{
                    imagePreviewUrls[pendingCoverMediaId!]
                      ? 'Ocultar imagem'
                      : mediaAccessBusy === pendingCoverMediaId
                        ? 'Abrindo…'
                        : 'Ver envio'
                  }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-red-900/50 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-950/40"
                  :disabled="uploadingCover || mediaAccessBusy !== null"
                  @click="removeSingleMedia('cover', pendingCoverMediaId!)"
                >
                  Remover envio
                </button>
              </div>
              <div
                v-if="imagePreviewUrls[pendingCoverMediaId!]"
                class="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-black/40 p-2"
              >
                <img
                  :src="imagePreviewUrls[pendingCoverMediaId!]"
                  alt="Banner aguardando aprovação"
                  class="mx-auto max-h-48 w-full max-w-full rounded-lg object-cover"
                />
              </div>
            </div>
          </div>

          <div class="profile-panel space-y-6">
            <div>
              <h2 class="text-lg font-semibold text-white">Foto de perfil</h2>
              <p class="mt-1 text-sm text-zinc-400">
                A foto aprovada continua no site até uma nova troca ser aprovada. Envios novos ficam em análise; você pode
                pré-visualizar e remover antes da decisão da equipe. Formatos: JPG, PNG ou WebP; até
                {{ REGISTER_IMAGE_MAX_FILE_MB }} MB.
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
                :disabled="uploadingAvatar || uploadingCover || mediaAccessBusy !== null"
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
                  :disabled="uploadingAvatar || uploadingCover || (mediaAccessBusy !== null && !imagePreviewUrls[publishedAvatarMediaId])"
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
                  :disabled="uploadingAvatar || uploadingCover || mediaAccessBusy !== null"
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
                  :disabled="uploadingAvatar || uploadingCover || (mediaAccessBusy !== null && !imagePreviewUrls[pendingAvatarMediaId!])"
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
                  :disabled="uploadingAvatar || uploadingCover || mediaAccessBusy !== null"
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
                :disabled="uploadingAudio || uploadingCover || mediaAccessBusy !== null"
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
                  :disabled="uploadingAudio || uploadingCover || (mediaAccessBusy !== null && !(audioPlayerForId === publishedAudioMediaId && audioPlayerUrl))"
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
                  :disabled="uploadingAudio || uploadingCover || mediaAccessBusy !== null"
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
                  :disabled="uploadingAudio || uploadingCover || (mediaAccessBusy !== null && !(audioPlayerForId === pendingAudioMediaId && audioPlayerUrl))"
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
                  :disabled="uploadingAudio || uploadingCover || mediaAccessBusy !== null"
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
                Novos arquivos ficam pendentes até moderação. Imagens: JPG, PNG ou WebP até {{ REGISTER_IMAGE_MAX_FILE_MB }}
                MB; vídeos com limite maior. Na página pública, os vídeos aparecem antes das fotos, na ordem que você
                definir abaixo.
                <span v-if="galleryDestaqueActive" class="mt-2 block text-zinc-300">
                  Com destaque ativo você pode ter até {{ galleryOrderedMax }} itens; todos podem aparecer no site.
                </span>
                <span v-else class="mt-2 block text-zinc-300">
                  Sem destaque ativo: o site mostra no máximo {{ galleryPublicBasicCap }} itens (vídeos primeiro, depois
                  fotos, na ordem abaixo). Novos envios só são permitidos com menos de {{ galleryUploadCap }} itens na
                  lista — se você tinha mais após o destaque acabar, nada some: apague ou reative o destaque para
                  ampliar de novo.
                </span>
              </p>
              <p
                v-if="galleryPublicSliceNotice"
                class="mt-3 rounded-xl border border-amber-900/45 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/90"
              >
                {{ galleryPublicSliceNotice }}
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
                :disabled="uploading || uploadingCover || !galleryCanAddMore"
                @click="openGalleryPicker"
              >
                {{ uploading ? 'Enviando…' : 'Adicionar foto ou vídeo' }}
              </button>
              <p v-if="!galleryCanAddMore && galleryOrder.length > 0" class="mt-2 text-xs text-zinc-500">
                Limite de {{ galleryUploadCap }} arquivo(s) neste modo. Remova um item ou reative o destaque para enviar
                mais.
              </p>
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

        <section v-show="activeSection === 'metricas'" class="profile-panel space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-white">Métricas</h2>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">
              Acompanhe quantas visitas ao seu perfil público geraram um clique no botão do WhatsApp (uma contagem por
              visita, mesmo com vários cliques seguidos).
            </p>
          </div>
          <div
            v-if="!profile?.whatsapp_metrics_unlocked"
            class="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100/95"
          >
            As métricas detalhadas ficam disponíveis com
            <strong class="text-amber-50">destaque ativo</strong>. No plano gratuito você vê este aviso; ao ativar o
            destaque em <NuxtLink class="font-medium text-brand underline hover:text-brand-muted" to="/conta/perfil?secao=financeiro">Financeiro</NuxtLink>, o gráfico passa a ser preenchido.
          </div>
          <WhatsappClicksChart
            :series="waMetricsSeries"
            :total="waMetricsTotal"
            :loading="waMetricsLoading"
          />
        </section>

        <section v-show="activeSection === 'financeiro'" class="profile-panel space-y-6">
          <div>
            <h2 class="text-lg font-semibold text-white">Financeiro</h2>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">
              Veja o seu destaque atual (nível e validade), pague com PIX para ativar ou subir de nível e consulte o
              histórico. No <strong class="text-zinc-300">upgrade</strong> o PIX é pelo
              <strong class="text-zinc-300">valor integral</strong> do plano escolhido; o tempo que ainda tinha no nível
              antigo é <strong class="text-zinc-300">convertido em dias no novo nível</strong> (pro-rata pelo preço mensal:
              ex. 1★ a R$150 → 2★ a R$300, o mesmo valor vira metade dos dias). Não somamos “25 dias antigos + 30 do novo
              mês”: os 25 no 1★ viram ~12,5 dias no 2★ e somam-se os 30 pagos (~42,5 dias no total nesse exemplo).
            </p>
          </div>

          <div
            class="relative overflow-hidden rounded-2xl border-2 border-amber-500/45 bg-gradient-to-br from-amber-950/50 via-zinc-950 to-zinc-900 p-5 shadow-[0_0_36px_-12px_rgba(245,158,11,0.45)] md:p-6"
          >
            <div
              class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div class="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-xs font-bold uppercase tracking-[0.18em] text-amber-200/90">Plano no portal</p>
                  <span
                    v-if="financeQuoteLoading"
                    class="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                  >
                    A sincronizar…
                  </span>
                </div>
                <p class="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  <template v-if="financeStatusHasDestaque">
                    Destaque
                    <span class="whitespace-nowrap text-amber-400" aria-hidden="true">{{ financeStarsVisual }}</span>
                    <span class="sr-only">{{ financeStatusStars }} estrela(s)</span>
                  </template>
                  <template v-else>Plano gratuito</template>
                </p>
                <p v-if="financeStatusHasDestaque" class="mt-2 text-sm text-zinc-300">
                  Nível <strong class="text-white">{{ financeStatusStars }}</strong> estrela(s)
                  <span v-if="profile?.plan_type === 'premium'" class="text-zinc-500"> · Premium</span>
                </p>
                <p v-else class="mt-2 text-sm text-zinc-400">
                  Sem destaque pago ativo — use os botões abaixo para ativar e aparecer em evidência no site.
                </p>

                <template v-if="financeStatusHasDestaque">
                  <p
                    v-if="financeStatusFrozen"
                    class="mt-3 rounded-lg border border-sky-900/50 bg-sky-950/35 px-3 py-2 text-sm text-sky-100/95"
                  >
                    O tempo de destaque está <strong class="text-sky-50">pausado</strong> enquanto o anúncio está
                    inativo. Ao reativar o perfil, o relógio volta a contar; a data abaixo aplica-se com o anúncio ativo.
                  </p>
                  <p v-else-if="financeStatusEndsAtLabel" class="mt-3 text-sm text-zinc-300">
                    Término aproximado (anúncio ativo):
                    <strong class="text-amber-100">{{ financeStatusEndsAtLabel }}</strong>
                  </p>
                  <p class="mt-2 text-sm text-zinc-500">
                    Tempo restante estimado:
                    <strong class="text-zinc-300">{{ formatDestaqueDuration(financeStatusRemainingSec) }}</strong>
                  </p>
                </template>

                <p
                  v-if="financeQuote?.upgrade_carry_seconds_preview != null && financeQuote.upgrade_carry_preview_stars"
                  class="mt-3 rounded-lg border border-emerald-900/40 bg-emerald-950/25 px-3 py-2 text-sm text-emerald-100/95"
                >
                  Exemplo de pro-rata: ao subir para
                  <strong class="text-emerald-50">{{ financeQuote.upgrade_carry_preview_stars }} estrela(s)</strong>, o
                  tempo restante equivale a
                  <strong class="text-emerald-50">{{ formatDaysApprox(financeQuote.upgrade_carry_seconds_preview) }}</strong>
                  nesse nível (antes de somar os meses que comprar).
                </p>
                <p
                  v-if="financeAtMaxTier"
                  class="mt-3 rounded-lg border border-amber-800/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-100/95"
                >
                  Está no <strong class="text-amber-50">nível máximo</strong> de destaque. Quando o plano vencer, poderá
                  renovar ou escolher outro nível aqui.
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
            <h3 class="text-base font-semibold text-white">Ativar ou aumentar destaque</h3>
            <p class="mt-2 text-sm text-zinc-500">
              Escolha estrelas e meses; o PIX abre no passo seguinte.
            </p>
            <p
              v-if="financeCarriedSecondsForSelectedUpgrade != null"
              class="mt-3 rounded-lg border border-zinc-700/80 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300"
            >
              Com o nível <strong class="text-white">{{ finSelectedStars }} estrela(s)</strong> selecionado, o tempo que
              resta hoje passa a valer cerca de
              <strong class="text-amber-200/95">{{ formatDaysApprox(financeCarriedSecondsForSelectedUpgrade) }}</strong>
              nesse nível; depois somam-se os meses do PIX.
            </p>

            <p v-if="financeErr" class="mt-3 text-sm text-red-400">{{ financeErr }}</p>
            <p
              v-if="financeNeedsQuoteForPurchase && !financeQuoteLoading"
              class="mt-3 rounded-lg border border-amber-900/40 bg-amber-950/25 px-3 py-2 text-sm text-amber-100/90"
            >
              Precisamos da cotação do servidor para calcular o upgrade.
              <button
                type="button"
                class="ml-1 font-medium text-brand underline hover:text-brand-muted"
                @click="void loadFinanceQuote()"
              >
                Tentar de novo
              </button>
            </p>

            <div v-if="!effectiveFinancePricing && (financeQuoteLoading || financePricingFallbackLoading)" class="mt-6 text-sm text-zinc-500">
              Carregando tabela de preços…
            </div>
            <p
              v-else-if="!effectiveFinancePricing"
              class="mt-6 text-sm text-amber-100/90"
            >
              Não foi possível carregar os preços. Verifique a ligação e use «Atualizar plano».
            </p>

            <template v-else-if="effectiveFinancePricing">
              <div class="mt-6 space-y-3">
                <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Nível (estrelas)</p>
                <div class="flex flex-wrap gap-1 text-amber-400">
                  <button
                    v-for="s in financeStarRange"
                    :key="'fin-star-' + s"
                    type="button"
                    class="text-xl leading-none transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-25"
                    :disabled="s < financeMinSelectableStarsForUi"
                    :title="`Nível ${s} — ${formatBrl(priceForFinTier(s))}/mês`"
                    @click="finSelectedStars = s"
                  >
                    {{ s <= finSelectedStars ? '★' : '☆' }}
                  </button>
                </div>
                <p class="text-xs text-zinc-500">
                  Selecionado: nível <strong class="text-zinc-300">{{ finSelectedStars }}</strong> —
                  {{ formatBrl(priceForFinTier(finSelectedStars)) }}/mês
                </p>
              </div>

              <div class="mt-5 max-w-xs">
                <label class="form-label" for="fin-months">Período (meses)</label>
                <select id="fin-months" v-model.number="finPeriodMonths" class="form-select mt-1">
                  <option v-for="m in 24" :key="'mo-' + m" :value="m">{{ m }} {{ m === 1 ? 'mês' : 'meses' }}</option>
                </select>
              </div>

              <div class="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  class="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                  :disabled="financePixDisabled"
                  @click="startDestaquePix"
                >
                  {{ financePixBusy ? 'A gerar PIX…' : 'Pagar com PIX' }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-zinc-600 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
                  :disabled="financeQuoteLoading"
                  @click="void loadFinanceSectionData()"
                >
                  Atualizar plano
                </button>
              </div>
            </template>
          </div>

          <div class="mt-10 border-t border-zinc-800 pt-8">
            <h3 class="text-base font-semibold text-white">Transações</h3>
            <p v-if="financeOrdersLoading" class="mt-3 text-sm text-zinc-500">Carregando…</p>
            <ul v-else-if="financeOrders.length" class="mt-4 space-y-3">
              <li
                v-for="o in financeOrders"
                :key="o.order_uuid"
                class="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="font-medium text-zinc-200">{{ o.stars }} estrela(s) × {{ o.period_months }} mês(es)</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="
                      o.payment_status === 'paid'
                        ? 'bg-emerald-950/70 text-emerald-200'
                        : o.payment_status === 'pending'
                          ? 'bg-amber-950/60 text-amber-100'
                          : 'bg-zinc-800 text-zinc-400'
                    "
                  >
                    {{ financeOrderStatusLabel(o.payment_status) }}
                  </span>
                </div>
                <p class="mt-1 tabular-nums text-zinc-400">
                  {{ formatBrl(o.amount_brl) }}
                  <span v-if="o.is_upgrade && o.pro_rata_carried_seconds != null" class="text-zinc-500">
                    · tempo convertido (pro-rata) ≈ {{ formatDaysApprox(o.pro_rata_carried_seconds) }}
                  </span>
                  <span v-else-if="o.is_upgrade && o.credit_brl" class="text-zinc-500">
                    · (ordem antiga) desconto {{ formatBrl(o.credit_brl) }}
                  </span>
                </p>
                <p class="mt-1 text-xs text-zinc-600">
                  {{ o.paid_at ? formatDate(o.paid_at) : formatDate(o.created_at) }}
                </p>
              </li>
            </ul>
            <p v-else class="mt-3 text-sm text-zinc-500">Nenhuma ordem de destaque ainda.</p>
          </div>
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

    <ImageCropModal
      v-model="imageCropOpen"
      :file="imageCropFile"
      :aspect-ratio="imageCropAspect"
      :title="imageCropTitle"
      @cropped="onProfileImageCropped"
    />

    <Teleport to="body">
      <div
        v-if="destaquePixModalOpen"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="destaque-pix-title"
        @click.self="closeDestaquePixModal"
      >
        <div
          class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
          @click.stop
        >
          <template v-if="!destaquePixPaid">
            <h3 id="destaque-pix-title" class="text-lg font-semibold text-white">PIX — destaque</h3>
            <p v-if="destaquePixPricingNote" class="mt-2 text-xs text-zinc-500">{{ destaquePixPricingNote }}</p>
            <div v-if="destaquePixQr" class="mt-5 flex justify-center rounded-xl bg-white p-4">
              <img :src="destaquePixQr" alt="QR Code PIX" width="260" height="260" class="h-[260px] w-[260px] object-contain" />
            </div>
            <p v-else class="mt-5 text-center text-sm text-zinc-500">A gerar QR Code…</p>
            <p class="mt-2 text-center text-sm font-medium text-white">{{ formatBrl(destaquePixAmount) }}</p>
            <div class="mt-4 space-y-2">
              <label class="block text-xs font-medium text-zinc-500">Pix copia e cola</label>
              <textarea
                readonly
                rows="4"
                class="form-input min-h-[5.5rem] resize-none break-all font-mono text-xs leading-relaxed text-zinc-200"
                :value="destaquePixBr"
              />
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-xl border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                  @click="copyDestaquePix"
                >
                  Copiar código
                </button>
                <button
                  v-if="destaquePixMock"
                  type="button"
                  class="rounded-xl border border-amber-700/60 bg-amber-950/40 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-950/70"
                  @click="mockConfirmDestaquePix"
                >
                  Simular pagamento (local)
                </button>
              </div>
              <p v-if="destaquePixCopyMsg" class="text-sm text-emerald-400">{{ destaquePixCopyMsg }}</p>
            </div>
            <p class="mt-4 text-sm text-zinc-500">Aguardando confirmação…</p>
            <button
              type="button"
              class="mt-6 w-full rounded-xl border border-zinc-600 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              @click="closeDestaquePixModal"
            >
              Fechar (continua pendente)
            </button>
          </template>
          <template v-else>
            <h3 class="text-lg font-semibold text-emerald-400">Pagamento confirmado</h3>
            <p class="mt-3 text-sm text-zinc-300">Seu destaque foi atualizado. Pode levar alguns segundos para refletir no site.</p>
            <button
              type="button"
              class="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:bg-brand-muted"
              @click="closeDestaquePixModalAfterPaid"
            >
              Fechar
            </button>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import WhatsappClicksChart from '~/components/WhatsappClicksChart.vue'
import { REGISTER_COVER_ASPECT_RATIO, REGISTER_IMAGE_MAX_FILE_MB } from '~/config/registerPresentation'
import { usePrazervipAnalytics } from '~/composables/usePrazervipAnalytics'
import { useSwal } from '~/composables/useSwal'
import { formatPhoneBrMask, phoneDigits } from '~/utils/brFormat'
import { extractLaravelErrorMessage } from '~/utils/laravelApiErrors'
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

type SectionId = 'dados' | 'perfil' | 'local' | 'whatsapp' | 'redes' | 'midias' | 'metricas' | 'financeiro'

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
  professional_name_pending?: string | null
  bio?: string | null
  bio_pending?: string | null
  has_portal_text_pending?: boolean
  public_slug_preview_from_pending_name?: string | null
  portal_text_pending_submitted_at?: string | null
  public_slug?: string | null
  service_type?: 'companion' | 'masseuse' | string | null
  profile_type?: 'men' | 'women' | 'trans' | null
  cover_media_id?: number | null
  public_cover_media_id?: number | null
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
  public_gallery_media_ids?: number[] | null
  public_gallery_display_order?: number[] | null
  gallery_upload_cap?: number
  gallery_ordered_max?: number
  gallery_public_basic_cap?: number
  gallery_destaque_time_active?: boolean
  plan_type?: string | null
  highlight_stars_cached?: number | null
  destaque_remaining_seconds?: number | null
  destaque_clock_frozen?: boolean
  destaque_month_seconds?: number
  /** Destaque ativo: métricas de cliques no WhatsApp liberadas */
  whatsapp_metrics_unlocked?: boolean
  media_moderation?: MediaMod[]
  professional_slug_cooldown_active?: boolean
  professional_slug_locked_until?: string | null
  city_change_cooldown_active?: boolean
  city_change_locked_until?: string | null
  portal_field_cooldown_hours?: number
  social_links?: SocialLinksPayload | null
  /** Dígitos (ex.: 5511999999999) — número público do anúncio */
  whatsapp?: string | null
}

const route = useRoute()

const { user, fetchMe } = useAuth()
const { request } = useApi()
const { swalConfirm } = useSwal()
const { portalDestaquePixGenerated, portalDestaquePixPaid } = usePrazervipAnalytics()

const loading = ref(true)
const profile = ref<Profile | null>(null)
const states = ref<ApiState[]>([])
const cities = ref<ApiCity[]>([])

const activeSection = ref<SectionId>('perfil')

const copyPublicLinkDone = ref(false)

const formProfessionalName = ref('')
const formBio = ref('')
const formStateId = ref('')
const formCityId = ref('')
const formNeighborhood = ref('')
/** false = sem local próprio; bairro oculto e limpo ao salvar */
const formHasVenue = ref(true)

const galleryOrder = ref<number[]>([])
const uploading = ref(false)
const savingPortalText = ref(false)
const savingLoc = ref(false)
const savingOrder = ref(false)
const msg = ref('')
const err = ref(false)
const galleryFileInput = ref<HTMLInputElement | null>(null)
const coverFileInput = ref<HTMLInputElement | null>(null)
const avatarFileInput = ref<HTMLInputElement | null>(null)
const audioFileInput = ref<HTMLInputElement | null>(null)
const uploadingCover = ref(false)
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

const waChangeOpen = ref(false)
const waNewPhone = ref('')
const waAwaitingOtp = ref(false)
const waOtpDigits = ref('')
const waBusy = ref(false)
const waFeedback = ref('')
const waFeedbackErr = ref(false)
const waResendUntil = ref<number | null>(null)
const waResendSecondsLeft = ref(0)
let waResendInterval: ReturnType<typeof setInterval> | null = null

const profileWhatsappDisplay = computed(() => {
  const digits = String(profile.value?.whatsapp ?? '').replace(/\D/g, '')
  if (digits.length < 10) {
    return '—'
  }
  return formatPhoneBrMask(digits)
})

function syncWaResendCountdown() {
  const now = Math.floor(Date.now() / 1000)
  waResendSecondsLeft.value =
    waResendUntil.value == null ? 0 : Math.max(0, waResendUntil.value - now)
}

function startWaResendTicker() {
  stopWaResendTicker()
  syncWaResendCountdown()
  waResendInterval = setInterval(syncWaResendCountdown, 1000)
}

function stopWaResendTicker() {
  if (waResendInterval != null) {
    clearInterval(waResendInterval)
    waResendInterval = null
  }
}

function resetWaChangeFlow() {
  waAwaitingOtp.value = false
  waNewPhone.value = ''
  waOtpDigits.value = ''
  waResendUntil.value = null
  waResendSecondsLeft.value = 0
  stopWaResendTicker()
}

function toggleWaChangePanel() {
  waChangeOpen.value = !waChangeOpen.value
  waFeedback.value = ''
  if (!waChangeOpen.value) {
    resetWaChangeFlow()
  }
}

function onWaNewInput(e: Event) {
  const el = e.target as HTMLInputElement
  waNewPhone.value = formatPhoneBrMask(el.value)
}

function onWaOtpInput(e: Event) {
  const el = e.target as HTMLInputElement
  waOtpDigits.value = el.value.replace(/\D/g, '').slice(0, 6)
}

async function waSendOtp() {
  const wa = phoneDigits(waNewPhone.value)
  if (wa.length < 10) {
    waFeedbackErr.value = true
    waFeedback.value = 'Informe o novo número com DDD.'
    return
  }
  waBusy.value = true
  waFeedback.value = ''
  waFeedbackErr.value = false
  try {
    const r = await request<{
      sent?: boolean
      can_resend_after?: number | null
    }>('/v1/me/profile/whatsapp-change/send-code', {
      method: 'POST',
      body: { whatsapp: wa },
    })
    if (r.sent) {
      waAwaitingOtp.value = true
      waNewPhone.value = formatPhoneBrMask(wa)
      waFeedbackErr.value = false
      waFeedback.value = 'Código enviado. Verifique o WhatsApp do novo número.'
    }
    if (typeof r.can_resend_after === 'number') {
      waResendUntil.value = r.can_resend_after
      startWaResendTicker()
    }
  } catch (e: unknown) {
    waFeedbackErr.value = true
    waFeedback.value =
      extractLaravelErrorMessage(e, ['whatsapp', 'cooldown']) ?? 'Não foi possível enviar o código.'
  } finally {
    waBusy.value = false
  }
}

async function waVerifyOtp() {
  const code = waOtpDigits.value.replace(/\D/g, '')
  if (code.length !== 6) {
    return
  }
  waBusy.value = true
  waFeedback.value = ''
  try {
    await request('/v1/me/profile/whatsapp-change/verify-code', {
      method: 'POST',
      body: { code },
    })
    waFeedbackErr.value = false
    waFeedback.value = 'WhatsApp atualizado com sucesso.'
    waChangeOpen.value = false
    resetWaChangeFlow()
    await refreshProfile()
  } catch (e: unknown) {
    waFeedbackErr.value = true
    waFeedback.value = extractLaravelErrorMessage(e, ['code']) ?? 'Código inválido ou expirado.'
  } finally {
    waBusy.value = false
  }
}

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

const publishedCoverMediaId = computed(() => profile.value?.public_cover_media_id ?? null)

const pendingCoverMediaId = computed(() => {
  const p = profile.value
  if (!p?.cover_media_id) {
    return null
  }
  if (p.public_cover_media_id === p.cover_media_id) {
    return null
  }
  return p.cover_media_id
})

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
      { id: 'perfil', label: 'Nome profissional, bio e link', icon: '✨' },
      { id: 'local', label: 'Local', icon: '📍' },
      { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
      { id: 'redes', label: 'Redes sociais', icon: '🔗' },
      { id: 'midias', label: 'Mídias', icon: '🖼' },
      { id: 'metricas', label: 'Métricas', icon: '🔥' },
      { id: 'financeiro', label: 'Financeiro', icon: '💰' },
    )
  }
  return items
})

function normalizeSectionQuery(raw: unknown): SectionId | null {
  const s = typeof raw === 'string' ? raw : ''
  const allowed: SectionId[] = [
    'dados',
    'perfil',
    'local',
    'whatsapp',
    'redes',
    'midias',
    'metricas',
    'financeiro',
  ]
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

const pendingPublicProfileFullUrl = computed(() => {
  const slug = profile.value?.public_slug_preview_from_pending_name
  if (!slug) {
    return '—'
  }
  const path = buildPublicProfilePath(slug, profile.value?.service_type)
  const origin = import.meta.client ? window.location.origin : requestUrl.origin
  return `${origin}${path}`
})

const galleryUploadCap = computed(() => Math.max(1, Number(profile.value?.gallery_upload_cap ?? 10)))
const galleryOrderedMax = computed(() => Math.max(1, Number(profile.value?.gallery_ordered_max ?? 100)))
const galleryPublicBasicCap = computed(() => Math.max(1, Number(profile.value?.gallery_public_basic_cap ?? 10)))
const galleryDestaqueActive = computed(() => profile.value?.gallery_destaque_time_active === true)
const galleryCanAddMore = computed(() => galleryOrder.value.length < galleryUploadCap.value)
const galleryPublicSliceNotice = computed((): string => {
  const p = profile.value
  if (!p || galleryDestaqueActive.value) {
    return ''
  }
  const total = galleryOrder.value.length
  if (total <= galleryPublicBasicCap.value) {
    return ''
  }
  const order = p.public_gallery_display_order
  const shown =
    Array.isArray(order) && order.length > 0 ? order.length : Math.min(total, galleryPublicBasicCap.value)

  return `No perfil público, visitantes veem ${shown} de ${total} itens (vídeos primeiro, depois fotos). Use as setas para escolher o que fica entre os primeiros.`
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
  const pendingName = (p.professional_name_pending ?? '').trim()
  formProfessionalName.value = pendingName !== '' ? pendingName : (p.professional_name ?? '').trim()
  formBio.value = p.bio_pending != null ? String(p.bio_pending) : (p.bio ?? '')
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

type FinanceQuote = {
  plan_type?: string
  current_stars: number
  remaining_seconds: number
  destaque_month_seconds?: number
  monthly_price_current_tier_brl?: number | null
  upgrade_carry_seconds_preview?: number | null
  upgrade_carry_preview_stars?: number | null
  upgrade_pays_full_price?: boolean
  min_selectable_stars: number
  tier_min: number
  tier_max: number
  price_per_tier_brl: number
  destaque_clock_frozen?: boolean
  destaque_ends_at_approx?: string | null
  at_max_tier?: boolean
  can_purchase_destaque?: boolean
}

type PremiumPricingFallback = {
  tier_min: number
  tier_max: number
  price_per_tier_brl: number
}

type FinanceOrderRow = {
  order_uuid: string
  amount_brl: number
  stars: number
  period_months: number
  payment_status: string
  paid_at: string | null
  created_at: string | null
  is_upgrade: boolean
  credit_brl: number | null
  pro_rata_carried_seconds?: number | null
  pro_rata_remaining_before_seconds?: number | null
}

const waMetricsLoading = ref(false)
const waMetricsSeries = ref<{ date: string; count: number }[]>([])
const waMetricsTotal = ref(0)

const financeQuoteLoading = ref(false)
const financeQuote = ref<FinanceQuote | null>(null)
const financePricingFallback = ref<PremiumPricingFallback | null>(null)
const financePricingFallbackLoading = ref(false)
const financeOrdersLoading = ref(false)
const financeOrders = ref<FinanceOrderRow[]>([])
const financeErr = ref('')
const financePixBusy = ref(false)
const finPeriodMonths = ref(1)
const finSelectedStars = ref(1)

const financeStatusStars = computed(() => {
  if (financeQuote.value) {
    return financeQuote.value.current_stars
  }
  return Math.max(0, Number(profile.value?.highlight_stars_cached ?? 0))
})

const financeStatusRemainingSec = computed(() => {
  if (financeQuote.value) {
    return financeQuote.value.remaining_seconds
  }
  return Math.max(0, Number(profile.value?.destaque_remaining_seconds ?? 0))
})

const financeStatusHasDestaque = computed(
  () => financeStatusStars.value > 0 && financeStatusRemainingSec.value > 0,
)

const financeStatusFrozen = computed(
  () => financeQuote.value?.destaque_clock_frozen === true || profile.value?.destaque_clock_frozen === true,
)

const financeStatusEndsAtLabel = computed(() => {
  const iso = financeQuote.value?.destaque_ends_at_approx
  if (!iso || financeStatusFrozen.value) {
    return ''
  }
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
})

const financeStarsVisual = computed(() => '★'.repeat(Math.min(10, Math.max(1, financeStatusStars.value))))

const financeAtMaxTier = computed(() => Boolean(financeQuote.value?.at_max_tier))

/** Dias/horas equivalentes após pro-rata para o nível atualmente selecionado (upgrade). */
const financeCarriedSecondsForSelectedUpgrade = computed((): number | null => {
  const q = financeQuote.value
  if (!q || q.current_stars <= 0 || q.remaining_seconds <= 0) {
    return null
  }
  const sel = finSelectedStars.value
  if (sel <= q.current_stars) {
    return null
  }
  const unit = q.price_per_tier_brl
  const pOld = (q.monthly_price_current_tier_brl ?? q.current_stars * unit) || 0
  const pNew = sel * unit
  if (pOld <= 0 || pNew <= 0) {
    return null
  }
  return Math.round(q.remaining_seconds * (pOld / pNew))
})

const effectiveFinancePricing = computed(() => {
  const q = financeQuote.value
  if (q) {
    return {
      tier_min: q.tier_min,
      tier_max: q.tier_max,
      price_per_tier_brl: q.price_per_tier_brl,
      min_selectable: q.min_selectable_stars,
      can_purchase: q.can_purchase_destaque !== false && !q.at_max_tier,
    }
  }
  const f = financePricingFallback.value
  if (f) {
    return {
      tier_min: f.tier_min,
      tier_max: f.tier_max,
      price_per_tier_brl: f.price_per_tier_brl,
      min_selectable: f.tier_min,
      can_purchase: true,
    }
  }
  return null
})

const financeStarRange = computed(() => {
  const e = effectiveFinancePricing.value
  if (!e) {
    return []
  }
  const out: number[] = []
  for (let s = e.tier_min; s <= e.tier_max; s++) {
    out.push(s)
  }
  return out
})

const financeMinSelectableStarsForUi = computed(() => effectiveFinancePricing.value?.min_selectable ?? 1)

const financeNeedsQuoteForPurchase = computed(() => {
  if (financeQuote.value) {
    return false
  }
  const p = profile.value
  const stars = Number(p?.highlight_stars_cached ?? 0) > 0
  const time =
    p?.gallery_destaque_time_active === true || Number(p?.destaque_remaining_seconds ?? 0) > 0
  return stars && time
})

const financePixDisabled = computed(() => {
  if (financePixBusy.value) {
    return true
  }
  const e = effectiveFinancePricing.value
  if (!e) {
    return true
  }
  if (financeQuote.value) {
    if (financeQuote.value.at_max_tier) {
      return true
    }
    if (finSelectedStars.value < financeQuote.value.min_selectable_stars) {
      return true
    }
    return false
  }
  if (financeNeedsQuoteForPurchase.value) {
    return true
  }
  return finSelectedStars.value < e.min_selectable
})

watch(
  () => effectiveFinancePricing.value,
  (ev) => {
    if (ev) {
      finSelectedStars.value = Math.max(ev.min_selectable, ev.tier_min)
    }
  },
  { immediate: true },
)

function formatBrl(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function formatDestaqueDuration(sec: number) {
  const d = Math.floor(sec / 86400)
  if (d >= 1) {
    return `${d} dia(s)`
  }
  const h = Math.floor(sec / 3600)
  return `${Math.max(1, h)} h`
}

function formatDaysApprox(sec: number) {
  const d = sec / 86400
  if (d >= 1) {
    return `${d.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias`
  }
  const h = Math.max(1, Math.round(sec / 3600))
  return `${h} h`
}

function priceForFinTier(t: number) {
  const u = effectiveFinancePricing.value?.price_per_tier_brl ?? 0
  return t * u
}

function financeOrderStatusLabel(s: string) {
  if (s === 'paid') {
    return 'Pago'
  }
  if (s === 'pending') {
    return 'Pendente'
  }
  if (s === 'failed') {
    return 'Falhou'
  }
  return s
}

async function loadWhatsappMetrics() {
  waMetricsLoading.value = true
  try {
    const r = await request<{
      series: { date: string; count: number }[]
      total_unique_sessions: number
    }>('/v1/me/profile/whatsapp-metrics', { query: { days: 30 } })
    waMetricsSeries.value = r.series
    waMetricsTotal.value = r.total_unique_sessions
  } catch {
    waMetricsSeries.value = []
    waMetricsTotal.value = 0
  } finally {
    waMetricsLoading.value = false
  }
}

async function loadFinanceQuote() {
  financeQuoteLoading.value = true
  financeErr.value = ''
  try {
    financeQuote.value = await request<FinanceQuote>('/v1/me/highlight/quote')
  } catch {
    financeQuote.value = null
    financeErr.value = 'Não foi possível carregar a cotação de destaque.'
  } finally {
    financeQuoteLoading.value = false
  }
}

async function loadPremiumPricingFallback() {
  financePricingFallbackLoading.value = true
  try {
    financePricingFallback.value = await request<PremiumPricingFallback>('/v1/config/premium-pricing')
  } catch {
    financePricingFallback.value = null
  } finally {
    financePricingFallbackLoading.value = false
  }
}

async function loadFinanceSectionData() {
  await Promise.all([loadFinanceQuote(), loadFinanceOrders(), loadPremiumPricingFallback()])
}

async function loadFinanceOrders() {
  financeOrdersLoading.value = true
  try {
    const r = await request<{ data: FinanceOrderRow[] }>('/v1/me/highlight/orders')
    financeOrders.value = r.data ?? []
  } catch {
    financeOrders.value = []
  } finally {
    financeOrdersLoading.value = false
  }
}

const destaquePixModalOpen = ref(false)
const destaquePixPaid = ref(false)
const destaquePixQr = ref<string | null>(null)
const destaquePixBr = ref('')
const destaquePixAmount = ref(0)
const destaquePixMock = ref(false)
const destaquePixCopyMsg = ref<string | null>(null)
const destaquePixOrderUuid = ref<string | null>(null)
const destaquePixPricingNote = ref('')

type DestaquePixAnalyticsMeta = { stars: number; period_months: number; is_upgrade: boolean }
const destaquePixAnalyticsMeta = ref<DestaquePixAnalyticsMeta | null>(null)
let destaquePixPaidAnalyticsSent = false

let destaquePixPollTimer: ReturnType<typeof setInterval> | null = null

function firePortalDestaquePixPaidAnalytics() {
  if (destaquePixPaidAnalyticsSent) {
    return
  }
  const meta = destaquePixAnalyticsMeta.value
  const id = destaquePixOrderUuid.value
  if (!meta || !id) {
    return
  }
  destaquePixPaidAnalyticsSent = true
  portalDestaquePixPaid({
    transaction_id: id,
    value: destaquePixAmount.value,
    stars: meta.stars,
    period_months: meta.period_months,
    mock: destaquePixMock.value,
    is_upgrade: meta.is_upgrade,
  })
}

function stopDestaquePixPolling() {
  if (destaquePixPollTimer != null) {
    clearInterval(destaquePixPollTimer)
    destaquePixPollTimer = null
  }
}

function startDestaquePixPolling() {
  stopDestaquePixPolling()
  destaquePixPollTimer = setInterval(async () => {
    const id = destaquePixOrderUuid.value
    if (!id) {
      return
    }
    try {
      const st = await request<{ status: string }>('/v1/me/highlight/payment-status', {
        query: { order_uuid: id },
      })
      if (st.status === 'paid') {
        stopDestaquePixPolling()
        firePortalDestaquePixPaidAnalytics()
        destaquePixPaid.value = true
        destaquePixCopyMsg.value = null
        await refreshProfile()
        await loadFinanceSectionData()
        await loadWhatsappMetrics()
      }
    } catch {
      /* continua */
    }
  }, 3000)
}

function closeDestaquePixModal() {
  stopDestaquePixPolling()
  destaquePixModalOpen.value = false
  destaquePixCopyMsg.value = null
  if (!destaquePixPaid.value) {
    destaquePixAnalyticsMeta.value = null
    destaquePixPaidAnalyticsSent = false
  }
}

function closeDestaquePixModalAfterPaid() {
  closeDestaquePixModal()
  destaquePixPaid.value = false
  destaquePixQr.value = null
  destaquePixBr.value = ''
  destaquePixOrderUuid.value = null
  destaquePixAnalyticsMeta.value = null
  destaquePixPaidAnalyticsSent = false
}

async function copyDestaquePix() {
  destaquePixCopyMsg.value = null
  if (!destaquePixBr.value || !import.meta.client) {
    return
  }
  try {
    await navigator.clipboard.writeText(destaquePixBr.value)
    destaquePixCopyMsg.value = 'Código copiado.'
  } catch {
    destaquePixCopyMsg.value = 'Não foi possível copiar.'
  }
}

async function mockConfirmDestaquePix() {
  const id = destaquePixOrderUuid.value
  if (!id) {
    return
  }
  try {
    await request('/v1/me/highlight/mock-confirm-payment', {
      method: 'POST',
      body: { order_uuid: id },
    })
    const st = await request<{ status: string }>('/v1/me/highlight/payment-status', {
      query: { order_uuid: id },
    })
    if (st.status === 'paid') {
      stopDestaquePixPolling()
      firePortalDestaquePixPaidAnalytics()
      destaquePixPaid.value = true
      await refreshProfile()
      await loadFinanceSectionData()
      await loadWhatsappMetrics()
    }
  } catch (e: unknown) {
    financeErr.value =
      extractLaravelErrorMessage(e, ['order_uuid', 'pix']) ?? 'Não foi possível simular o pagamento.'
  }
}

async function startDestaquePix() {
  financeErr.value = ''
  const stars = finSelectedStars.value
  const q = financeQuote.value
  if (q) {
    if (stars < q.min_selectable_stars) {
      financeErr.value = 'Escolha um nível de estrelas válido.'
      return
    }
  } else if (financeNeedsQuoteForPurchase.value) {
    financeErr.value = 'Atualize o plano (cotação) antes de pagar o upgrade.'
    return
  } else {
    const tmin = effectiveFinancePricing.value?.tier_min ?? 1
    if (stars < tmin) {
      financeErr.value = 'Escolha um nível de estrelas válido.'
      return
    }
  }
  financePixBusy.value = true
  try {
    const pix = await request<{
      order_uuid: string
      br_code: string
      amount_brl: number
      mock?: boolean
      pricing?: { is_upgrade?: boolean; gross_brl?: number; amount_brl?: number }
    }>('/v1/me/highlight/pix', {
      method: 'POST',
      body: { stars, period_months: finPeriodMonths.value },
    })
    destaquePixPaidAnalyticsSent = false
    destaquePixAnalyticsMeta.value = {
      stars,
      period_months: finPeriodMonths.value,
      is_upgrade: Boolean(pix.pricing?.is_upgrade),
    }
    destaquePixOrderUuid.value = pix.order_uuid
    destaquePixBr.value = pix.br_code
    destaquePixAmount.value = pix.amount_brl
    destaquePixMock.value = Boolean(pix.mock)
    destaquePixPaid.value = false
    destaquePixQr.value = null
    const pr = pix.pricing
    if (pr?.is_upgrade) {
      destaquePixPricingNote.value =
        'Upgrade: paga o valor integral do plano; o tempo restante no nível anterior é convertido para o novo nível (pro-rata).'
    } else {
      destaquePixPricingNote.value = ''
    }
    destaquePixModalOpen.value = true
    portalDestaquePixGenerated({
      transaction_id: pix.order_uuid,
      value: pix.amount_brl,
      stars,
      period_months: finPeriodMonths.value,
      mock: Boolean(pix.mock),
      is_upgrade: Boolean(pr?.is_upgrade),
    })
    const QRCode = (await import('qrcode')).default
    destaquePixQr.value = await QRCode.toDataURL(pix.br_code, {
      width: 260,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
    startDestaquePixPolling()
  } catch (e: unknown) {
    financeErr.value =
      extractLaravelErrorMessage(e, ['stars', 'period_months', 'pix', 'profile']) ??
      'Não foi possível gerar o PIX.'
    destaquePixAnalyticsMeta.value = null
  } finally {
    financePixBusy.value = false
  }
}

watch(activeSection, (s) => {
  msg.value = ''
  err.value = false
  if (s === 'metricas') {
    void loadWhatsappMetrics()
  }
  if (s === 'financeiro') {
    void loadFinanceSectionData()
  }
})

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

onUnmounted(() => {
  stopWaResendTicker()
  stopDestaquePixPolling()
})

async function onStateChange() {
  formCityId.value = ''
  cities.value = []
  if (!formStateId.value) {
    return
  }
  cities.value = await request<ApiCity[]>(`/v1/states/${formStateId.value}/cities`)
}

async function savePortalTextPresentation() {
  savingPortalText.value = true
  err.value = false
  msg.value = ''
  try {
    await request('/v1/me/profile/portal', {
      method: 'PATCH',
      body: {
        professional_name: formProfessionalName.value.trim(),
        bio: formBio.value,
      },
    })
    msg.value =
      'Pedido enviado. Quando a equipe aprovar, nome, biografia e link público passam a valer no site.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  } finally {
    savingPortalText.value = false
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

const imageCropOpen = ref(false)
const imageCropFile = ref<File | null>(null)
const imageCropAspect = ref(1)
const imageCropTitle = ref('')
const profileCropPurpose = ref<'cover' | 'portal_avatar' | null>(null)

function isRasterImageForCrop(file: File): boolean {
  const t = file.type.toLowerCase()
  return t.startsWith('image/') && !t.includes('svg') && !t.includes('gif')
}

async function onSingleMediaPick(e: Event, purpose: 'portal_avatar' | 'audio' | 'cover') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  if (purpose === 'audio') {
    await uploadSingleMediaRaw(file, 'audio')
    return
  }
  if (!isRasterImageForCrop(file)) {
    err.value = true
    msg.value = 'Envie uma imagem (JPG, PNG ou WebP).'
    return
  }
  profileCropPurpose.value = purpose
  imageCropFile.value = file
  imageCropAspect.value = purpose === 'cover' ? REGISTER_COVER_ASPECT_RATIO : 1
  imageCropTitle.value = purpose === 'cover' ? 'Ajustar banner' : 'Ajustar foto de perfil'
  imageCropOpen.value = true
}

async function onProfileImageCropped(file: File) {
  const purpose = profileCropPurpose.value
  profileCropPurpose.value = null
  imageCropFile.value = null
  if (purpose === 'cover' || purpose === 'portal_avatar') {
    await uploadSingleMediaRaw(file, purpose)
  }
}

async function uploadSingleMediaRaw(file: File, purpose: 'portal_avatar' | 'audio' | 'cover') {
  const uploadingRef =
    purpose === 'portal_avatar' ? uploadingAvatar : purpose === 'audio' ? uploadingAudio : uploadingCover
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

async function removeSingleMedia(_purpose: 'portal_avatar' | 'audio' | 'cover', mediaId: number) {
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
    msg.value = 'Item removido.'
    await refreshProfile()
  } catch (e) {
    err.value = true
    msg.value = apiErr(e)
  }
}
</script>
