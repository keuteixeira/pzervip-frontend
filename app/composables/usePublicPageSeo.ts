import { toValue, type MaybeRefOrGetter } from 'vue'

/**
 * Meta tags para páginas públicas indexáveis (canonical exige NUXT_PUBLIC_SITE_URL em produção).
 */
export function usePublicPageSeo(opts: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | undefined>
  robots?: MaybeRefOrGetter<string>
}) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const siteBase = computed(() => String(config.public.siteUrl || '').replace(/\/$/, ''))
  const canonical = computed(() => {
    const base = siteBase.value
    if (!base) {
      return undefined
    }
    return `${base}${route.path.split('?')[0] || ''}`
  })

  useSeoMeta({
    title: () => toValue(opts.title),
    description: () => toValue(opts.description),
    ogTitle: () => toValue(opts.title),
    ogDescription: () => toValue(opts.description),
    ogType: 'website',
    ogUrl: canonical,
    twitterCard: 'summary_large_image',
    ...(opts.image
      ? {
          ogImage: () => toValue(opts.image) || undefined,
        }
      : {}),
    robots: () => toValue(opts.robots) ?? 'index, follow',
  })

  useHead({
    link: computed(() => (canonical.value ? [{ rel: 'canonical', href: canonical.value }] : [])),
  })
}
