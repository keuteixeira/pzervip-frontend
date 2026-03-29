export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  const base = () => config.public.apiBase.replace(/\/$/, '')

  async function request<T>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    const body = options.body
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    }
    /** multipart precisa do boundary; não definir Content-Type manualmente */
    if (isFormData && 'Content-Type' in headers) {
      delete headers['Content-Type']
    }
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }
    return $fetch<T>(`${base()}${path}`, {
      ...options,
      headers,
    })
  }

  return { request, token, base }
}
