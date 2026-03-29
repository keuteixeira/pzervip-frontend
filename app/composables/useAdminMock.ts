/**
 * Ative dados de demonstração em qualquer rota `/admin/*` com query `?mock=1`.
 */
export function useAdminMock() {
  const route = useRoute()

  const isMock = computed(() => route.query.mock === '1')

  /** Preserva `?mock=1` em links internos do admin. */
  function withMock(path: string) {
    if (!isMock.value) {
      return path
    }
    const sep = path.includes('?') ? '&' : '?'
    return `${path}${sep}mock=1`
  }

  return { isMock, withMock }
}
