/**
 * Confirmação de maioridade (equivalente à primeira camada do site WordPress/Elementor).
 * Persiste 30 dias via cookie httpOnly-safe (valor simples, só indica aceitação).
 */
export function useAgeGate() {
  const cookie = useCookie('pv_age_verified', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    path: '/',
  })

  function isAgeConfirmed(): boolean {
    return cookie.value === '1'
  }

  function confirmAge(): void {
    cookie.value = '1'
  }

  return { isAgeConfirmed, confirmAge }
}
