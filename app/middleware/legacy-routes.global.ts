/**
 * Redireciona URLs antigas em inglês para as rotas canónicas em português (301).
 */
export default defineNuxtRouteMiddleware((to) => {
  const path = to.path

  if (path === '/explore' || path.startsWith('/explore/')) {
    const next = path
      .replace(/^\/explore/, '/explorar')
      .replace(/\/city\//g, '/cidade/')
      .replace(/\/profile\//g, '/perfil/')
    return navigateTo({ path: next, query: to.query, hash: to.hash }, { redirectCode: 301 })
  }

  if (path === '/account' || path.startsWith('/account/')) {
    const next = path.replace(/^\/account\/profile/, '/conta/perfil').replace(/^\/account/, '/conta')
    return navigateTo({ path: next, query: to.query, hash: to.hash }, { redirectCode: 301 })
  }

  if (path === '/auth/forgot-password') {
    return navigateTo({ path: '/entrar/recuperar', query: to.query, hash: to.hash }, { redirectCode: 301 })
  }
  if (path === '/auth/reset-password') {
    return navigateTo({ path: '/entrar/redefinir', query: to.query, hash: to.hash }, { redirectCode: 301 })
  }
})
