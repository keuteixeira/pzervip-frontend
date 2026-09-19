import { advertiserAreaDestination, registerOrProfileDestination } from '~/utils/area-destination'
import { buildPublicProfilePath } from '~/utils/public-profile-url'
import { useAdvertiserApproval } from '~/composables/useAdvertiserApproval'

/**
 * Botão «Área do Anunciante»: destino conforme sessão.
 * — Sem token: /login
 * — Admin: /admin/cadastros (igual ao pós-login)
 * — Anunciante: /conta
 *
 * Menu «Cadastro de Anunciante» / «Meu Perfil»: só mostra «Meu Perfil» com cadastro aprovado; antes disso
 * o link segue para `/cadastro` (pré-cadastro / código / etapas).
 * Anunciante aprovado → página pública ou `/conta/perfil` se ainda não houver slug; visitante ou admin → `/cadastro`.
 *
 * Com cookie mas `user` ainda null (primeira pintura), trata como visitante até `hydrateUserIfNeeded()` correr.
 */
export function useAdvertiserAreaLink() {
  const { token } = useApi()
  const { user, fetchMe } = useAuth()
  const { isApprovedAdvertiser } = useAdvertiserApproval()

  const advertiserAreaTo = computed(() => advertiserAreaDestination(token.value, user.value?.role))

  const registerOrMyProfileLabel = computed(() => {
    if (isApprovedAdvertiser.value) {
      return 'Meu Perfil'
    }
    return 'Cadastro de Anunciante'
  })

  const registerOrMyProfileTo = computed(() =>
    registerOrProfileDestination({
      isApprovedAdvertiser: isApprovedAdvertiser.value,
      publicSlug: user.value?.advertiser_profile?.public_slug,
      serviceType: user.value?.advertiser_profile?.service_type,
      publicPath: buildPublicProfilePath,
    }),
  )

  async function hydrateUserIfNeeded() {
    if (token.value && !user.value) {
      await fetchMe()
    }
  }

  return {
    advertiserAreaTo,
    registerOrMyProfileLabel,
    registerOrMyProfileTo,
    hydrateUserIfNeeded,
    isApprovedAdvertiser,
  }
}
