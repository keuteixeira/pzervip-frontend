/**
 * Marca no localStorage (partilhado entre abas): evita perder o token ao abrir /cadastro noutra aba.
 * Sair da rota /cadastro apaga a marca.
 */
export const CADASTRO_TAB_KEY = 'prazervip_cadastro_aba'

export function markCadastroTabActive() {
  if (import.meta.client) {
    localStorage.setItem(CADASTRO_TAB_KEY, '1')
  }
}

export function clearCadastroTabMarker() {
  if (import.meta.client) {
    localStorage.removeItem(CADASTRO_TAB_KEY)
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
