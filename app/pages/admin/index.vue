<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

const { withMock } = useAdminMock()
await navigateTo(withMock('/admin/cadastros'), { replace: true })
</script>

<template>
  <div />
</template>
