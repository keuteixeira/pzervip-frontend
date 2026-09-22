/**
 * Google Analytics 4 (gtag.js) quando NUXT_PUBLIC_GA_MEASUREMENT_ID está definido.
 * Injeta scripts no DOM (evita bloqueio de innerHTML do Unhead em alguns builds).
 * `/admin` não conta: não injeta no painel e, se o GA já estiver no ar (veio do site),
 * liga `ga-disable-*` e corta o consentimento até sair do admin.
 */
import { isAdminSitePath } from '~/utils/admin-route'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export default defineNuxtPlugin(() => {
  const id = useRuntimeConfig().public.gaMeasurementId
  if (!id || typeof id !== 'string' || !import.meta.client) {
    return
  }

  const { attribution } = useCampaignAttribution()
  const disableKey = `ga-disable-${id}`

  function setAdminTrackingDisabled(disabled: boolean) {
    ;(window as unknown as Record<string, boolean>)[disableKey] = disabled
    const g = window.gtag
    if (typeof g === 'function') {
      g('consent', 'update', {
        analytics_storage: disabled ? 'denied' : 'granted',
      })
    }
  }

  function gaConfig(): Record<string, unknown> {
    const config: Record<string, unknown> = {
      send_page_view: true,
      anonymize_ip: true,
    }
    const a = attribution.value
    if (a?.source) {
      config.campaign_source = a.source
    }
    if (a?.medium) {
      config.campaign_medium = a.medium
    }
    if (a?.campaign) {
      config.campaign_name = a.campaign
    }
    if (a?.content) {
      config.campaign_content = a.content
    }
    if (a?.cid) {
      config.campaign_id = a.cid
    }
    return config
  }

  function inject() {
    if (document.querySelector(`script[data-prazervip-ga="${id}"]`)) {
      return
    }

    const ext = document.createElement('script')
    ext.async = true
    ext.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
    ext.setAttribute('data-prazervip-ga', id)
    document.head.appendChild(ext)

    const safeId = id.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    const inline = document.createElement('script')
    inline.setAttribute('data-prazervip-ga-init', id)
    inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${safeId}',${JSON.stringify(gaConfig())});`
    document.head.appendChild(inline)
  }

  const router = useRouter()

  function syncForPath(path: string) {
    if (isAdminSitePath(path)) {
      setAdminTrackingDisabled(true)
      return
    }
    setAdminTrackingDisabled(false)
    inject()
  }

  syncForPath(router.currentRoute.value.path)
  router.afterEach((to) => {
    syncForPath(to.path)
  })
})
