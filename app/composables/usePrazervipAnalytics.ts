declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
    gtag?: (...args: unknown[]) => void
  }
}

export type RegistrationPixAnalyticsPayload = {
  transaction_id: string
  value: number
  currency?: string
  mock?: boolean
}

export type PortalDestaquePixAnalyticsPayload = {
  transaction_id: string
  value: number
  stars: number
  period_months: number
  currency?: string
  mock?: boolean
  is_upgrade?: boolean
}

/**
 * Analytics / GTM: empurra eventos na `dataLayer` e, se `gtag` existir (GA4 carregado pelo site), envia também.
 * Nomes estáveis para acionadores no Tag Manager: `prazervip_registration_pix_generated`, `prazervip_registration_pix_paid`,
 * `prazervip_portal_destaque_pix_generated`, `prazervip_portal_destaque_pix_paid`.
 */
export function usePrazervipAnalytics() {
  function pushLayer(obj: Record<string, unknown>) {
    if (!import.meta.client) {
      return
    }
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(obj)
  }

  function gtagEvent(name: string, params: Record<string, unknown>) {
    if (!import.meta.client) {
      return
    }
    const g = window.gtag
    if (typeof g === 'function') {
      g('event', name, params)
    }
  }

  function registrationPixGenerated(p: RegistrationPixAnalyticsPayload) {
    const currency = p.currency ?? 'BRL'
    const base = {
      transaction_id: p.transaction_id,
      value: p.value,
      currency,
      mock: Boolean(p.mock),
    }
    pushLayer({
      event: 'prazervip_registration_pix_generated',
      ...base,
    })
    gtagEvent('begin_checkout', {
      currency,
      value: p.value,
      items: [
        {
          item_id: 'cadastro_premium',
          item_name: 'Cadastro anunciante — Premium',
          price: p.value,
          quantity: 1,
        },
      ],
    })
  }

  function registrationPixPaid(p: RegistrationPixAnalyticsPayload) {
    const currency = p.currency ?? 'BRL'
    const base = {
      transaction_id: p.transaction_id,
      value: p.value,
      currency,
    }
    pushLayer({
      event: 'prazervip_registration_pix_paid',
      ...base,
    })
    gtagEvent('purchase', {
      transaction_id: p.transaction_id,
      value: p.value,
      currency,
      items: [
        {
          item_id: 'cadastro_premium',
          item_name: 'Cadastro anunciante — Premium',
          price: p.value,
          quantity: 1,
        },
      ],
    })
  }

  function portalDestaquePixGenerated(p: PortalDestaquePixAnalyticsPayload) {
    const currency = p.currency ?? 'BRL'
    const itemId = `portal_destaque_${p.stars}star_${p.period_months}m`
    const base = {
      transaction_id: p.transaction_id,
      value: p.value,
      currency,
      mock: Boolean(p.mock),
      stars: p.stars,
      period_months: p.period_months,
      is_upgrade: Boolean(p.is_upgrade),
    }
    pushLayer({
      event: 'prazervip_portal_destaque_pix_generated',
      ...base,
    })
    gtagEvent('begin_checkout', {
      currency,
      value: p.value,
      items: [
        {
          item_id: itemId,
          item_name: `Destaque portal — ${p.stars} estrela(s) × ${p.period_months} mês(es)`,
          price: p.value,
          quantity: 1,
        },
      ],
    })
  }

  function portalDestaquePixPaid(p: PortalDestaquePixAnalyticsPayload) {
    const currency = p.currency ?? 'BRL'
    const itemId = `portal_destaque_${p.stars}star_${p.period_months}m`
    const base = {
      transaction_id: p.transaction_id,
      value: p.value,
      currency,
      stars: p.stars,
      period_months: p.period_months,
      is_upgrade: Boolean(p.is_upgrade),
    }
    pushLayer({
      event: 'prazervip_portal_destaque_pix_paid',
      ...base,
    })
    gtagEvent('purchase', {
      transaction_id: p.transaction_id,
      value: p.value,
      currency,
      items: [
        {
          item_id: itemId,
          item_name: `Destaque portal — ${p.stars} estrela(s) × ${p.period_months} mês(es)`,
          price: p.value,
          quantity: 1,
        },
      ],
    })
  }

  return {
    registrationPixGenerated,
    registrationPixPaid,
    portalDestaquePixGenerated,
    portalDestaquePixPaid,
  }
}
