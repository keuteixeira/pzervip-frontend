/**
 * Rotas que não exigem confirmação de idade (login, legal, cadastro, admin, etc.).
 * Manter alinhado com `app/middleware/age.global.ts`.
 */
export function isAgeGateExemptPath(path: string): boolean {
  return (
    path.startsWith('/login') ||
    path.startsWith('/auth') ||
    path.startsWith('/entrar') ||
    path.startsWith('/cadastro') ||
    path.startsWith('/admin') ||
    path.startsWith('/conta') ||
    path === '/contato' ||
    path === '/politica-de-privacidade' ||
    path === '/termos-de-servico' ||
    path === '/sobre-nos' ||
    path === '/anunciar'
  )
}

/** Evita open redirect: só caminhos relativos internos. */
export function safeInternalNextPath(next: unknown): string | null {
  if (typeof next !== 'string') {
    return null
  }
  const t = next.trim()
  if (!t.startsWith('/') || t.startsWith('//') || t.includes('://')) {
    return null
  }
  const pathOnly = t.split('?')[0]?.split('#')[0] ?? ''
  if (!pathOnly.startsWith('/')) {
    return null
  }
  return pathOnly || null
}
