/**
 * dataLayer antes de qualquer push (GTM ou gtag). Sem isto, pushes muito cedo podem falhar.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }
  window.dataLayer = window.dataLayer || []
})
