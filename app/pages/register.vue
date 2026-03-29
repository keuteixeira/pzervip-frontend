<template>
  <div class="mx-auto max-w-3xl pb-32">
    <!-- Cabeçalho alinhado ao fluxo "Cadastro de Anunciante" do WordPress/Elementor -->
    <div class="border-b border-zinc-800 pb-8 text-center">
      <p class="text-sm font-medium text-brand">Cadastro de Anunciante</p>
      <h1 class="mt-2 text-2xl font-bold text-white md:text-3xl">Complete as etapas do cadastro</h1>
      <p class="mt-2 text-sm text-zinc-400">
        Depois de concluir, o perfil segue para <strong class="text-zinc-300">análise da equipe</strong>.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-2">
        <span
          v-for="n in totalSteps"
          :key="n"
          class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition"
          :class="
            n === step
              ? 'bg-brand text-white'
              : n < step
                ? 'bg-emerald-900/40 text-emerald-400'
                : 'bg-zinc-800 text-zinc-500'
          "
        >
          {{ n }}
        </span>
      </div>
    </div>

    <!-- 1 — Conta: nome, CPF e e-mail (senha na etapa 2) -->
    <section v-show="step === 1" class="mt-10 space-y-6">
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 class="text-xl font-semibold text-white">Bem-vindo ao cadastro</h2>
        <p class="mt-2 text-sm leading-relaxed text-zinc-400">
          Para completar seu cadastro como anunciante, você precisará fornecer algumas informações e documentos
          importantes.
        </p>
        <p class="mt-4 text-sm font-medium text-zinc-300">Documentos necessários:</p>
        <ul class="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-400">
          <li>1 foto para banner (obrigatória)</li>
          <li>1 foto de perfil (obrigatória — rosto visível)</li>
          <li>5 fotos para galeria (mínimo 3 obrigatórias)</li>
          <li>Foto do documento de identificação (frente e verso)</li>
          <li>Selfie para verificação</li>
          <li>Vídeo de verificação (autenticar o cadastro)</li>
        </ul>
        <p class="mt-4 text-xs text-amber-200/80">
          <strong>Importante:</strong> todas as etapas devem ser finalizadas para concluir o cadastro com sucesso.
        </p>
      </div>

      <div v-if="!hasToken" class="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 class="text-lg font-medium text-white">Criar conta</h3>
        <p class="text-xs text-zinc-500">
          Nome e CPF devem ser os mesmos do documento. E-mail e CPF são únicos.
        </p>
        <input
          v-model="form.name"
          type="text"
          placeholder="Nome completo igual ao documento *"
          class="input"
        />
        <input
          :value="form.cpf"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="CPF *"
          maxlength="14"
          class="input"
          @input="onCpfInput"
        />
        <input v-model="form.email" type="email" placeholder="E-mail *" class="input" />

        <div v-if="showPurgeSection" class="mt-6 border-t border-zinc-800 pt-5">
          <button
            type="button"
            class="text-sm font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            @click="purgeOpen = !purgeOpen"
          >
            {{ purgeOpen ? 'Ocultar' : 'Excluir pré-cadastro incompleto' }}
          </button>
          <p class="mt-2 text-xs text-zinc-500">
            Você voltou ao cadastro: se começou antes e não finalizou, informe o mesmo e-mail e CPF para apagar o rascunho
            e liberar os dados.
          </p>
          <div v-show="purgeOpen" class="mt-4 space-y-3 rounded-xl border border-rose-900/40 bg-rose-950/10 p-4">
            <button
              type="button"
              class="text-xs text-brand hover:underline"
              @click="copyFormToPurge"
            >
              Copiar e-mail e CPF do formulário acima
            </button>
            <input v-model="purge.email" type="email" placeholder="E-mail da conta" class="input" />
            <input
              :value="purge.cpf"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="CPF"
              maxlength="14"
              class="input"
              @input="onPurgeCpfInput"
            />
            <label class="flex cursor-pointer items-start gap-3 text-sm text-zinc-400">
              <input v-model="purge.confirm" type="checkbox" class="mt-0.5 rounded border-zinc-600" />
              <span>Entendo que o pré-cadastro será removido de forma definitiva e poderei criar uma nova conta.</span>
            </label>
            <p v-if="purgeError" class="text-sm text-red-400">{{ purgeError }}</p>
            <p v-if="purgeSuccess" class="text-sm text-emerald-400">{{ purgeSuccess }}</p>
            <button
              type="button"
              class="w-full rounded-xl border border-rose-800 bg-rose-950/40 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-950/70 disabled:opacity-50"
              :disabled="purgeBusy"
              @click="submitPurgeDraft"
            >
              {{ purgeBusy ? 'Removendo…' : 'Excluir pré-cadastro definitivamente' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 text-sm text-emerald-200">
        <p>Sessão ativa — continue preenchendo o perfil.</p>
        <p class="mt-2 text-xs text-emerald-300/90">
          Para apagar este rascunho e liberar e-mail e CPF, use
          <NuxtLink to="/conta" class="underline hover:text-white">Minha conta</NuxtLink>
          (exclusão) ou encerre a sessão — na etapa 1, a opção de excluir pré-cadastro só aparece se você já tiver
          visitado esta página antes e preencher nome, e-mail e CPF.
        </p>
      </div>
    </section>

    <!-- 2 — Senha da conta + dados pessoais + endereço -->
    <section v-show="step === 2" class="mt-10 space-y-4">
      <h2 class="text-xl font-semibold text-white">Dados pessoais</h2>
      <div v-if="needsAccountPassword" class="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <p class="text-sm font-medium text-white">Senha para entrar no site</p>
        <p class="text-xs text-zinc-500">
          Defina uma senha para usar em <strong class="text-zinc-400">Entrar</strong> com e-mail ou CPF depois de concluir
          esta etapa.
        </p>
        <input v-model="accountPassword" type="password" autocomplete="new-password" placeholder="Senha (mín. 8) *" class="input" />
        <input
          v-model="accountPasswordConfirmation"
          type="password"
          autocomplete="new-password"
          placeholder="Confirmar senha *"
          class="input"
        />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <p class="mb-1 text-xs font-medium text-zinc-500">Nome completo (documento)</p>
          <div class="input cursor-not-allowed bg-zinc-950/80 text-zinc-300">
            {{ legalNameDisplay }}
          </div>
        </div>
        <div>
          <p class="mb-1 text-xs font-medium text-zinc-500">CPF</p>
          <div class="input cursor-not-allowed bg-zinc-950/80 text-zinc-300">
            {{ cpfDisplay }}
          </div>
        </div>
        <div>
          <p class="mb-1 text-xs font-medium text-zinc-500">Data de nascimento</p>
          <BirthDatePicker v-model="draft.birth_date" />
        </div>
        <input v-model="draft.mother_name" type="text" placeholder="Nome completo da mãe *" class="input sm:col-span-2" />
        <div class="min-w-0 self-start">
          <p class="mb-1 text-xs font-medium text-zinc-500">E-mail de contato *</p>
          <input v-model="draft.contact_email" type="email" placeholder="contato@exemplo.com" class="input" />
        </div>
        <div class="min-w-0 self-start">
          <p class="mb-1 text-xs font-medium text-zinc-500">WhatsApp *</p>
          <input
            :value="draft.whatsapp"
            type="text"
            inputmode="tel"
            autocomplete="tel"
            placeholder="(11) 98765-4321"
            maxlength="20"
            class="input"
            @input="onWhatsappInput"
          />
        </div>
      </div>
      <h3 class="pt-4 text-lg font-medium text-white">Endereço</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="mb-1 text-xs font-medium text-zinc-500">CEP *</p>
          <input
            :value="draft.address.zipcode"
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            placeholder="00000-000"
            maxlength="9"
            class="input"
            @blur="fetchViaCep"
            @input="onCepInput"
          />
          <p v-if="cepLoading" class="mt-1 text-xs text-zinc-500">Consultando CEP…</p>
          <p v-if="cepError" class="mt-1 text-xs text-amber-400">{{ cepError }}</p>
        </div>
        <div class="sm:col-span-2">
          <input v-model="draft.address.street" type="text" placeholder="Rua *" class="input" />
        </div>
        <input v-model="draft.address.number" type="text" placeholder="Número *" class="input" />
        <input v-model="draft.address.complement" type="text" placeholder="Complemento" class="input" />
        <input v-model="draft.address.neighborhood" type="text" placeholder="Bairro *" class="input sm:col-span-2" />
        <div class="sm:col-span-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm text-zinc-400">
          <span v-if="draft.address.city || draft.address.state_uf">
            {{ draft.address.city }}{{ draft.address.city && draft.address.state_uf ? ' — ' : '' }}{{ draft.address.state_uf }}
          </span>
          <span v-else>Preencha o CEP para localizar cidade e UF.</span>
        </div>
      </div>
    </section>

    <!-- 3 — Documentos -->
    <section v-show="step === 3" class="mt-10 space-y-6">
      <h2 class="text-xl font-semibold text-white">Documentos</h2>
      <p class="text-sm text-zinc-400">
        Envie os quatro arquivos obrigatórios. Imagens: JPG, PNG ou WebP (até 10&nbsp;MB). Vídeo: MP4, WebM ou MOV (até 50&nbsp;MB).
      </p>
      <div
        v-for="doc in docLabels"
        :key="doc.key"
        role="button"
        tabindex="0"
        class="cursor-pointer rounded-xl border border-dashed p-6 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-brand"
        :class="verificationDropClass(doc.key)"
        @click="openVerificationPicker(doc.key)"
        @keydown.enter.prevent="openVerificationPicker(doc.key)"
        @keydown.space.prevent="openVerificationPicker(doc.key)"
        @dragenter.prevent="verificationDragKey = doc.key"
        @dragleave.prevent="onVerificationDragLeave($event, doc.key)"
        @dragover.prevent="onVerificationDragOver"
        @drop.prevent="onVerificationDrop($event, doc)"
      >
        <p class="font-medium text-zinc-200">{{ doc.label }}</p>
        <p
          class="mt-2 text-xs"
          :class="verificationErrors[doc.key] ? 'text-red-400' : 'text-zinc-500'"
        >
          {{ verificationHint(doc) }}
        </p>
        <input
          :id="'vdoc-' + doc.key"
          type="file"
          class="sr-only"
          :accept="doc.accept"
          @click.stop
          @change="onVerificationInputChange($event, doc)"
        />
      </div>
      <div class="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-left text-sm text-zinc-400">
        <p class="font-medium text-zinc-300">Vídeo de verificação</p>
        <p class="mt-2">
          Grave um vídeo falando: <em>“Meu nome é [nome profissional], e quero anunciar no site Prazer.Vip em
          {{ hoje }}”</em>
        </p>
      </div>
    </section>

    <!-- 4 — Dados profissionais -->
    <section v-show="step === 4" class="mt-10 space-y-4">
      <h2 class="text-xl font-semibold text-white">Dados profissionais</h2>
      <input v-model="draft.professional_name" type="text" placeholder="Nome profissional *" class="input" />
      <p class="text-xs text-zinc-500">Este é o nome que aparecerá no perfil público (diferente do nome legal na etapa 1).</p>
      <div>
        <p class="mb-2 text-sm text-zinc-400">Tipo de perfil *</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in profileTypeOptions"
            :key="opt.value"
            type="button"
            class="rounded-lg border px-4 py-2 text-sm"
            :class="
              draft.profile_type === opt.value
                ? 'border-brand bg-brand/15 text-white'
                : 'border-zinc-700 text-zinc-300'
            "
            @click="draft.profile_type = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div>
        <p class="mb-2 text-sm text-zinc-400">Tipo de atendimento *</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in serviceTypeOptions"
            :key="opt.value"
            type="button"
            class="rounded-lg border px-4 py-2 text-sm"
            :class="
              draft.service_type === opt.value
                ? 'border-brand bg-brand/15 text-white'
                : 'border-zinc-700 text-zinc-300'
            "
            @click="draft.service_type = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- 5 — Local do primeiro anúncio -->
    <section v-show="step === 5" class="mt-10 space-y-4">
      <h2 class="text-xl font-semibold text-white">Local do primeiro anúncio</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="min-w-0">
          <p class="mb-1 text-xs font-medium text-zinc-500">Estado *</p>
          <select
            class="input select-field"
            :value="draft.state_id ?? ''"
            :disabled="locationsLoading"
            @change="onAdvertStateChange"
          >
            <option value="" disabled>{{ locationsLoading ? 'Carregando…' : 'Selecione o estado' }}</option>
            <option v-for="st in states" :key="st.id" :value="String(st.id)">{{ st.name }} ({{ st.uf }})</option>
          </select>
        </div>
        <div class="min-w-0">
          <p class="mb-1 text-xs font-medium text-zinc-500">Cidade *</p>
          <select
            class="input select-field"
            :value="draft.city_id ?? ''"
            :disabled="!draft.state_id || citiesLoading"
            @change="onAdvertCityChange"
          >
            <option value="" disabled>{{ citiesLoading ? 'Carregando…' : 'Selecione a cidade' }}</option>
            <option v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
        </div>
      </div>
      <div>
        <p class="mb-2 text-sm text-zinc-400">Tem local? *</p>
        <div class="flex gap-2">
          <button
            v-for="opt in venueOptions"
            :key="String(opt.value)"
            type="button"
            class="rounded-lg border px-4 py-2 text-sm"
            :class="
              draft.has_venue === opt.value
                ? 'border-brand bg-brand/15 text-white'
                : 'border-zinc-700 text-zinc-300'
            "
            @click="draft.has_venue = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div v-if="draft.has_venue === true">
        <p class="mb-1 text-xs font-medium text-zinc-500">Bairro do anúncio *</p>
        <input v-model="draft.neighborhood" type="text" placeholder="Bairro *" class="input" />
      </div>
    </section>

    <!-- 6 — Apresentação e fotos -->
    <section v-show="step === 6" class="mt-10 space-y-6">
      <h2 class="text-xl font-semibold text-white">Apresentação e fotos</h2>
      <textarea
        v-model="draft.bio"
        rows="6"
        placeholder="Texto de apresentação * — serviços, especialidades, experiência. Não inclua telefone (regra do site atual)."
        class="input min-h-[140px] resize-y"
      />

      <div>
        <p class="font-medium text-zinc-200">Foto para capa (banner) *</p>
        <ul class="mt-2 list-inside list-disc space-y-1 text-xs text-zinc-500">
          <li>
            Tamanho sugerido:
            <strong class="text-zinc-400">{{ REGISTER_COVER.suggestedSizeLabel }}</strong>
            — {{ REGISTER_COVER.aspectHint }}
          </li>
          <li>Formatos: {{ REGISTER_COVER.formatsHint }} Até {{ REGISTER_COVER.maxFileMb }} MB.</li>
        </ul>
        <div
          role="button"
          tabindex="0"
          class="mt-3 rounded-xl border border-dashed p-6 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-brand"
          :class="presentationCoverZoneClass"
          @click="openPresentationPicker('cover')"
          @keydown.enter.prevent="openPresentationPicker('cover')"
          @keydown.space.prevent="openPresentationPicker('cover')"
          @dragenter.prevent="dragCover = true"
          @dragleave.prevent="onPresentationDragLeave($event, 'cover')"
          @dragover.prevent="onPresentationDragOver"
          @drop.prevent="onPresentationDrop($event, 'cover')"
        >
          <p class="text-sm" :class="coverError ? 'text-red-400' : coverUploading ? 'text-brand' : 'text-zinc-500'">
            {{ coverHint }}
          </p>
          <input
            id="presentation-cover-input"
            type="file"
            class="sr-only"
            accept="image/*"
            @click.stop
            @change="onCoverFileInput"
          />
        </div>
      </div>

      <div>
        <p class="font-medium text-zinc-200">Foto do perfil *</p>
        <p class="mt-1 text-xs text-zinc-500">
          Aparece no anúncio público e na sua conta; você pode trocar depois em
          <strong class="text-zinc-400">Minha conta → Perfil</strong>.
        </p>
        <ul class="mt-2 list-inside list-disc space-y-1 text-xs text-zinc-500">
          <li>
            Tamanho sugerido:
            <strong class="text-zinc-400">{{ REGISTER_PROFILE_AVATAR.suggestedSizeLabel }}</strong>
            — {{ REGISTER_PROFILE_AVATAR.hint }}
          </li>
          <li>Formatos: {{ REGISTER_PROFILE_AVATAR.formatsHint }} Até {{ REGISTER_PROFILE_AVATAR.maxFileMb }} MB.</li>
        </ul>
        <div
          role="button"
          tabindex="0"
          class="mt-3 rounded-xl border border-dashed p-6 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-brand"
          :class="presentationAvatarZoneClass"
          @click="openPresentationPicker('avatar')"
          @keydown.enter.prevent="openPresentationPicker('avatar')"
          @keydown.space.prevent="openPresentationPicker('avatar')"
          @dragenter.prevent="dragAvatar = true"
          @dragleave.prevent="onPresentationDragLeave($event, 'avatar')"
          @dragover.prevent="onPresentationDragOver"
          @drop.prevent="onPresentationDrop($event, 'avatar')"
        >
          <p class="text-sm" :class="avatarError ? 'text-red-400' : avatarUploading ? 'text-brand' : 'text-zinc-500'">
            {{ avatarHint }}
          </p>
          <input
            id="presentation-avatar-input"
            type="file"
            class="sr-only"
            accept="image/*"
            @click.stop
            @change="onAvatarFileInput"
          />
        </div>
      </div>

      <div>
        <p class="font-medium text-zinc-200">
          Fotos da galeria * ({{ galleryRules.min }} a {{ galleryRules.max }} fotos)
        </p>
        <p class="mt-1 text-xs text-zinc-500">
          Envie imagens nítidas; quantidade mínima e máxima podem ser ajustadas no servidor (variáveis
          <code class="rounded bg-zinc-800 px-1 py-0.5 text-[10px]">GALLERY_MIN_PHOTOS</code> /
          <code class="rounded bg-zinc-800 px-1 py-0.5 text-[10px]">GALLERY_MAX_PHOTOS</code>).
        </p>
        <div
          role="button"
          tabindex="0"
          class="mt-3 rounded-xl border border-dashed p-6 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-brand"
          :class="presentationGalleryZoneClass"
          @click="openPresentationPicker('gallery')"
          @keydown.enter.prevent="openPresentationPicker('gallery')"
          @keydown.space.prevent="openPresentationPicker('gallery')"
          @dragenter.prevent="dragGallery = true"
          @dragleave.prevent="onPresentationDragLeave($event, 'gallery')"
          @dragover.prevent="onPresentationDragOver"
          @drop.prevent="onPresentationDrop($event, 'gallery')"
        >
          <p class="text-sm" :class="galleryError ? 'text-red-400' : galleryUploading > 0 ? 'text-brand' : 'text-zinc-500'">
            {{ galleryHint }}
          </p>
          <input
            id="presentation-gallery-input"
            type="file"
            class="sr-only"
            accept="image/*"
            multiple
            @click.stop
            @change="onGalleryFileInput"
          />
        </div>
        <ul v-if="galleryItems.length > 0" class="mt-4 space-y-2">
          <li
            v-for="(item, idx) in galleryItems"
            :key="item.id"
            class="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300"
          >
            <span class="min-w-0 truncate">
              <span class="text-zinc-500">{{ idx + 1 }}.</span> {{ item.name }}
            </span>
            <button
              type="button"
              class="shrink-0 rounded-lg border border-zinc-600 px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              @click.stop="removeGalleryItem(item.id)"
            >
              Remover
            </button>
          </li>
        </ul>
      </div>
    </section>

    <!-- 7 — Plano + termos -->
    <section v-show="step === 7" class="mt-10 space-y-6">
      <h2 class="text-xl font-semibold text-white">Escolha seu plano</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          class="rounded-2xl border p-6 text-left transition"
          :class="
            draft.plan_type === 'basic'
              ? 'border-brand bg-brand/10'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
          "
          @click="draft.plan_type = 'basic'"
        >
          <p class="text-sm font-medium text-brand">Plano básico</p>
          <p class="mt-2 text-2xl font-bold text-white">Gratuito</p>
          <ul class="mt-4 space-y-2 text-sm text-zinc-400">
            <li>Perfil básico na plataforma</li>
            <li>Até 5 fotos na galeria</li>
            <li>Aprovação em até {{ approvalDaysBasic }} dias úteis</li>
          </ul>
        </button>
        <button
          type="button"
          class="relative rounded-2xl border p-6 text-left transition"
          :class="
            draft.plan_type === 'premium'
              ? 'border-brand bg-brand/10'
              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600'
          "
          @click="selectPremiumPlan"
        >
          <span class="absolute right-4 top-4 rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">Popular</span>
          <p class="text-sm font-medium text-brand">Plano premium</p>
          <p class="mt-2 text-2xl font-bold text-white">
            <template v-if="draft.plan_type === 'premium'">{{ formatBrl(premiumSelectedPrice) }}</template>
            <template v-else>A partir de {{ formatBrl(premiumFromPrice) }}</template>
            <span class="text-base font-normal text-zinc-400">/mês</span>
          </p>
          <p class="mt-3 text-xs leading-relaxed text-zinc-500">
            Destaque de <strong class="text-zinc-400">{{ premiumTierMin }}</strong> a
            <strong class="text-zinc-400">{{ premiumTierMax }}</strong>.<br />
            Clique na estrela para escolher o nível de destaque.
          </p>
          <p class="mt-2 text-xs font-medium text-zinc-400">Nível de destaque (estrelas)</p>
          <div class="mt-2 flex flex-wrap gap-1 text-amber-400">
            <button
              v-for="s in premiumTierRange"
              :key="s"
              type="button"
              class="text-xl leading-none transition hover:scale-110"
              :title="`Nível ${s} — ${formatBrl(priceForPremiumTier(s))}/mês`"
              @click.stop="setPremiumTier(s)"
            >
              {{ s <= draft.premium_tier ? '★' : '☆' }}
            </button>
          </div>
          <p v-if="draft.plan_type === 'premium'" class="mt-2 text-xs text-zinc-500">
            Selecionado: nível <strong class="text-zinc-300">{{ draft.premium_tier }}</strong> —
            {{ formatBrl(premiumSelectedPrice) }}/mês
          </p>
          <ul class="mt-4 space-y-2 text-sm text-zinc-400">
            <li>Aprovação em até {{ approvalDaysPremium }} dias úteis após o pagamento</li>
            <li>PIX no final do cadastro; análise após confirmação</li>
          </ul>
        </button>
      </div>
      <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <input v-model="draft.terms_accepted" type="checkbox" class="mt-1 rounded border-zinc-600" />
        <span class="text-sm text-zinc-300">
          Li e aceito os
          <NuxtLink
            to="/termos-de-servico"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-brand underline underline-offset-2 hover:text-brand-muted"
            @click.stop
          >
            termos de uso
          </NuxtLink>
          *
        </span>
      </label>
    </section>

    <!-- Navegação inferior fixa -->
    <div
      class="fixed bottom-0 left-0 right-0 z-10 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80"
    >
      <p
        v-if="formError"
        class="mx-auto mb-3 max-w-3xl rounded-lg border border-red-900/60 bg-red-950/90 px-3 py-2 text-center text-sm text-red-200"
        role="alert"
      >
        {{ formError }}
      </p>
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <button
          type="button"
          class="rounded-xl border border-zinc-600 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40"
          :disabled="step <= 1 || busy"
          @click="prev"
        >
          Voltar
        </button>
        <button
          v-if="step < totalSteps"
          type="button"
          class="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:bg-brand-muted disabled:opacity-50"
          :disabled="busy"
          @click="next"
        >
          {{ busy ? 'Salvando…' : 'Próximo' }}
        </button>
        <button
          v-else
          type="button"
          class="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:bg-brand-muted disabled:opacity-50"
          :disabled="!draft.terms_accepted || busy || basicSuccessModalOpen"
          @click="submitFinal"
        >
          {{ busy ? 'Enviando…' : 'Enviar cadastro' }}
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="pixModalOpen"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pix-modal-title"
        @click.self="closePixModal"
      >
        <div
          class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
          @click.stop
        >
          <template v-if="!pixPaid">
            <h3 id="pix-modal-title" class="text-lg font-semibold text-white">Pagamento via PIX</h3>
            <p class="mt-2 text-sm leading-relaxed text-zinc-400">
              Escaneie o QR Code com o app do seu banco ou copie o código abaixo. Validamos o pagamento automaticamente;
              em seguida o cadastro segue para análise.
            </p>
            <p class="mt-3 rounded-lg border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
              <strong class="text-amber-200">Estorno:</strong> se o cadastro não for aprovado na análise, o valor pago é
              estornado conforme as regras da plataforma.
            </p>
            <div v-if="qrDataUrl" class="mt-5 flex justify-center rounded-xl bg-white p-4">
              <img :src="qrDataUrl" alt="QR Code PIX" width="260" height="260" class="h-[260px] w-[260px] object-contain" />
            </div>
            <p v-else class="mt-5 text-center text-sm text-zinc-500">A gerar QR Code…</p>
            <p class="mt-2 text-center text-sm font-medium text-white">{{ formatBrl(pixAmount) }}</p>
            <div class="mt-4 space-y-2">
              <label class="block text-xs font-medium text-zinc-500">Pix copia e cola</label>
              <textarea
                readonly
                rows="3"
                class="input resize-none font-mono text-xs text-zinc-200"
                :value="pixBrCode"
              />
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-xl border border-zinc-600 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
                  @click="copyPixCode"
                >
                  Copiar código
                </button>
                <button
                  v-if="pixMock"
                  type="button"
                  class="rounded-xl border border-amber-700/60 bg-amber-950/40 px-4 py-2 text-sm text-amber-100 transition hover:bg-amber-950/70"
                  @click="mockConfirmPix"
                >
                  Simular pagamento (local)
                </button>
              </div>
              <p v-if="pixCopyMsg" class="text-sm text-emerald-400">{{ pixCopyMsg }}</p>
            </div>
            <p class="mt-4 text-sm text-zinc-500">Aguardando confirmação do pagamento…</p>
            <button
              type="button"
              class="mt-6 w-full rounded-xl border border-zinc-600 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              @click="closePixModal"
            >
              Fechar (continua pendente)
            </button>
          </template>
          <template v-else>
            <h3 class="text-lg font-semibold text-emerald-400">Pagamento confirmado</h3>
            <p class="mt-3 text-sm leading-relaxed text-zinc-300">
              Recebemos seu pagamento com sucesso. Seu perfil foi enviado para análise da equipe. Prazo estimado:
              <strong class="text-white">até {{ approvalDaysPremium }} dias úteis</strong>.
            </p>
            <p class="mt-2 text-xs text-zinc-500">
              Você será notificado quando houver retorno. Enquanto isso, explore o site.
            </p>
            <button
              type="button"
              class="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:bg-brand-muted"
              @click="finishAfterPix"
            >
              Ir para explorar
            </button>
          </template>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="basicSuccessModalOpen"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="basic-success-title"
      >
        <div
          class="w-full max-w-md rounded-2xl border border-emerald-900/50 bg-zinc-900 p-6 shadow-2xl"
          @click.stop
        >
          <h3 id="basic-success-title" class="text-lg font-semibold text-emerald-400">Cadastro enviado</h3>
          <p class="mt-3 text-sm leading-relaxed text-zinc-300">
            Seu cadastro no <strong class="text-white">plano gratuito</strong> foi recebido e está na fila para análise da
            equipe.
          </p>
          <p class="mt-3 text-sm leading-relaxed text-zinc-300">
            Prazo estimado para análise:
            <strong class="text-white">até {{ approvalDaysBasic }} dias úteis</strong>.
          </p>
          <p class="mt-2 text-xs text-zinc-500">
            Você será notificado quando houver retorno. Enquanto isso, pode explorar o site.
          </p>
          <button
            type="button"
            class="mt-6 w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 hover:bg-brand-muted"
            @click="finishAfterBasicSuccess"
          >
            Ir para explorar
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/// <reference path="../../types/qrcode.d.ts" />
/** Public URL: /cadastro — file name in English (register.vue). API uses men|women|trans. */

import { REGISTER_COVER, REGISTER_GALLERY_DEFAULTS, REGISTER_PROFILE_AVATAR } from '~/config/registerPresentation'
import { cpfDigits, formatCepMask, formatCpfMask, formatPhoneBrMask, phoneDigits } from '~/utils/brFormat'

/** Marca que o usuário já saiu da página /cadastro pelo menos uma vez (próximas visitas = “voltou”). */
const CADASTRO_REVISIT_KEY = 'prazervip_cadastro_revisitou'

definePageMeta({
  layout: 'default',
  path: '/cadastro',
})

useHead({
  title: 'Cadastro de anunciante',
})

const totalSteps = 7
const step = ref(1)
const busy = ref(false)
const formError = ref<string | null>(null)
const cepLoading = ref(false)
const cepError = ref<string | null>(null)
const hasReturnedToCadastro = ref(false)
const purgeOpen = ref(false)
const purgeBusy = ref(false)
const purgeError = ref<string | null>(null)
const purgeSuccess = ref<string | null>(null)
const purge = reactive({
  email: '',
  cpf: '',
  confirm: false,
})

const accountPassword = ref('')
const accountPasswordConfirmation = ref('')

const { token, request } = useApi()
const { register, fetchMe, user, deleteDraftRegistration, setPassword } = useAuth()
const hasToken = computed(() => !!token.value)

const form = reactive({
  name: '',
  cpf: '',
  email: '',
})

const draft = reactive({
  birth_date: '',
  mother_name: '',
  contact_email: '',
  whatsapp: '',
  address: {
    zipcode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state_uf: '',
  },
  professional_name: '',
  profile_type: '' as '' | 'men' | 'women' | 'trans',
  service_type: '' as '' | 'companion' | 'masseuse',
  state_id: null as number | null,
  city_id: null as number | null,
  neighborhood: '',
  has_venue: null as boolean | null,
  bio: '',
  plan_type: '' as '' | 'basic' | 'premium',
  premium_tier: 1,
  terms_accepted: false,
  id_document_front_media_id: null as number | null,
  id_document_back_media_id: null as number | null,
  selfie_media_id: null as number | null,
  video_media_id: null as number | null,
  cover_media_id: null as number | null,
  portal_avatar_media_id: null as number | null,
  gallery_media_ids: [] as number[],
})

const step1IdentityComplete = computed(() => {
  const d = cpfDigits(form.cpf)
  return Boolean(form.name.trim() && form.email.trim() && d.length === 11)
})

/** Só na 2ª+ visita à página e com nome, e-mail e CPF preenchidos (fluxo “voltou”). */
const showPurgeSection = computed(
  () => !hasToken.value && hasReturnedToCadastro.value && step1IdentityComplete.value,
)

/** Conta criada na etapa 1 ainda sem senha escolhida pelo usuário. */
const needsAccountPassword = computed(() => !user.value?.password_set_at)

const legalNameDisplay = computed(() => user.value?.name?.trim() || '—')
const cpfDisplay = computed(() => {
  const raw = user.value?.advertiser_profile?.cpf
  if (raw && /^\d{11}$/.test(raw)) {
    return formatCpfMask(raw)
  }
  return formatCpfMask(form.cpf)
})

const profileTypeOptions = [
  { value: 'men' as const, label: 'Homem' },
  { value: 'women' as const, label: 'Mulher' },
  { value: 'trans' as const, label: 'Trans' },
]

const serviceTypeOptions = [
  { value: 'companion' as const, label: 'Acompanhante' },
  { value: 'masseuse' as const, label: 'Massagista' },
]

const venueOptions = [
  { value: true, label: 'Sim' },
  { value: false, label: 'Não' },
]

interface ApiState {
  id: number
  uf: string
  name: string
}

interface ApiCity {
  id: number
  state_id: number
  name: string
  slug: string
}

const states = ref<ApiState[]>([])
const cities = ref<ApiCity[]>([])
const locationsLoading = ref(false)
const citiesLoading = ref(false)

async function loadStates() {
  if (states.value.length > 0) {
    return
  }
  locationsLoading.value = true
  try {
    states.value = await request<ApiState[]>('/v1/states')
  } finally {
    locationsLoading.value = false
  }
}

async function loadCitiesForState(stateId: number) {
  citiesLoading.value = true
  try {
    cities.value = await request<ApiCity[]>(`/v1/states/${stateId}/cities`)
  } finally {
    citiesLoading.value = false
  }
}

async function onAdvertStateChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  const newId = raw === '' ? null : Number(raw)
  draft.state_id = newId
  draft.city_id = null
  if (newId != null) {
    await loadCitiesForState(newId)
  } else {
    cities.value = []
  }
}

function onAdvertCityChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  draft.city_id = raw === '' ? null : Number(raw)
}

