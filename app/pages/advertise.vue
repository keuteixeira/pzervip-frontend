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

await navigateTo('/cadastro', { replace: true })
</script>
