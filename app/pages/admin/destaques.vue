<script setup lang="ts">
definePageMeta({
  layout: 'admin' as any,
  middleware: ['admin' as any],
})

await navigateTo('/admin/financeiro', { replace: true })
</script>

<template>
  <div />
</template>
