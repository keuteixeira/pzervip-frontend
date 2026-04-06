/**
 * Compatibilidade: páginas antigas importavam isto para `?mock=1`.
 * O painel usa só API; `isMock` é sempre false e `withMock` devolve o path tal como está.
 */
export function useAdminMock() {
  const isMock = computed(() => false)

  function withMock(path: string) {
    return path
  }

  return { isMock, withMock }
}