watch(
  () => step.value,
  async (s) => {
    if (s !== 5) {
      return
    }
    await loadStates()
    if (draft.state_id != null) {
      await loadCitiesForState(draft.state_id)
    } else {
      cities.value = []
    }
  },
)

watch(
  () => draft.has_venue,
  (v) => {
    if (v === false) {
      draft.neighborhood = ''
    }
  },
)

const docLabels = [
  { key: 'frente', label: 'Documento (frente) *', purpose: 'id_document_front', accept: 'image/*' },
  { key: 'verso', label: 'Documento (verso) *', purpose: 'id_document_back', accept: 'image/*' },
  { key: 'selfie', label: 'Selfie *', purpose: 'selfie', accept: 'image/*' },
  { key: 'video', label: 'Vídeo de verificação *', purpose: 'video', accept: 'video/*' },
] as const

type DocItem = (typeof docLabels)[number]

const PURPOSE_TO_DRAFT = {
  id_document_front: 'id_document_front_media_id',
  id_document_back: 'id_document_back_media_id',
  selfie: 'selfie_media_id',
  video: 'video_media_id',
} as const

const verificationDragKey = ref<string | null>(null)
const verificationErrors = reactive<Record<string, string>>({})
const verificationUploading = reactive<Record<string, boolean>>({})
const verificationFileNames = reactive<Record<string, string>>({})

