<template>
  <footer class="border-t border-zinc-800 bg-zinc-950">
    <div class="mx-auto max-w-7xl px-4 py-12">
      <div class="grid gap-10 md:grid-cols-3 md:gap-8">
        <!-- Coluna 1: logo + texto + privacidade -->
        <div class="space-y-5">
          <NuxtLink to="/" class="inline-block max-w-[min(100%,320px)]">
            <img
              :src="brand.logoHorizontalWide"
              alt="Prazer.Vip"
              class="object-contain object-left"
              width="160"
              loading="lazy"
              decoding="async"
            />
          </NuxtLink>
          <p class="text-sm leading-relaxed text-zinc-400">
            Conectando pessoas na sua cidade com segurança e privacidade absoluta.
          </p>
          <div class="flex gap-3">
            <span
              class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand"
              aria-hidden="true"
            >
              <svg class="h-5 w-5" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"
                />
              </svg>
            </span>
            <div>
              <h3 class="font-semibold text-white">Privacidade garantida</h3>
              <p class="mt-1 text-xs text-zinc-500">
                O seu uso do site é tratado com discrição e proteção de dados.
              </p>
            </div>
          </div>
        </div>

        <!-- Links rápidos -->
        <div>
          <h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500">Links rápidos</h2>
          <ul class="mt-4 space-y-3 text-sm">
            <li>
              <NuxtLink
                to="/contato"
                class="flex items-center gap-2 text-zinc-400 transition hover:text-brand"
              >
                <span class="text-zinc-600" aria-hidden="true">✉</span>
                Contato
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/politica-de-privacidade"
                class="flex items-center gap-2 text-zinc-400 transition hover:text-brand"
              >
                <span class="text-zinc-600" aria-hidden="true">🛡</span>
                Política de privacidade
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/termos-de-servico"
                class="flex items-center gap-2 text-zinc-400 transition hover:text-brand"
              >
                <span class="text-zinc-600" aria-hidden="true">📋</span>
                Termos de serviço
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/sobre-nos"
                class="flex items-center gap-2 text-zinc-400 transition hover:text-brand"
              >
                <span class="text-zinc-600" aria-hidden="true">ℹ</span>
                Sobre nós
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/anunciar"
                class="flex items-center gap-2 text-zinc-400 transition hover:text-brand"
              >
                <span class="text-zinc-600" aria-hidden="true">＋</span>
                Criar anúncio
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Navegação + selos -->
        <div>
          <h2 class="text-sm font-semibold uppercase tracking-wide text-zinc-500">Navegação</h2>
          <button
            type="button"
            class="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-300 transition hover:border-brand/40 hover:text-white"
            @click="scrollTop"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            Voltar ao topo
          </button>
          <ul class="mt-6 space-y-3 text-sm text-zinc-500">
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" viewBox="0 0 448 512" fill="currentColor">
                <path
                  d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"
                />
              </svg>
              Sem cookies de rastreio desnecessários
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" viewBox="0 0 384 512" fill="currentColor">
                <path
                  d="M186.1.09C81.01 3.24 0 94.92 0 200.05v263.92c0 14.26 17.23 21.39 27.31 11.31l24.92-18.53c6.66-4.95 16-3.99 21.51 2.21l42.95 48.35c6.25 6.25 16.38 6.25 22.63 0l40.72-45.85c6.37-7.17 17.56-7.17 23.92 0l40.72 45.85c6.25 6.25 16.38 6.25 22.63 0l42.95-48.35c5.51-6.2 14.85-7.17 21.51-2.21l24.92 18.53c10.08 10.08 27.31 2.94 27.31-11.31V192C384 84 294.83-3.17 186.1.09zM128 224c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm128 0c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"
                />
              </svg>
              Navegação anónima
            </li>
            <li class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" viewBox="0 0 512 512" fill="currentColor">
                <path
                  d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"
                />
              </svg>
              Dados protegidos
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-zinc-800 pt-8 text-center">
        <p class="text-sm text-zinc-500">© {{ year }} Prazer.Vip — Todos os direitos reservados.</p>
        <p class="mt-2 text-sm text-zinc-600">Feito com 💓 para conectar pessoas</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { brandAssets } from '~/config/brand-assets'

const brand = brandAssets
const year = new Date().getFullYear()

function scrollTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
