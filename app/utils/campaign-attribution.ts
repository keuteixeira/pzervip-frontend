export type CampaignAttribution = {
  cid: string
  source: string
  medium: string
  campaign: string
  content: string
}

export const CAMPAIGN_ATTRIBUTION_COOKIE = 'pv_acq'
export const CAMPAIGN_ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 30

const PLACEHOLDER = /^\{.+\}$/

export function firstQueryString(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === 'string' ? raw.trim() : ''
}

export function sanitizeClickId(raw: string): string | null {
  const value = raw.trim()
  if (!value || PLACEHOLDER.test(value)) {
    return null
  }
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(value)) {
    return null
  }
  return value
}

export function mergeAttributionFromQuery(
  query: Record<string, unknown>,
  previous: CampaignAttribution | null,
): CampaignAttribution | null {
  if (previous?.cid) {
    return previous
  }

  const cid = sanitizeClickId(firstQueryString(query.cid) || firstQueryString(query.click_id))
  const source = firstQueryString(query.utm_source)
  const medium = firstQueryString(query.utm_medium)
  const campaign = firstQueryString(query.utm_campaign)
  const content = firstQueryString(query.utm_content)

  if (!cid && !source) {
    return previous
  }

  return {
    cid: cid || previous?.cid || '',
    source: source || (cid ? 'trafficstars' : previous?.source || ''),
    medium: medium || (cid ? 'cpc' : previous?.medium || ''),
    campaign: campaign || previous?.campaign || '',
    content: content || previous?.content || '',
  }
}

export function attributionToApiPayload(attribution: CampaignAttribution | null): {
  acquisition_click_id?: string
  acquisition_source?: string
  acquisition_medium?: string
  acquisition_campaign?: string
} {
  if (!attribution?.cid) {
    return {}
  }
  return {
    acquisition_click_id: attribution.cid,
    acquisition_source: attribution.source || 'trafficstars',
    acquisition_medium: attribution.medium || 'cpc',
    acquisition_campaign: attribution.campaign || undefined,
  }
}