const hoje = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('pt-BR')
})

function mediaIdForDoc(doc: DocItem): number | null {
  const field = PURPOSE_TO_DRAFT[doc.purpose]
  return draft[field]
}

function verificationDropClass(key: string) {
  if (verificationDragKey.value === key) {
    return 'border-brand bg-zinc-800/40'
  }
  const doc = docLabels.find((d) => d.key === key)
  if (doc && mediaIdForDoc(doc)) {
    return 'border-emerald-800/50 bg-emerald-950/20'
  }
  return 'border-zinc-700 bg-zinc-900/30'
}

function verificationHint(doc: DocItem) {
  if (verificationUploading[doc.key]) {
    return 'Enviando…'
  }
  if (verificationErrors[doc.key]) {
    return verificationErrors[doc.key]
  }
  if (mediaIdForDoc(doc)) {
    return verificationFileNames[doc.key] || 'Arquivo enviado — clique ou arraste para substituir'
  }
  return 'Clique ou arraste o arquivo até aqui'
}

function openVerificationPicker(key: string) {
  document.getElementById(`vdoc-${key}`)?.click()
}

function onVerificationDragOver(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function onVerificationDragLeave(e: DragEvent, key: string) {
  const t = e.currentTarget as HTMLElement
  const rel = e.relatedTarget as Node | null
  if (rel && t.contains(rel)) {
    return
  }
  if (verificationDragKey.value === key) {
    verificationDragKey.value = null
  }
}

function onVerificationDrop(e: DragEvent, doc: DocItem) {
  verificationDragKey.value = null
  const f = e.dataTransfer?.files?.[0]
  if (f) {
    void uploadVerificationFile(doc, f)
  }
}

function onVerificationInputChange(e: Event, doc: DocItem) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (f) {
    void uploadVerificationFile(doc, f)
  }
}

