import {
  fetchExploreSummaries,
  pathsFromExploreSummaries,
  pathsFromProfilesSitemap,
  staticIndexablePaths,
} from '../utils/build-sitemap-urls'
import { escapeXml, getApiBase, getPublicSiteBase } from '../utils/seo-site-base'

export default defineEventHandler(async (event) => {
  const base = getPublicSiteBase()
  const apiBase = getApiBase()

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  const [summaries, profilePaths] = await Promise.all([
    fetchExploreSummaries(apiBase),
    pathsFromProfilesSitemap(apiBase),
  ])
  const hubPaths = pathsFromExploreSummaries(summaries)
  const allPaths = [...new Set([...staticIndexablePaths(), ...hubPaths, ...profilePaths])].sort()

  const lastmod = new Date().toISOString().slice(0, 10)

  const urlEntries = allPaths.map((path) => {
    const loc = `${base}${path.startsWith('/') ? path : `/${path}`}`
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`

  return xml
})
