import { isAgeGateExemptPath, safeInternalNextPath } from '~/utils/age-gate-routes'

export default defineNuxtRouteMiddleware((to) => {
  const { isAgeConfirmed } = useAgeGate()

  if (to.path === '/') {
    if (isAgeConfirmed()) {
      const raw = to.query.next
      const next = Array.isArray(raw) ? raw[0] : raw
      const path = safeInternalNextPath(next)
      return navigateTo(path || '/explorar')
    }
    return
  }

  if (isAgeGateExemptPath(to.path)) {
    return
  }

  // Demais rotas: a verificação é feita com overlay no layout (mantém URL e meta tags da página para SEO).
})