function verificationApiError(e: unknown): string {
  const d = (e as { data?: { errors?: Record<string, string[]>; message?: string } }).data
  if (d?.errors?.file?.[0]) {
    return d.errors.file[0]
  }
  if (d?.errors?.purpose?.[0]) {
    return d.errors.purpose[0]
  }
  if (typeof d?.message === 'string') {
    return d.message
  }
  return 'Não foi possível enviar. Verifique o tipo e o tamanho do arquivo.'
}

async function uploadVerificationFile(doc: DocItem, file: File) {
  if (!hasToken.value) {
    return
  }
  delete verificationErrors[doc.key]
  verificationUploading[doc.key] = true
  const formData = new FormData()
  formData.append('purpose', doc.purpose)
  formData.append('file', file)
  try {
    const res = await request<{ id: number; purpose: keyof typeof PURPOSE_TO_DRAFT }>('/v1/me/media', {
      method: 'POST',
      body: formData,
    })
    const field = PURPOSE_TO_DRAFT[res.purpose]
    draft[field] = res.id
    verificationFileNames[doc.key] = file.name
  } catch (e: unknown) {
    verificationErrors[doc.key] = verificationApiError(e)
  } finally {
    verificationUploading[doc.key] = false
  }
}

const galleryRules = ref<{ min: number; max: number }>({
  min: REGISTER_GALLERY_DEFAULTS.min,
  max: REGISTER_GALLERY_DEFAULTS.max,
})

