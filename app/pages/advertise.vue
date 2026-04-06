<template>
  <div class="py-16 text-center text-zinc-500">
    <p>A redirecionar para o cadastro de anunciante…</p>
  </div>
</template>

<script setup lang="ts">
/** Public URL: /anunciar — redirects to /cadastro (register flow). */

definePageMeta({
  layout: 'default',
  path: '/anunciar',
})

usePublicPageSeo({
  title: 'Anunciar',
  description: 'Redirecionamento para o cadastro de anunciante no Prazer.Vip.',
  robots: 'noindex, follow',
})

await navigateTo('/cadastro', { replace: true })
</script>
