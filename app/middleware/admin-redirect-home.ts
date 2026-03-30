/** `/admin` (índice vazio) → primeira rota útil do painel. */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/admin' || to.path === '/admin/') {
    return navigateTo('/admin/cadastros', { replace: true })
  }
})