const dragCover = ref(false)
const dragGallery = ref(false)
const dragAvatar = ref(false)
const coverUploading = ref(false)
const coverError = ref('')
const coverFileName = ref('')
const avatarUploading = ref(false)
const avatarError = ref('')
const avatarFileName = ref('')
const galleryUploading = ref(0)
const galleryError = ref('')
const galleryItems = ref<{ id: number; name: string }[]>([])

async function loadRegisterMediaConfig() {
  try {
    const c = await request<{ gallery_min: number; gallery_max: number }>('/v1/config/register-media')
    const min = Number(c.gallery_min)
    const max = Number(c.gallery_max)
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      galleryRules.value = { ...REGISTER_GALLERY_DEFAULTS }
      return
    }
    galleryRules.value = { min: Math.min(min, max), max: Math.max(min, max) }
  } catch {
    galleryRules.value = { ...REGISTER_GALLERY_DEFAULTS }
  }
}

interface PremiumTierRow {
  tier: number
  price_brl: number
}

interface PremiumPricingPayload {
  /** Valor de cada “degrau” (nível N = N × este valor). */
  price_per_tier_brl: number
  tier_min: number
  tier_max: number
  tiers: PremiumTierRow[]
  approval_business_days_basic: number
  approval_business_days_premium: number
}

const PREMIUM_PRICING_FALLBACK: Omit<PremiumPricingPayload, 'tiers'> = {
  price_per_tier_brl: 150,
  tier_min: 1,
  tier_max: 10,
  approval_business_days_basic: 5,
  approval_business_days_premium: 2,
}

const premiumPricing = ref<PremiumPricingPayload | null>(null)

function buildPremiumTierRows(p: Omit<PremiumPricingPayload, 'tiers'>): PremiumPricingPayload {
  const tiers: PremiumTierRow[] = []
  for (let t = p.tier_min; t <= p.tier_max; t++) {
    tiers.push({ tier: t, price_brl: t * p.price_per_tier_brl })
  }
  return { ...p, tiers }
}

const premiumPayloadResolved = computed(() =>
  premiumPricing.value ? premiumPricing.value : buildPremiumTierRows({ ...PREMIUM_PRICING_FALLBACK }),
)

async function loadPremiumPricing() {
  try {
    const c = await request<PremiumPricingPayload>('/v1/config/premium-pricing')
    const tierMin = Math.max(1, Math.floor(Number(c.tier_min)) || 1)
    const tierMax = Math.max(tierMin, Math.floor(Number(c.tier_max)) || 10)
    const unit = Number(c.price_per_tier_brl)
    const ab = Number(c.approval_business_days_basic)
    const ap = Number(c.approval_business_days_premium)
    premiumPricing.value = buildPremiumTierRows({
      price_per_tier_brl: Number.isFinite(unit) && unit > 0 ? unit : PREMIUM_PRICING_FALLBACK.price_per_tier_brl,
      tier_min: tierMin,
      tier_max: tierMax,
      approval_business_days_basic: Number.isFinite(ab) ? ab : PREMIUM_PRICING_FALLBACK.approval_business_days_basic,
      approval_business_days_premium: Number.isFinite(ap) ? ap : PREMIUM_PRICING_FALLBACK.approval_business_days_premium,
    })
  } catch {
    premiumPricing.value = buildPremiumTierRows({ ...PREMIUM_PRICING_FALLBACK })
  }
  clampPremiumTier()
}

function clampPremiumTier() {
  const p = premiumPayloadResolved.value
  draft.premium_tier = Math.min(Math.max(draft.premium_tier, p.tier_min), p.tier_max)
}

function selectPremiumPlan() {
  draft.plan_type = 'premium'
  clampPremiumTier()
}

function setPremiumTier(s: number) {
  draft.plan_type = 'premium'
  draft.premium_tier = s
  clampPremiumTier()
}

