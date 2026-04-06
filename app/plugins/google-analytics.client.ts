/**
 * Google Analytics 4 (gtag.js) quando NUXT_PUBLIC_GA_MEASUREMENT_ID está definido.
 * Injeta scripts no DOM (evita bloqueio de innerHTML do Unhead em alguns builds).
 */
export default defineNuxtPlugin(() => {
  const id = useRuntimeConfig().public.gaMeasurementId
  if (!id || typeof id !== 'string' || !import.meta.client) {
    return
  }
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
  inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${safeId}',{send_page_view:true,anonymize_ip:true});`
  document.head.appendChild(inline)
})
