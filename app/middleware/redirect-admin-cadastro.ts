/**
 * URL legada/incorreta `/admin/cadastro/:id` → `/admin/cadastros/:id`
 */
export default defineNuxtRouteMiddleware((to) => {
  const raw = to.params.id
  const id = Array.isArray(raw) ? raw[0] : raw
  if (id == null || String(id).trim() === '') {
    return navigateTo('/admin/cadastros', { replace: true })
  }
  return navigateTo(
    {
      path: `/admin/cadastros/${String(id)}`,
      query: { ...to.query },
    },
    { replace: true },
  )
})
