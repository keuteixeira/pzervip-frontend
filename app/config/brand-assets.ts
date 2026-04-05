/**
 * Assets em /public/ (Nuxt). Versões *-2 = claras (UI escura); *-1 = escuras (fundos claros, ex. e-mails).
 * A URL absoluta da logo em e-mail é montada no backend: FRONTEND_URL + /prazervip-logo-horizontal-1.png
 */
export const brandAssets = {
  logoHorizontal: '/images/prazervip-logo-horizontal-2.png',
  logoHorizontalWide: '/images/prazervip-logo-horizontal-2.png',
  logoVertical: '/images/prazervip-logo-vertical-2.png',
  logoHorizontalOnLight: '/images/prazervip-logo-horizontal-1.png',
  logoVerticalOnLight: '/images/prazervip-logo-vertical-1.png',
  iconSquare: '/web-app-manifest-192x192.png',
} as const
