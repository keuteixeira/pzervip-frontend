<template>
  <div class="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-zinc-400">Redirecionando…</div>
</template>

<script setup lang="ts">
import { publicProfilePathSegment } from '~/utils/public-profile-url'

definePageMeta({
  layout: 'profile',
  path: '/explorar/:gender/perfil/:slug',
} as any)

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => String(route.params.slug ?? ''))

usePublicPageSeo({
  title: 'Redirecionamento',
  description: 'URL legada de perfil; a redirecionar para o anúncio público.',
  robots: 'noindex, follow',
})

const { data: apiJson, pending } = await useAsyncData(
  () => `legacy-perfil-redirect-${slug.value}`,
  async () => {
    try {
      return await $fetch<{ service_type?: string | null }>(
        `${config.public.apiBase}/v1/public/advertisers/${slug.value}`,
      )
    } catch {
      return null
    }
  },
  { watch: [slug] },
)

function destinationPath(): string {
  const s = slug.value
  if (!s) {
    return '/explorar'
  }
  const seg = publicProfilePathSegment(apiJson.value?.service_type)
  return `/${seg}/${s}`
}

watch(
  [pending, apiJson, slug],
  () => {
    if (pending.value || !slug.value) {
      return
    }
    navigateTo(destinationPath(), { replace: true })
  },
  { immediate: true },
)
</script>
