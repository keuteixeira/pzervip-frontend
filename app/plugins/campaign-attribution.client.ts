/**
 * Guarda cid/UTM do anúncio (TrafficStars e afins) antes do age gate trocar a URL.
 */
export default defineNuxtPlugin(() => {
  const route = useRoute()
  const router = useRouter()
  const { ingest } = useCampaignAttribution()

  ingest(route.query as Record<string, unknown>)
  router.afterEach((to) => {
    ingest(to.query as Record<string, unknown>)
  })
})
