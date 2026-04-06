/** Extrai mensagem legível de erros da API (Laravel / useApi). */
export function apiErrorMessage(e: unknown, fallback: string): string {
  const err = e as { data?: { message?: string; errors?: Record<string, string[]> } }
  const first =
    err.data?.errors && Object.keys(err.data.errors).length > 0
      ? Object.values(err.data.errors)[0]?.[0]
      : null
  return first || err.data?.message || fallback
}
