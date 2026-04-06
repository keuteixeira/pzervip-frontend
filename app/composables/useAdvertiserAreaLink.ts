import { buildPublicProfilePath } from '~/utils/public-profile-url'

/**
 * Botão «Área do Anunciante»: destino conforme sessão.
 * — Sem token: /login
 * — Admin: /admin/cadastros (igual ao pós-login)
 * — Anunciante: /conta
 *
 * Menu «Cadastro de Anunciante» / «Meu Perfil»: anunciante logado → página pública (`/acompanhante|massagista/slug`)
 * ou `/conta/perfil` se ainda não houver slug; visitante ou admin → `/cadastro`.
 *
 * Com cookie mas `user` ainda null (primeira pintura), assume /conta até `hydrateUserIfNeeded()` correr.
 */
export function useAdvertiserAreaLink() {
  const { token } = useApi()
  const { user, fetchMe } = useAuth()

  const advertiserAreaTo = computed(() => {
    if (!token.value) {
      return '/login'
    }
    if (user.value?.role === 'admin') {
      return '/admin/cadastros'
    }
    return '/conta'
  })

  const registerOrMyProfileLabel = computed(() => {
    if (user.value?.role === 'advertiser') {
      return 'Meu Perfil'
    }
    return 'Cadastro de Anunciante'
  })

  const registerOrMyProfileTo = computed(() => {
    if (user.value?.role === 'advertiser') {
      const slug = user.value.advertiser_profile?.public_slug?.trim()
      const st = user.value.advertiser_profile?.service_type
      if (slug) {
        return buildPublicProfilePath(slug, st)
      }
      return '/conta/perfil'
    }
    return '/cadastro'
  })

  async function hydrateUserIfNeeded() {
    if (token.value && !user.value) {
      await fetchMe()
    }
  }

  return { advertiserAreaTo, registerOrMyProfileLabel, registerOrMyProfileTo, hydrateUserIfNeeded }
}
