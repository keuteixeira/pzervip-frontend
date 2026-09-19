/** Converte URL antiga em inglês para o caminho canónico em português. */
export function canonicalPathFromLegacy(path: string): string | null {
  if (path === '/explore' || path.startsWith('/explore/')) {
    return path
      .replace(/^\/explore/, '/explorar')
      .replace(/\/city\//g, '/cidade/')
      .replace(/\/profile\//g, '/perfil/')
  }
  if (path === '/account' || path.startsWith('/account/')) {
    return path.replace(/^\/account\/profile/, '/conta/perfil').replace(/^\/account/, '/conta')
  }
  if (path === '/auth/forgot-password') {
    return '/entrar/recuperar'
  }
  if (path === '/auth/reset-password') {
    return '/entrar/redefinir'
  }
  return null
}

export function adminCadastroCanonicalPath(id: string | number | null | undefined): string {
  if (id == null || String(id).trim() === '') {
    return '/admin/cadastros'
  }
  return `/admin/cadastros/${String(id)}`
}
