import { describe, expect, it } from 'vitest'
import {
  attributionToApiPayload,
  mergeAttributionFromQuery,
  sanitizeClickId,
} from '~/utils/campaign-attribution'

describe('atribuição de campanha', () => {
  it('aceita cid do TrafficStars e assume source', () => {
    const a = mergeAttributionFromQuery({ cid: 'tsclick01ab' }, null)
    expect(a).toEqual({
      cid: 'tsclick01ab',
      source: 'trafficstars',
      medium: 'cpc',
      campaign: '',
      content: '',
    })
    expect(attributionToApiPayload(a).acquisition_click_id).toBe('tsclick01ab')
  })

  it('ignora macro sem substituir e cid curto', () => {
    expect(sanitizeClickId('{click_id}')).toBeNull()
    expect(sanitizeClickId('abc')).toBeNull()
    expect(mergeAttributionFromQuery({ cid: '{click_id}' }, null)).toBeNull()
  })

  it('mantém o primeiro clique (first touch)', () => {
    const first = mergeAttributionFromQuery({ cid: 'firstclick1' }, null)
    const next = mergeAttributionFromQuery({ cid: 'secondclk2', utm_source: 'outro' }, first)
    expect(next?.cid).toBe('firstclick1')
    expect(next?.source).toBe('trafficstars')
  })

  it('usa UTM quando vier junto', () => {
    const a = mergeAttributionFromQuery(
      {
        cid: 'tsclick99zz',
        utm_source: 'trafficstars',
        utm_medium: 'cpc',
        utm_campaign: 'leads-set',
      },
      null,
    )
    expect(a?.campaign).toBe('leads-set')
    expect(a?.source).toBe('trafficstars')
  })
})
