/**
 * Rotas do painel administrativo — não carregar GA / Clarity nem enviar eventos.
 */
export function isAdminSitePath(path: string): boolean {
  const p = (path.split('?')[0] || '').trim()
  return p === '/admin' || p.startsWith('/admin/')
}
