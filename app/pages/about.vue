<template>
  <article class="prose prose-invert prose-zinc max-w-none">
    <header class="border-b border-zinc-800 pb-8 not-prose">
      <h1 class="text-3xl font-bold text-white">Sobre nós</h1>
      <p class="mt-2 text-lg text-zinc-400">
        Conectando pessoas na sua cidade com segurança e privacidade absoluta.
      </p>
    </header>

    <section class="mt-10 space-y-4 text-zinc-300">
      <p>
        O Prazer.Vip é uma plataforma pensada para colocar em contato anunciantes e visitantes de forma
        organizada por localização — com foco em transparência nas regras de publicação, verificação de perfis
        quando aplicável e respeito pela privacidade.
      </p>
      <p>
        O nosso objetivo é oferecer uma experiência estável e moderna (frontend Nuxt e API Laravel), com
        listagens por cidade, categorias e ferramentas para anunciantes gerirem o seu perfil com segurança.
      </p>
      <p>
        Para sugestões, parcerias ou apoio, utilize o
        <NuxtLink to="/contato" class="text-brand hover:underline">formulário de contato</NuxtLink>.
        Para criar um anúncio, aceda a
        <NuxtLink to="/cadastro" class="text-brand hover:underline">cadastro de anunciante</NuxtLink>.
      </p>
    </section>
  </article>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  path: '/sobre-nos',
})

useHead({
  title: 'Sobre nós',
})
</script>
