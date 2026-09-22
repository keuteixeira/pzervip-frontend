import {
  attributionToApiPayload,
  CAMPAIGN_ATTRIBUTION_COOKIE,
  CAMPAIGN_ATTRIBUTION_MAX_AGE,
  mergeAttributionFromQuery,
  type CampaignAttribution,
} from '~/utils/campaign-attribution'

export function useCampaignAttribution() {
  const cookie = useCookie<CampaignAttribution | null>(CAMPAIGN_ATTRIBUTION_COOKIE, {
    maxAge: CAMPAIGN_ATTRIBUTION_MAX_AGE,
    sameSite: 'lax',
    path: '/',
    default: () => null,
  })

  function ingest(query: Record<string, unknown>) {
    cookie.value = mergeAttributionFromQuery(query, cookie.value)
  }

  function toApiPayload() {
    return attributionToApiPayload(cookie.value)
  }

  return {
    attribution: cookie,
    ingest,
    toApiPayload,
  }
}
