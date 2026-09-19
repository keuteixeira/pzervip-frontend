import { canonicalPathFromLegacy } from '~/utils/legacy-path'

/**
 * Redireciona URLs antigas em inglês para as rotas canónicas em português (301).
 */
export default defineNuxtRouteMiddleware((to) => {
  const next = canonicalPathFromLegacy(to.path)
  if (!next || next === to.path) {
    return
  }
  return navigateTo({ path: next, query: to.query, hash: to.hash }, { redirectCode: 301 })
})