function formatBrl(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function priceForPremiumTier(tier: number): number {
  const p = premiumPayloadResolved.value
  const t = Math.min(Math.max(tier, p.tier_min), p.tier_max)
  return t * p.price_per_tier_brl
}

const premiumTierRange = computed(() => {
  const p = premiumPayloadResolved.value
  const out: number[] = []
  for (let t = p.tier_min; t <= p.tier_max; t++) {
    out.push(t)
  }
  return out
})

const premiumSelectedPrice = computed(() => priceForPremiumTier(draft.premium_tier))

const premiumPricePerTier = computed(() => premiumPayloadResolved.value.price_per_tier_brl)
const premiumFromPrice = computed(() => priceForPremiumTier(premiumPayloadResolved.value.tier_min))
const premiumTierMin = computed(() => premiumPayloadResolved.value.tier_min)
const premiumTierMax = computed(() => premiumPayloadResolved.value.tier_max)

const approvalDaysBasic = computed(() => {
  const n = Number(premiumPayloadResolved.value.approval_business_days_basic)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : PREMIUM_PRICING_FALLBACK.approval_business_days_basic
})
const approvalDaysPremium = computed(() => {
  const n = Number(premiumPayloadResolved.value.approval_business_days_premium)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : PREMIUM_PRICING_FALLBACK.approval_business_days_premium
})

const basicSuccessModalOpen = ref(false)
const pixModalOpen = ref(false)
const pixPaid = ref(false)
const pixMock = ref(false)
const pixBrCode = ref('')
const pixAmount = ref(0)
const qrDataUrl = ref('')
const pixCopyMsg = ref<string | null>(null)
let paymentPollTimer: ReturnType<typeof setInterval> | null = null

watch(
  () => step.value,
  (s) => {
    if (s === 6) {
      void loadRegisterMediaConfig()
    }
    if (s === 7) {
      void loadPremiumPricing()
    }
  },
)

watch(
  () => draft.plan_type,
  (v) => {
    if (v === 'premium') {
      clampPremiumTier()
    }
  },
)

const presentationCoverZoneClass = computed(() => {
  const base = 'border-zinc-700 bg-zinc-900/30'
  if (dragCover.value) {
    return 'border-brand bg-zinc-800/40'
  }
  if (draft.cover_media_id) {
    return 'border-emerald-800/50 bg-emerald-950/20'
  }
  return base
})

const presentationGalleryZoneClass = computed(() => {
  const base = 'border-zinc-700 bg-zinc-900/30'
  if (dragGallery.value) {
    return 'border-brand bg-zinc-800/40'
  }
  const min = galleryRules.value.min
  if (draft.gallery_media_ids.length >= min) {
    return 'border-emerald-800/50 bg-emerald-950/20'
  }
  return base
})

const presentationAvatarZoneClass = computed(() => {
  const base = 'border-zinc-700 bg-zinc-900/30'
  if (dragAvatar.value) {
    return 'border-brand bg-zinc-800/40'
  }
  if (draft.portal_avatar_media_id) {
    return 'border-emerald-800/50 bg-emerald-950/20'
  }
  return base
})

const coverHint = computed(() => {
  if (coverUploading.value) {
    return 'Enviando…'
  }
  if (coverError.value) {
    return coverError.value
  }
  if (draft.cover_media_id) {
    return coverFileName.value || 'Imagem de capa enviada — clique ou arraste para substituir'
  }
  return 'Clique ou arraste uma imagem até aqui'
})

const avatarHint = computed(() => {
  if (avatarUploading.value) {
    return 'Enviando…'
  }
  if (avatarError.value) {
    return avatarError.value
  }
  if (draft.portal_avatar_media_id) {
    return avatarFileName.value || 'Foto de perfil enviada — clique ou arraste para substituir'
  }
  return 'Clique ou arraste a foto do rosto até aqui'
})

const galleryHint = computed(() => {
  if (galleryUploading.value > 0) {
    return 'Enviando…'
  }
  if (galleryError.value) {
    return galleryError.value
  }
  const { min, max } = galleryRules.value
  const n = draft.gallery_media_ids.length
  if (n >= max) {
    return `Limite de ${max} foto(s) atingido. Remova uma foto para substituir.`
  }
  return `Clique ou arraste imagens (até mais ${max - n}). São necessárias no mínimo ${min} foto(s).`
})

/** Detecta imagem por MIME ou extensão (alguns SOs deixam type vazio). */
function isProbablyImageFile(f: File): boolean {
  if (f.type.startsWith('image/')) {
    return true
  }
  if (!f.type && /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(f.name)) {
    return true
  }
  return false
}

function openPresentationPicker(which: 'cover' | 'gallery' | 'avatar') {
  const id =
    which === 'cover'
      ? 'presentation-cover-input'
      : which === 'avatar'
        ? 'presentation-avatar-input'
        : 'presentation-gallery-input'
  document.getElementById(id)?.click()
}

function onPresentationDragOver(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function onPresentationDragLeave(e: DragEvent, which: 'cover' | 'gallery' | 'avatar') {
  const t = e.currentTarget as HTMLElement
  const rel = e.relatedTarget as Node | null
  if (rel && t.contains(rel)) {
    return
  }
  if (which === 'cover') {
    dragCover.value = false
  } else if (which === 'avatar') {
    dragAvatar.value = false
  } else {
    dragGallery.value = false
  }
}

function onPresentationDrop(e: DragEvent, zone: 'cover' | 'gallery' | 'avatar') {
  dragCover.value = false
  dragGallery.value = false
  dragAvatar.value = false
  const raw = e.dataTransfer?.files
  if (!raw?.length) {
    return
  }
  if (zone === 'cover') {
    const f = raw[0]
    if (f && isProbablyImageFile(f)) {
      void uploadCoverFile(f)
    }
    return
  }
  if (zone === 'avatar') {
    const f = raw[0]
    if (f && isProbablyImageFile(f)) {
      void uploadAvatarFile(f)
    }
    return
  }
  void addGalleryFiles(Array.from(raw))
}

function onCoverFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (f) {
    void uploadCoverFile(f)
  }
}

function onGalleryFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  /** Copiar antes de limpar o input: FileList é vivo e some ao dar input.value = '' */
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (files.length) {
    void addGalleryFiles(files)
  }
}

async function uploadCoverFile(file: File) {
  if (!hasToken.value) {
    coverError.value = 'Sessão expirada. Atualize a página e entre de novo.'
    return
  }
  coverError.value = ''
  coverUploading.value = true
  const fd = new FormData()
  fd.append('purpose', 'cover')
  fd.append('file', file)
  try {
    const res = await request<{ id: number; purpose: string }>('/v1/me/media', {
      method: 'POST',
      body: fd,
    })
    if (res.purpose === 'cover') {
      draft.cover_media_id = res.id
      coverFileName.value = file.name
    }
  } catch (e: unknown) {
    coverError.value = verificationApiError(e)
  } finally {
    coverUploading.value = false
  }
}

function onAvatarFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (f) {
    void uploadAvatarFile(f)
  }
}

async function uploadAvatarFile(file: File) {
  if (!hasToken.value) {
    avatarError.value = 'Sessão expirada. Atualize a página e entre de novo.'
    return
  }
  avatarError.value = ''
  avatarUploading.value = true
  const fd = new FormData()
  fd.append('purpose', 'portal_avatar')
  fd.append('file', file)
  try {
    const res = await request<{ id: number; purpose: string }>('/v1/me/media', {
      method: 'POST',
      body: fd,
    })
    if (res.purpose === 'portal_avatar') {
      draft.portal_avatar_media_id = res.id
      avatarFileName.value = file.name
    }
  } catch (e: unknown) {
    avatarError.value = verificationApiError(e)
  } finally {
    avatarUploading.value = false
  }
}

async function addGalleryFiles(files: File[]) {
  const arr = files.filter(isProbablyImageFile)
  if (arr.length === 0) {
    galleryError.value = 'Selecione apenas arquivos de imagem (JPG, PNG, WebP, etc.).'
    return
  }
  galleryError.value = ''
  const max = galleryRules.value.max
  const remaining = max - draft.gallery_media_ids.length
  if (remaining <= 0) {
    galleryError.value = `Limite de ${max} fotos atingido.`
    return
  }
  const slice = arr.slice(0, remaining)
  for (const f of slice) {
    if (draft.gallery_media_ids.length >= max) {
      break
    }
    await uploadGalleryOne(f)
  }
}

async function uploadGalleryOne(file: File) {
  if (!hasToken.value) {
    galleryError.value = 'Sessão expirada. Atualize a página e entre de novo.'
    return
  }
  galleryUploading.value += 1
  galleryError.value = ''
  const fd = new FormData()
  fd.append('purpose', 'gallery')
  fd.append('file', file)
  try {
    const res = await request<{ id: number; purpose: string }>('/v1/me/media', {
      method: 'POST',
      body: fd,
    })
    if (res.purpose === 'gallery') {
      draft.gallery_media_ids.push(res.id)
      galleryItems.value.push({ id: res.id, name: file.name })
    }
  } catch (e: unknown) {
    galleryError.value = verificationApiError(e)
  } finally {
    galleryUploading.value -= 1
  }
}

async function removeGalleryItem(id: number) {
  galleryError.value = ''
  draft.gallery_media_ids = draft.gallery_media_ids.filter((x) => x !== id)
  galleryItems.value = galleryItems.value.filter((x) => x.id !== id)
  if (!hasToken.value) {
    return
  }
  try {
    await request('/v1/me/profile', {
      method: 'PUT',
      body: {
        gallery_media_ids: draft.gallery_media_ids.length ? draft.gallery_media_ids : null,
        form_status: 'draft',
      },
    })
  } catch {
    galleryError.value = 'Não foi possível atualizar a galeria.'
  }
}

function onCpfInput(e: Event) {
  const el = e.target as HTMLInputElement
  form.cpf = formatCpfMask(el.value)
}

function onWhatsappInput(e: Event) {
  const el = e.target as HTMLInputElement
  draft.whatsapp = formatPhoneBrMask(el.value)
}

