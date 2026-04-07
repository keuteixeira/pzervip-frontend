/**
 * URL pública do site (sem barra final). Usada em robots.txt e sitemap.xml.
 */
export function getPublicSiteBase(): string {
  const config = useRuntimeConfig()
  const raw = String(config.public.siteUrl || '').trim()
  if (raw) {
    return raw.replace(/\/$/, '')
  }
  return 'https://prazer.vip'
}

export function getApiBase(): string {
  const config = useRuntimeConfig()
  return String(config.public.apiBase || 'http://localhost:8000/api').replace(/\/$/, '')
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
