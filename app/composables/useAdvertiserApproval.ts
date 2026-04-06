/**
 * Cadastro de anunciante aprovado pela equipe (perfil público liberado).
 * Enquanto isso for falso, o menu trata como pré-cadastro (/cadastro), não «Meu Perfil».
 */
export function useAdvertiserApproval() {
  const { user, fetchMe } = useAuth()

  const isApprovedAdvertiser = computed(
    () =>
      user.value?.role === 'advertiser' &&
      user.value?.advertiser_profile?.approval_status === 'approved',
  )

  /**
   * Segurança e suporte só após aprovação. Redireciona anunciantes em rascunho/análise para /conta.
   */
  async function guardAccountToolsOrRedirect(): Promise<boolean> {
    await fetchMe()
    if (user.value?.role !== 'advertiser') {
      return false
    }
    if (isApprovedAdvertiser.value) {
      return false
    }
    await navigateTo('/conta')
    return true
  }

  return { isApprovedAdvertiser, guardAccountToolsOrRedirect }
}
