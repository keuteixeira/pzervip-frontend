import { getPublicSiteBase } from '../utils/seo-site-base'

export default defineEventHandler((event) => {
  const base = getPublicSiteBase()
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Áreas privadas e fluxos de conta',
    'Disallow: /admin',
    'Disallow: /conta',
    'Disallow: /cadastro',
    'Disallow: /login',
    'Disallow: /entrar',
    'Disallow: /auth',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ]

  return lines.join('\n')
})
