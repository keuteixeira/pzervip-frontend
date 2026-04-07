<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <NuxtLink to="/admin/anunciantes" class="text-sm text-zinc-500 hover:text-brand">← Anunciantes</NuxtLink>
        <h1 class="mt-2 text-2xl font-bold text-white">{{ detail?.professional_name || 'Perfil' }}</h1>
        <p class="text-sm text-zinc-500">
          ID {{ id }} · {{ adminApprovalStatusLabel(detail?.approval_status) }} · {{ detail?.public_slug || '—' }}
        </p>
      </div>
    </div>

    <p v-if="loading" class="text-zinc-400">Carregando…</p>
    <p v-else-if="errorMsg" class="text-red-400">{{ errorMsg }}</p>

    <template v-else-if="detail">
      <nav class="flex flex-wrap gap-1 border-b border-zinc-800 pb-3" aria-label="Secções do anunciante">
        <button
          v-for="t in adminTabs"
          :key="t.id"
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-medium transition"
          :class="
            adminTab === t.id
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          "
          @click="adminTab = t.id"
        >
          {{ t.label }}
        </button>
      </nav>

      <div v-show="adminTab === 'resumo'" class="mt-6 space-y-6">
      <section class="rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-6">
        <h2 class="text-lg font-semibold text-emerald-100">Visão geral</h2>
        <p class="mt-1 text-sm text-emerald-100/75">
          Identificadores, status do cadastro e plano. O que estiver vinculado ao perfil aparece nas secções abaixo.
        </p>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt class="text-zinc-500">ID do perfil</dt>
            <dd class="font-mono text-zinc-200">{{ detail.id }}</dd>
          </div>
          <div v-if="detail.uuid">
            <dt class="text-zinc-500">UUID</dt>
            <dd class="break-all font-mono text-xs text-zinc-300">{{ detail.uuid }}</dd>
          </div>
          <div v-if="detail.user?.id != null">
            <dt class="text-zinc-500">ID do usuário</dt>
            <dd class="font-mono text-zinc-200">{{ detail.user?.id }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Aprovação do cadastro</dt>
            <dd class="text-zinc-200">{{ adminApprovalStatusLabel(detail.approval_status) }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Estado do formulário</dt>
            <dd class="text-zinc-200">{{ adminFormStatusLabel(detail.form_status) }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Conta (usuário)</dt>
            <dd class="text-zinc-200">{{ adminAccountStatusLabel(detail.user?.account_status) }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Plano / destaque</dt>
            <dd class="text-zinc-200">
              {{ detail.plan_type || '—' }}
              <span v-if="detail.premium_tier != null" class="text-zinc-400"> · tier {{ detail.premium_tier }}</span>
            </dd>
          </div>
          <div v-if="(detail.highlight_stars_cached ?? 0) > 0 || (detail.destaque_effective_remaining_seconds ?? 0) > 0">
            <dt class="text-zinc-500">Tempo de destaque restante (estimado)</dt>
            <dd class="text-zinc-200">
              {{ formatDestaqueDuration(detail.destaque_effective_remaining_seconds ?? 0) }}
              <span v-if="detail.user_paused_listing" class="mt-1 block text-xs text-zinc-500">
                Destaque pausado — anúncio inativo; o tempo não decorre enquanto estiver pausado.
              </span>
            </dd>
          </div>
          <div v-if="(detail.highlight_stars_cached ?? 0) > 0">
            <dt class="text-zinc-500">Nível de estrelas (cache)</dt>
            <dd class="text-zinc-200">{{ detail.highlight_stars_cached }} ★</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Tipo de perfil / serviço</dt>
            <dd class="text-zinc-200">
              {{ adminProfileTypeLabel(detail.profile_type) }} · {{ adminServiceTypeLabel(detail.service_type) }}
            </dd>
          </div>
          <div v-if="detail.created_at">
            <dt class="text-zinc-500">Criado em</dt>
            <dd class="text-zinc-200">{{ formatDateTime(detail.created_at) }}</dd>
          </div>
          <div v-if="detail.updated_at">
            <dt class="text-zinc-500">Atualizado em</dt>
            <dd class="text-zinc-200">{{ formatDateTime(detail.updated_at) }}</dd>
          </div>
        </dl>
        <div class="mt-4 flex flex-wrap gap-3">
          <NuxtLink
            v-if="publicProfilePath"
            :to="publicProfilePath"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex rounded-lg border border-emerald-600/50 bg-emerald-900/30 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-900/50"
          >
            Abrir perfil público (nova aba)
          </NuxtLink>
          <NuxtLink
            :to="`/admin/cadastros/${id}`"
            class="inline-flex rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Revisão de cadastro (KYC completo)
          </NuxtLink>
        </div>
      </section>

      <section
        v-if="detail.portal_text_pending?.has_pending"
        class="rounded-xl border border-sky-900/40 bg-sky-950/15 px-4 py-3 text-sm text-sky-100/95"
      >
        <NuxtLink to="/admin/texto-perfil" class="font-medium text-brand hover:underline">Nome e bio (fila)</NuxtLink>
        <span class="text-sky-100/80">
          — este perfil tem alterações de nome profissional e/ou biografia aguardando análise. Aprove ou recuse em
          «Nome e bio» no menu.
        </span>
      </section>
      </div>

      <div v-show="adminTab === 'perfil'" class="space-y-6">
      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Localização e apresentação</h2>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-zinc-500">Cidade / UF</dt>
            <dd class="text-zinc-200">{{ detail.city?.name || '—' }} · {{ detail.state?.uf || '—' }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Bairro (anúncio)</dt>
            <dd class="text-zinc-200">{{ detail.neighborhood || '—' }}</dd>
          </div>
          <div v-if="detail.registration?.has_venue != null" class="sm:col-span-2">
            <dt class="text-zinc-500">Possui local para atendimento</dt>
            <dd class="text-zinc-200">{{ detail.registration.has_venue ? 'Sim' : 'Não' }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Visibilidade na plataforma</h2>
        <ul class="mt-3 space-y-2 text-sm text-zinc-300">
          <li>
            <span class="text-zinc-500">Anúncio pausado (site):</span>
            {{ detail.user_paused_listing ? 'Sim — não aparece na listagem' : 'Não — ativo no site' }}
          </li>
          <li>
            <span class="text-zinc-500">Com anúncio pausado, link público:</span>
            {{
              detail.public_profile_visible_when_paused
                ? 'Permanece acessível'
                : 'Oculto (404 / indisponível conforme regra)'
            }}
          </li>
          <li v-if="detail.listing_visibility_locked_until">
            <span class="text-zinc-500">Carência para voltar a inativar até:</span>
            {{ formatDateTime(detail.listing_visibility_locked_until) }}
          </li>
          <li v-if="detail.available_now_activated_at">
            <span class="text-zinc-500">Última ativação «Disponível agora»:</span>
            {{ formatDateTime(detail.available_now_activated_at) }}
          </li>
        </ul>
      </section>

      <section v-if="socialLinksEntries.length" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Redes e links</h2>
        <ul class="mt-3 space-y-2 text-sm">
          <li v-for="[key, url] in socialLinksEntries" :key="key" class="flex flex-wrap gap-2">
            <span class="text-zinc-500 capitalize">{{ key }}</span>
            <a :href="url" target="_blank" rel="noopener noreferrer" class="text-brand hover:underline">{{ url }}</a>
          </li>
        </ul>
      </section>

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
            <span>Anúncio pausado (sumir do site)</span>
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
      </div>

      <div v-show="adminTab === 'financeiro'" class="space-y-6">
      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Estado do destaque</h2>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-zinc-500">Tempo restante (estimado, com anúncio ativo)</dt>
            <dd class="text-zinc-200">{{ formatDestaqueDuration(detail.destaque_effective_remaining_seconds ?? 0) }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Saldo em segundos (BD, antes do relógio em tempo real)</dt>
            <dd class="font-mono text-xs text-zinc-400">{{ detail.destaque_remaining_seconds }} s</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Início do relógio (último tick)</dt>
            <dd class="text-zinc-300">{{ detail.destaque_clock_started_at ? formatDateTime(detail.destaque_clock_started_at) : '—' }}</dd>
          </div>
          <div>
            <dt class="text-zinc-500">Estrelas (cache)</dt>
            <dd class="text-zinc-200">{{ detail.highlight_stars_cached ?? '—' }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-xl border border-amber-900/40 bg-amber-950/20 p-6">
        <h2 class="text-lg font-semibold text-amber-100">Destaque gratuito (cortesia)</h2>
        <p class="mt-1 text-sm text-amber-100/80">
          Credita tempo de destaque sem PIX. Perfil precisa estar <strong>aprovado</strong>.
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
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-white">Pedidos e pagamentos (destaque / PIX)</h2>
          <button
            type="button"
            class="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
            :disabled="highlightOrdersLoading"
            @click="fetchHighlightOrders"
          >
            {{ highlightOrdersLoading ? 'A atualizar…' : 'Atualizar lista' }}
          </button>
        </div>
        <p v-if="highlightOrdersErr" class="mt-2 text-sm text-red-400">{{ highlightOrdersErr }}</p>
        <p v-else-if="highlightOrdersLoading && highlightOrders.length === 0" class="mt-3 text-sm text-zinc-500">
          A carregar…
        </p>
        <div v-else-if="highlightOrders.length === 0" class="mt-3 text-sm text-zinc-500">Nenhum pedido registado.</div>
        <div v-else class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-zinc-700 text-xs uppercase tracking-wide text-zinc-500">
                <th class="py-2 pr-3">Criado</th>
                <th class="py-2 pr-3">Estado</th>
                <th class="py-2 pr-3">Valor</th>
                <th class="py-2 pr-3">★ / meses</th>
                <th class="py-2 pr-3">Gateway</th>
                <th class="py-2 pr-3">Notas</th>
                <th class="py-2">UUID</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="o in highlightOrders"
                :key="o.order_uuid"
                class="border-b border-zinc-800/80 text-zinc-300"
              >
                <td class="py-2 pr-3 align-top whitespace-nowrap">{{ formatDateTime(o.created_at) }}</td>
                <td class="py-2 pr-3 align-top">{{ financeOrderStatusLabel(o.payment_status) }}</td>
                <td class="py-2 pr-3 align-top">{{ formatBrlAdmin(o.amount_brl) }}</td>
                <td class="py-2 pr-3 align-top">{{ o.stars }} ★ · {{ o.period_months }} m</td>
                <td class="py-2 pr-3 align-top font-mono text-xs">{{ o.gateway || '—' }}</td>
                <td class="py-2 pr-3 align-top text-xs text-zinc-400">
                  <span v-if="o.admin_grant">Cortesia admin</span>
                  <span v-else-if="o.is_upgrade">Upgrade</span>
                  <span v-if="o.paid_at" class="block text-zinc-500">Pago: {{ formatDateTime(o.paid_at) }}</span>
                  <span v-if="o.failure_reason" class="block text-red-300/90">{{ o.failure_reason }}</span>
                </td>
                <td class="py-2 align-top font-mono text-[10px] text-zinc-500 break-all">{{ o.order_uuid }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      </div>

      <div v-show="adminTab === 'cadastro'" class="space-y-6">
      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Conta (usuário)</h2>
        <ul class="mt-2 space-y-1 text-sm text-zinc-400">
          <li v-if="detail.user?.email"><span class="text-zinc-500">E-mail:</span> {{ detail.user.email }}</li>
          <li v-if="detail.user?.name"><span class="text-zinc-500">Nome legal:</span> {{ detail.user.name }}</li>
        </ul>
      </section>

      <section v-if="detail.registration" class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Cadastro (origem) e referências de mídia</h2>
        <p class="mt-1 text-sm text-zinc-500">Dados do formulário inicial e IDs das mídias ligadas no perfil.</p>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <template v-if="detail.registration.mother_name">
            <dt class="text-zinc-500">Nome da mãe</dt>
            <dd class="text-zinc-300">{{ detail.registration.mother_name }}</dd>
          </template>
          <template v-if="detail.registration.birth_date">
            <dt class="text-zinc-500">Nascimento</dt>
            <dd class="text-zinc-300">{{ detail.registration.birth_date }}</dd>
          </template>
          <template v-if="detail.registration.contact_email">
            <dt class="text-zinc-500">E-mail de contato</dt>
            <dd class="text-zinc-300">{{ detail.registration.contact_email }}</dd>
          </template>
          <template v-if="detail.registration.cpf">
            <dt class="text-zinc-500">CPF</dt>
            <dd class="font-mono text-zinc-300">{{ detail.registration.cpf }}</dd>
          </template>
          <template v-if="detail.registration.current_step != null">
            <dt class="text-zinc-500">Último passo do formulário</dt>
            <dd class="text-zinc-300">{{ detail.registration.current_step }}</dd>
          </template>
          <template v-if="detail.registration.registration_paid_at">
            <dt class="text-zinc-500">Taxa de cadastro paga em</dt>
            <dd class="text-zinc-300">{{ formatDateTime(detail.registration.registration_paid_at) }}</dd>
          </template>
          <template v-if="detail.registration.terms_accepted != null">
            <dt class="text-zinc-500">Termos aceitos</dt>
            <dd class="text-zinc-300">{{ detail.registration.terms_accepted ? 'Sim' : 'Não' }}</dd>
          </template>
          <template v-if="detail.registration.privacy_policy_accepted != null">
            <dt class="text-zinc-500">Política de privacidade aceita</dt>
            <dd class="text-zinc-300">{{ detail.registration.privacy_policy_accepted ? 'Sim' : 'Não' }}</dd>
          </template>
        </dl>
        <div v-if="detail.registration.address_json && typeof detail.registration.address_json === 'object'" class="mt-4">
          <h3 class="text-sm font-medium text-zinc-400">Endereço (cadastro)</h3>
          <p class="mt-1 text-sm text-zinc-300">{{ formatAddress(detail.registration.address_json) }}</p>
        </div>
        <div class="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <h3 class="text-sm font-medium text-zinc-400">IDs de mídia no registro (Spatie)</h3>
          <ul class="mt-2 grid gap-1 font-mono text-xs text-zinc-400 sm:grid-cols-2">
            <li v-if="detail.registration.id_document_front_media_id">Documento frente: {{ detail.registration.id_document_front_media_id }}</li>
            <li v-if="detail.registration.id_document_back_media_id">Documento verso: {{ detail.registration.id_document_back_media_id }}</li>
            <li v-if="detail.registration.selfie_media_id">Selfie: {{ detail.registration.selfie_media_id }}</li>
            <li v-if="detail.registration.video_media_id">Vídeo verificação: {{ detail.registration.video_media_id }}</li>
            <li v-if="detail.registration.cover_media_id">Capa: {{ detail.registration.cover_media_id }}</li>
            <li v-if="detail.registration.portal_avatar_media_id">Foto perfil: {{ detail.registration.portal_avatar_media_id }}</li>
            <li v-if="detail.registration.audio_media_id">Áudio: {{ detail.registration.audio_media_id }}</li>
            <li v-if="detail.registration.gallery_media_ids?.length" class="sm:col-span-2">
              Galeria (ordem): {{ detail.registration.gallery_media_ids.join(', ') }}
            </li>
          </ul>
        </div>
        <NuxtLink
          :to="`/admin/cadastros/${id}`"
          class="mt-4 inline-block text-sm text-brand hover:underline"
        >
          Abrir tela de revisão de cadastro (remover arquivos, aprovar) →
        </NuxtLink>
      </section>
      </div>

      <div v-show="adminTab === 'midias'" class="space-y-6">
      <section class="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 class="text-lg font-semibold text-white">Mídias deste perfil</h2>
        <p class="mt-1 text-sm text-zinc-500">Verificação de identidade e mídias do site, com moderação.</p>
        <p
          v-if="mediaModerationMsg"
          class="mt-3 text-sm"
          :class="mediaModerationOk ? 'text-emerald-400' : 'text-red-400'"
          role="status"
        >
          {{ mediaModerationMsg }}
        </p>

        <p class="mt-3 text-xs text-zinc-500">
          Imagens, vídeos e áudio abrem no visualizador com setas (como na revisão de cadastro). Documentos KYC aprovados só podem ser visualizados.
        </p>

        <div v-if="mediaKyc.length" class="mt-6">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-amber-200/90">Verificação / KYC</h3>
          <ul class="mt-3 space-y-3">
            <li
              v-for="m in mediaKyc"
              :key="m.id"
              class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-brand">{{ m.kind_label || m.collection_name }}</p>
                <p class="truncate text-sm text-white">{{ m.file_name }}</p>
                <p class="text-xs text-zinc-500">ID {{ m.id }} · {{ m.mime_type || '—' }} · moderação: {{ adminMediaModerationStatusLabel(m.moderation_status) }}</p>
              </div>
              <div class="flex flex-shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                  :disabled="mediaPreviewBusy || moderatingMediaId === m.id || removingMediaId === m.id"
                  @click="openMedia(m)"
                >
                  {{ mediaPreviewBusy ? 'A carregar…' : 'Visualizar' }}
                </button>
                <template v-if="mediaNeedsModerationActions(m)">
                  <button
                    type="button"
                    class="rounded bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-40"
                    :disabled="moderatingMediaId === m.id"
                    @click="setMediaModeration(m.id, 'approved')"
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    class="rounded bg-zinc-700 px-2 py-1 text-xs text-white disabled:opacity-40"
                    :disabled="moderatingMediaId === m.id"
                    @click="setMediaModeration(m.id, 'rejected')"
                  >
                    Recusar
                  </button>
                </template>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="mediaVitrine.length" class="mt-8 space-y-8">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-sky-200/90">Perfil público</h3>

          <div v-if="mediaVitrineGallery.length">
            <h4 class="text-sm font-medium text-zinc-300">Galeria (fotos e vídeos)</h4>
            <p class="mt-1 text-xs text-zinc-500">
              Visualizar abre o lightbox; com mais de um ficheiro pode usar «Ver galeria em sequência».
            </p>
            <div v-if="adminLightboxableGallery.length > 1" class="mt-2">
              <button
                type="button"
                class="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-40"
                :disabled="mediaPreviewBusy"
                @click="openAdminLightboxFromList(adminLightboxableGallery, 0)"
              >
                {{ mediaPreviewBusy ? 'A carregar…' : 'Ver galeria em sequência' }}
              </button>
            </div>
            <ul class="mt-3 space-y-3">
              <li
                v-for="m in mediaVitrineGallery"
                :key="m.id"
                class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-brand">{{ m.kind_label || m.collection_name }}</p>
                  <p class="mt-1 truncate text-sm text-white">{{ m.file_name }}</p>
                  <p class="text-xs text-zinc-500">
                    ID {{ m.id }} · {{ m.mime_type || '—' }} · moderação:
                    {{ adminMediaModerationStatusLabel(m.moderation_status) }}
                  </p>
                </div>
                <div class="flex flex-shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                    :disabled="mediaPreviewBusy || moderatingMediaId === m.id || removingMediaId === m.id"
                    @click="openMedia(m)"
                  >
                    {{ mediaPreviewBusy ? 'A carregar…' : 'Visualizar' }}
                  </button>
                  <template v-if="mediaNeedsModerationActions(m)">
                    <button
                      type="button"
                      class="rounded bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-40"
                      :disabled="moderatingMediaId === m.id"
                      @click="setMediaModeration(m.id, 'approved')"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      class="rounded bg-zinc-700 px-2 py-1 text-xs text-white disabled:opacity-40"
                      :disabled="moderatingMediaId === m.id"
                      @click="setMediaModeration(m.id, 'rejected')"
                    >
                      Recusar
                    </button>
                  </template>
                  <button
                    v-else-if="mediaShowsRemoveOnly(m)"
                    type="button"
                    class="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-900/70 disabled:opacity-40"
                    :disabled="removingMediaId === m.id"
                    @click="removeMedia(m)"
                  >
                    {{ removingMediaId === m.id ? 'Removendo…' : 'Remover' }}
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="mediaVitrineOther.length">
            <h4 class="text-xs font-semibold uppercase tracking-wide text-zinc-400">Capa, avatar, áudio e outras</h4>
            <ul class="mt-3 space-y-3">
              <li
                v-for="m in mediaVitrineOther"
                :key="m.id"
                class="flex flex-col gap-2 rounded-lg border border-zinc-800 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-brand">{{ m.kind_label || m.collection_name }}</p>
                  <p class="truncate text-sm text-white">{{ m.file_name }}</p>
                  <p class="text-xs text-zinc-500">ID {{ m.id }} · {{ m.mime_type || '—' }} · moderação: {{ adminMediaModerationStatusLabel(m.moderation_status) }}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded border border-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                    :disabled="mediaPreviewBusy || moderatingMediaId === m.id || removingMediaId === m.id"
                    @click="openMedia(m)"
                  >
                    {{ mediaPreviewBusy ? 'A carregar…' : 'Visualizar' }}
                  </button>
                  <template v-if="mediaNeedsModerationActions(m)">
                    <button
                      type="button"
                      class="rounded bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-40"
                      :disabled="moderatingMediaId === m.id"
                      @click="setMediaModeration(m.id, 'approved')"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      class="rounded bg-zinc-700 px-2 py-1 text-xs text-white disabled:opacity-40"
                      :disabled="moderatingMediaId === m.id"
                      @click="setMediaModeration(m.id, 'rejected')"
                    >
                      Recusar
                    </button>
                  </template>
                  <button
                    v-else-if="mediaShowsRemoveOnly(m)"
                    type="button"
                    class="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-900/70 disabled:opacity-40"
                    :disabled="removingMediaId === m.id"
                    @click="removeMedia(m)"
                  >
                    {{ removingMediaId === m.id ? 'Removendo…' : 'Remover' }}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <p v-if="!mediaList.length" class="mt-4 text-sm text-zinc-500">Nenhuma mídia listada.</p>
      </section>
      </div>

      <ProfileMediaLightbox
        v-model="adminLightboxOpen"
        :items="adminLightboxItems"
        :start-index="adminLightboxStart"
        alt-text="Mídia do anunciante"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSwal } from '~/composables/useSwal'
import { apiErrorMessage } from '~/utils/api-error-message'
import { buildPublicProfilePath } from '~/utils/public-profile-url'
import {
  adminAccountStatusLabel,
  adminApprovalStatusLabel,
  adminFormStatusLabel,
  adminMediaModerationStatusLabel,
  adminProfileTypeLabel,
  adminServiceTypeLabel,
} from '~/utils/admin-labels'
definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

const route = useRoute()
const id = computed(() => Number(route.params.id))
const { request } = useApi()
const { swalConfirm, swalAlert, swalRejectWithReason } = useSwal()

useHead(() => ({ title: `Anunciante #${route.params.id}` }))

type AddressJson = Record<string, string | undefined>

type ProfileDetail = {
  id: number
  uuid?: string | null
  professional_name: string | null
  public_slug: string | null
  approval_status: string
  form_status?: string | null
  bio: string | null
  portal_text_pending?: { has_pending: boolean } | null
  whatsapp: string | null
  profile_type?: string | null
  service_type?: string | null
  plan_type?: string | null
  premium_tier?: number | null
  highlight_stars_cached: number | null
  destaque_remaining_seconds: number
  destaque_effective_remaining_seconds?: number
  destaque_clock_started_at?: string | null
  user_paused_listing: boolean
  public_profile_visible_when_paused?: boolean
  listing_visibility_locked_until?: string | null
  available_now_activated_at?: string | null
  social_links?: Record<string, string | null> | null
  neighborhood?: string | null
  created_at?: string | null
  updated_at?: string | null
  user?: { id?: number; name: string; email?: string; account_status?: string }
  city?: { name: string } | null
  state?: { uf: string } | null
  registration?: {
    mother_name?: string | null
    birth_date?: string | null
    contact_email?: string | null
    cpf?: string | null
    address_json?: AddressJson | null
    has_venue?: boolean
    terms_accepted?: boolean
    privacy_policy_accepted?: boolean
    current_step?: number | null
    registration_paid_at?: string | null
    id_document_front_media_id?: number | null
    id_document_back_media_id?: number | null
    selfie_media_id?: number | null
    video_media_id?: number | null
    cover_media_id?: number | null
    portal_avatar_media_id?: number | null
    audio_media_id?: number | null
    gallery_media_ids?: number[] | null
  } | null
}

type AdminTabId = 'resumo' | 'perfil' | 'financeiro' | 'cadastro' | 'midias'

type HighlightOrderRow = {
  order_uuid: string
  amount_brl: number
  stars: number
  period_months: number
  payment_status: string
  paid_at: string | null
  created_at: string | null
  failure_reason?: string | null
  gateway: string
  is_upgrade: boolean
  admin_grant: boolean
}

const adminTabs: { id: AdminTabId; label: string }[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'perfil', label: 'Perfil e edição' },
  { id: 'financeiro', label: 'Destaque e financeiro' },
  { id: 'cadastro', label: 'Cadastro' },
  { id: 'midias', label: 'Mídias' },
]

const adminTab = ref<AdminTabId>('resumo')

const KYC_COLLECTIONS = new Set(['id_document_front', 'id_document_back', 'selfie', 'video'])

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

const highlightOrders = ref<HighlightOrderRow[]>([])
const highlightOrdersLoading = ref(false)
const highlightOrdersErr = ref<string | null>(null)

const mediaList = ref<
  {
    id: number
    collection_name: string
    kind?: string
    kind_label?: string
    file_name: string
    mime_type?: string
    moderation_status: string
  }[]
>([])
const moderatingMediaId = ref<number | null>(null)
const removingMediaId = ref<number | null>(null)
const mediaModerationMsg = ref('')
const mediaModerationOk = ref(true)
const mediaPreviewBusy = ref(false)

type AdminLightboxItem = { kind: 'audio' | 'video' | 'image'; url: string; caption?: string }
const adminLightboxOpen = ref(false)
const adminLightboxItems = ref<AdminLightboxItem[]>([])
const adminLightboxStart = ref(0)

const publicProfilePath = computed(() => {
  const d = detail.value
  if (!d?.public_slug || d.approval_status !== 'approved') {
    return null
  }
  return buildPublicProfilePath(d.public_slug, d.service_type)
})

const mediaKyc = computed(() =>
  [...mediaList.value]
    .filter((m) => KYC_COLLECTIONS.has(m.collection_name))
    .sort((a, b) => a.id - b.id),
)

const mediaVitrine = computed(() =>
  [...mediaList.value]
    .filter((m) => !KYC_COLLECTIONS.has(m.collection_name))
    .sort((a, b) => a.id - b.id),
)

const mediaVitrineGallery = computed(() => mediaVitrine.value.filter((m) => m.collection_name === 'gallery'))

const mediaVitrineOther = computed(() => mediaVitrine.value.filter((m) => m.collection_name !== 'gallery'))

function isLightboxableMedia(m: (typeof mediaList.value)[number]): boolean {
  const k = (m.kind || '').toLowerCase()
  if (
    k === 'audio' ||
    k === 'verification_video' ||
    k === 'gallery_video' ||
    k === 'gallery_image' ||
    k === 'id_front' ||
    k === 'id_back' ||
    k === 'selfie' ||
    k === 'banner' ||
    k === 'profile_photo'
  ) {
    return true
  }
  const mime = (m.mime_type || '').toLowerCase()
  return mime.startsWith('image/') || mime.startsWith('video/') || mime.startsWith('audio/')
}

function lightboxKindFromRow(m: (typeof mediaList.value)[number]): 'image' | 'video' | 'audio' {
  const k = (m.kind || '').toLowerCase()
  if (k === 'audio') {
    return 'audio'
  }
  if (k === 'verification_video' || k === 'gallery_video') {
    return 'video'
  }
  const mime = (m.mime_type || '').toLowerCase()
  if (mime.startsWith('video/')) {
    return 'video'
  }
  if (mime.startsWith('audio/')) {
    return 'audio'
  }
  return 'image'
}

const adminLightboxableAll = computed(() => [...mediaList.value].filter(isLightboxableMedia).sort((a, b) => a.id - b.id))

const adminLightboxableGallery = computed(() =>
  adminLightboxableAll.value.filter((m) => m.collection_name === 'gallery'),
)

function mediaEffectivelyApproved(m: (typeof mediaList.value)[number]): boolean {
  if (m.moderation_status === 'approved') {
    return true
  }
  if (m.moderation_status === 'registration' && detail.value?.approval_status === 'approved') {
    return true
  }
  return false
}

function canAdminDeleteMedia(m: (typeof mediaList.value)[number]): boolean {
  return !KYC_COLLECTIONS.has(m.collection_name)
}

function mediaNeedsModerationActions(m: (typeof mediaList.value)[number]): boolean {
  if (m.moderation_status === 'rejected' || m.moderation_status === 'pending') {
    return true
  }
  if (m.moderation_status === 'registration') {
    return detail.value?.approval_status !== 'approved'
  }
  return false
}

function mediaShowsRemoveOnly(m: (typeof mediaList.value)[number]): boolean {
  return mediaEffectivelyApproved(m) && canAdminDeleteMedia(m)
}

const socialLinksEntries = computed((): [string, string][] => {
  const sl = detail.value?.social_links
  if (!sl || typeof sl !== 'object') {
    return []
  }
  return Object.entries(sl).filter(([, v]) => {
    const s = v == null ? '' : String(v).trim()
    return s !== ''
  }) as [string, string][]
})

function formatDateTime(iso: string | null | undefined) {
  if (!iso) {
    return '—'
  }
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}

function formatDestaqueDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const d = Math.floor(s / 86400)
  if (d >= 1) {
    return `${d} dia(s)`
  }
  const h = Math.floor(s / 3600)
  if (h >= 1) {
    return `${h} h`
  }
  const m = Math.max(0, Math.floor(s / 60))
  return m >= 1 ? `${m} min` : s > 0 ? `${s} s` : '0 s'
}

function formatBrlAdmin(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function financeOrderStatusLabel(s: string) {
  if (s === 'paid') {
    return 'Pago'
  }
  if (s === 'pending') {
    return 'Pendente'
  }
  if (s === 'failed' || s === 'cancelled' || s === 'expired') {
    return s === 'failed' ? 'Falhou' : s === 'cancelled' ? 'Cancelado' : 'Expirado'
  }
  return s
}

async function fetchHighlightOrders() {
  highlightOrdersErr.value = null
  highlightOrdersLoading.value = true
  try {
    const r = await request<{ data?: HighlightOrderRow[] }>(`/v1/admin/profiles/${id.value}/highlight-orders`)
    highlightOrders.value = Array.isArray(r.data) ? r.data : []
  } catch {
    highlightOrdersErr.value = 'Não foi possível carregar os pedidos.'
    highlightOrders.value = []
  } finally {
    highlightOrdersLoading.value = false
  }
}

function formatAddress(a: AddressJson) {
  const parts = [
    a.street && a.number ? `${a.street}, ${a.number}` : a.street,
    a.neighborhood,
    a.city && a.state_uf ? `${a.city} · ${a.state_uf}` : a.city || a.state_uf,
    a.zipcode ? `CEP ${a.zipcode}` : '',
  ].filter(Boolean)
  return parts.join(' · ') || '—'
}

function applyDetailToForm(p: ProfileDetail) {
  form.professional_name = p.professional_name || ''
  form.bio = p.bio || ''
  form.whatsapp = p.whatsapp || ''
  form.user_paused_listing = p.user_paused_listing
}

async function load() {
  loading.value = true
  errorMsg.value = null
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}`)
    detail.value = p
    applyDetailToForm(p)
    void fetchHighlightOrders()
    const mediaOk = await fetchAdminMediaList()
    if (!mediaOk) {
      mediaModerationMsg.value =
        'A lista de mídias não foi carregada corretamente. Atualize a página (F5) ou verifique a API.'
      mediaModerationOk.value = false
    }
  } catch {
    errorMsg.value = 'Não foi possível carregar o perfil.'
    detail.value = null
  } finally {
    loading.value = false
  }
}

/** Recarrega só a lista de mídias. Retorna false se o JSON não trouxer `media` como array (nunca chama `load()` para evitar recursão). */
async function fetchAdminMediaList(): Promise<boolean> {
  try {
    const mediaRes = await request<{ media?: unknown }>(`/v1/admin/profiles/${id.value}/media`)
    if (Array.isArray(mediaRes.media)) {
      mediaList.value = mediaRes.media as typeof mediaList.value
      return true
    }
  } catch {
    /* vazio */
  }
  return false
}

async function reloadAdminMediaList() {
  const ok = await fetchAdminMediaList()
  if (!ok) {
    mediaModerationMsg.value =
      'Não foi possível recarregar a lista de mídias. Atualize a página (F5) para ver o estado actual no servidor.'
    mediaModerationOk.value = false
  }
}

async function saveDetails() {
  saveMsg.value = ''
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
  granting.value = true
  try {
    const p = await request<ProfileDetail>(`/v1/admin/profiles/${id.value}/grant-destaque`, {
      method: 'POST',
      body: { stars: grant.stars, period_months: grant.months },
    })
    detail.value = p
    grantMsg.value = 'Destaque creditado.'
    grantOk.value = true
    void fetchHighlightOrders()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string; errors?: Record<string, string[]> } }
    grantMsg.value =
      err.data?.errors?.profile?.[0] || err.data?.message || 'Não foi possível conceder destaque.'
    grantOk.value = false
  } finally {
    granting.value = false
  }
}

async function fetchAdminTemporaryUrl(mediaNumericId: number): Promise<string> {
  const res = await request<{ url: string }>(
    `/v1/admin/profiles/${id.value}/media/${mediaNumericId}/temporary-url`,
  )
  return res.url
}

async function openAdminLightboxFromList(
  list: (typeof mediaList.value)[number][],
  startIdx: number,
) {
  if (list.length === 0 || mediaPreviewBusy.value) {
    return
  }
  const idx = Math.max(0, Math.min(startIdx, list.length - 1))
  mediaPreviewBusy.value = true
  try {
    const urls = await Promise.all(list.map((m) => fetchAdminTemporaryUrl(m.id)))
    adminLightboxItems.value = list.map((m, i) => ({
      kind: lightboxKindFromRow(m),
      url: urls[i]!,
      caption: `${m.kind_label || m.collection_name} · ${m.file_name}`,
    }))
    adminLightboxStart.value = idx
    adminLightboxOpen.value = true
  } catch {
    await swalAlert({
      icon: 'error',
      title: 'Pré-visualização',
      text: 'Não foi possível obter os endereços dos ficheiros. Tente de novo.',
    })
  } finally {
    mediaPreviewBusy.value = false
  }
}

async function openMedia(m: (typeof mediaList.value)[number]) {
  if (!isLightboxableMedia(m)) {
    mediaPreviewBusy.value = true
    try {
      const url = await fetchAdminTemporaryUrl(m.id)
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      await swalAlert({
        icon: 'error',
        title: 'Abrir ficheiro',
        text: 'Não foi possível obter o link temporário.',
      })
    } finally {
      mediaPreviewBusy.value = false
    }
    return
  }

  if (m.collection_name === 'gallery') {
    const gIdx = adminLightboxableGallery.value.findIndex((x) => x.id === m.id)
    if (gIdx >= 0) {
      await openAdminLightboxFromList(adminLightboxableGallery.value, gIdx)
      return
    }
  }
  const idx = adminLightboxableAll.value.findIndex((x) => x.id === m.id)
  if (idx < 0) {
    return
  }
  await openAdminLightboxFromList(adminLightboxableAll.value, idx)
}

async function removeMedia(m: (typeof mediaList.value)[number]) {
  if (!canAdminDeleteMedia(m)) {
    return
  }
  const ok = await swalConfirm({
    title: 'Remover mídia?',
    text: `Deseja remover «${m.file_name}» deste perfil?`,
    icon: 'warning',
    confirmButtonText: 'Sim, remover',
    cancelButtonText: 'Cancelar',
  })
  if (!ok) {
    return
  }
  removingMediaId.value = m.id
  mediaModerationMsg.value = ''
  try {
    await request(`/v1/admin/profiles/${id.value}/media/${m.id}`, { method: 'DELETE' })
    await reloadAdminMediaList()
    mediaModerationMsg.value = 'Mídia removida.'
    mediaModerationOk.value = true
  } catch (e: unknown) {
    mediaModerationMsg.value = apiErrorMessage(e, 'Não foi possível remover a mídia.')
    mediaModerationOk.value = false
  } finally {
    removingMediaId.value = null
  }
}

async function setMediaModeration(mediaId: number, moderation_status: 'approved' | 'rejected') {
  let moderation_reject_reason: string | undefined
  if (moderation_status === 'rejected') {
    const m = mediaList.value.find((x) => x.id === mediaId)
    const { confirmed, reason } = await swalRejectWithReason({
      title: 'Recusar esta mídia?',
      text: m ? `${m.kind_label || m.collection_name} · ${m.file_name}` : undefined,
    })
    if (!confirmed) {
      return
    }
    moderation_reject_reason = reason !== '' ? reason : undefined
  }
  mediaModerationMsg.value = ''
  moderatingMediaId.value = mediaId
  try {
    await request(`/v1/admin/profiles/${id.value}/media/${mediaId}`, {
      method: 'PATCH',
      body:
        moderation_status === 'rejected'
          ? { moderation_status, moderation_reject_reason }
          : { moderation_status },
    })
    await reloadAdminMediaList()
    mediaModerationMsg.value =
      moderation_status === 'approved' ? 'Mídia aprovada.' : 'Mídia recusada.'
    mediaModerationOk.value = true
  } catch (e: unknown) {
    mediaModerationMsg.value = apiErrorMessage(e, 'Não foi possível atualizar a moderação da mídia.')
    mediaModerationOk.value = false
  } finally {
    moderatingMediaId.value = null
  }
}

onMounted(() => load())

watch(id, () => load())
</script>

<style scoped>
.input {
  @apply w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand;
}
</style>
