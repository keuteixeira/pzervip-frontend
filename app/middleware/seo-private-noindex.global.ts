/**
 * Áreas autenticadas / admin: não indexar (Google).
 */
export default defineNuxtRouteMiddleware((to) => {
  const path = to.path
  const blocked =
    path.startsWith('/admin') ||
    path.startsWith('/conta') ||
    path.startsWith('/entrar') ||
    path === '/login'

  if (blocked) {
    useHead({
      meta: [{ name: 'robots', content: 'noindex, nofollow' }],
    })
  }
})
