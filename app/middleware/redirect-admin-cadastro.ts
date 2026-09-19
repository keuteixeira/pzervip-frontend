import { adminCadastroCanonicalPath } from '~/utils/legacy-path'

/**
 * URL legada/incorreta `/admin/cadastro/:id` → `/admin/cadastros/:id`
 */
export default defineNuxtRouteMiddleware((to) => {
  const raw = to.params.id
  const id = Array.isArray(raw) ? raw[0] : raw
  return navigateTo(
    {
      path: adminCadastroCanonicalPath(id),
      query: { ...to.query },
    },
    { replace: true },
  )
})
