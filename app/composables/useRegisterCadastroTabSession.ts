/**
 * Marca só nesta aba (sessionStorage): F5 em /cadastro mantém o passo; sair da rota apaga a marca.
 * Não usar import de 'vue-router' — só o auto-import do Nuxt.
 */
export const CADASTRO_TAB_KEY = 'prazervip_cadastro_aba'

export function markCadastroTabActive() {
  if (import.meta.client) {
    sessionStorage.setItem(CADASTRO_TAB_KEY, '1')
  }
}

export function clearCadastroTabMarker() {
  if (import.meta.client) {
    sessionStorage.removeItem(CADASTRO_TAB_KEY)
  }
}

export function useRegisterCadastroRouteGuard() {
  onBeforeRouteLeave((to) => {
    if (!import.meta.client) {
      return
    }
    if (!to.path.startsWith('/cadastro')) {
      clearCadastroTabMarker()
    }
  })
}
