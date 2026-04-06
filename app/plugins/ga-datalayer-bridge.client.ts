/**
 * Espelha pushes do dataLayer para gtag('event', …) nos eventos de cadastro PIX.
 * Só ativa quando **não** há NUXT_PUBLIC_GA_MEASUREMENT_ID (GA carregado só pelo GTM ou outro script).
 *
 * Com measurement ID no Nuxt, usePrazervipAnalytics já chama gtag — este bridge ficaria desligado para não duplicar.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }
  const id = String(useRuntimeConfig().public.gaMeasurementId || '').trim()
  if (id) {
    return
  }

  const dl = window.dataLayer
  if (!dl || typeof dl.push !== 'function') {
    return
  }

  const orig = dl.push.bind(dl)
  function maybeGa4FromPrazervip(obj: unknown) {
    if (!obj || typeof obj !== 'object') {
      return
    }
    const o = obj as Record<string, unknown>
    if (typeof window.gtag !== 'function') {
      return
    }
    const val = Number(o.value) || 0
    const cur = (o.currency as string) || 'BRL'
    const items = [
      {
        item_id: 'cadastro_premium',
        item_name: 'Cadastro anunciante — Premium',
        price: val,
        quantity: 1,
      },
    ]
    if (o.event === 'prazervip_registration_pix_generated') {
      window.gtag!('event', 'begin_checkout', {
        currency: cur,
        value: val,
        items,
      })
      return
    }
    if (o.event === 'prazervip_registration_pix_paid') {
      window.gtag!('event', 'purchase', {
        transaction_id: String(o.transaction_id || ''),
        value: val,
        currency: cur,
        items,
      })
    }
  }

  dl.push = function (...args: unknown[]) {
    for (const a of args) {
      maybeGa4FromPrazervip(a)
    }
    return orig(...args)
  }
})