function onPurgeCpfInput(e: Event) {
  const el = e.target as HTMLInputElement
  purge.cpf = formatCpfMask(el.value)
}

function copyFormToPurge() {
  purge.email = form.email
  purge.cpf = form.cpf
  purgeError.value = null
  purgeSuccess.value = null
}

async function submitPurgeDraft() {
  purgeError.value = null
  purgeSuccess.value = null
  const d = cpfDigits(purge.cpf)
  if (!purge.email.trim() || d.length !== 11) {
    purgeError.value = 'Preencha e-mail e CPF (11 dígitos).'
    return
  }
  if (!purge.confirm) {
    purgeError.value = 'Marque a confirmação para continuar.'
    return
  }
  purgeBusy.value = true
  try {
    await deleteDraftRegistration({
      email: purge.email.trim(),
      cpf: d,
      confirm: true,
    })
    purgeSuccess.value = 'Pré-cadastro removido. Você pode criar uma nova conta acima.'
    purge.email = ''
    purge.cpf = ''
    purge.confirm = false
  } catch (e: unknown) {
    const err = e as { data?: { errors?: Record<string, string[]> } }
    const msg =
      err.data?.errors?.form_status?.[0] ||
      err.data?.errors?.email?.[0] ||
      err.data?.errors?.cpf?.[0] ||
      null
    purgeError.value = msg || 'Não foi possível excluir. Verifique e-mail e CPF.'
  } finally {
    purgeBusy.value = false
  }
}

function onCepInput(e: Event) {
  const el = e.target as HTMLInputElement
  draft.address.zipcode = formatCepMask(el.value)
}

async function fetchViaCep() {
  cepError.value = null
  const digits = draft.address.zipcode.replace(/\D/g, '')
  if (digits.length !== 8) {
    return
  }
  cepLoading.value = true
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    const data = (await res.json()) as { erro?: boolean; logradouro?: string; complemento?: string; bairro?: string; localidade?: string; uf?: string }
    if (data.erro) {
      cepError.value = 'CEP não encontrado.'
      return
    }
    draft.address.street = data.logradouro || draft.address.street
    draft.address.complement = data.complemento || ''
    draft.address.neighborhood = data.bairro || ''
    draft.address.city = data.localidade || ''
    draft.address.state_uf = data.uf || ''
  } catch {
    cepError.value = 'Não foi possível consultar o CEP.'
  } finally {
    cepLoading.value = false
  }
}

onMounted(async () => {
  if (import.meta.client) {
    hasReturnedToCadastro.value = localStorage.getItem(CADASTRO_REVISIT_KEY) === '1'
  }
  await fetchMe()
  if (hasToken.value) {
    try {
      const p = await request<Record<string, unknown>>('/v1/me/profile')
      hydrateFromProfile(p)
      step.value = Math.min(Math.max(Number(p.current_step) || 1, 1), totalSteps)
    } catch {
      /* perfil novo */
    }
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    localStorage.setItem(CADASTRO_REVISIT_KEY, '1')
  }
})

watch(showPurgeSection, (v) => {
  if (!v) {
    purgeOpen.value = false
  }
})

function hydrateFromProfile(p: Record<string, unknown>) {
  const keys = [
    'mother_name',
    'contact_email',
    'whatsapp',
    'professional_name',
    'profile_type',
    'service_type',
    'neighborhood',
    'bio',
    'plan_type',
    'premium_tier',
  ] as const
  for (const k of keys) {
    const v = p[k]
    if (v !== undefined && v !== null) {
      ;(draft as Record<string, unknown>)[k] = v
    }
  }
  if (p.birth_date) {
    const s = String(p.birth_date)
    draft.birth_date = s.includes('T') ? s.slice(0, 10) : s.slice(0, 10)
  }
  if (p.has_venue !== undefined && p.has_venue !== null) {
    draft.has_venue = Boolean(p.has_venue)
  }
  if (p.state_id != null) {
    draft.state_id = Number(p.state_id)
  }
  if (p.city_id != null) {
    draft.city_id = Number(p.city_id)
  }
  if (p.whatsapp != null && String(p.whatsapp).length > 0) {
    draft.whatsapp = formatPhoneBrMask(String(p.whatsapp))
  }
  const ej = p.address_json
  if (ej && typeof ej === 'object') {
    const o = ej as Record<string, string>
    draft.address.zipcode = o.zipcode ?? o.zip ?? ''
    if (draft.address.zipcode) {
      draft.address.zipcode = formatCepMask(draft.address.zipcode)
    }
    draft.address.street = o.street ?? ''
    draft.address.number = o.number ?? ''
    draft.address.complement = o.complement ?? ''
    draft.address.neighborhood = o.neighborhood ?? o.bairro ?? ''
    draft.address.city = o.city ?? o.localidade ?? ''
    draft.address.state_uf = o.state_uf ?? o.uf ?? ''
  }
  for (const doc of docLabels) {
    const field = PURPOSE_TO_DRAFT[doc.purpose]
    const v = p[field]
    if (v != null && v !== '' && Number(v) > 0) {
      draft[field] = Number(v)
      verificationFileNames[doc.key] = 'Arquivo já salvo'
    }
  }
  if (p.cover_media_id != null && Number(p.cover_media_id) > 0) {
    draft.cover_media_id = Number(p.cover_media_id)
    coverFileName.value = 'Arquivo já salvo'
  }
  if (p.portal_avatar_media_id != null && Number(p.portal_avatar_media_id) > 0) {
    draft.portal_avatar_media_id = Number(p.portal_avatar_media_id)
    avatarFileName.value = 'Arquivo já salvo'
  }
  const rawGallery = p.gallery_media_ids
  if (Array.isArray(rawGallery) && rawGallery.length > 0) {
    const ids = rawGallery.map((x) => Number(x)).filter((x) => x > 0)
    draft.gallery_media_ids = ids
    galleryItems.value = ids.map((id, i) => ({ id, name: `Foto ${i + 1}` }))
  }
}

function bodyFromDraft() {
  const zipDigits = draft.address.zipcode.replace(/\D/g, '').slice(0, 8)
  const waDigits = phoneDigits(draft.whatsapp)
  return {
    mother_name: draft.mother_name || null,
    birth_date: draft.birth_date || null,
    contact_email: draft.contact_email || null,
    whatsapp: waDigits || null,
    professional_name: draft.professional_name || null,
    profile_type: draft.profile_type || null,
    service_type: draft.service_type || null,
    state_id: draft.state_id,
    city_id: draft.city_id,
    neighborhood: draft.has_venue === true ? (draft.neighborhood.trim() || null) : null,
    has_venue: draft.has_venue,
    bio: draft.bio || null,
    plan_type: draft.plan_type || null,
    premium_tier: draft.plan_type === 'premium' ? draft.premium_tier : null,
    current_step: step.value,
    address_json: {
      zipcode: zipDigits || null,
      street: draft.address.street,
      number: draft.address.number,
      complement: draft.address.complement || null,
      neighborhood: draft.address.neighborhood,
      city: draft.address.city,
      state_uf: draft.address.state_uf,
      country: 'BR',
    },
    id_document_front_media_id: draft.id_document_front_media_id,
    id_document_back_media_id: draft.id_document_back_media_id,
    selfie_media_id: draft.selfie_media_id,
    video_media_id: draft.video_media_id,
    cover_media_id: draft.cover_media_id,
    portal_avatar_media_id: draft.portal_avatar_media_id,
    gallery_media_ids: draft.gallery_media_ids.length ? draft.gallery_media_ids : null,
  }
}

async function persistStep() {
  if (!hasToken.value) {
    return
  }
  busy.value = true
  try {
    await request('/v1/me/profile', {
      method: 'PUT',
      body: { ...bodyFromDraft(), form_status: 'draft' },
    })
  } finally {
    busy.value = false
  }
}

function buildStep1Error(): string | null {
  const missing: string[] = []
  if (!form.name.trim()) {
    missing.push('nome completo')
  }
  if (!form.email.trim()) {
    missing.push('e-mail')
  }
  if (cpfDigits(form.cpf).length !== 11) {
    missing.push('CPF (11 dígitos)')
  }
  if (missing.length === 0) {
    return null
  }
  return `Preencha: ${missing.join(', ')}.`
}

