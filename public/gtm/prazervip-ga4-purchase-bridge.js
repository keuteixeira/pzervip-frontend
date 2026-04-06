/**
 * Prazer.Vip — cópia opcional da ponte (mesma lógica que app/plugins/ga-datalayer-bridge.client.ts)
 *
 * No Nuxt: se NUXT_PUBLIC_GA_MEASUREMENT_ID estiver **vazio**, o bridge já corre na app — não precisa
 * deste ficheiro nem de Custom HTML no GTM para espelhar para gtag.
 *
 * Com G-ZMC… no .env (GA pelo Nuxt): **não** uses este script — o código já envia gtag e isto duplicaria eventos.
 *
 * Útil só se quiseres colar no GTM noutro site / ordem específica de tags.
 *
 * dataLayer.push:
 *   prazervip_registration_pix_generated → begin_checkout (se gtag existir)
 *   prazervip_registration_pix_paid      → purchase
 *
 * Alternativa GTM sem este ficheiro: Acionador > Evento personalizado (prazervip_registration_pix_paid)
 * e tag GA4 com campos do Data Layer.
 */
;(function () {
  var dl = window.dataLayer
  if (!dl || typeof dl.push !== 'function') {
    return
  }
  var orig = dl.push.bind(dl)
  function maybeGa4FromPrazervip(obj) {
    if (!obj || typeof obj !== 'object') {
      return
    }
    if (typeof window.gtag !== 'function') {
      return
    }
    var val = Number(obj.value) || 0
    var cur = obj.currency || 'BRL'
    var items = [
      {
        item_id: 'cadastro_premium',
        item_name: 'Cadastro anunciante — Premium',
        price: val,
        quantity: 1,
      },
    ]
    if (obj.event === 'prazervip_registration_pix_generated') {
      window.gtag('event', 'begin_checkout', {
        currency: cur,
        value: val,
        items: items,
      })
      return
    }
    if (obj.event === 'prazervip_registration_pix_paid') {
      window.gtag('event', 'purchase', {
        transaction_id: String(obj.transaction_id || ''),
        value: val,
        currency: cur,
        items: items,
      })
    }
  }
  dl.push = function () {
    for (var i = 0; i < arguments.length; i++) {
      maybeGa4FromPrazervip(arguments[i])
    }
    return orig.apply(dl, arguments)
  }
})()