function validateStepForNext(s: number): string | null {
  if (s === 2) {
    if (!draft.birth_date) {
      return 'Informe a data de nascimento.'
    }
    if (!draft.mother_name.trim()) {
      return 'Informe o nome completo da mãe.'
    }
    if (!draft.contact_email.trim()) {
      return 'Informe o e-mail de contato.'
    }
    const w = phoneDigits(draft.whatsapp)
    if (w.length < 10 || w.length > 13) {
      return 'Informe um WhatsApp válido (DDD + número; ao salvar usamos só números).'
    }
    const cep = draft.address.zipcode.replace(/\D/g, '')
    if (cep.length !== 8) {
      return 'Informe o CEP com 8 dígitos.'
    }
    if (!draft.address.street.trim()) {
      return 'Informe o logradouro (rua).'
    }
    if (!draft.address.number.trim()) {
      return 'Informe o número.'
    }
    if (!draft.address.neighborhood.trim()) {
      return 'Informe o bairro.'
    }
    return null
  }
  if (s === 3) {
    if (
      !draft.id_document_front_media_id ||
      !draft.id_document_back_media_id ||
      !draft.selfie_media_id ||
      !draft.video_media_id
    ) {
      return 'Envie os quatro arquivos: documento (frente e verso), selfie e vídeo de verificação.'
    }
    return null
  }
  if (s === 4) {
    if (!draft.professional_name.trim()) {
      return 'Informe o nome profissional.'
    }
    if (!draft.profile_type) {
      return 'Selecione o tipo de perfil.'
    }
    if (!draft.service_type) {
      return 'Selecione o tipo de atendimento.'
    }
    return null
  }
  if (s === 5) {
    if (draft.state_id == null || Number.isNaN(Number(draft.state_id))) {
      return 'Selecione o estado.'
    }
    if (draft.city_id == null || Number.isNaN(Number(draft.city_id))) {
      return 'Selecione a cidade.'
    }
    if (draft.has_venue === null) {
      return 'Indique se tem local de atendimento (Tem local?).'
    }
    if (draft.has_venue === true && !draft.neighborhood.trim()) {
      return 'Informe o bairro do anúncio.'
    }
    return null
  }
  if (s === 6) {
    if (!draft.bio.trim()) {
      return 'Preencha o texto de apresentação.'
    }
    if (!draft.cover_media_id) {
      return 'Envie a foto de capa (banner).'
    }
    if (!draft.portal_avatar_media_id) {
      return 'Envie a foto do perfil (rosto visível).'
    }
    const { min, max } = galleryRules.value
    const n = draft.gallery_media_ids.length
    if (n < min) {
      return `Envie no mínimo ${min} foto(s) na galeria.`
    }
    if (n > max) {
      return `No máximo ${max} foto(s) na galeria.`
    }
    return null
  }
  return null
}

async function next() {
  formError.value = null
  if (step.value === 1 && !hasToken.value) {
    const err = buildStep1Error()
    if (err) {
      formError.value = err
      return
    }
    const d = cpfDigits(form.cpf)
    try {
      const lookup = await request<{
        registration_state: string
        message: string | null
      }>('/v1/register/lookup', {
        method: 'POST',
        body: { email: form.email.trim(), cpf: d },
      })

      if (lookup.registration_state !== 'no_account') {
        formError.value =
          lookup.message ??
          (lookup.registration_state === 'pending_review'
            ? 'Seu cadastro está em análise. Aguarde a aprovação para poder entrar.'
            : 'Não é possível iniciar um novo cadastro com estes dados. Use Entrar ou outro e-mail.')
        return
      }

      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        cpf: d,
      })
      await fetchMe()
      draft.contact_email = form.email.trim()
      step.value = 2
      await persistStep()
    } catch (e: unknown) {
      const err = e as { data?: { errors?: Record<string, string[]> } }
      const msg = err.data?.errors?.cpf?.[0] ?? err.data?.errors?.email?.[0]
      formError.value =
        msg ?? 'Não foi possível criar a conta. E-mail ou CPF podem já estar em uso.'
    }
    return
  }
  if (step.value === 1 && hasToken.value) {
    step.value = 2
    return
  }
  if (step.value === 2 && needsAccountPassword.value) {
    if (accountPassword.value.length < 8 || accountPassword.value !== accountPasswordConfirmation.value) {
      formError.value = 'Defina uma senha de no mínimo 8 caracteres e confirme igual.'
      return
    }
    busy.value = true
    try {
      await setPassword(accountPassword.value, accountPasswordConfirmation.value)
      accountPassword.value = ''
      accountPasswordConfirmation.value = ''
    } catch {
      formError.value = 'Não foi possível salvar a senha. Tente novamente.'
      busy.value = false
      return
    } finally {
      busy.value = false
    }
  }
  const stepErr = validateStepForNext(step.value)
  if (stepErr) {
    formError.value = stepErr
    return
  }
  await persistStep()
  step.value += 1
}

async function prev() {
  formError.value = null
  if (step.value <= 1) {
    return
  }
  step.value -= 1
}

function stopPaymentPolling() {
  if (paymentPollTimer != null) {
    clearInterval(paymentPollTimer)
    paymentPollTimer = null
  }
}

function startPaymentPolling() {
  stopPaymentPolling()
  paymentPollTimer = setInterval(async () => {
    try {
      const st = await request<{ status: string }>('/v1/me/registration/payment-status')
      if (st.status === 'paid') {
        stopPaymentPolling()
        pixPaid.value = true
        pixCopyMsg.value = null
        await fetchMe()
      }
    } catch {
      /* mantém tentando */
    }
  }, 3000)
}

function closePixModal() {
  stopPaymentPolling()
  pixModalOpen.value = false
  pixCopyMsg.value = null
}

async function copyPixCode() {
  pixCopyMsg.value = null
  if (!pixBrCode.value || !import.meta.client) {
    return
  }
  try {
    await navigator.clipboard.writeText(pixBrCode.value)
    pixCopyMsg.value = 'Código copiado.'
  } catch {
    pixCopyMsg.value = 'Não foi possível copiar. Selecione o texto manualmente.'
  }
}

async function mockConfirmPix() {
  formError.value = null
  try {
    await request('/v1/me/registration/mock-confirm-payment', { method: 'POST' })
    const st = await request<{ status: string }>('/v1/me/registration/payment-status')
    if (st.status === 'paid') {
      stopPaymentPolling()
      pixPaid.value = true
      await fetchMe()
    }
  } catch (e: unknown) {
    formError.value = registrationPixError(e)
  }
}

async function finishAfterPix() {
  closePixModal()
  await navigateTo('/explorar')
}

async function finishAfterBasicSuccess() {
  basicSuccessModalOpen.value = false
  await navigateTo('/explorar')
}

function registrationPixError(e: unknown): string {
  const d = (e as { data?: { errors?: Record<string, string[]>; message?: string } }).data
  if (d?.errors?.plan?.[0]) {
    return d.errors.plan[0]
  }
  if (d?.errors?.pix?.[0]) {
    return d.errors.pix[0]
  }
  if (d?.errors?.form_status?.[0]) {
    return d.errors.form_status[0]
  }
  if (typeof d?.message === 'string') {
    return d.message
  }
  return 'Não foi possível concluir. Tente novamente.'
}

async function submitFinal() {
  if (!draft.terms_accepted || !hasToken.value) {
    return
  }
  formError.value = null
  if (draft.plan_type === 'premium') {
    clampPremiumTier()
  }
  busy.value = true
  try {
    if (draft.plan_type === 'basic') {
      await request('/v1/me/profile', {
        method: 'PUT',
        body: {
          ...bodyFromDraft(),
          current_step: totalSteps,
          terms_accepted: true,
          form_status: 'complete',
        },
      })
      await fetchMe()
      await loadPremiumPricing()
      basicSuccessModalOpen.value = true
      return
    }

    if (draft.plan_type !== 'premium') {
      formError.value = 'Selecione o plano básico ou premium.'
      return
    }

    await request('/v1/me/profile', {
      method: 'PUT',
      body: {
        ...bodyFromDraft(),
        current_step: totalSteps,
        terms_accepted: true,
        form_status: 'draft',
      },
    })

    const pix = await request<{
      order_uuid: string
      br_code: string
      amount_brl: number
      mock?: boolean
    }>('/v1/me/registration/pix', { method: 'POST' })

    pixPaid.value = false
    pixMock.value = Boolean(pix.mock)
    pixBrCode.value = pix.br_code
    pixAmount.value = Number(pix.amount_brl)
    qrDataUrl.value = ''
    pixCopyMsg.value = null
    pixModalOpen.value = true

    const QRCode = (await import('qrcode')).default
    qrDataUrl.value = await QRCode.toDataURL(pix.br_code, {
      width: 260,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
    startPaymentPolling()
  } catch (e: unknown) {
    formError.value = registrationPixError(e)
  } finally {
    busy.value = false
  }
}

onBeforeUnmount(() => {
  stopPaymentPolling()
})
</script>

<style scoped>
.input {
  @apply w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}

.select-field {
  @apply appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
}
</style>
